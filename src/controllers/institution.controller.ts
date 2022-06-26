import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiError, ErrorResponse, InstitutionType } from '~entities';
import {
  logger, parseError, getRequestUser
} from '~shared';
import app from '~app';
import { InstitutionDao } from '~daos';
import Joi from 'joi';


interface IInstitutionDTO {
  institutionId: number;
  sirutaId: number;
  type: InstitutionType;
  requireDecls: number;
  name: string;
  address?: string;
  cui?: string;
  regCom?: string;
  dateStart?: Date;
  dateEnd?: Date;
  info?: string;
}


/** Institution management controller */
export class InstitutionController {
  /**
   * @api {get} /api/insts/:instId Get details for the specified institution
   * @apiName InstitutionGet
   * @apiGroup Institution Management
   * @apiVersion 0.6.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get details for the specified institution
   *
   * @apiSuccess {Object} inst Institution info
   * @apiSuccess {Number} inst.id Institution unique id
   * @apiSuccess {String} inst.name
   * @apiSuccess {Number} inst.type
   * @apiSuccess {Number} inst.requireDecls
   * @apiSuccess {Number} inst.sirutaId
   * @apiSuccess {String} inst.uat
   * @apiSuccess {Date}   inst.dateStart
   * @apiSuccess {Date}   inst.dateEnd
   * @apiSuccess {String} inst.address
   * @apiSuccess {String} inst.cui
   * @apiSuccess {String} inst.regCom
   * @apiSuccess {String} inst.aditionalInfo
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
      const dao = new InstitutionDao(sqlpool);
      const job = await dao.getById(parseInt(req.params.instId, 10));
      res.status(StatusCodes.OK).json(job);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {post} /api/insts Add a new institution
   * @apiName InstitutionAdd
   * @apiGroup Institution Management
   * @apiVersion 0.6.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Adds a new institution
   *
   * @apiParam {Number} sirutaId
   * @apiParam {Number} type
   * @apiParam {Number} requireDecls 1 - requires declarations, 0 - does not require
   * @apiParam {String} name
   * @apiParam {String} address
   * @apiParam {String} cui
   * @apiParam {String} regCom
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
  public async add(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const requestSchema = Joi.object<IInstitutionDTO>({
        sirutaId: Joi.number().required(),
        type: Joi.number().required(),
        requireDecls: Joi.number().required(),
        dateStart: Joi.date(),
        dateEnd: Joi.date(),
        name: Joi.string().required(),
        address: Joi.string(),
        cui: Joi.string(),
        regCom: Joi.string(),
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

      const inst = {
        institutionId: 0,
        sirutaId: params.sirutaId,
        type: params.type,
        requireDecls: params.requireDecls,
        dateStart: params.dateStart,
        dateEnd: params.dateEnd,
        name: params.name,
        address: params.address,
        cui: params.cui,
        regCom: params.regCom,
        info: params.info
      };
      logger.debug(inst);
      const sqlpool = await app.sqlPool;
      const dao = new InstitutionDao(sqlpool);
      await dao.add(inst);

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
   * @api {put} /api/insts/:instId Update the specified institution
   * @apiName InstitutionUpdate
   * @apiGroup Institution Management
   * @apiVersion 0.6.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Update the specified institution
   *
   * @apiParam {Number} sirutaId
   * @apiParam {Number} type
   * @apiParam {Number} requireDecls 1 - requires declarations, 0 - does not require
   * @apiParam {String} name
   * @apiParam {String} address
   * @apiParam {String} cui
   * @apiParam {String} regCom
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

      const requestSchema = Joi.object<IInstitutionDTO>({
        sirutaId: Joi.number().required(),
        type: Joi.number().required(),
        requireDecls: Joi.number().required(),
        dateStart: Joi.date(),
        dateEnd: Joi.date(),
        name: Joi.string().required(),
        address: Joi.string(),
        cui: Joi.string(),
        regCom: Joi.string(),
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

      const inst = {
        institutionId: parseInt(req.params.instId, 10),
        sirutaId: params.sirutaId,
        type: params.type,
        requireDecls: params.requireDecls,
        dateStart: params.dateStart,
        dateEnd: params.dateEnd,
        name: params.name,
        address: params.address,
        cui: params.cui,
        regCom: params.regCom,
        info: params.info
      };
      logger.debug(inst);
      const sqlpool = await app.sqlPool;
      const dao = new InstitutionDao(sqlpool);
      await dao.update(inst);

      res.status(StatusCodes.OK).send();
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {delete} /api/insts/:instId Delete the specified institution
   * @apiName InstitutionDelete
   * @apiGroup Institution Management
   * @apiVersion 0.6.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Delete the specified institution
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
      const dao = new InstitutionDao(sqlpool);
      await dao.delete(parseInt(req.params.instId, 10));

      res.status(StatusCodes.OK).send();
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {get} /api/insts List institutions
   * @apiName InstitutionList
   * @apiGroup Institution Management
   * @apiVersion 0.6.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get a list of existing institutions
   *
   * @apiSuccess {Object[]} jobs List of institution
   * @apiSuccess {Object} inst Institution info
   * @apiSuccess {Number} inst.id Institution unique id
   * @apiSuccess {String} inst.name
   * @apiSuccess {Number} inst.type
   * @apiSuccess {Number} inst.sirutaId
   * @apiSuccess {String} inst.uat
   * @apiSuccess {Date}   inst.dateStart
   * @apiSuccess {Date}   inst.dateEnd
   * @apiSuccess {String} inst.address
   * @apiSuccess {String} inst.cui
   * @apiSuccess {String} inst.regCom
   * @apiSuccess {String} inst.aditionalInfo
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

      const sqlpool = await app.sqlPool;
      const dao = new InstitutionDao(sqlpool);
      const insts = await dao.list();

      res.status(StatusCodes.OK).json(insts);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }
}
