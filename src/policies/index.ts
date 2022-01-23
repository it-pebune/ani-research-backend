import { adminUserPolicy } from './user';
import { subjectPolicy } from './subject';

export const initServerRolesPolicy = () => {
  adminUserPolicy.invokeRolesPolicies();
  subjectPolicy.invokeRolesPolicies();
};

export {
  adminUserPolicy,
  subjectPolicy
};
