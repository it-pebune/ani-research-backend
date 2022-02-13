import { ConnectionPool, IProcedureResult, MAX, Request as SqlRequest, TYPES } from 'mssql';
import { IInstitution, InstitutionType } from '~entities';
import { sqlVarChar } from '~shared';


interface IInstitutionDTO {
  institutionId: number;
  sirutaId: number;
  type: InstitutionType;
  name: string;
  address?: string;
  cui?: string;
  regCom?: string;
  dateStart?: Date;
  dateEnd?: Date;
  info?: string;
}

/**
 * Institution Data Access
 */
export class InstitutionDao {
  private sql: ConnectionPool;

  /**
   * @param {ConnectionPool} pool Connection pool to use
   */
  constructor(pool: ConnectionPool) {
    this.sql = pool;
  }

  /**
   * Get institution by id
   * @param {number} id
   * @return {Promise<IInstitution>}
   */
  public async getById(id: number): Promise<IInstitution> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('id', TYPES.Int, id)
        .execute('getInstitutionById');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {IInstitutionDTO} inst
   */
  public async add(inst: IInstitutionDTO): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('sirutaId', TYPES.Int, inst.sirutaId)
        .input('type', TYPES.TinyInt, inst.type)
        .input('dateStart', TYPES.Date, inst.dateStart)
        .input('dateEnd', TYPES.Date, inst.dateEnd)
        .input('name', sqlVarChar(200), inst.name)
        .input('address', sqlVarChar(300), inst.address)
        .input('cui', sqlVarChar(20), inst.cui)
        .input('regCom', sqlVarChar(20), inst.regCom)
        .input('info', sqlVarChar(MAX), inst.info)
        .output('institutionId', TYPES.Int);

      const result = await sqlReq.execute('institutionAdd');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {IInstitutionDTO} inst
   */
  public async update(inst: IInstitutionDTO): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('institutionId', TYPES.Int, inst.institutionId)
        .input('sirutaId', TYPES.Int, inst.sirutaId)
        .input('type', TYPES.TinyInt, inst.type)
        .input('dateStart', TYPES.Date, inst.dateStart)
        .input('dateEnd', TYPES.Date, inst.dateEnd)
        .input('name', sqlVarChar(200), inst.name)
        .input('address', sqlVarChar(300), inst.address)
        .input('cui', sqlVarChar(20), inst.cui)
        .input('regCom', sqlVarChar(20), inst.regCom)
        .input('info', sqlVarChar(MAX), inst.info);

      const result = await sqlReq.execute('institutionUpdate');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {number} id
   */
  public async delete(id: number): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('id', TYPES.Int, id);

      const result = await sqlReq.execute('institutionDelete');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get institution list
   * @return {Promise<IInstitution[]>}
   */
  public async list(): Promise<IInstitution[]> {
    try {
      const result = await new SqlRequest(this.sql)
        .execute('institutionList');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
}
