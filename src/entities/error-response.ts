/* eslint-disable require-jsdoc */
import { IApiError } from './api-error';

export class ErrorResponse {
  public code: string;
  public message: string;
  public details: string | [] | undefined;

  constructor(error: IApiError) {
    this.code = error.errorCode;
    this.message = error.message;
    this.details = error.details;
  }
}
