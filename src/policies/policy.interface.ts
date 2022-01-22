import { Request, Response, NextFunction } from 'express';

export interface IPolicy {
  invokeRolesPolicies: () => void;
  isAllowed: (req: Request, res: Response, next: NextFunction) => void;
}
