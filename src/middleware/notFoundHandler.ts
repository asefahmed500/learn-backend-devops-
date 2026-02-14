import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants';

/**
 * 404 handler — catches requests that matched no route.
 */
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};
