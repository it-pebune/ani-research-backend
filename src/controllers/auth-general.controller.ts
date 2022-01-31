import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse, ApiError, IAuthUser, IAuthToken } from '~entities';
import {
  logger, appConfig,
  parseError, getRequestUser
} from '~shared';
import { AuthDao } from '~daos';
import app from '~app';

/**
 * General Authentication controller
 */
export class GeneralAuthController {
  /**
   * @api {get} /api/auth/signout Sign out
   * @apiName Signout
   * @apiGroup Authentication
   * @apiVersion 0.1.0
   * @apiPermission user
   * @apiDescription Sign out the user from the app
   *
   * @apiErrorExample Error-Response:
   * HTTP 1/1 401
   * {
   *  code: REQUIRED_AUTH_TOKEN,
   *  message: 'Auth Token is required. Please provide a valid auth token along with request.'
   * }
   *
   * @apiUse UnknownError
   *
   */
  /**
   * Sign out
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async signout(req: Request, res: Response): Promise<void> {
    logger.debug('::signout');
    const user = getRequestUser(req);
    if (user) {
      try {
        const sqlpool = await app.sqlPool;
        const authDao = new AuthDao(sqlpool);
        await authDao.didLogout(user.id, new Date());
        // TODO: signout from Google account
        res.status(StatusCodes.OK).json({});
      } catch (ex) {
        logger.error(parseError(ex));
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
      }
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json(new ErrorResponse(ApiError.required_auth));
    }
  }

  /**
   * @api {get} /api/auth/refresh Refresh authentication token
   * @apiName Refresh
   * @apiGroup Authentication
   * @apiVersion 0.1.0
   * @apiPermission user
   * @apiDescription Refresh authentication token
   *
   * @apiSuccess {Object} token Authentication token info
   * @apiSuccess {String} token.access Access token
   * @apiSuccess {String} token.refresh Refresh token
   * @apiSuccess {String} token.expiresIn Expiration period in seconds
   *
   * @apiErrorExample Error-Response:
   * HTTP 1/1 404
   * {
   *  code: NOT_FOUND,
   *  message: 'Unknown user or invalid password.'
   * }
   *
   * @apiUse UnknownError
   *
   */
  /**
   * Sign out
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async refreshAuthToken(req: Request, res: Response): Promise<void> {
    logger.debug('::refreshAuthToken');
    const body = req.query as { token: string };
    try {
      const sqlpool = await app.sqlPool;
      const authDao = new AuthDao(sqlpool);
      const user = await authDao.getUserByRefreshToken(body.token, new Date());
      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json(
          new ErrorResponse(ApiError.unknown_user.withDetails('Unknown user or invalid token'))
        );
        return;
      }

      const authUser: IAuthUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        email: user.email,
        roles: user.roles,
        profileImageUrl: user.profileImageUrl,
        status: user.status,
        sessionId: uuidv4()
      };

      const jwtBearerToken = jwt.sign({}, appConfig.authentication.private, {
        algorithm: 'RS256',
        expiresIn: '2h',
        subject: JSON.stringify({
          id: authUser.id,
          sessionId: authUser.sessionId
        })
      });

      const token: IAuthToken = {
        access: jwtBearerToken,
        refresh: req.body.token,
        accessExpiresIn: 2 * 60 * 60,
        refreshExpiresIn: 0
      };

      res.status(StatusCodes.OK).json(token);
    } catch (error) {
      logger.error(parseError(error));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }
}
