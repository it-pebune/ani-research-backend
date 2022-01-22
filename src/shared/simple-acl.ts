import { UserRole } from '~shared';
import { SimpleAclBackend } from './simple-acl-backend';

export interface IAclAllowParam {
  resources: string | string[];
  permissions: string | string[];
}

export interface IAclAllows {
  roles: UserRole[];
  allows: IAclAllowParam[];
}

interface IAclRPP {
  roles: UserRole[];
  resources: string | string[];
  permissions: string | string[];
}

/**
 * Simple Access Control
 */
export class SimpleAcl {
  private backend: SimpleAclBackend;
  private buckets = {
    meta: 'meta',
    parents: 'parents',
    permissions: 'permissions',
    resources: 'resources',
    roles: 'roles',
    users: 'users'
  };

  /** Constructor */
  constructor() {
    this.backend = new SimpleAclBackend();
  }

  /**
   * @param {IAclAllows[]} allows with objects expressing what permissions to give.
   * [{roles:{UserRole[]}, allows:[{resources:{string|string[]}, permissions:{string|string[]}]]
   *
   */
  public allow(allows: IAclAllows[]): void {
    allows = this.makeArray(allows);

    const demuxed: IAclRPP[] = [];
    allows.forEach((obj) => {
      const roles = obj.roles;
      obj.allows.forEach((allow) => {
        demuxed.push({
          roles,
          resources: allow.resources,
          permissions: allow.permissions
        });
      });
    });

    demuxed.forEach((obj) => {
      return this._allow(obj.roles, obj.resources, obj.permissions);
    });
  }

  /**
   * areAnyRolesAllowed(roles, resource, permissions, function(err, allowed))
   * Returns true if any of the given roles have the right permissions.
   * @param {UserRole[]} roles to check the permissions for.
   * @param {string} resource to ask permissions for.
   * @param {string|string[]} permissions
   * @return {boolean}
   */
  areAnyRolesAllowed(roles: UserRole[], resource: string, permissions: string | string[]): boolean {
    roles = this.makeArray(roles);
    permissions = this.makeArray(permissions);

    if (roles.length === 0) {
      return false;
    } else {
      return this._checkPermissions(roles, resource, permissions);
    }
  }

  /**
   * allow(roles, resources, permissions)
   * Adds the given permissions to the given roles over the given resources.
   * @param {UserRole[]} roles to add permissions to.
   * @param {string|string[]} resources to add permisisons to.
   * @param {string|string[]} permissions to add to the roles over the resources.
   */
  private _allow(roles: UserRole[], resources: string | string[], permissions: string | string[]): void {
    roles = this.makeArray(roles);
    resources = this.makeArray(resources);

    this.backend.add(this.buckets.meta, 'roles', roles);
    resources.forEach((resource) => {
      roles.forEach((role) => {
        this.backend.add(this.allowsBucket(resource), role, permissions);
      });
    });
    roles.forEach((role) => {
      this.backend.add(this.buckets.resources, role, resources);
    });
  }

  /**
   * NOTE: This function will not handle circular dependencies and result in a crash.
   * @param {UserRole[]} roles
   * @param {string} resource
   * @param {string[]} permissions
   * @return {boolean}
   */
  private _checkPermissions(roles: UserRole[], resource: string, permissions: string[]): boolean {
    const resourcePermissions = this.backend.union(this.allowsBucket(resource), roles);
    if (resourcePermissions.indexOf('*') !== -1) {
      return true;
    } else {
      permissions = permissions.filter((p) => {
        return resourcePermissions.indexOf(p) === -1;
      });

      if (permissions.length === 0) {
        return true;
      } else {
        const parents = this.backend.union(this.buckets.parents, roles);
        if (parents && parents.length) {
          return this._checkPermissions(parents, resource, permissions);
        } else {
          return false;
        }
      }
    }
  }

  /**
   * @param {string} resource
   * @return {string}
   */
  private allowsBucket(resource: string): string {
    return `allows_${resource}`;
  }

  /**
   * @param {any} arr
   * @return {any[]}
   */
  private makeArray(arr: any): any[] {
    return Array.isArray(arr) ? arr : [arr];
  }
}
