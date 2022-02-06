import { adminUserPolicy } from './user';
import { documentPolicy } from './document';
import { subjectPolicy } from './subject';

export const initServerRolesPolicy = () => {
  adminUserPolicy.invokeRolesPolicies();
  documentPolicy.invokeRolesPolicies();
  subjectPolicy.invokeRolesPolicies();
};

export {
  adminUserPolicy,
  documentPolicy,
  subjectPolicy
};
