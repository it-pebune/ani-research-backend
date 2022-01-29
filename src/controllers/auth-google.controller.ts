import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { OAuth2Client } from 'google-auth-library';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';
import {
  ErrorResponse, ApiError, IGoogleClientInfo,
  IProviderData, IAuthToken, IAuthResponse, UserStatus, IGoogleData
} from '~entities';
import {
  appConfig,
  logger, parseError
} from '~shared';
import app from '~app';
import { AdminDao, AuthDao, UserDao } from '~daos';


/**
 * Google Authentication Controller
 */
export class GoogleAuthController {
  /**
   * @api {get} /api/auth/google/signin Sign in with Google
   * @apiName Signin
   * @apiGroup Authentication
   * @apiVersion 0.1.0
   * @apiPermission user
   * @apiDescription Perform user authentication
   *
   * @apiParam {String} code Authentication token
   * @apiParam {String} redirect_uri Redirect frontend uri
   *
   * @apiSuccess {Object} user User info
   * @apiSuccess {Number} user.id User unique id
   * @apiSuccess {String} user.firstName
   * @apiSuccess {String} user.lastName
   * @apiSuccess {String} user.displayName
   * @apiSuccess {String} user.email
   * @apiSuccess {String} user.profileImageUrl
   * @apiSuccess {Number} user.status
   * @apiSuccess {UserRole[]} user.roles User roles
   * @apiSuccess {String} user.sessionId Session identifier (internal)
   * @apiSuccess {Object} token Authentication token info
   * @apiSuccess {String} token.access Access token
   * @apiSuccess {String} token.refresh Refresh token
   * @apiSuccess {Number} token.accessExpiresIn Expiration period in seconds of the access token
   * @apiSuccess {Number} token.refreshExpiresIn Expiration period in seconds of the refresh token
   *
   * @apiErrorExample Error-Response:
   * HTTP 1/1 406
   * {
   *  code: INVALID_REDIRECT_URI,
   *  message: 'Invalid redirect URI'
   * }
   * HTTP 1/1 406
   * {
   *  code: VALIDATION_ERROR,
   *  message: 'Input validation failed',
   *  details: validation error array
   * }
   * HTTP 1/1 406
   * {
   *  code: ACCOUNT_BLACKLISTED,
   *  message: 'Account is blacklisted',
   *  details: validation error array
   * }
   *
   * @apiUse UnknownError
   *
   */
  /**
   * Google authentication callback
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async signIn(req: Request, res: Response): Promise<void> {
    try {
      const requestSchema = Joi.object<{ code: string; redirect_uri: string }>({
        code: Joi.string().required(),
        redirect_uri: Joi.string().required().uri({
          scheme: ['http', 'https']
        })
      });
      const { value: query, error: verror } = requestSchema.validate(req.query);
      if (verror || !query) {
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const keys = this.getGoogleClientInfo();
      if (keys.redirect_uris.indexOf(query.redirect_uri) < 0) {
        res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse(ApiError.invalid_redirect_uri));
        return;
      }
      const oauth2Client = new OAuth2Client(
        keys.client_id,
        keys.client_secret,
        query.redirect_uri
      );

      const { tokens } = await oauth2Client.getToken(query.code);
      // logger.debug(tokens);
      oauth2Client.setCredentials(tokens);
      const url = 'https://people.googleapis.com/v1/people/me?personFields=emailAddresses,names,photos';
      const userInfoResponse = await oauth2Client.request({ url });
      const userInfo = this.parseMeInfo(userInfoResponse.data);
      logger.debug(userInfo);
      if (userInfo.id && userInfo.email && userInfo.displayName) {
        const sqlpool = await app.sqlPool;
        const userDao = new UserDao(sqlpool);
        let userExists = await userDao.getByGoogleId(userInfo.id);
        if (!userExists) {
          const userAdd = {
            firstName: userInfo.givenName || userInfo.displayName,
            lastName: userInfo.familyName || userInfo.displayName,
            displayName: userInfo.displayName,
            email: userInfo.email,
            provider: 'google',
            providerData: userInfo,
            profileImageUrl: userInfo.picture || '',
            googleId: userInfo.id,
            status: UserStatus.pending
          };

          const adminDao = new AdminDao(sqlpool);
          const addResult = await adminDao.add(userAdd);
          logger.debug(addResult);

          userExists = {
            ...userAdd,
            phone: '',
            id: addResult.output.userId,
            roles: [],
            sessionId: '',
            settings: {},
            created: new Date(),
            updated: new Date()
          };
        } else if (userExists.status === UserStatus.blackListed) {
          res.status(StatusCodes.NOT_ACCEPTABLE).json(new ErrorResponse(ApiError.account_blacklisted));
          return;
        } else {
          if (
            userExists.email !== userInfo.email ||
            userExists.profileImageUrl !== userInfo.picture
          ) {
            logger.debug('update provider data...');
            userExists.email = userInfo.email;
            userExists.profileImageUrl = userInfo.picture || '';
            userExists.providerData = userInfo as IProviderData;
            const adminDao = new AdminDao(sqlpool);
            const result = await adminDao.updateProviderData(userExists);
            logger.debug(result);
          }
        }

        logger.debug(userExists);

        const sessionId = uuidv4();
        const jwtBearerToken = jwt.sign({}, appConfig.authentication.private, {
          algorithm: 'RS256',
          expiresIn: '2h',
          subject: JSON.stringify({
            id: userExists.id,
            sessionId
          })
        });

        const now = new Date();
        const refreshToken = randomBytes(32).toString('base64');
        const refreshTokenExpires = new Date(now.getTime() + 86400000); // 24h
        const authDao = new AuthDao(sqlpool);
        await authDao.didLogin(userExists.id, refreshToken, refreshTokenExpires, now);

        const token: IAuthToken = {
          access: jwtBearerToken,
          refresh: refreshToken,
          accessExpiresIn: 2 * 60 * 60,
          refreshExpiresIn: 24 * 60 * 60
        };

        const authresp: IAuthResponse = {
          user: {
            id: userExists.id,
            firstName: userExists.firstName,
            lastName: userExists.lastName,
            displayName: userExists.displayName,
            email: userExists.email,
            roles: userExists.roles,
            profileImageUrl: userExists.profileImageUrl,
            status: userExists.status,
            sessionId
          },
          token
        };
        res.status(StatusCodes.OK).json(authresp);
        return;
      }
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {get} /api/auth/google/auth-url Get Google sign in url
   * @apiName GetAuthUrl
   * @apiGroup Authentication
   * @apiVersion 0.1.0
   * @apiPermission user
   * @apiDescription Obtain the url for Google authentication redirect
   *
   * @apiParam {String} redirect_uri Redirect frontend uri
   *
   * @apiErrorExample Error-Response:
   * HTTP 1/1 406
   * {
   *  code: INVALID_REDIRECT_URI,
   *  message: 'Invalid redirect URI'
   * }
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
   * Gets Google authentication url
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async getAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const requestSchema = Joi.object<{ redirect_uri: string }>({
        redirect_uri: Joi.string().required().uri({
          scheme: ['http', 'https']
        })
      });
      const { value: query, error: verror } = requestSchema.validate(req.query);
      if (verror || !query) {
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const keys = this.getGoogleClientInfo();
      if (keys.redirect_uris.indexOf(query.redirect_uri) < 0) {
        res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse(ApiError.invalid_redirect_uri));
        return;
      }

      const scopes = [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ];

      const oauth2Client = new OAuth2Client(
        keys.client_id,
        keys.client_secret,
        query.redirect_uri
      );
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes.join(' '),
        state: 'provider=google'
      });
      res.status(StatusCodes.OK).json({
        authUrl
      });
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @return {IGoogleClientInfo}
   */
  private getGoogleClientInfo(): IGoogleClientInfo {
    if (!process.env.GOOGLE_CLIENT_INFO) {
      throw new Error('Missing Google client into');
    }
    const json = JSON.parse(process.env.GOOGLE_CLIENT_INFO);
    return json.web;
  }

  /**
   * Parse the returned info from people.googleapis.com/v1/people/me
   * @param {any} info
   * @return {IGoogleData}
   */
  private parseMeInfo(info: any): IGoogleData {
    const me: IGoogleData = {};

    if (info.names && info.names.length) {
      const names = info.names[0];
      me.id = names.metadata.source.id;
      me.displayName = names.displayName;
      me.familyName = names.familyName;
      me.givenName = names.givenName;
    }
    if (info.emailAddresses && info.emailAddresses.length) {
      info.emailAddresses.forEach((ea: IPeopleEmailAddress) => {
        if (!!ea.metadata.primary) {
          me.email = ea.value;
          me.verifiedEmail = !!ea.metadata.verified;
        }
      });
    }
    if (info.photos && info.photos.length) {
      info.photos.forEach((p: IPeoplePhoto) => {
        if (!!p.metadata.primary) {
          me.picture = p.url;
        }
      });
    }

    return me;
  }
}


interface IPeopleEmailAddress {
  metadata: {
    primary?: boolean;
    verified?: boolean;
    source: IPeopleMetaSource;
  }
  value: string;
}

interface IPeoplePhoto {
  metadata: {
    primary?: boolean;
    source: IPeopleMetaSource;
  }
  url: string;
}

interface IPeopleMetaSource {
  id: string;
  type: string;
}
