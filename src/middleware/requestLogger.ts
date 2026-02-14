import { Request, Response, NextFunction } from 'express';

/**
 * Simple request logger middleware.
 * In production, replace with a structured logger like Winston or Pino.
 */
export const requestLogger = (req: Request, _res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};
