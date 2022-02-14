export interface IJobPosition {
  id: string;
  subjectId: number;
  institutionId: number;
  institution: string;
  sirutaId: number;
  uat: string;
  name: string;
  dateStart: Date;
  dateEnd: Date;
}
