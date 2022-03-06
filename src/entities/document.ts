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
  validated = 2
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

/* eslint-disable no-unused-vars */
export enum OcrResult {
  SUCCESS = 0,
  ERROR
  // TBD
}
/* eslint-enable no-unused-vars */

export interface IQueueOutput extends IQueueInput {
  error: OcrResult;
}
