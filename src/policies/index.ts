import { adminUserPolicy } from './user';
import { documentPolicy } from './document';
import { institutionPolicy } from './institution';
import { jobPositionPolicy } from './job-position';
import { subjectPolicy } from './subject';

export const initServerRolesPolicy = () => {
  adminUserPolicy.invokeRolesPolicies();
  documentPolicy.invokeRolesPolicies();
  institutionPolicy.invokeRolesPolicies();
  jobPositionPolicy.invokeRolesPolicies();
  subjectPolicy.invokeRolesPolicies();
};

export {
  adminUserPolicy,
  documentPolicy,
  institutionPolicy,
  jobPositionPolicy,
  subjectPolicy
};
