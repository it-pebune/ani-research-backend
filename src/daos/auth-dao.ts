import { initWithDbRecord, IUserFull } from '~entities';
import { ConnectionPool, Request as SqlRequest, TYPES } from 'mssql';
import { sqlVarChar } from '~shared';


/** Authorization Data Access */
export class AuthDao {
  private sql: ConnectionPool;

  /**
   * @param {ConnectionPool} pool
   */
  constructor(pool: ConnectionPool) {
    this.sql = pool;
  }

  /**
   * @param {number} userId
   * @param {string} refreshToken
   * @param {Date} refreshTokenExpires
   * @param {Date} lastLogin
   */
  public async didLogin(userId: number, refreshToken: string, refreshTokenExpires: Date, lastLogin: Date)
    : Promise<void> {
    try {
      await new SqlRequest(this.sql)
        .input('id', TYPES.Int, userId)
        .input('refreshToken', sqlVarChar(64), refreshToken)
        .input('refreshTokenExpires', TYPES.DateTime, refreshTokenExpires)
        .input('lastLogin', TYPES.DateTime, lastLogin)
        .execute('didLogin');
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {number} userId
   * @param {Date} refreshTokenExpires
   */
  public async didLogout(userId: number, refreshTokenExpires: Date): Promise<void> {
    try {
      await new SqlRequest(this.sql)
        .input('id', TYPES.Int, userId)
        .input('refreshTokenExpires', TYPES.DateTime, refreshTokenExpires)
        .execute('didLogout');
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {string} refreshToken
   * @param {Date} refreshTokenExpires
   * @return {Prmise<IUserFull>}
   */
  public async getUserByRefreshToken(refreshToken: string, refreshTokenExpires: Date): Promise<IUserFull | null> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('refreshToken', sqlVarChar(64), refreshToken)
        .input('refreshTokenExpires', TYPES.DateTime, refreshTokenExpires)
        .execute('getUserByRefreshToken');

      if (!result.recordset?.length) {
        return null;
      }

      const roles = result.recordsets[1].map((record) => record.roleId);
      return initWithDbRecord(result.recordset[0], roles);
    } catch (error) {
      throw error;
    }
  }
}
