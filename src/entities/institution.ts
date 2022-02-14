
/* eslint-disable no-unused-vars */
export enum InstitutionType {
  public = 0,
  private = 1,
  ngo = 2
}

/* eslint-enable no-unused-vars */

export interface IInstitution {
  id: string;
  sirutaId: number;
  type: InstitutionType;
  name: string;
  address?: string;
  cui?: string;
  regCom?: string;
  dateStart?: Date;
  dateEnd?: Date;
  aditionalInfo?: string;
}
