import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { HttpStatus } from '../constants';

/**
 * Middleware that checks express-validator results.
 * Place AFTER your validation chains in the route definition.
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(HttpStatus.UNPROCESSABLE).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }
  next();
};
