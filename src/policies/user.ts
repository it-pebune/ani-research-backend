import { Request, Response, NextFunction } from 'express';
import { getRequestUser, UserRole } from '~shared';
import { IPolicy } from './policy.interface';
import { StatusCodes } from 'http-status-codes';
import { SimpleAcl } from '~shared';


/**
 * Admin User Policy
 */
class AdminUserPolicy implements IPolicy {
  private acl: SimpleAcl;

  /** */
  constructor() {
    this.acl = new SimpleAcl();
  }

  /**
   * Initializes permissions
   */
  public invokeRolesPolicies(): void {
    this.acl.allow([{
      roles: [UserRole.admin],
      allows: [{
        resources: '/',
        permissions: '*'
      }, {
        resources: '/role',
        permissions: ['get']
      }, {
        resources: '/:auserId',
        permissions: '*'
      }, {
        resources: '/:auserId/delete',
        permissions: '*'
      }, {
        resources: '/:auserId/status',
        permissions: '*'
      }, {
        resources: '/:auserId/notes',
        permissions: '*'
      }]
    }, {
      roles: [UserRole.coordinator],
      allows: [{
        resources: '/role',
        permissions: ['get']
      }]
    }]);
  }

  /**
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @return {Response}
   */
  public isAllowed(req: Request, res: Response, next: NextFunction) {
    // If session expired return 401 instead of 403
    const user = getRequestUser(req);

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'User is not authenticated'
      });
    }

    // Check for user roles
    try {
      const isallowed = this.acl.areAnyRolesAllowed(user.roles, req.route.path, req.method.toLowerCase());
      if (isallowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: 'User is not authorized'
        });
      }
    } catch (ex) {
      // An authorization error occurred.
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Unexpected authorization error');
    }
  };
}

export const adminUserPolicy = new AdminUserPolicy();
