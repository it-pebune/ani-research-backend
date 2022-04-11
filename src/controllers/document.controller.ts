import { createHash } from 'crypto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { ApiError, DocumentType, DocumentVersion, ErrorResponse, IQueueInput, ISubject } from '~entities';
import {
  appConfig, logger, parseError, getRequestUser, generateSasUrl
} from '~shared';
import app from '~app';
import { DocumentDao, SubjectDao } from '~daos';
import Joi from 'joi';
import got from 'got';
import { ShareServiceClient } from '@azure/storage-file-share';
import { QueueServiceClient } from '@azure/storage-queue';

// const got = require('got');


interface IDocumentDTO {
  subjectId: number;
  jobId: number;
  type: number;
  status: number;
  date: Date;
  name: string;
  downloadUrl: string;
}


/** Document management controller */
export class DocumentController {
  /**
   * @api {get} /api/docs/:docId Get details for the specified document
   * @apiName DocumentGet
   * @apiGroup Document Management
   * @apiVersion 0.5.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get details for the specified document
   *
   * @apiSuccess {Object} doc Document info
   * @apiSuccess {String} doc.id Document unique id
   * @apiSuccess {String} doc.name
   * @apiSuccess {String} doc.md5
   * @apiSuccess {String} doc.downloadedUrl
   * @apiSuccess {String} doc.originalPath
   * @apiSuccess {Date}   doc.created
   * @apiSuccess {String} doc.createdByName
   * @apiSuccess {Date}   doc.updated
   * @apiSuccess {String} doc.updatedByName
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async read(req: Request, res: Response): Promise<void> {
    try {
      const sqlpool = await app.sqlPool;
      const dao = new DocumentDao(sqlpool);
      const doc = await dao.getById(req.params.docId);
      res.status(StatusCodes.OK).json(doc);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {post} /api/docs Add a new document
   * @apiName DocumentAdd
   * @apiGroup Document Management
   * @apiVersion 0.5.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Adds a new document
   *
   * @apiParam {Number} subjectId
   * @apiParam {Number} type
   * @apiParam {Number} status
   * @apiParam {String} name
   * @apiParam {String} downloadUrl
   *
   * @apiErrorExample Error-Response:
   * HTTP 1/1 406
   * {
   *  code: VALIDATION_ERROR,
   *  message: 'Input validation failed',
   *  details: validation error array
   * }
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async add(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const requestSchema = Joi.object<IDocumentDTO>({
        subjectId: Joi.number().required(),
        jobId: Joi.number().required(),
        type: Joi.number().required(),
        status: Joi.number().required(),
        date: Joi.date().required(),
        name: Joi.string().required(),
        downloadUrl: Joi.string().required()
      });
      const { value: params, error: verror } = requestSchema.validate(req.body);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const appCfg = appConfig();

      // download file and calculate hash
      const buff = await this.downloadFile(params.downloadUrl);
      const hashSum = createHash('sha1'); // quicker than sha256
      hashSum.update(buff);
      const md5 = hashSum.digest('base64');

      // check if document already exists in DB
      const sqlpool = await app.sqlPool;
      const docDao = new DocumentDao(sqlpool);
      const exists = await docDao.exists(md5, params.downloadUrl);
      if (exists) {
        logger.debug(`there is already a document with this md5: ${md5} ${params.downloadUrl}`);
        res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse(ApiError.document_already_exists));
        return;
      }

      // upload file to storage
      const subjDao = new SubjectDao(sqlpool);
      const subj = await subjDao.getById(params.subjectId);
      if (!subj) {
        logger.debug(`there is no subject with this id: ${params.subjectId}`);
        res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse(ApiError.unknown_subject));
        return;
      }

      const subjFolder = this.getSubjectFolder(subj);
      const declFolder = params.type === DocumentType.assetDeclaration ? 'DA' : 'DI';
      const docId = uuidv4();
      const fileName = docId;
      // eslint-disable-next-line max-len
      const originalPath = `${appCfg.storageOcrInfo.fileEndpoint}/${appCfg.shareDeclarations}/${subjFolder}/${declFolder}/${fileName}`;

      const shareServiceClient = ShareServiceClient.fromConnectionString(appCfg.storageOcrCnnString);
      const shareClient = shareServiceClient.getShareClient(appCfg.shareDeclarations);
      const subjFolderClient = shareClient.getDirectoryClient(subjFolder);
      await subjFolderClient.createIfNotExists();
      const declFolderClient = subjFolderClient.getDirectoryClient(declFolder);
      await declFolderClient.createIfNotExists();
      const fileClient = declFolderClient.getFileClient(fileName);
      await fileClient.create(buff.byteLength);
      await fileClient.uploadData(buff);

      const doc = {
        docId,
        subjectId: params.subjectId,
        jobId: params.jobId,
        userId: loggedUser.id,
        type: params.type,
        status: params.status,
        date: params.date,
        name: params.name,
        md5,
        downloadedUrl: params.downloadUrl,
        originalPath
      };
      logger.debug(doc);
      await docDao.add(doc);

      // add message to ocr queue
      const queueServiceClient = QueueServiceClient.fromConnectionString(appCfg.storageOcrCnnString);
      const queueClient = queueServiceClient.getQueueClient(appCfg.queueDeclarationsInName);
      const msg: IQueueInput = {
        documentId: docId,
        type: params.type,
        formularType: DocumentVersion.v1,
        storage: 'azure',
        path: `${subjFolder}/${declFolder}`,
        filename: fileName,
        outPath: `${subjFolder}/${declFolder}`,
        ocrTableJsonFilename: `${fileName}-table.json`,
        ocrCustomJsonFilename: `${fileName}-custom.json`
      };
      logger.debug(msg);
      const sendResp = await queueClient.sendMessage(JSON.stringify(msg));
      logger.debug({
        requestId: sendResp.requestId,
        clientRequestId: sendResp.clientRequestId,
        version: sendResp.version,
        errorCode: sendResp.errorCode,
        messageId: sendResp.messageId,
        popReceipt: sendResp.popReceipt
      });

      res.status(StatusCodes.OK).send();
    } catch (ex) {
      if (ex instanceof ApiError) {
        res.status(ex.statusCode).json(new ErrorResponse(ex));
      } else {
        logger.error(parseError(ex));
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
      }
    }
  }

  /**
   * @param {String} url
   * @param {String} documentId
   * @return {String}
   */
  private getFilename(url: string, documentId: string): string {
    const re1 = /.+\/(?<filename>.+)$/;
    const re2 = /.+fileName=(?<filename>.+)&.*/i;
    let result = url.match(re2);
    if (result?.groups) {
      return `${result.groups['filename']}-${documentId}`;
    }
    result = url.match(re1);
    if (result?.groups) {
      return `${result.groups['filename']}-${documentId}`;
    }
    return documentId;
  }

  /**
   * @param {ISubject} subject
   * @return {String}
   */
  private getSubjectFolder(subject: ISubject): string {
    const parts: string[] = [
      ...subject.lastName.split(/[\s,\-]/),
      ...subject.firstName.split(/[\s,\-]/),
      subject.uuid
    ];

    return parts.join('-');
  }

  /**
   * @param {String} url
   */
  private async downloadFile(url: string): Promise<Buffer> {
    try {
      return await got(url).buffer();
    } catch (error) {
      logger.error(parseError(error));
      throw ApiError.download_file_error.withDetails({ url });
    }
  }

  /**
   * @api {put} /api/docs/:docId Update the specified document
   * @apiName DocumentUpdate
   * @apiGroup Document Management
   * @apiVersion 0.5.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Update the specified document
   *
   * @apiParam {Number} type
   * @apiParam {Number} status
   * @apiParam {String} name
   *
   * @apiErrorExample Error-Response:
   * HTTP 1/1 406
   * {
   *  code: VALIDATION_ERROR,
   *  message: 'Input validation failed',
   *  details: validation error array
   * }
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async update(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const docId = req.params.docId;

      const requestSchema = Joi.object<IDocumentDTO>({
        jobId: Joi.number().required(),
        name: Joi.string().required(),
        type: Joi.number().required(),
        status: Joi.number().required(),
        date: Joi.date().required()
      });
      const { value: params, error: verror } = requestSchema.validate(req.body);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const doc = {
        docId,
        subjectId: 0,
        jobId: params.jobId,
        userId: loggedUser.id,
        type: params.type,
        status: params.status,
        date: params.date,
        name: params.name,
        md5: '',
        downloadedUrl: '',
        originalPath: ''
      };

      const sqlpool = await app.sqlPool;
      const dao = new DocumentDao(sqlpool);
      await dao.update(doc);

      res.status(StatusCodes.OK).send();
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {put} /api/docs/:docId/data Update the specified document data
   * @apiName DocumentUpdateData
   * @apiGroup Document Management
   * @apiVersion 0.5.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Update the specified document data
   *
   * @apiParam {string} data
   *
   * @apiErrorExample Error-Response:
   * HTTP 1/1 406
   * {
   *  code: VALIDATION_ERROR,
   *  message: 'Input validation failed',
   *  details: validation error array
   * }
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async updateData(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const docId = req.params.docId;

      const requestSchema = Joi.object<{ data: string }>({
        data: Joi.string().required()
      });
      const { value: params, error: verror } = requestSchema.validate(req.body);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const sqlpool = await app.sqlPool;
      const dao = new DocumentDao(sqlpool);
      await dao.updateData(docId, loggedUser.id, params.data);

      res.status(StatusCodes.OK).send();
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {delete} /api/docs/:docId Delete the specified document
   * @apiName DocumentDelete
   * @apiGroup Document Management
   * @apiVersion 0.5.0
   * @apiPermission coordinator, reviewer
   * @apiDescription Delete the specified document
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async delete(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const sqlpool = await app.sqlPool;
      const dao = new DocumentDao(sqlpool);
      await dao.delete(req.params.docId);

      res.status(StatusCodes.OK).send();
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {get} /api/docs List subject' documents
   * @apiName DocumentList
   * @apiGroup Document Management
   * @apiVersion 0.5.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get a list of specified subject documents.
   *
   * @apiParam {Number} subjectId
   *
   * @apiSuccess {Object[]} docs List of subject' documents
   * @apiSuccess {String} doc.id Document unique id
   * @apiSuccess {String} doc.name
   * @apiSuccess {String} doc.md5
   * @apiSuccess {DocumentType} doc.type
   * @apiSuccess {String} doc.downloadedUrl
   * @apiSuccess {String} doc.originalPath
   * @apiSuccess {Date}   doc.created
   * @apiSuccess {String} doc.createdByName
   * @apiSuccess {Date}   doc.updated
   * @apiSuccess {String} doc.updatedByName
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async list(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const requestSchema = Joi.object<{ subjectId: number }>({
        subjectId: Joi.number().required()
      });
      const { value: params, error: verror } = requestSchema.validate(req.query);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const sqlpool = await app.sqlPool;
      const dao = new DocumentDao(sqlpool);
      const docs = await dao.list(params.subjectId);

      res.status(StatusCodes.OK).json(docs);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {get} /api/docs/:docId/data Get the document processed data
   * @apiName DocumentGetData
   * @apiGroup Document Management
   * @apiVersion 0.5.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get the specified document processed data
   *
   * @apiSuccess {Object} doc Document info
   * @apiSuccess {String} doc.id Document unique id
   * @apiSuccess {String} doc.data
   *
   * @apiErrorExample Error-Response:
   * HTTP 1/1 406
   * {
   *  code: VALIDATION_ERROR,
   *  message: 'Input validation failed',
   *  details: validation error array
   * }
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async getData(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const sqlpool = await app.sqlPool;
      const dao = new DocumentDao(sqlpool);
      const result = await dao.getData(req.params.docId);

      res.status(StatusCodes.OK).json(result);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {get} /api/docs/:docId/dataraw Get the document original raw data
   * @apiName DocumentGetDataRaw
   * @apiGroup Document Management
   * @apiVersion 0.5.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get the specified document processed data
   *
   * @apiSuccess {Object} doc Document info
   * @apiSuccess {String} doc.id Document unique id
   * @apiSuccess {String} doc.dataRaw
   *
   * @apiErrorExample Error-Response:
   * HTTP 1/1 406
   * {
   *  code: VALIDATION_ERROR,
   *  message: 'Input validation failed',
   *  details: validation error array
   * }
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async getDataRaw(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const sqlpool = await app.sqlPool;
      const dao = new DocumentDao(sqlpool);
      const result = await dao.getRawData(req.params.docId);

      res.status(StatusCodes.OK).json(result);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {get} /api/docs/:docId/odoc Get the original document
   * @apiName DocumentGetOriginal
   * @apiGroup Document Management
   * @apiVersion 0.5.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get the specified document original url
   *
   * @apiSuccess {Object} doc Document info
   * @apiSuccess {String} doc.id Document unique id
   * @apiSuccess {String} doc.originalPath
   *
   * @apiErrorExample Error-Response:
   * HTTP 1/1 406
   * {
   *  code: VALIDATION_ERROR,
   *  message: 'Input validation failed',
   *  details: validation error array
   * }
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async getOriginalDoc(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const sqlpool = await app.sqlPool;
      const dao = new DocumentDao(sqlpool);
      const result = await dao.getOriginalPath(req.params.docId);
      if (!result || !result.originalPath) {
        res.status(StatusCodes.NOT_FOUND).json(new ErrorResponse(ApiError.document_not_found));
        return;
      }

      const sasUrl = generateSasUrl(appConfig().storageOcrInfo, result.originalPath, 60);
      res.status(StatusCodes.OK).json({ url: sasUrl });
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }
}
