import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiError, ErrorResponse } from '~entities';
import {
  logger, parseError, getRequestUser
} from '~shared';
import app from '~app';
import { JobPositionDao } from '~daos';
import Joi from 'joi';


interface IJobPositionDTO {
  subjectId: number;
  institutionId: number;
  sirutaId: number;
  dateStart: Date;
  dateEnd?: Date;
  name: string;
  info?: string;
}


/** JobPosition management controller */
export class JobPositionController {
  /**
   * @api {get} /api/jobs/:jobId Get details for the specified job position
   * @apiName JobPositionGet
   * @apiGroup JobPosition Management
   * @apiVersion 0.6.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get details for the specified job position
   *
   * @apiSuccess {Object} job JobPosition info
   * @apiSuccess {Number} job.id JobPosition unique id
   * @apiSuccess {String} job.name
   * @apiSuccess {Number} job.institutiionId
   * @apiSuccess {String} job.institution
   * @apiSuccess {Number} job.sirutaId
   * @apiSuccess {String} job.uat
   * @apiSuccess {Date}   job.dateStart
   * @apiSuccess {Date}   job.dateEnd
   * @apiSuccess {String} job.aditionalInfo
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
      const dao = new JobPositionDao(sqlpool);
      const job = await dao.getById(parseInt(req.params.jobId, 10));
      res.status(StatusCodes.OK).json(job);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {post} /api/jobs Add a new job position
   * @apiName JobPositionAdd
   * @apiGroup JobPosition Management
   * @apiVersion 0.6.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Adds a new job position
   *
   * @apiParam {Number} subjectId
   * @apiParam {Number} institutionId
   * @apiParam {Number} sirutaId
   * @apiParam {String} name
   * @apiParam {Date} dateStart
   * @apiParam {Date} dateEnd
   * @apiParam {String} info
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

      const requestSchema = Joi.object<IJobPositionDTO>({
        subjectId: Joi.number().required(),
        institutionId: Joi.number().required(),
        sirutaId: Joi.number().required(),
        dateStart: Joi.date().required(),
        dateEnd: Joi.date(),
        name: Joi.string().required(),
        info: Joi.string()
      });
      const { value: params, error: verror } = requestSchema.validate(req.body);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const job = {
        jobId: 0,
        subjectId: params.subjectId,
        institutionId: params.institutionId,
        sirutaId: params.sirutaId,
        dateStart: params.dateStart,
        dateEnd: params.dateEnd,
        name: params.name,
        info: params.info
      };
      logger.debug(job);
      const sqlpool = await app.sqlPool;
      const dao = new JobPositionDao(sqlpool);
      await dao.add(job);

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
   * @api {put} /api/jobs/:jobId Update the specified job position
   * @apiName JobPositionUpdate
   * @apiGroup JobPosition Management
   * @apiVersion 0.6.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Update the specified job position
   *
   * @apiParam {Number} institutionId
   * @apiParam {Number} sirutaId
   * @apiParam {String} name
   * @apiParam {Date}   dateStart
   * @apiParam {Date}   dateEnd
   * @apiParam {String} info
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

      const requestSchema = Joi.object<IJobPositionDTO>({
        subjectId: Joi.number().required(),
        institutionId: Joi.number().required(),
        sirutaId: Joi.number().required(),
        dateStart: Joi.date().required(),
        dateEnd: Joi.date(),
        name: Joi.string().required(),
        info: Joi.string()
      });
      const { value: params, error: verror } = requestSchema.validate(req.body);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const job = {
        jobId: parseInt(req.params.jobId, 10),
        subjectId: 0,
        institutionId: params.institutionId,
        sirutaId: params.sirutaId,
        dateStart: params.dateStart,
        dateEnd: params.dateEnd,
        name: params.name,
        info: params.info
      };
      logger.debug(job);
      const sqlpool = await app.sqlPool;
      const dao = new JobPositionDao(sqlpool);
      await dao.update(job);

      res.status(StatusCodes.OK).send();
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {delete} /api/jobs/:jobId Delete the specified job position
   * @apiName JobPositionDelete
   * @apiGroup JobPosition Management
   * @apiVersion 0.6.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Delete the specified job position
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
      const dao = new JobPositionDao(sqlpool);
      await dao.delete(parseInt(req.params.docId, 10));

      res.status(StatusCodes.OK).send();
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {get} /api/jobs List subject' job positions
   * @apiName JobPositionList
   * @apiGroup JobPosition Management
   * @apiVersion 0.6.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get a list of specified subject job position.
   *
   * @apiParam {Number} subjectId
   *
   * @apiSuccess {Object[]} jobs List of subject' job positions
   * @apiSuccess {Object} job JobPosition info
   * @apiSuccess {Number} job.id JobPosition unique id
   * @apiSuccess {String} job.name
   * @apiSuccess {Number} job.institutiionId
   * @apiSuccess {String} job.institution
   * @apiSuccess {Number} job.sirutaId
   * @apiSuccess {String} job.uat
   * @apiSuccess {Date}   job.dateStart
   * @apiSuccess {Date}   job.dateEnd
   * @apiSuccess {String} job.aditionalInfo
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
      const dao = new JobPositionDao(sqlpool);
      const jobs = await dao.list(params.subjectId);

      res.status(StatusCodes.OK).json(jobs);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }
}
