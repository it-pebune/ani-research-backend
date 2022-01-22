import { ConnectionPool, IProcedureResult, MAX, Request as SqlRequest, TYPES } from 'mssql';
import { initWithDbRecord, IUserFull, UserStatus } from '~entities';
import { sqlNVarChar, sqlVarChar } from '~shared';


interface IUserUpdateDTO {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  socialInfo: string;
}

/**
 * User Data Access
 */
export class UserDao {
  private sql: ConnectionPool;

  /**
   * @param {ConnectionPool} pool Connection pool to use
   */
  constructor(pool: ConnectionPool) {
    this.sql = pool;
  }

  /**
   * Get user by id
   * @param {number} id
   * @return {Promise<IUserFull>}
   */
  public async getById(id: number): Promise<IUserFull> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('id', TYPES.Int, id)
        .execute('getUserById');
      const roles = result.recordsets[1].map((record) => record.roleId);
      return initWithDbRecord(result.recordset[0], roles);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by id
   * @param {number} id
   * @return {Promise<IUserFull>}
   */
  public async deserializeUser(id: number): Promise<IUserFull> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('userId', TYPES.Int, id)
        .execute('deserializeUser');
      const roles = result.recordsets[1].map((record) => record.roleId);
      return initWithDbRecord(result.recordset[0], roles);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {string} email
   * @return {Promise<IUserFull>}
   */
  public async getByEmail(email: string): Promise<IUserFull> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('email', sqlVarChar(100), email)
        .execute('getUserByEmail');
      if (!result.recordset?.length) {
        return ((null as unknown) as IUserFull);
      }
      const roles = result.recordsets[1].map((record) => record.roleId);
      return initWithDbRecord(result.recordset[0], roles);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {string} id
   * @return {Promise<IUserFull>}
   */
  public async getByGoogleId(id: string): Promise<IUserFull> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('googleId', sqlVarChar(50), id)
        .execute('getUserByGoogleId');
      if (!result.recordset?.length) {
        return ((null as unknown) as IUserFull);
      }
      const roles = result.recordsets[1].map((record) => record.roleId);
      return initWithDbRecord(result.recordset[0], roles);
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {IUserUpdateDTO} user
   */
  public async update(user: IUserUpdateDTO): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('id', TYPES.Int, user.id)
        .input('firstName', sqlNVarChar(100), user.firstName)
        .input('lastName', sqlNVarChar(100), user.lastName)
        .input('displayName', sqlNVarChar(200), user.displayName)
        .input('phone', sqlVarChar(50), user.phone)
        .input('socialInfo', sqlVarChar(MAX), user.socialInfo);

      const result = await sqlReq.execute('userUpdate');
      return result;
    } catch (error) {
      throw error;
    }
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

      const result = await sqlReq.execute('userDelete');
      return result;
    } catch (error) {
      throw error;
    }
  }
}
