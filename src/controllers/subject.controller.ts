import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { SubjectStatus, ErrorResponse, ApiError,  } from '~entities';
import {
  logger, parseError, getRequestUser,
  setRequestSubject,
  getRequestSubject,
  userHasRole,
  UserRole
} from '~shared';
import app from '~app';
import { SubjectDao } from '~daos';
import Joi from 'joi';


interface ISubjectDTO {
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: Date;
  sirutaId: number;
}

interface ISubjectUpdateNotesDTO {
  notes: string;
}

interface ISubjectAssignDTO {
  userId: number;
  status: SubjectStatus;
}

/** Subject management controller */
export class SubjectController {
  /**
   * @api {get} /api/subjects/:subjectId Get details for the specified subject
   * @apiName SubjectGet
   * @apiGroup Subject Management
   * @apiVersion 0.3.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get details for the specified subject
   *
   * @apiSuccess {Object} subject Subject info
   * @apiSuccess {Number} subject.id Subject unique id
   * @apiSuccess {String} subject.firstName
   * @apiSuccess {String} subject.middleName
   * @apiSuccess {String} subject.lastName
   * @apiSuccess {Date} subject.dob
   * @apiSuccess {number} subject.sirutaId
   * @apiSuccess {String} subject.city
   * @apiSuccess {String} subject.county
   * @apiSuccess {number} subject.countId
   * @apiSuccess {String} subject.notes
   * @apiSuccess {Date} subject.created
   * @apiSuccess {Date} subject.updated
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
    const subj = getRequestSubject(req);
    if (!subj) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }
    res.status(StatusCodes.OK).json(subj);
  }

  /**
   * @api {post} /api/subjects Add a new subject
   * @apiName SubjectAdd
   * @apiGroup Subject Management
   * @apiVersion 0.3.0
   * @apiPermission coordinator, reviewer
   * @apiDescription Adds a new subject
   *
   * @apiParam {String} firstName
   * @apiParam {String} middleName
   * @apiParam {String} lastName
   * @apiParam {Date} dob
   * @apiParam {Number} sirutaId
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

      const requestSchema = Joi.object<ISubjectDTO>({
        firstName: Joi.string().required(),
        middleName: Joi.string(),
        lastName: Joi.string().required(),
        dob: Joi.date().required(),
        sirutaId: Joi.number().required()
      });
      const { value: params, error: verror } = requestSchema.validate(req.body);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      const subject = {
        id: 0,
        uuid: uuidv4(),
        firstName: params.firstName,
        middleName: params.middleName,
        lastName: params.lastName,
        dob: params.dob,
        sirutaId: params.sirutaId,
        created: new Date()
      };

      const sqlpool = await app.sqlPool;
      const dao = new SubjectDao(sqlpool);
      const result = await dao.add(subject);
      subject.id = result.output.subjectId;

      res.status(StatusCodes.OK).json(subject);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {put} /api/subjects/:subjectId Update the specified subject
   * @apiName SubjectUpdate
   * @apiGroup Subject Management
   * @apiVersion 0.3.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Update the specified subject
   *
   * @apiParam {String} firstName
   * @apiParam {String} middleName
   * @apiParam {String} lastName
   * @apiParam {Date} dob
   * @apiParam {Number} sirutaId
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

      const subject = getRequestSubject(req);
      if (!subject) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const requestSchema = Joi.object<ISubjectDTO>({
        firstName: Joi.string().required(),
        middleName: Joi.string(),
        lastName: Joi.string().required(),
        dob: Joi.date().required(),
        sirutaId: Joi.number().required()
      });
      const { value: params, error: verror } = requestSchema.validate(req.body);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      subject.firstName = params.firstName;
      subject.middleName = params.middleName;
      subject.lastName = params.lastName;
      subject.dob = params.dob;
      subject.sirutaId = params.sirutaId;

      const sqlpool = await app.sqlPool;
      const dao = new SubjectDao(sqlpool);
      await dao.update(subject);

      res.status(StatusCodes.OK).json({});
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {put} /api/subjects/:subjectId/notes Update the specified subject notes
   * @apiName SubjectUpdateNotes
   * @apiGroup Subject Management
   * @apiVersion 0.3.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Update the specified subject notes
   *
   * @apiParam {string} notes
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
  public async updateNotes(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }
      const subject = getRequestSubject(req);
      if (!subject) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const requestSchema = Joi.object<ISubjectUpdateNotesDTO>({
        notes: Joi.string().required()
      });
      const { value: params, error: verror } = requestSchema.validate(req.body);
      if (verror || !params) {
        logger.debug(verror?.details);
        res.status(StatusCodes.BAD_REQUEST).json(
          new ErrorResponse(ApiError.validation_error.withDetails(verror?.details))
        );
        return;
      }

      subject.notes = params.notes;

      const sqlpool = await app.sqlPool;
      const dao = new SubjectDao(sqlpool);
      await dao.updateNotes(subject.id, params.notes);

      res.status(StatusCodes.OK).json(subject);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {delete} /api/subjects/:subjectId Delete the specified subject
   * @apiName SubjectDelete
   * @apiGroup Subject Management
   * @apiVersion 0.3.0
   * @apiPermission coordinator, reviewer
   * @apiDescription Delete the specified subject
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
      const subject = getRequestSubject(req);
      if (!subject) {
        res.status(StatusCodes.NOT_FOUND).send();
        return;
      }

      const sqlpool = await app.sqlPool;
      const dao = new SubjectDao(sqlpool);
      await dao.delete(subject.id);

      res.status(StatusCodes.OK).json(subject);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {put} /api/subjects/:subjectId/assign Assign the specified subject to a user
   * @apiName SubjectAssign
   * @apiGroup Subject Management
   * @apiVersion 0.3.0
   * @apiPermission coordinator
   * @apiDescription Assign the specified subject to a user.
   * Note: The previous subject assignment, if any, will be revoked
   *
   * @apiParam {Number} userId The user the subject is assigned to
   * @apiParam {SubjectStatus} status The status the subject is in
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
  public async assign(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const subject = getRequestSubject(req);
      if (!subject) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const requestSchema = Joi.object<ISubjectAssignDTO>({
        userId: Joi.number().required(),
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

      const subj = {
        id: subject.id,
        userId: params.userId,
        assignedBy: loggedUser.id,
        status: params.status
      };

      const sqlpool = await app.sqlPool;
      const dao = new SubjectDao(sqlpool);
      await dao.assign(subj);

      res.status(StatusCodes.OK).json({});
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {get} /api/subjects List registered subjects
   * @apiName SubjectList
   * @apiGroup Subject Management
   * @apiVersion 0.3.0
   * @apiPermission coordinator, reviewer, researcher
   * @apiDescription Get a list of registered subjects.
   * If the logged in user is a researcher or reviewer then it only gets the subjects assigned to her/him
   *
   * @apiSuccess {Object[]} subjects List of registered subjects
   * @apiSuccess {Number} subject.id User unique id
   * @apiSuccess {Number} subject.sirutaId UAT siruta number
   * @apiSuccess {String} subject.firstName
   * @apiSuccess {String} subject.middleName
   * @apiSuccess {String} subject.lastName
   * @apiSuccess {Date} subject.dob
   * @apiSuccess {String} subject.city UAT name
   * @apiSuccess {Number} subject.countyId
   * @apiSuccess {String} subject.county
   * @apiSuccess {Date} subject.created
   * @apiSuccess {Date} subject.updated
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

      const userId = userHasRole(loggedUser, UserRole.coordinator) ? 0 : loggedUser.id;

      const sqlpool = await app.sqlPool;
      const dao = new SubjectDao(sqlpool);
      const subjects = await dao.list(userId, false);

      res.status(StatusCodes.OK).json(subjects);
    } catch (ex) {
      logger.error(parseError(ex));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ErrorResponse(ApiError.internal_error));
    }
  }

  /**
   * @api {get} /api/subjects/:subjectId/assignedHistory Get subject assigned history
   * @apiName SubjectAssignedHistory
   * @apiGroup Subject Management
   * @apiVersion 0.3.0
   * @apiPermission coordinator, reviewer
   * @apiDescription Get the assignment history for this subject
   *
   * @apiSuccess {Object[]} history List of entries
   * @apiSuccess {Number} history.id Unique id
   * @apiSuccess {Boolean} history.revoked
   * @apiSuccess {SubjectStatus} history.status
   * @apiSuccess {Number} history.assignedToId
   * @apiSuccess {String} history.assignedTo
   * @apiSuccess {Number} history.assignedById
   * @apiSuccess {String} history.assignedBy
   * @apiSuccess {Date} history.assignedOn
   * @apiSuccess {Number} history.revokedById
   * @apiSuccess {String} history.revokedBy
   * @apiSuccess {Date} history.revokedOn
   *
   * @apiUse UnknownError
   *
   */
  /**
   * @param {Request} req
   * @param {Response} res
   * @return {Promise<void>}
   */
  public async assignedHistory(req: Request, res: Response) {
    try {
      const loggedUser = getRequestUser(req);
      if (!loggedUser) {
        res.status(StatusCodes.UNAUTHORIZED).send();
        return;
      }

      const subject = getRequestSubject(req);
      if (!subject) {
        res.status(StatusCodes.NOT_FOUND).send();
        return;
      }

      const sqlpool = await app.sqlPool;
      const dao = new SubjectDao(sqlpool);
      const history = await dao.assignedHistory(subject.id);

      res.status(StatusCodes.OK).json(history);
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
  public async subjectById(req: Request, res: Response, next: NextFunction, id: number) {
    try {
      const sqlpool = await app.sqlPool;
      const dao = new SubjectDao(sqlpool);
      const subject = await dao.getById(id);
      setRequestSubject(req, subject);
      next();
    } catch (ex) {
      next(
        new Error('No subject with that identifier has been found')
      );
    }
  }
}
