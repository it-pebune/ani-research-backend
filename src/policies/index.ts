import { adminUserPolicy } from './user';

export const initServerRolesPolicy = () => {
  adminUserPolicy.invokeRolesPolicies();
};

export {
  adminUserPolicy
};
