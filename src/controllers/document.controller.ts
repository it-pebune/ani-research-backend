import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { v4 as uuidv4 } from 'uuid';
import { ApiError, ErrorResponse } from '~entities';
import {
  logger, parseError, getRequestUser
} from '~shared';
import app from '~app';
import { DocumentDao } from '~daos';
import Joi from 'joi';


interface IDocumentDTO {
  subjectId: number;
  type: number;
  status: number;
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
        type: Joi.number().required(),
        status: Joi.number().required(),
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

      res.status(StatusCodes.NOT_IMPLEMENTED).send();

      // const md5 = '';
      // const originalPath = '';

      // const doc = {
      //   docId: uuidv4(),
      //   subjectId: params.subjectId,
      //   userId: loggedUser.id,
      //   type: params.type,
      //   status: params.status,
      //   name: params.name,
      //   md5,
      //   downloadedUrl: params.downloadUrl,
      //   originalPath
      // };

      // const sqlpool = await app.sqlPool;
      // const dao = new DocumentDao(sqlpool);
      // await dao.add(doc);

      // res.status(StatusCodes.OK).json(doc);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
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
        name: Joi.string().required(),
        type: Joi.number().required(),
        status: Joi.number().required()
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
        userId: loggedUser.id,
        type: params.type,
        status: params.status,
        name: params.name,
        md5: '',
        downloadedUrl: '',
        originalPath: ''
      };

      const sqlpool = await app.sqlPool;
      const dao = new DocumentDao(sqlpool);
      await dao.update(doc);

      res.status(StatusCodes.OK).json({});
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
   * @api {delete} /api/docs/:subjectId Delete the specified document
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

      res.status(StatusCodes.OK).json(result);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }
}
