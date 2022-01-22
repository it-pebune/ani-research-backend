import { IUserFull } from '~entities';

export enum UserRole {
  // eslint-disable-next-line no-unused-vars
  researcher = 10,
  // eslint-disable-next-line no-unused-vars
  reviewer = 70,
  // eslint-disable-next-line no-unused-vars
  coordinator = 150,
  // eslint-disable-next-line no-unused-vars
  admin = 250
}

/**
 * Maps user role id to string
 * @param {UserRole} roleId role id
 * @return {string} role name
 */
export function getUserRoleName(roleId: UserRole): string {
  switch (roleId) {
    case UserRole.researcher: return 'Researcher';
    case UserRole.reviewer: return 'Reviewer';
    case UserRole.coordinator: return 'Coordinator';
    case UserRole.admin: return 'Admin';
    default: return '';
  }
}

export const userHasRole = (user: IUserFull, roleId: UserRole): boolean => {
  return user.roles.indexOf(roleId) > -1;
};
