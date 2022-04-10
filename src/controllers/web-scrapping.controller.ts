import { BlobServiceClient } from '@azure/storage-blob';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import got from 'got';
import Joi from 'joi';
import {
  appConfig, logger, parseError, getRequestUser
} from '~shared';
import { ApiError, ErrorResponse } from '~entities';

interface IWSMPListResponse {
  legislature: number;
  profileUrl: string;
  results: any[];
}

/** Web Scrapping API wrapper controller */
export class WebScrapController {
  /**
   * @api {get} /api/webscrap/mps Get MP list
   * @apiName WebScrapMPList
   * @apiGroup WebScrap
   * @apiVersion 0.8.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get a list with all the MPs from a specified camera and legislature
   *
   * @apiParam {Number} cham which chamber: 1 - Senators, 2 - Deputies, 3 - Both
   * @apiParam {Number} leg the legislature e.g. 2020
   * @apiParam {Boolean} refresh true if the cache should be refreshed
   *
   * @apiSuccess {Number} legislature
   * @apiSuccess {String} profileUrl url to get mp details
   * @apiSuccess {Object[]} results List of mps
   * @apiSuccess {Number} result.id MP id
   * @apiSuccess {String} result.name
   * @apiSuccess {String} result.party
   * @apiSuccess {String} result.loc city of residence
   * @apiSuccess {Number} result.cham which chamber 1 - Senate, 2 - Deputies
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
  public async getMPList(req: Request, res: Response): Promise<void> {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const requestSchema = Joi.object<{ cham: number; leg: number; refresh: boolean; }>({
        cham: Joi.number().required(),
        leg: Joi.number().required(),
        refresh: Joi.boolean()
      });
      const { value: params, error: verror } = requestSchema.validate(req.query);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const appCfg = appConfig();
      const blobName = `mps-${params.leg}-${params.cham}.json`;
      const blobService = BlobServiceClient.fromConnectionString(appCfg.storageGenCnnString);
      const containerClient = blobService.getContainerClient(appCfg.blobMPsCachePath);
      await containerClient.createIfNotExists();
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      if (!params.refresh && await blockBlobClient.exists()) {
        logger.debug('send from cache');
        const content = await blockBlobClient.downloadToBuffer();
        const data: IWSMPListResponse = JSON.parse(content.toString());
        res.status(StatusCodes.OK).json(data);
        return;
      }

      if (params.refresh) {
        logger.debug('delete existing cache');
        await blockBlobClient.deleteIfExists();
      }

      const wsi = appCfg.webScrapApi;
      const url = `${wsi.baseUrl}${wsi.getMPListUrl}?code=${wsi.key}&cham=${params.cham}&leg=${params.leg}`;
      const data = await got(url).json<IWSMPListResponse>();
      if (data.results?.length) {
        logger.debug(data.results.length);
        const content = Buffer.from(JSON.stringify(data));
        await blockBlobClient.upload(content, content.byteLength);

        res.status(StatusCodes.OK).json(data);
        return;
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
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
   * @api {get} /api/webscrap/mps/details Get MP details
   * @apiName WebScrapMPDetails
   * @apiGroup WebScrap
   * @apiVersion 0.8.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get details for an MP
   *
   * @apiParam {Number} id mp id (from a previous call to api/webscrap/mps)
   * @apiParam {Number} cham which chamber: 1 - Senators, 2 - Deputies
   * @apiParam {Number} leg the legislature e.g. 2020
   *
   * @apiSuccess {String} name
   * @apiSuccess {String} photo
   * @apiSuccess {String} dateOfBirth
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
  public async getMPDetails(req: Request, res: Response): Promise<void> {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const requestSchema = Joi.object<{ id: number; cham: number; leg: number; }>({
        id: Joi.number().required(),
        cham: Joi.number().required(),
        leg: Joi.number().required()
      });
      const { value: params, error: verror } = requestSchema.validate(req.query);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const appCfg = appConfig();
      const wsi = appCfg.webScrapApi;
      // eslint-disable-next-line max-len
      const url = `${wsi.baseUrl}${wsi.getMPDetailsUrl}?code=${wsi.key}&id=${params.id}&cham=${params.cham}&leg=${params.leg}`;
      const data = await got(url, {
        timeout: {
          request: 30000
        }
      }).json();
      res.status(StatusCodes.OK).json(data);
    } catch (ex) {
      if (ex instanceof ApiError) {
        res.status(ex.statusCode).json(new ErrorResponse(ex));
      } else if ((ex as Error).name === 'TimeoutError') {
        logger.error(parseError(ex));
        logger.debug(ex);
        res.status(StatusCodes.REQUEST_TIMEOUT).send();
      } else {
        logger.error(parseError(ex));
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
      }
    }
  }

  /**
   * @api {get} /api/webscrap/decls Get assets and interests declarations for a specific person
   * @apiName WebScrapDeclarations
   * @apiGroup WebScrap
   * @apiVersion 0.8.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get assets and interests declarations for a specific person
   *
   * @apiParam {String} name
   *
   * @apiSuccess {Object[]} decls Array of declarations
   * @apiSuccess {String} decl.name
   * @apiSuccess {String} decl.institution cdep, senat
   * @apiSuccess {String} decl.function
   * @apiSuccess {String} decl.locality
   * @apiSuccess {String} decl.county
   * @apiSuccess {String} decl.date
   * @apiSuccess {Number} decl.type 1 - asset declaration, 2 - interests declaration
   * @apiSuccess {String} decl.link url from where the declaration was downloaded
   * @apiSuccess {String} decl.uid
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
  public async getDeclarations(req: Request, res: Response): Promise<void> {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }
      logger.debug(`webscrap::decls ${req.query.name}`);

      const requestSchema = Joi.object<{ name: string; }>({
        name: Joi.string().required()
      });
      const { value: params, error: verror } = requestSchema.validate(req.query);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const appCfg = appConfig();
      const wsi = appCfg.webScrapApi;
      // params.name = encodeURIComponent(params.name);
      // eslint-disable-next-line max-len
      const url = `${wsi.baseUrl}${wsi.getDeclarationsUrl}?code=${wsi.key}&name=${params.name}`;
      const data = await got(url, {
        timeout: {
          request: 30000
        }
      }).json();
      res.status(StatusCodes.OK).json(data);
    } catch (ex) {
      if (ex instanceof ApiError) {
        res.status(ex.statusCode).json(new ErrorResponse(ex));
      } else if ((ex as Error).name === 'TimeoutError') {
        logger.error(parseError(ex));
        logger.debug(ex);
        res.status(StatusCodes.REQUEST_TIMEOUT).send();
      } else {
        logger.error(parseError(ex));
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
      }
    }
  }
}
