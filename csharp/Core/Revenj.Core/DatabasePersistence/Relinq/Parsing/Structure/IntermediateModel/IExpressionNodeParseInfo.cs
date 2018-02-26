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
using System.Linq.Expressions;

namespace Remotion.Linq.Parsing.Structure.IntermediateModel
{
	/// <summary>
	/// Contains metadata about a <see cref="MethodCallExpression"/> that is parsed into a <see cref="MethodCallExpressionNodeBase"/>.
	/// </summary>
	public struct MethodCallExpressionParseInfo
	{
		public MethodCallExpressionParseInfo(string associatedIdentifier, IExpressionNode source, MethodCallExpression parsedExpression)
			: this()
		{
			AssociatedIdentifier = associatedIdentifier;
			Source = source;
			ParsedExpression = parsedExpression;
		}

		/// <summary>
		/// Gets the associated identifier, i.e. the name the user gave the data streaming out of this expression. For example, the 
		/// <see cref="SelectManyExpressionNode"/> corresponding to a <c>from c in C</c> clause should get the identifier "c".
		/// If there is no user-defined identifier (or the identifier is impossible to infer from the expression tree), a generated identifier
		/// is given instead.
		/// </summary>
		public string AssociatedIdentifier { get; private set; }

		/// <summary>
		/// Gets the source expression node, i.e. the node streaming data into the parsed node.
		/// </summary>
		/// <value>The source.</value>
		public IExpressionNode Source { get; private set; }

		/// <summary>
		/// Gets the <see cref="MethodCallExpression"/> being parsed.
		/// </summary>
		public MethodCallExpression ParsedExpression { get; private set; }
	}
}
