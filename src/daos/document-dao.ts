import { ConnectionPool, IProcedureResult, MAX, Request as SqlRequest, TYPES } from 'mssql';
import { DocumentStatus, DocumentType, IDocument } from '~entities';
import { sqlNVarChar, sqlVarChar } from '~shared';


interface IDocumentDTO {
  docId: string;
  jobId: number;
  subjectId: number;
  userId: number;
  type: DocumentType;
  status: DocumentStatus;
  date: Date;
  name: string;
  md5: string;
  downloadedUrl: string;
  originalPath: string;
}

/**
 * Document Data Access
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
   * @return {Promise<IDocument>}
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
   * Check if a document with the same md5 and downloaded url exists
   * @param {string} md5
   * @param {string} downloadedUrl
   * @return {Promise<IDocument>}
   */
  public async exists(md5: string, downloadedUrl: string): Promise<IDocument> {
    try {
      const result = await new SqlRequest(this.sql)
        .input('md5', sqlVarChar(32), md5)
        .input('downloadedUrl', sqlVarChar(MAX), downloadedUrl)
        .execute('documentExists');
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
        .input('jobId', TYPES.Int, doc.jobId)
        .input('subjectId', TYPES.Int, doc.subjectId)
        .input('userId', TYPES.Int, doc.userId)
        .input('type', TYPES.TinyInt, doc.type)
        .input('status', TYPES.TinyInt, doc.status)
        .input('date', TYPES.Date, doc.date)
        .input('name', sqlNVarChar(MAX), doc.name)
        .input('md5', sqlVarChar(32), doc.md5)
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
        .input('jobId', TYPES.Int, doc.jobId)
        .input('userId', TYPES.Int, doc.userId)
        .input('type', TYPES.TinyInt, doc.type)
        .input('status', TYPES.TinyInt, doc.status)
        .input('date', TYPES.Date, doc.date)
        .input('name', sqlNVarChar(MAX), doc.name);

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
   * @param {string} docId
   * @param {DocumentStatus} status
   * @param {string} data
   */
  public async updateDataRaw(docId: string, status: DocumentStatus, data?: string): Promise<IProcedureResult<any>> {
    try {
      const sqlReq = new SqlRequest(this.sql)
        .input('docId', sqlVarChar(MAX), docId)
        .input('status', TYPES.TinyInt, status)
        .input('data', sqlVarChar(MAX), data);

      const result = await sqlReq.execute('documentUpdateDataRaw');
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
   * @return {Promise<IDocument[]>}
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

  /**
   * Get document status
   * @param {string} docId
   * @param {number} subjectId
   * @param {number} jobId
   * @param {number} createdBy
   * @return {Promise<ISubject>}
   */
  public async getStatus(docId: string | null = null, subjectId = 0, jobId = 0, createdBy = 0):
    Promise<Array<{ id: string; status: DocumentStatus }>> {
    try {
      console.log(docId, subjectId, jobId, createdBy);
      const result = await new SqlRequest(this.sql)
        .input('statusValidated', TYPES.TinyInt, DocumentStatus.validated)
        .input('docId', sqlVarChar(50), docId)
        .input('subjectId', TYPES.Int, subjectId)
        .input('jobId', TYPES.Int, jobId)
        .input('createdBy', TYPES.Int, createdBy)
        .execute('getDocumentStatus');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
}
