import React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  FormType,
  IActionButton,
} from 'revenj';

import { AuthContext } from '../../components/Auth';
import { LookupUser } from '../../dsl/class/demo.LookupUser';
import { MarkUserAsActive } from '../../dsl/class/demo.MarkUserAsActive';
import { MarkUserAsBlocked } from '../../dsl/class/demo.MarkUserAsBlocked';
import { MarkUserAsDeactivated } from '../../dsl/class/demo.MarkUserAsDeactivated';
import { UserStatus } from '../../dsl/enum/demo.UserStatus';
import { IEditUser as ICommand } from '../../dsl/interface/demo.EditUser';
import { EditUserPresenter } from '../../dsl/presenters/demo.EditUser';

interface IRouteProps {
  id: UUID;
}

interface IViewEditUser extends RouteComponentProps<IRouteProps> {
  isEdit: boolean;
}

interface IConcreteViewEditPresenter extends RouteComponentProps<IRouteProps> {}

export const ViewEditUser: React.FC<IViewEditUser> = ({ isEdit, history, match }) => {
  const { user, onForbidden } = React.useContext(AuthContext)!;
  const [ activeItem, setActiveItem ] = React.useState<ICommand>();
  const onReceiveItem = React.useCallback((item: ICommand) => setActiveItem(item), [setActiveItem]);
  const constTrue = React.useCallback(() => true, []);
  const navigateTo = React.useCallback((formType: FormType, id?: UUID) => {
    switch (formType) {
      case FormType.Create: return history.push(`/user/create`);
      case FormType.Edit: return history.push(`/user/${encodeURIComponent(id!)}/edit`);
      case FormType.View: return history.push(`/user/${encodeURIComponent(id!)}/dashboard`);
    }
  }, [history]);

  const onRequestItem = React.useCallback(
    (id: string) => LookupUser.submit({ id: id as UUID }).then((response) => response.user!),
    [],
  );

  const actions: IActionButton[] = React.useMemo(() => [
    {
      label: 'Activate User',
      isVisible: () => !isEdit && activeItem?.status !== UserStatus.Active,
      onClick: async () => {
        await MarkUserAsActive.submit({ userID: activeItem!.ID });
        history.go(0);
      },
    },
    {
      label: 'Block User',
      isVisible: () => !isEdit && activeItem?.status !== UserStatus.Blocked,
      onClick: async () => {
        await MarkUserAsBlocked.submit({ userID: activeItem!.ID });
        history.go(0);
      },
    },
    {
      label: 'Deactivate User',
      isVisible: () => !isEdit && activeItem?.status !== UserStatus.Deactivated,
      onClick: async () => {
        await MarkUserAsDeactivated.submit({ userID: activeItem!.ID });
        history.go(0);
      },
    },
  ], [isEdit, activeItem, history]);

  return (
    <EditUserPresenter
      actions={actions}
      isEdit={isEdit}
      userRoles={user?.roles ?? new Set()}
      onForbidden={onForbidden}
      canNavigateTo={constTrue}
      navigateTo={navigateTo}
      onCancel={history.goBack}
      onRequestItem={onRequestItem}
      onReceiveItem={onReceiveItem}
      activeKey={match.params.id}
      onSubmitSuccess={(command: ICommand) => navigateTo(FormType.View, command.ID!)}
    />
  )
};

export const ViewUser: React.FC<IConcreteViewEditPresenter> = (props) =>
  <ViewEditUser {...props} isEdit={false} />;

export const EditUser: React.FC<IConcreteViewEditPresenter> = (props) =>
  <ViewEditUser {...props} isEdit />;
