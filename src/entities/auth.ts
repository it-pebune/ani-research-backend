import { IUserFull } from '~entities';

export type IAuthUser = Pick<IUserFull,
  'id' | 'firstName' | 'lastName' | 'displayName' | 'email' | 'roles' | 'status' | 'sessionId' | 'profileImageUrl'>;

export interface IAuthTokenSubject {
  id: number;
  sessionsId: string;
}

export interface IAuthToken {
  access: string;
  refresh: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

export interface IAuthResponse {
  user: IAuthUser;
  token: IAuthToken;
}
