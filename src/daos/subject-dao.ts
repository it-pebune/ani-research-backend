import { ConnectionPool, IProcedureResult, MAX, Request as SqlRequest, TYPES } from 'mssql';
import { ISubject, ISubjectAssignedHistory, SubjectStatus } from '~entities';
import { sqlNVarChar, sqlVarChar } from '~shared';

interface ISubjectDTO {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  dob: Date;
  sirutaId?: number;
  hash: string;
}

interface ISubjectAssignDTO {
  id: number;
  userId: number;
  assignedBy: number;
  status: SubjectStatus;
}

/**
 * User Data Access
 */
export class SubjectDao {
  private sql: ConnectionPool;

  /**
   * @param {ConnectionPool} pool Connection pool to use
   */
  constructor(pool: ConnectionPool) {
    this.sql = pool;
  }

  /**
   * Get subject by id
   * @param {number} id
   * @return {Promise<ISubject>}
   */
  public async getById(id: number): Promise<ISubject> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('id', TYPES.Int, id)
        .execute('getSubjectById');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {ISubjectDTO} subject
   */
  public async add(subject: ISubjectDTO): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('uuid', sqlVarChar(50), subject.uuid)
        .input('firstName', sqlNVarChar(100), subject.firstName)
        .input('lastName', sqlNVarChar(100), subject.lastName)
        .input('photoUrl', sqlNVarChar(MAX), subject.photoUrl)
        .input('dob', TYPES.Date, subject.dob)
        .input('sirutaId', TYPES.Int, subject.sirutaId || 0)
        .input('hash', sqlNVarChar(40), subject.hash)
        .output('subjectId', TYPES.Int);

      const result = await sqlReq.execute('subjectAdd');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {ISubject} subject
   */
  public async update(subject: ISubject): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('id', TYPES.Int, subject.id)
        .input('firstName', sqlNVarChar(100), subject.firstName)
        .input('lastName', sqlNVarChar(100), subject.lastName)
        .input('photoUrl', sqlNVarChar(MAX), subject.photoUrl)
        .input('dob', TYPES.Date, subject.dob)
        .input('sirutaId', TYPES.Int, subject.sirutaId || 0)
        .input('hash', sqlNVarChar(40), subject.hash);

      const result = await sqlReq.execute('subjectUpdate');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {number} id
   * @param {string} notes
   */
  public async updateNotes(id: number, notes: string): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('id', TYPES.Int, id)
        .input('notes', sqlNVarChar(MAX), notes);

      const result = await sqlReq.execute('subjectUpdateNotes');
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

      const result = await sqlReq.execute('subjectDelete');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get subject list
   * @param {number} userId
   * @param {boolean} deleted
   * @return {Promise<ISubject[]>}
   */
  public async list(userId: number, deleted: boolean): Promise<ISubject[]> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('userId', TYPES.Int, userId)
        .input('deleted', TYPES.TinyInt, deleted ? 1 : 0)
        .execute('subjectList');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get subject assigned history
   * @param {number} id
   * @return {Promise<ISubjectAssignedHistory[]>}
   */
  public async assignedHistory(id: number): Promise<ISubjectAssignedHistory[]> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('id', TYPES.Int, id)
        .execute('getSubjectAssignedHistory');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assign subject to user
   * @param {ISubjectAssignDTO} params
   * @return {Promise<IProcedureResult<any>>}
   */
  public async assign(params: ISubjectAssignDTO) : Promise<IProcedureResult<any>> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('subjectId', TYPES.Int, params.id)
        .input('userId', TYPES.Int, params.userId)
        .input('assignedBy', TYPES.Int, params.assignedBy)
        .input('status', TYPES.TinyInt, params.status)
        .execute('subjectAssign');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {string} hash
   * @return {Promise<boolean>}
   */
  public async subjectWithHashExists(hash: string): Promise<boolean> {
    return !!(await new SqlRequest(this.sql)
      .input('hash', sqlNVarChar(40), hash)
      .execute('subjectWithHashExists'))
      .recordset[0];
  }

  /**
   * @param {string[]} hashes
   * @return {Promise<{}>}
   */
  public async getSubjectsWithHashes(hashes: string[]): Promise<{ [hash: string]: number }> {
    const subjects = (await new SqlRequest(this.sql)
      .input('hashes', sqlNVarChar(MAX), hashes.join(','))
      .execute('getSubjectsWithHashes'))
      .recordset;

    const subjectIdsByHashes: any = {};

    for (const subject of subjects) {
      subjectIdsByHashes[subject.hash] = subject.id;
    }

    return subjectIdsByHashes;
  }
}
