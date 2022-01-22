import lodash from 'lodash';
import { Request } from 'express';
import { IAuthUser, IUserFull } from '~entities';

const HTTP_CONTEXT_PROPERTY_REQ_ID = 'apb_property_requestId';
const HTTP_CONTEXT_PROPERTY_USER = 'apb_property_user';
const HTTP_CONTEXT_PROPERTY_AUSER = 'apb_property_admin_user';

export const getRequestUser = (req: Request): IAuthUser | null => {
  return lodash.get(req, HTTP_CONTEXT_PROPERTY_USER, null);
};

export const setRequestUser = (req: Request, user: IAuthUser): void => {
  lodash.set(req, HTTP_CONTEXT_PROPERTY_USER, user);
};

export const getRequestAdminUser = (req: Request): IUserFull | null => {
  return lodash.get(req, HTTP_CONTEXT_PROPERTY_AUSER, null);
};

export const setRequestAdminUser = (req: Request, user: IUserFull): void => {
  lodash.set(req, HTTP_CONTEXT_PROPERTY_AUSER, user);
};

export const setHttpCtxReqId = (httpCtx: any, id: string): void => {
  httpCtx.set(HTTP_CONTEXT_PROPERTY_REQ_ID, id);
};

export const getHttpCtxReqId = (httpCtx: any): string | null => {
  return httpCtx.get(HTTP_CONTEXT_PROPERTY_REQ_ID);
};

export const setHttpCtxUser = (httpCtx: any, user: IAuthUser): void => {
  httpCtx.set(HTTP_CONTEXT_PROPERTY_USER, user);
};

export const getHttpCtxUser = (httpCtx: any): IAuthUser | null => {
  return httpCtx.get(HTTP_CONTEXT_PROPERTY_USER);
};
