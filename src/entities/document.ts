/* eslint-disable no-unused-vars */
export enum DocumentType {
  assetDeclaration = 1,
  interestDeclaration = 2
}

export enum DocumentVersion {
  v1 = 1,
  v2 = 2
}

export enum DocumentStatus {
  waitingOCR = 0,
  ocrCompleted = 1,
  ocrError,
  ocrOutputNotFound,
  ocrOutputDownloadError,
  validated,
  downloadError
}
/* eslint-enable no-unused-vars */

export interface IDocument {
  id: string;
  subjectId: number;
  type: DocumentType;
  status: DocumentStatus;
  name: string;
  md5: string;
  downloadedUrl: string;
  originalPath: string;
  data?: string;
  dataRaw?: string;
  created: Date;
  createdBy: number;
  createdByName: string;
  updated?: Date;
  updatedBy?: number;
  updatedByName?: string;
}

/* eslint-disable no-unused-vars */
export enum OcrResult {
  SUCCESS = 0,
  ERROR
  // TBD
}
/* eslint-enable no-unused-vars */


export interface IQueueInput {
  documentId: string;
  type: DocumentType;
  formularType: DocumentVersion;
  storage: string;
  path: string;
  filename: string;
  outPath: string;
  ocrTableJsonFilename: string;
  ocrCustomJsonFilename: string;
}

export interface IOcrError {
  title: string;
  value: string;
}

export interface IOcrMessage {
  title: string;
  value: string;
  comments?: string;
}

export interface IQueueOutput extends IQueueInput {
  messageid: string;
  messages: IOcrMessage[];
  errors: IOcrError[];
}
