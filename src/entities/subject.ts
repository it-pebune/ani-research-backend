
/* eslint-disable no-unused-vars */
export enum SubjectStatus {
  unassigned = 0,
  assigned,
  workInProgress,
  researchCompleted
}
/* eslint-enable no-unused-vars */

export interface ISubjectDTO {
  firstName: string;
  lastName: string;
  photoUrl: string;
  dob: Date;
  sirutaId?: number;
}

export interface ISubject {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
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
  hash: string | null;
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
