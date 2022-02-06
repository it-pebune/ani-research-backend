import { ConnectionPool, IProcedureResult, MAX, Request as SqlRequest, TYPES } from 'mssql';
import { DocumentStatus, DocumentType, IDocument } from '~entities';
import { sqlVarChar } from '~shared';


interface IDocumentDTO {
  docId: string;
  subjectId: number;
  userId: number;
  type: DocumentType;
  status: DocumentStatus;
  name: string;
  md5: string;
  downloadedUrl: string;
  originalPath: string;
}

/**
 * User Data Access
 */
export class DocumentDao {
  private sql: ConnectionPool;

  /**
   * @param {ConnectionPool} pool Connection pool to use
   */
  constructor(pool: ConnectionPool) {
    this.sql = pool;
  }

  /**
   * Get document by id
   * @param {string} id
   * @return {Promise<ISubject>}
   */
  public async getById(id: string): Promise<IDocument> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('id', sqlVarChar(50), id)
        .execute('getDocumentById');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {IDocumentDTO} doc
   */
  public async add(doc: IDocumentDTO): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('docId', sqlVarChar(50), doc.docId)
        .input('subjectId', TYPES.Int, doc.subjectId)
        .input('userId', TYPES.Int, doc.userId)
        .input('type', TYPES.TinyInt, doc.type)
        .input('status', TYPES.TinyInt, doc.status)
        .input('name', sqlVarChar(MAX), doc.name)
        .input('md5', sqlVarChar(MAX), doc.md5)
        .input('downloadedUrl', sqlVarChar(MAX), doc.downloadedUrl)
        .input('originalPath', sqlVarChar(MAX), doc.originalPath);

      const result = await sqlReq.execute('documentAdd');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {IDocumentDTO} doc
   */
  public async update(doc: IDocumentDTO): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('docId', sqlVarChar(50), doc.docId)
        .input('userId', TYPES.Int, doc.userId)
        .input('type', TYPES.TinyInt, doc.type)
        .input('status', TYPES.TinyInt, doc.status)
        .input('name', sqlVarChar(MAX), doc.name);

      const result = await sqlReq.execute('documentUpdate');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {string} docId
   * @param {number} userId
   * @param {string} data
   */
  public async updateData(docId: string, userId: number, data: string): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('docId', sqlVarChar(MAX), docId)
        .input('userId', TYPES.Int, userId)
        .input('data', sqlVarChar(MAX), data);

      const result = await sqlReq.execute('documentUpdateData');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {string} id
   */
  public async delete(id: string): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('docId', sqlVarChar(50), id);

      const result = await sqlReq.execute('documentDelete');
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get subject' document list
   * @param {number} subjectId
   * @return {Promise<ISubject[]>}
   */
  public async list(subjectId: number): Promise<IDocument[]> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('subjectId', TYPES.Int, subjectId)
        .execute('documentList');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get document data
   * @param {string} id
   * @return {Promise<ISubject>}
   */
  public async getData(id: string): Promise<IDocument> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('id', sqlVarChar(50), id)
        .execute('getDocumentData');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get document raw data
   * @param {string} id
   * @return {Promise<ISubject>}
   */
  public async getRawData(id: string): Promise<IDocument> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('id', sqlVarChar(50), id)
        .execute('getDocumentDataRaw');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get document original path
   * @param {string} id
   * @return {Promise<ISubject>}
   */
  public async getOriginalPath(id: string): Promise<IDocument> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('id', sqlVarChar(50), id)
        .execute('getDocumentOriginalPath');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }
}
