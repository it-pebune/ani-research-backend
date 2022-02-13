/* eslint-disable require-jsdoc */
import { StatusCodes } from 'http-status-codes';

export interface IApiError {
  statusCode: number;
  errorCode: string;
  message: string;
  details?: any;
}

/** Api Error */
export class ApiError extends Error implements IApiError {
  public statusCode: number;
  public errorCode: string;
  public message: string;
  public details?: any;

  /**
   * @param {number} statusCode
   * @param {string} errorCode
   * @param {string} message
   */
  constructor(statusCode: number, errorCode: string, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.message = message;
  }

  /**
   * @param {any} details
   * @return {ApiError}
   */
  public withDetails(details: any): this {
    this.details = details;
    return this;
  }

  public static get required_key() {
    return new ApiError(
      StatusCodes.BAD_REQUEST,
      API_ERROR_CODES.REQUIRED_KEY,
      'Api key is required. Please provide a valid api key along with request.');
  }

  /**
   * Generic errors
   */
  public static get required_auth() {
    return new ApiError(StatusCodes.BAD_REQUEST,
      API_ERROR_CODES.REQUIRED_AUTH_TOKEN,
      'Auth Token is required. Please provide a valid auth token along with request.');
  }

  public static get required_parameter() {
    return new ApiError(StatusCodes.BAD_REQUEST, API_ERROR_CODES.REQUIRED_PARAMETER, 'Required parameter not provided');
  }

  public static get invalid_input() {
    return new ApiError(StatusCodes.BAD_REQUEST,
      API_ERROR_CODES.INVALID_INPUT,
      'The request input is not as expected by API. Please provide valid input.');
  }
  public static get input_too_large() {
    return new ApiError(StatusCodes.BAD_REQUEST,
      API_ERROR_CODES.INPUT_TOO_LARGE,
      'The request input size is larger than allowed.');
  }
  public static get invalid_input_format() {
    return new ApiError(StatusCodes.BAD_REQUEST,
      API_ERROR_CODES.INVALID_INPUT_FORMAT, 'The request input format is not allowed.');
  }
  public static get invalid_key() {
    return new ApiError(StatusCodes.UNAUTHORIZED,
      API_ERROR_CODES.INVALID_KEY, 'Valid api key is required. Please provide a valid api key along with request.');
  }

  public static get invalid_auth() {
    return new ApiError(StatusCodes.UNAUTHORIZED,
      API_ERROR_CODES.INVALID_AUTH,
      'Valid auth token is required. Please provide a valid auth token along with request.');
  }

  public static get invalid_permission() {
    return new ApiError(StatusCodes.UNAUTHORIZED,
      API_ERROR_CODES.INVALID_PERMISSION,
      'Permission denied. Current user does not has required permissions for this resource.');
  }

  public static get invalid_redirect_uri() {
    return new ApiError(StatusCodes.BAD_REQUEST,
      API_ERROR_CODES.INVALID_REDIRECT_URI,
      'Invalid redirect URI');
  }

  public static get invalid_access() {
    return new ApiError(StatusCodes.UNAUTHORIZED,
      API_ERROR_CODES.INVALID_ACCESS,
      'Access denied. Current user does not has access for this resource.');
  }

  public static get invalid_operation() {
    return new ApiError(StatusCodes.FORBIDDEN,
      API_ERROR_CODES.INVALID_OPERATION,
      'Requested operation is not allowed due to applied rules. Please refer to error details.');
  }

  public static get not_found() {
    return new ApiError(StatusCodes.NOT_FOUND,
      API_ERROR_CODES.NOT_FOUND, 'The resource referenced by request does not exists.');
  }

  public static get not_registered() {
    return new ApiError(StatusCodes.NOT_FOUND,
      API_ERROR_CODES.NOT_REGISTERED, 'User not registered with this email/mobile.');
  }
  public static get internal_error() {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,
      API_ERROR_CODES.INTERNAL_ERROR, 'Something went wrong on server. Please contact server admin.');
  }

  /**
   * Business logic errors
   */


  public static get invalid_verification_key() {
    return new ApiError(StatusCodes.FORBIDDEN,
      API_ERROR_CODES.INVALID_VERFICATION_KEY,
      'Key is expired or does not exists.Please provide a valid vaerfication key');
  }

  public static get could_not_get_access_token() {
    return new ApiError(StatusCodes.FORBIDDEN,
      API_ERROR_CODES.INVALID_OPERATION, 'Error in getting access token from auth0');
  }

  public static get bad_request() {
    return new ApiError(StatusCodes.BAD_REQUEST, API_ERROR_CODES.INVALID_OPERATION, 'Bad Request');
  }

  public static get unknown_user() {
    return new ApiError(StatusCodes.NOT_FOUND, API_ERROR_CODES.NOT_FOUND, 'Unknown user or invalid password.');
  }

  public static get account_not_activated() {
    return new ApiError(StatusCodes.BAD_REQUEST, API_ERROR_CODES.ACCOUNT_NOT_ACTIVATED, 'Account not activated.');
  }

  public static get account_suspended() {
    return new ApiError(StatusCodes.BAD_REQUEST, API_ERROR_CODES.ACCOUNT_SUSPENDED, 'Account is suspended.');
  }

  public static get account_blacklisted() {
    return new ApiError(StatusCodes.NOT_ACCEPTABLE, API_ERROR_CODES.ACCOUNT_BLACKLISTED, 'Account is blacklisted.');
  }

  public static get duplicate_email() {
    return new ApiError(StatusCodes.NOT_ACCEPTABLE,
      API_ERROR_CODES.DUPLICATE_EMAIL, 'A user with this e-mail address is already registered.');
  }

  public static get validation_error() {
    return new ApiError(StatusCodes.BAD_REQUEST,
      API_ERROR_CODES.VALIDATION_ERROR, 'Input validation failed');
  }

  public static get download_file_error() {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,
      API_ERROR_CODES.DOWNLOAD_FILE_ERROR, 'Error downloading file');
  }

  public static get unknown_subject() {
    return new ApiError(StatusCodes.BAD_REQUEST,
      API_ERROR_CODES.UNKNOWN_SUBJECT, 'There is no subject with that id');
  }

  public static get document_already_exists() {
    return new ApiError(StatusCodes.BAD_REQUEST,
      API_ERROR_CODES.DOCUMENT_ALREADY_EXISTS, 'There is already a document with these characteristics');
  }

  public static get document_not_found() {
    return new ApiError(StatusCodes.NOT_FOUND,
      API_ERROR_CODES.DOCUMENT_NOT_FOUND, 'Document not found');
  }
}

const API_ERROR_CODES = {
  ACCOUNT_NOT_ACTIVATED: 'ACCOUNT_NOT_ACTIVATED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_BLACKLISTED: 'ACCOUNT_BLACKLISTED',
  DOWNLOAD_FILE_ERROR: 'DOWNLOAD_FILE_ERROR',
  DOCUMENT_ALREADY_EXISTS: 'DOCUMENT_ALREADY_EXISTS',
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  INPUT_TOO_LARGE: 'INPUT_TOO_LARGE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_ACCESS: 'INVALID_ACCESS',
  INVALID_AUTH: 'INVALID_AUTH',
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_INPUT_FORMAT: 'INVALID_INPUT_FORMAT',
  INVALID_KEY: 'INVALID_KEY',
  INVALID_OPERATION: 'INVALID_OPERATION',
  INVALID_PERMISSION: 'INVALID_PERMISSION',
  INVALID_REDIRECT_URI: 'INVALID_REDIRECT_URI',
  INVALID_VERFICATION_KEY: 'INVALID_VERFICATION_KEY',
  NOT_FOUND: 'NOT_FOUND',
  NOT_REGISTERED: 'NOT_REGISTERED',
  PASSWORD_MISMATCHED: 'PASSWORD_MISMATCHED',
  REQUIRED_AUTH_TOKEN: 'REQUIRED_AUTH_TOKEN',
  REQUIRED_KEY: 'REQUIRED_KEY',
  REQUIRED_PARAMETER: 'REQUIRED_PARAMETER',
  UNKNOWN_SUBJECT: 'UNKNOWN_SUBJECT',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};
