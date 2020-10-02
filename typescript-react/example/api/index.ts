/// <reference path="dsl/dsl.d.ts" />

import { json } from 'body-parser';
import express from 'express';
import * as path from 'path';

import { ICreateUser } from './dsl/interface/demo.CreateUser';
import { CreateUser } from './dsl/class/demo.CreateUser';
import { IEditUser } from './dsl/interface/demo.EditUser';
import { EditUser } from './dsl/class/demo.EditUser';
import { ILookupUser } from './dsl/interface/demo.LookupUser';
import { LookupUser } from './dsl/class/demo.LookupUser';
import { IMarkUserAsActive } from './dsl/interface/demo.MarkUserAsActive';
import { MarkUserAsActive } from './dsl/class/demo.MarkUserAsActive';
import { IMarkUserAsBlocked } from './dsl/interface/demo.MarkUserAsBlocked';
import { MarkUserAsBlocked } from './dsl/class/demo.MarkUserAsBlocked';
import { IMarkUserAsDeactivated } from './dsl/interface/demo.MarkUserAsDeactivated';
import { MarkUserAsDeactivated } from './dsl/class/demo.MarkUserAsDeactivated';
import { ISearchUsers } from './dsl/interface/demo.SearchUsers';
import { SearchUsers } from './dsl/class/demo.SearchUsers';
import {
  searchUsers, createUser, editUser, lookupUser, markUserAsActive, markUserAsBlocked, markUserAsDeactivated
} from './model/domain';

import { ICreatePackage } from './dsl/interface/demo.CreatePackage';
import { CreatePackage } from './dsl/class/demo.CreatePackage';
import { IEditPackage } from './dsl/interface/demo.EditPackage';
import { EditPackage } from './dsl/class/demo.EditPackage';
import { ILookupPackage } from './dsl/interface/demo.LookupPackage';
import { LookupPackage } from './dsl/class/demo.LookupPackage';
import { IMarkPackageDelivered } from './dsl/interface/demo.MarkPackageDelivered';
import { MarkPackageDelivered } from './dsl/class/demo.MarkPackageDelivered';
import { IMarkPackageInDelivery } from './dsl/interface/demo.MarkPackageInDelivery';
import { MarkPackageInDelivery } from './dsl/class/demo.MarkPackageInDelivery';
import { IMarkPackageReturned } from './dsl/interface/demo.MarkPackageReturned';
import { MarkPackageReturned } from './dsl/class/demo.MarkPackageReturned';
import { ISearchPackages } from './dsl/interface/demo.SearchPackages';
import { SearchPackages } from './dsl/class/demo.SearchPackages';
import {
  searchPackages, createPackage, editPackage, lookupPackage, markPackageDelivered, markPackageInDelivery, markPackageReturned
} from './model/domain';


const app = express();
const PORT = 8080;

app.use(json());

export const registerSubmitHandler = <T>(app: express.Application, name: string, handler: (command: T) => T) => {
  app.post<{}, T, T>(`/submit/${name}`, (req, res) => {
    try {
      res.json(handler(req.body));
    } catch (error) {
      console.error(error);
      res.status(400).json(error);
    }
  })

  app.post<{}, string, T>(`/export/:template/${name}`, (req, res) => {
    try {
      handler(req.body);
      res.download(path.resolve(__dirname, './export/dummy.xlsx'));
    } catch (error) {
      console.error(error);
      res.status(400).json(error);
    }
  });
}

registerSubmitHandler<ISearchUsers>(app, SearchUsers.domainObjectName, searchUsers);
registerSubmitHandler<ICreateUser>(app, CreateUser.domainObjectName, createUser);
registerSubmitHandler<IEditUser>(app, EditUser.domainObjectName, editUser);
registerSubmitHandler<ILookupUser>(app, LookupUser.domainObjectName, lookupUser);
registerSubmitHandler<IMarkUserAsActive>(app, MarkUserAsActive.domainObjectName, markUserAsActive);
registerSubmitHandler<IMarkUserAsBlocked>(app, MarkUserAsBlocked.domainObjectName, markUserAsBlocked);
registerSubmitHandler<IMarkUserAsDeactivated>(app, MarkUserAsDeactivated.domainObjectName, markUserAsDeactivated);

registerSubmitHandler<ISearchPackages>(app, SearchPackages.domainObjectName, searchPackages);
registerSubmitHandler<ICreatePackage>(app, CreatePackage.domainObjectName, createPackage);
registerSubmitHandler<IEditPackage>(app, EditPackage.domainObjectName, editPackage);
registerSubmitHandler<ILookupPackage>(app, LookupPackage.domainObjectName, lookupPackage);
registerSubmitHandler<IMarkPackageInDelivery>(app, MarkPackageInDelivery.domainObjectName, markPackageInDelivery);
registerSubmitHandler<IMarkPackageDelivered>(app, MarkPackageDelivered.domainObjectName, markPackageDelivered);
registerSubmitHandler<IMarkPackageReturned>(app, MarkPackageReturned.domainObjectName, markPackageReturned);

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
