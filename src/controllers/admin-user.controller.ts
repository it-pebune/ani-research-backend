import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse, ApiError, UserStatus, IUserFull, IAuthUser, INote } from '~entities';
import {
  logger, parseError, getRequestUser,
  getRequestAdminUser,
  setRequestAdminUser,
  UserRole
} from '~shared';
import app from '~app';
import { AdminDao, UserDao } from '~daos';
import Joi from 'joi';


interface IUserUpdateDTO {
  firstName: string;
  lastName: string;
  displayName: string;
  phone?: string;
  socialInfo?: string;
  roles: UserRole[];
}

interface IUserUpdateStatusDTO {
  status: UserStatus;
}

interface IUserAddNoteDTO {
  note: string;
}

interface IUserDeleteDTO {
  status: UserStatus;
}

/** User management controller */
export class AdminUserController {
  /**
   * @api {get} /api/users/:userId Get details for the specified user
   * @apiName UserGet
   * @apiGroup User Management
   * @apiVersion 0.1.0
   * @apiPermission admin
   * @apiDescription Get details for the specified user
   *
   * @apiSuccess {Object} user User info
   * @apiSuccess {Number} user.id User unique id
   * @apiSuccess {String} user.firstName
   * @apiSuccess {String} user.lastName
   * @apiSuccess {String} user.displayName
   * @apiSuccess {String} user.email
   * @apiSuccess {String} user.phone
   * @apiSuccess {String} user.socialInfo
   * @apiSuccess {UserRole[]} user.roles User roles
   * @apiSuccess {IUserNote[]} user.notes User notes
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
    const user = getRequestAdminUser(req);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }
    res.status(StatusCodes.OK).json(user);
  }

  /**
   * @api {put} /api/users/:userId Update the specified user
   * @apiName AdminUserUpdate
   * @apiGroup User Management
   * @apiVersion 0.1.0
   * @apiPermission admin
   * @apiDescription Update the specified user
   *
   * @apiParam {String} firstName
   * @apiParam {String} lastName
   * @apiParam {String} displayName
   * @apiParam {String} phone
   * @apiParam {String} socialInfo
   * @apiParam {UserRole[]} roles
   *
   * @apiSuccess {Object} user User info
   * @apiSuccess {Number} user.id User unique id
   * @apiSuccess {String} user.firstName
   * @apiSuccess {String} user.lastName
   * @apiSuccess {String} user.displayName
   * @apiSuccess {String} user.email
   * @apiSuccess {String} user.phone
   * @apiSuccess {String} user.socialInfo
   * @apiSuccess {UserRole[]} user.roles User roles
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
      const user: any = getRequestAdminUser(req);
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const requestSchema = Joi.object<IUserUpdateDTO>({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        displayName: Joi.string().required(),
        phone: Joi.string().min(10).pattern(/^\+?[0-9]+$/).allow(''),
        socialInfo: Joi.string(),
        roles: Joi.array().items(Joi.number())
      });
      const { value: params, error: verror } = requestSchema.validate(req.body);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const maxRole = loggedUser.roles.reduce((max, role) => max < role ? role : max, -1);
      let roles: UserRole[] = [];
      if (params.roles?.length) {
        roles = params.roles.filter((r: number) => r <= maxRole);
      }

      user.firstName = params.firstName;
      user.lastName = params.lastName;
      user.displayName = params.displayName;
      user.phone = params.phone || user.phone || '';
      user.roles = roles;

      const sqlpool = await app.sqlPool;
      const dao = new AdminDao(sqlpool);
      await dao.update(user);

      res.status(StatusCodes.OK).json(user);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {put} /api/users/:userId/status Update the specified user status
   * @apiName UserUpdateStatus
   * @apiGroup User Management
   * @apiVersion 0.1.0
   * @apiPermission admin
   * @apiDescription Update the specified user status
   *
   * @apiParam {UserStatus} status
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
  public async updateStatus(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }
      const user: any = getRequestAdminUser(req);
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const requestSchema = Joi.object<IUserUpdateStatusDTO>({
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
      const dao = new AdminDao(sqlpool);
      await dao.updateStatus(user.id, params.status);

      res.status(StatusCodes.OK).json(user);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {post} /api/users/:userId/note Adds a note for the specified user
   * @apiName UserAddNote
   * @apiGroup User Management
   * @apiVersion 0.10.0
   * @apiPermission admin
   * @apiDescription Adds a note for the specified user
   *
   * @apiParam {String} note
   *
   * @apiSuccess {Object} user User info
   * @apiSuccess {Number} user.id User unique id
   * @apiSuccess {String} user.firstName
   * @apiSuccess {String} user.lastName
   * @apiSuccess {String} user.displayName
   * @apiSuccess {String} user.email
   * @apiSuccess {String} user.phone
   * @apiSuccess {String} user.socialInfo
   * @apiSuccess {UserRole[]} user.roles User roles
   * @apiSuccess {INote[]} user.notes User notes
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
   */
  /**
   * @param {Request} req
   * @param {Response} res
   *
   * @return {Promise<void>}
   */
  public async addNote(req: Request, res: Response): Promise<void> {
    try {
      const currentUser: IAuthUser | null = getRequestUser(req);

      if (!currentUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();

        return;
      }

      const user: IUserFull | null = getRequestAdminUser(req);
      if (!user) {
        res.status(StatusCodes.NOT_FOUND).send();

        return;
      }

      const validation = Joi.object<IUserAddNoteDTO>({ note: Joi.string().required() });
      const { value: params, error: verror } = validation.validate(req.body);

      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST)
          .json(new ErrorResponse(ApiError.validation_error.withDetails(verror?.details)));

        return;
      }

      const note: INote = { content: params.note, author: currentUser.email, createdAt: new Date() };

      user.notes ? user.notes.push(note) : user.notes = [note];

      const sqlPool = await app.sqlPool;
      const dao = new AdminDao(sqlPool);

      await dao.updateNotes(user.id, user.notes);

      res.status(StatusCodes.OK)
        .json(user);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {put} /api/users/:userId/delete Delete the specified user
   * @apiName AdminUserDelete
   * @apiGroup User Management
   * @apiVersion 0.1.0
   * @apiPermission admin
   * @apiDescription Delete the specified user allowing to set the specified status to the user
   *
   * @apiParam {UserStatus} status
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
  public async delete(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }
      const user: any = getRequestAdminUser(req);
      if (!user) {
        res.status(StatusCodes.NOT_FOUND).send();
        return;
      }

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
      const dao = new AdminDao(sqlpool);
      await dao.delete(user.id, params.status);

      res.status(StatusCodes.OK).json({});
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {get} /api/users List registered users
   * @apiName UserList
   * @apiGroup User Management
   * @apiVersion 0.1.0
   * @apiPermission admin
   * @apiDescription Get a list of registered users
   *
   * @apiSuccess {Object[]} users List of registered users
   * @apiSuccess {Number} user.id User unique id
   * @apiSuccess {Number} user.roleId Highest role id
   * @apiSuccess {String} user.role Highest role name
   * @apiSuccess {String} user.displayName
   * @apiSuccess {String} user.email
   * @apiSuccess {String} user.provider
   * @apiSuccess {Date} user.created
   * @apiSuccess {Date} user.updated
   * @apiSuccess {Date} user.lastLogin
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
    // logger.debug('admin-user::list');
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const sqlpool = await app.sqlPool;
      const dao = new AdminDao(sqlpool);
      const users = await dao.list(false);

      res.status(StatusCodes.OK).json(users);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {get} /api/users/role List users with the specified role
   * @apiName UserListByRole
   * @apiGroup User Management
   * @apiVersion 0.9.0
   * @apiPermission admin, coordinator
   * @apiDescription Get a list of users that have the specified role
   *
   * @apiParam {UserRole} role
   *
   * @apiSuccess {Object[]} users List of users
   * @apiSuccess {Number} user.id User unique id
   * @apiSuccess {Number} user.roleId Role id
   * @apiSuccess {String} user.displayName
   * @apiSuccess {String} user.email
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async listByRole(req: Request, res: Response) {
    // logger.debug('admin-user::listByRole');
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const requestSchema = Joi.object<{ role: number }>({
        role: Joi.number().required()
      });
      const { value: params, error: verror } = requestSchema.validate(req.query);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      if (!(params.role in UserRole)) {
        res.status(StatusCodes.NOT_ACCEPTABLE).send(new ErrorResponse(ApiError.value_not_valid_role));
        return;
      }

      const sqlpool = await app.sqlPool;
      const dao = new AdminDao(sqlpool);
      const users = await dao.listByRole(params.role);

      res.status(StatusCodes.OK).json(users);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @param {number} id
   */
  public async userById(req: Request, res: Response, next: NextFunction, id: number) {
    try {
      const sqlpool = await app.sqlPool;
      const dao = new UserDao(sqlpool);
      const user = await dao.getById(id);
      setRequestAdminUser(req, user);
      next();
    } catch (ex) {
      next(
        new Error('No user with that identifier has been found')
      );
    }
  }
}
