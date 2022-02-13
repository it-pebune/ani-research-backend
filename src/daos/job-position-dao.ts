import { ConnectionPool, IProcedureResult, MAX, Request as SqlRequest, TYPES } from 'mssql';
import { IJobPosition } from '~entities';
import { sqlVarChar } from '~shared';


interface IJobPositionDTO {
  jobId: number;
  subjectId: number;
  institutionId: number;
  sirutaId: number;
  dateStart: Date;
  dateEnd?: Date;
  name: string;
  info?: string;
}

/**
 * Job Position Data Access
 */
export class JobPositionDao {
  private sql: ConnectionPool;

  /**
   * @param {ConnectionPool} pool Connection pool to use
   */
  constructor(pool: ConnectionPool) {
    this.sql = pool;
  }

  /**
   * Get job position by id
   * @param {number} id
   * @return {Promise<IJobPosition>}
   */
  public async getById(id: number): Promise<IJobPosition> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('id', TYPES.Int, id)
        .execute('getJobPositionById');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {IJobPositionDTO} jobpos
   */
  public async add(jobpos: IJobPositionDTO): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('subjectId', TYPES.Int, jobpos.subjectId)
        .input('institutionId', TYPES.Int, jobpos.institutionId)
        .input('sirutaId', TYPES.Int, jobpos.sirutaId)
        .input('dateStart', TYPES.Date, jobpos.dateStart)
        .input('dateEnd', TYPES.Date, jobpos.dateEnd)
        .input('name', sqlVarChar(300), jobpos.name)
        .input('info', sqlVarChar(MAX), jobpos.info)
        .output('jobId', TYPES.Int);

      const result = await sqlReq.execute('jobposAdd');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {IJobPositionDTO} jobpos
   */
  public async update(jobpos: IJobPositionDTO): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('jobId', TYPES.Int, jobpos.jobId)
        .input('institutionId', TYPES.Int, jobpos.institutionId)
        .input('sirutaId', TYPES.Int, jobpos.sirutaId)
        .input('dateStart', TYPES.Date, jobpos.dateStart)
        .input('dateEnd', TYPES.Date, jobpos.dateEnd)
        .input('name', sqlVarChar(300), jobpos.name)
        .input('info', sqlVarChar(MAX), jobpos.info);

      const result = await sqlReq.execute('jobposUpdate');
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
        .input('jobId', TYPES.Int, id);

      const result = await sqlReq.execute('jobposDelete');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get subject' job position list
   * @param {number} subjectId
   * @return {Promise<IJobPosition[]>}
   */
  public async list(subjectId: number): Promise<IJobPosition[]> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('subjectId', TYPES.Int, subjectId)
        .execute('jobposList');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
}
