import { NextFunction, Request, Response } from 'express';

type AsyncHandler = (_req: Request, _res: Response, _next: NextFunction) => Promise<unknown>;

export const catchAsync =
  (fn: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
