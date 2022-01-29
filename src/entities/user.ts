import { UserRole } from '~shared';

/* eslint-disable no-unused-vars */
export enum UserStatus {
  pending = 0,
  active = 1,
  idle = 2,
  closed = 3,
  deleted = 4, // account deleted by admin
  canceled = 5, // account deleted by user himself
  blackListed = 6
}
/* eslint-enable no-unused-vars */

export interface IProviderData {
  [key: string]: number | string | Date | object | null;
}

export interface IGoogleData {
  id?: string;
  email?: string;
  verifiedEmail?: boolean;
  displayName?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
}

export interface IUserFull {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  roles: UserRole[];
  provider: string;
  providerData: IProviderData | IGoogleData;
  profileImageUrl: string;
  googleId: string;
  socialInfo?: string;
  notes?: string;
  created: Date;
  updated: Date;
  status: UserStatus;
  sessionId: string;
  settings: any;
}

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
  created: Date;
  email: string;
  socialInfo?: string;
  status: UserStatus;
  roles: string[];
  settings: any;
  profileImageUrl: string;
}

export const initWithDbRecord = (userInfo: any, roles: UserRole[]): IUserFull => {
  const user: IUserFull = userInfo;
  user.roles = roles;
  if (userInfo.settings) {
    user.settings = JSON.parse(userInfo.settings);
  }
  if (userInfo.providerData) {
    user.providerData = JSON.parse(userInfo.providerData);
  }
  return user;
};
