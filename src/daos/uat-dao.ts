import { ConnectionPool, Request as SqlRequest, TYPES } from 'mssql';

/* eslint-disable no-unused-vars */
export enum UatType {
  All = 0,
  ConsiliuJudetean = 11,
  Municipiu = 12,
  Oras = 13,
  Comuna = 14,
  Bucuresti = 15, // Primaria Municipiului Bucuresti
  BucurestiSector = 16 // Primarie de Sector al Municipiului Bucuresti
}
/* eslint-enable no-unused-vars */

interface ICounty {
  id: number;
  name: string;
}

interface IUat {
  sirutaId: number;
  countyId: number;
  type: UatType;
  name: string;
}

interface IUatWithCounty extends Omit<IUat, 'countyId'> {
  county: ICounty | null;
}

/**
 * User Data Access
 */
export class UatDao {
  private sql: ConnectionPool;

  /**
   * @param {ConnectionPool} pool Connection pool to use
   */
  constructor(pool: ConnectionPool) {
    this.sql = pool;
  }

  /**
   * Get counties list
   * @return {Promise<ICounty[]>}
   */
  public async getCounties(): Promise<ICounty[]> {
    try {
      const result = await new SqlRequest(this.sql)
        .execute('getCounties');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get uat list
   * @param {number} countyId
   * @param {UatType} type
   * @return {Promise<IUat[]>}
   */
  public async getUats(countyId: number = 0, type: UatType = UatType.All): Promise<IUat[]> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('countyId', TYPES.Int, countyId)
        .input('type', TYPES.TinyInt, type)
        .execute('getUats');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {number} sirutaId
   * @return {Promise<IUatWithCounty | null>}
   */
  public async getUatWithCounty(sirutaId?: number): Promise<IUatWithCounty | null> {
    if (!sirutaId) {
      return null;
    }

    const data = (await new SqlRequest(this.sql)
      .input('sirutaId', TYPES.Int, sirutaId)
      .execute('getUatWithCounty'))
      .recordset[0];

    return {
      sirutaId: data.sirutaId,
      type: data.type,
      name: data.name,
      county: data.countyId ? { id: data.countyId, name: data.countyName } : null
    };
  }
}
