
/* eslint-disable no-unused-vars */
export enum InstitutionType {
  public = 0,
  private = 1,
  ngo = 2,
  university = 3,
  highschool = 4,
  senat = 254,
  cdep = 255
}

/* eslint-enable no-unused-vars */

export interface IInstitution {
  id: string;
  sirutaId: number;
  type: InstitutionType;
  requireDecls: number;
  name: string;
  address?: string;
  cui?: string;
  regCom?: string;
  dateStart?: Date;
  dateEnd?: Date;
  aditionalInfo?: string;
}
