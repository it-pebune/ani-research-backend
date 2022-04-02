import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import app from '~app';
import { UserDao } from '~daos';
import { ErrorResponse, ApiError, IUserFull, UserStatus } from '~entities';
import {
  logger, parseError, getRequestUser
} from '~shared';

interface IUserUpdateDTO {
  firstName: string;
  lastName: string;
  displayName: string;
  phone?: string;
  socialInfo?: string;
}

interface IUserDeleteDTO {
  status: UserStatus;
}

/** User controller */
export class UserController {
  /**
   * @api {get} /api/users/me Get logged in user details
   * @apiName UserMe
   * @apiGroup User Profile
   * @apiVersion 0.2.0
   * @apiPermission user
   * @apiDescription Get details of the logged in user
   *
   * @apiSuccess {Object} user User info
   * @apiSuccess {Number} user.id
   * @apiSuccess {String} user.firstName
   * @apiSuccess {String} user.lastName
   * @apiSuccess {String} user.displayName
   * @apiSuccess {String} user.email
   * @apiSuccess {String} user.phone
   * @apiSuccess {String} user.socialInfo
   * @apiSuccess {Object} user.settings
   *
   * @apiErrorExample Error-Response:
   * HTTP 1/1 404
   * {
   *  code: NOT_FOUND,
   *  message: 'User not found'
   * }
   *
   * @apiUse UnknownError
   *
   */
  /**
   * Gets logged in user info
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async getMe(req: Request, res: Response): Promise<void> {
    try {
      const user = getRequestUser(req);
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).json(new ErrorResponse(ApiError.invalid_access));
        return;
      }
      logger.debug(`user::me ${user.email}`);

      const sqlpool = await app.sqlPool;
      const userDao = new UserDao(sqlpool);
      const userInfo: IUserFull = await userDao.deserializeUser(user.id);
      if (userInfo) {
        const u = {
          id: userInfo.id,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          displayName: userInfo.displayName,
          email: userInfo.email,
          phone: userInfo.phone,
          socialInfo: userInfo.socialInfo,
          settings: userInfo.settings
        };

        res.status(StatusCodes.OK).json(u);
      } else {
        res.status(StatusCodes.NOT_FOUND).json(new ErrorResponse(ApiError.not_found));
      }
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {put} /api/users Update the logged in user
   * @apiName UserUpdate
   * @apiGroup User Management
   * @apiVersion 0.2.0
   * @apiPermission user
   * @apiDescription Update the logged in user
   *
   * @apiParam {String} firstName
   * @apiParam {String} lastName
   * @apiParam {String} displayName
   * @apiParam {String} phone
   * @apiParam {string} socialInfo
   *
   * @apiSuccess {Object} user User info
   * @apiSuccess {Number} user.id
   * @apiSuccess {String} user.firstName
   * @apiSuccess {String} user.lastName
   * @apiSuccess {String} user.displayName
   * @apiSuccess {String} user.email
   * @apiSuccess {String} user.phone
   * @apiSuccess {String} user.socialInfo
   * @apiSuccess {Object} user.settings
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
   * Updates user display name
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async update(req: Request, res: Response): Promise<void> {
    try {
      const user = getRequestUser(req);
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).json(new ErrorResponse(ApiError.invalid_access));
        return;
      }
      logger.debug(`user::update ${user.email}`);

      const requestSchema = Joi.object<IUserUpdateDTO>({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        displayName: Joi.string().required(),
        phone: Joi.string().min(10).pattern(/^\+?[0-9]+$/).allow(''),
        socialInfo: Joi.string()
      });
      const { value: params, error: verror } = requestSchema.validate(req.body);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const u = {
        id: user.id,
        firstName: params.firstName,
        lastName: params.lastName,
        displayName: params.displayName,
        phone: params.phone || '',
        socialInfo: params.socialInfo || ''
      };
      const dao = new UserDao(await app.sqlPool);

      await dao.update(u);

      const userInfo: IUserFull = await dao.deserializeUser(user.id);

      res.status(StatusCodes.OK).json({
        id: userInfo.id,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        displayName: userInfo.displayName,
        email: userInfo.email,
        phone: userInfo.phone,
        socialInfo: userInfo.socialInfo,
        settings: userInfo.settings
      });
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {put} /api/users/delete Delete the logged in user
   * @apiName UserDelete
   * @apiGroup User Profile
   * @apiVersion 0.2.0
   * @apiPermission admin
   * @apiDescription Delete the logged in user
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
   * Deletes user account
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const user = getRequestUser(req);
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).json(new ErrorResponse(ApiError.invalid_access));
        return;
      }
      logger.debug(`user::delete ${user.email}`);

      const requestSchema = Joi.object<IUserDeleteDTO>({
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

      const sqlpool = await app.sqlPool;
      const dao = new UserDao(sqlpool);
      await dao.delete(user.id, params.status);

      res.status(StatusCodes.OK).json({});
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * Updates UI settings
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async updateUISettings(req: Request, res: Response): Promise<void> {
    try {
      const user = getRequestUser(req);
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).json(new ErrorResponse(ApiError.invalid_access));
        return;
      }

      // const settings = JSON.stringify(req.body.settings || {});

      // const sqlpool = await vmmapApp.sqlPool;
      // const userDao = new UserDao(sqlpool);
      // await userDao.updateUISettings(user.id, settings);
      res.status(StatusCodes.OK).json(user);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }
}
