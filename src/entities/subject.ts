
/* eslint-disable no-unused-vars */
export enum SubjectStatus {
  assigned = 0,
  workInProgress = 1,
  researchCompleted = 2
}
/* eslint-enable no-unused-vars */

export interface ISubject {
  id: number;
  uuid: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: Date;
  sirutaId: number;
  city: string;
  countyId: number;
  county: string;
  notes: string;
  created: Date;
  updated: Date;
  deleted: boolean;
  assignedToId?: number;
  assignedTo?: string;
  status?: SubjectStatus;
}

export interface ISubjectAssignedHistory {
  id: number;
  revoked: boolean;
  status: SubjectStatus;
  assignedToId: number;
  assignedTo: string;
  assignedById: number;
  assignedBy: string;
  assignedOn: Date;
  revokedById?: number;
  revokedBy?: string;
  revokedOn?: Date;
}
