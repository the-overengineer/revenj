// Copyright (c) rubicon IT GmbH, www.rubicon.eu
//
// See the NOTICE file distributed with this work for additional information
// regarding copyright ownership.  rubicon licenses this file to you under 
// the Apache License, Version 2.0 (the "License"); you may not use this 
// file except in compliance with the License.  You may obtain a copy of the 
// License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software 
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT 
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the 
// License for the specific language governing permissions and limitations
// under the License.
// 
using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using Remotion.Linq.Clauses.Expressions;
using Remotion.Linq.Clauses.ExpressionTreeVisitors;
using Remotion.Linq.Clauses.StreamedData;
using Remotion.Linq.Utilities;

namespace Remotion.Linq.Clauses.ResultOperators
{
	/// <summary>
	/// Represents grouping the items returned by a query according to some key retrieved by a <see cref="KeySelector"/>, applying by an 
	/// <see cref="ElementSelector"/> to the grouped items. This is a result operator, operating on the whole result set of the query.
	/// </summary>
	/// <example>
	/// In C#, the "group by" clause in the following sample corresponds to a <see cref="GroupResultOperator"/>. "s" (a reference to the query source 
	/// "s", see <see cref="QuerySourceReferenceExpression"/>) is the <see cref="ElementSelector"/> expression, "s.Country" is the 
	/// <see cref="KeySelector"/> expression:
	/// <code>
	/// var query = from s in Students
	///             where s.First == "Hugo"
	///             group s by s.Country;
	/// </code>
	/// </example>
	public class GroupResultOperator : SequenceFromSequenceResultOperatorBase, IQuerySource
	{
		private static readonly MethodInfo s_executeMethod =
			typeof(GroupResultOperator).GetRuntimeMethodChecked("ExecuteGroupingInMemory", new[] { typeof(StreamedSequence) });

		private string _itemName;

		private Expression _keySelector;
		private Expression _elementSelector;

		/// <summary>
		/// Initializes a new instance of the <see cref="GroupResultOperator"/> class.
		/// </summary>
		/// <param name="itemName">A name associated with the <see cref="IGrouping{TKey,TElement}"/> items generated by the result operator.</param>
		/// <param name="keySelector">The selector retrieving the key by which to group items.</param>
		/// <param name="elementSelector">The selector retrieving the elements to group.</param>
		public GroupResultOperator(string itemName, Expression keySelector, Expression elementSelector)
		{
			_itemName = itemName;
			_elementSelector = elementSelector;
			_keySelector = keySelector;
		}

		/// <summary>
		/// Gets or sets the name of the items generated by this <see cref="GroupResultOperator"/>.
		/// </summary>
		/// <remarks>
		/// Item names are inferred when a query expression is parsed, and they usually correspond to the variable names present in that expression. 
		/// However, note that names are not necessarily unique within a <see cref="QueryModel"/>. Use names only for readability and debugging, not for 
		/// uniquely identifying <see cref="IQuerySource"/> objects. To match an <see cref="IQuerySource"/> with its references, use the 
		/// <see cref="QuerySourceReferenceExpression.ReferencedQuerySource"/> property rather than the <see cref="ItemName"/>.
		/// </remarks>
		public string ItemName
		{
			get { return _itemName; }
			set { _itemName = value; }
		}

		/// <summary>
		/// Gets or sets the type of the items generated by this <see cref="GroupResultOperator"/>. The item type is an instantiation of 
		/// <see cref="IGrouping{TKey,TElement}"/> derived from the types of <see cref="KeySelector"/> and <see cref="ElementSelector"/>.
		/// </summary>
		public Type ItemType
		{
			get { return typeof(IGrouping<,>).MakeGenericType(KeySelector.Type, ElementSelector.Type); }
		}

		/// <summary>
		/// Gets or sets the selector retrieving the key by which to group items.
		/// This is a resolved version of the body of the <see cref="LambdaExpression"/> that would be 
		/// passed to <see cref="Queryable.GroupBy{TSource,TKey,TElement}(System.Linq.IQueryable{TSource},System.Linq.Expressions.Expression{System.Func{TSource,TKey}},System.Linq.Expressions.Expression{System.Func{TSource,TElement}})"/>.
		/// </summary>
		/// <value>The key selector.</value>
		public Expression KeySelector
		{
			get { return _keySelector; }
			set { _keySelector = value; }
		}

		/// <summary>
		/// Gets or sets the selector retrieving the elements to group.
		/// This is a resolved version of the body of the <see cref="LambdaExpression"/> that would be 
		/// passed to <see cref="Queryable.GroupBy{TSource,TKey,TElement}(System.Linq.IQueryable{TSource},System.Linq.Expressions.Expression{System.Func{TSource,TKey}},System.Linq.Expressions.Expression{System.Func{TSource,TElement}})"/>.
		/// </summary>
		/// <value>The element selector.</value>
		public Expression ElementSelector
		{
			get { return _elementSelector; }
			set { _elementSelector = value; }
		}

		/// <summary>
		/// Clones this clause, adjusting all <see cref="QuerySourceReferenceExpression"/> instances held by it as defined by
		/// <paramref name="cloneContext"/>.
		/// </summary>
		/// <param name="cloneContext">The clones of all query source clauses are registered with this <see cref="CloneContext"/>.</param>
		/// <returns>A clone of this clause.</returns>
		public override ResultOperatorBase Clone(CloneContext cloneContext)
		{
			return new GroupResultOperator(ItemName, KeySelector, ElementSelector);
		}

		/// <summary>
		/// Transforms all the expressions in this clause and its child objects via the given <paramref name="transformation"/> delegate.
		/// </summary>
		/// <param name="transformation">The transformation object. This delegate is called for each <see cref="Expression"/> within this
		/// clause, and those expressions will be replaced with what the delegate returns.</param>
		public override void TransformExpressions(Func<Expression, Expression> transformation)
		{
			KeySelector = transformation(KeySelector);
			ElementSelector = transformation(ElementSelector);
		}

		public override StreamedSequence ExecuteInMemory<TInput>(StreamedSequence input)
		{
			var closedExecuteMethod = s_executeMethod.MakeGenericMethod(typeof(TInput), KeySelector.Type, ElementSelector.Type);
			return (StreamedSequence)InvokeExecuteMethod(closedExecuteMethod, input);
		}

		public StreamedSequence ExecuteGroupingInMemory<TSource, TKey, TElement>(StreamedSequence input)
		{
			var inputSequence = input.GetTypedSequence<TSource>();

			var keySelectorLambda = ReverseResolvingExpressionTreeVisitor.ReverseResolve(input.DataInfo.ItemExpression, KeySelector);
			var keySelector = (Func<TSource, TKey>)keySelectorLambda.Compile();

			var elementSelectorLambda = ReverseResolvingExpressionTreeVisitor.ReverseResolve(input.DataInfo.ItemExpression, ElementSelector);
			var elementSelector = (Func<TSource, TElement>)elementSelectorLambda.Compile();

			var resultSequence = inputSequence.GroupBy(keySelector, elementSelector);
			return new StreamedSequence(resultSequence.AsQueryable(), (StreamedSequenceInfo)GetOutputDataInfo(input.DataInfo));
		}

		public override IStreamedDataInfo GetOutputDataInfo(IStreamedDataInfo inputInfo)
		{
			return new StreamedSequenceInfo(typeof(IQueryable<>).MakeGenericType(ItemType), new QuerySourceReferenceExpression(this));
		}

		public override string ToString()
		{
			return string.Format(
				"GroupBy({0}, {1})",
				FormattingExpressionTreeVisitor.Format(KeySelector),
				FormattingExpressionTreeVisitor.Format(ElementSelector));
		}
	}
}
