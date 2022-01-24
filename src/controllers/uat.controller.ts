import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse, ApiError } from '~entities';
import {
  logger, parseError, getRequestUser
} from '~shared';
import app from '~app';
import { UatDao, UatType } from '~daos';
import Joi from 'joi';


interface IUatDTO {
  countyId?: number;
  type?: UatType;
}

/** Uat controller */
export class UatController {
  /**
   * @api {get} /api/uat/counties List counties
   * @apiName UatCounties
   * @apiGroup UAT
   * @apiVersion 0.3.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get a list of counties
   *
   * @apiSuccess {Object[]} counties List of counties
   * @apiSuccess {Number} county.id County unique id
   * @apiSuccess {String} county.name
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async getCounties(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const sqlpool = await app.sqlPool;
      const dao = new UatDao(sqlpool);
      const counties = await dao.getCounties();

      res.status(StatusCodes.OK).json(counties);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {get} /api/uat/uats List uats
   * @apiName UatUats
   * @apiGroup UAT
   * @apiVersion 0.3.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get a list of uats
   *
   * @apiSuccess {Object[]} uats List of uats
   * @apiSuccess {Number} uat.sirutaId UAT unique id
   * @apiSuccess {Number} uat.countyId County unique id
   * @apiSuccess {Number} uat.type UAT type
   * @apiSuccess {String} uat.name UAT name
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async getUats(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const requestSchema = Joi.object<IUatDTO>({
        countyId: Joi.number(),
        type: Joi.number()
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
      const dao = new UatDao(sqlpool);
      const uats = await dao.getUats(params.countyId || 0, params.type || UatType.All);

      res.status(StatusCodes.OK).json(uats);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }
}
