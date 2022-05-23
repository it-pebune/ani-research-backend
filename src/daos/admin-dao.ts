import { ConnectionPool, IProcedureResult, MAX, Request as SqlRequest, TYPES } from 'mssql';
import { IGoogleData, INote, IProviderData, IUser, IUserFull, UserStatus } from '~entities';
import { sqlNVarChar, sqlVarChar, UserRole } from '~shared';

/**
 * Admin Data Access
 */
export class AdminDao {
  private sql: ConnectionPool;

  /**
   * @param {ConnectionPool} pool Connection pool to use
   */
  constructor(pool: ConnectionPool) {
    this.sql = pool;
  }

  /**
   *
   * @param {IUserAddDTO} user
   */
  public async add(user: IUserAddDTO): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('firstName', sqlNVarChar(100), user.firstName)
        .input('lastName', sqlNVarChar(100), user.lastName)
        .input('displayName', sqlNVarChar(200), user.displayName)
        .input('email', sqlVarChar(50), user.email)
        .input('provider', sqlVarChar(50), user.provider)
        .input('providerData', sqlNVarChar(MAX), JSON.stringify(user.providerData))
        .input('googleId', sqlVarChar(50), user.googleId)
        .input('profileImageUrl', sqlVarChar(512), user.profileImageUrl)
        .output('userId', TYPES.Int);

      // only for initial admin accounts the roles property will be set
      if (user.roles?.length) {
        sqlReq.input('roles', sqlVarChar(50), user.roles.join());
      }

      const result = await sqlReq.execute('adminUserAdd');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {IUserFull} user
   */
  public async update(user: IUserFull): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('id', TYPES.Int, user.id)
        .input('firstName', sqlNVarChar(100), user.firstName)
        .input('lastName', sqlNVarChar(100), user.lastName)
        .input('displayName', sqlNVarChar(200), user.displayName)
        .input('phone', sqlVarChar(50), user.phone)
        .input('socialInfo', sqlVarChar(MAX), user.socialInfo)
        .input('status', TYPES.TinyInt, user.status)
        .input('roles', sqlVarChar(50), user.roles.join());

      const result = await sqlReq.execute('adminUserUpdate');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {IUserFull} user
   */
  public async updateProviderData(user: IUserFull): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('id', TYPES.Int, user.id)
        .input('email', sqlVarChar(50), user.email)
        .input('providerData', sqlNVarChar(MAX), JSON.stringify(user.providerData))
        .input('profileImageUrl', sqlVarChar(512), user.profileImageUrl);

      const result = await sqlReq.execute('userUpdateProviderData');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {number} userId
   * @param {UserStatus} status
   */
  public async updateStatus(userId: number, status: UserStatus): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('id', TYPES.Int, userId)
        .input('status', TYPES.TinyInt, status);

      const result = await sqlReq.execute('adminUserUpdateStatus');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {number} userId
   * @param {INote[]} notes
   */
  public async updateNotes(userId: number, notes: INote[]): Promise<void> {
    const sqlRequest = new SqlRequest(this.sql)
      .input('id', TYPES.Int, userId)
      .input('notes', sqlNVarChar(MAX), JSON.stringify(notes));

    await sqlRequest.execute('adminUserUpdateNotes');
  }

  /**
   *
   * @param {number} id
   * @param {UserStatus} status
   */
  public async delete(id: number, status: UserStatus): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('id', TYPES.Int, id)
        .input('status', TYPES.TinyInt, status);

      const result = await sqlReq.execute('adminUserDelete');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user list
   * @param {boolean} deleted
   * @return {Promise<IUser[]>}
   */
  public async list(deleted: boolean): Promise<IUser[]> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('deleted', TYPES.TinyInt, deleted ? 1 : 0)
        .execute('adminUserList');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by role list
   * @param {UserRole} role
   * @return {Promise<IUser[]>}
   */
  public async listByRole(role: UserRole): Promise<IUser[]> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('roleId', TYPES.TinyInt, role)
        .execute('adminUserListByRole');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
}


export interface IUserAddDTO {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  roles?: UserRole[];
  provider: string;
  providerData: IProviderData | IGoogleData;
  profileImageUrl: string;
  googleId: string;
  status: UserStatus;
}
