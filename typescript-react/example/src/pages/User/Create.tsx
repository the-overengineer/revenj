import React from 'react';
import { FormType } from 'revenj';
import { RouteComponentProps } from 'react-router';

import { AuthContext } from '../../components/Auth';
import { CreateUserPresenter } from '../../dsl/presenters/demo.CreateUser';
import { ICreateUser as ICommand } from '../../dsl/interface/demo.CreateUser';

interface ICreateUser extends RouteComponentProps<{}> {}

export const CreateUser: React.FC<ICreateUser> = ({ history }) => {
  const { user, onForbidden } = React.useContext(AuthContext)!;
  const constTrue = React.useCallback(() => true, []);
  const navigateTo = React.useCallback((formType: FormType, id?: UUID) => {
    switch (formType) {
      case FormType.Create: return history.push(`/user/create`);
      case FormType.Edit: return history.push(`/user/${encodeURIComponent(id!)}/edit`);
      case FormType.View: return history.push(`/user/${encodeURIComponent(id!)}/dashboard`);
    }
  }, [history]);
  return (
    <CreateUserPresenter
      userRoles={user?.roles ?? new Set()}
      onForbidden={onForbidden}
      canNavigateTo={constTrue}
      navigateTo={navigateTo}
      onCancel={history.goBack}
      onSubmitSuccess={(command: ICommand) => navigateTo(FormType.View, command.ID!)}
    />
  )
};
