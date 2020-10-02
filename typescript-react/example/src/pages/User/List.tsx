import React from 'react';
import { FormType } from 'revenj';
import { RouteComponentProps } from 'react-router';

import { AuthContext } from '../../components/Auth';
import { SearchUsersPresenter } from '../../dsl/presenters/demo.SearchUsers';
import { IUserVM } from '../../dsl/interface/demo.UserVM';

interface IListUsers extends RouteComponentProps<{}> {}

export const ListUsers: React.FC<IListUsers> = ({ history }) => {
  const { user, onForbidden } = React.useContext(AuthContext)!;
  const getPackageID = React.useCallback((u: IUserVM) => u.ID, []);
  const constTrue = React.useCallback(() => true, []);
  const navigateTo = React.useCallback((formType: FormType, id?: UUID) => {
    switch (formType) {
      case FormType.Create: return history.push(`/user/create`);
      case FormType.Edit: return history.push(`/user/${encodeURIComponent(id!)}/edit`);
      case FormType.View: return history.push(`/user/${encodeURIComponent(id!)}/dashboard`);
    }
  }, [history]);

  return (
    <SearchUsersPresenter
      userRoles={user?.roles ?? new Set()}
      onForbidden={onForbidden}
      canNavigateTo={constTrue}
      navigateTo={navigateTo}
      getIdentifier={getPackageID}
    />
  )
};
