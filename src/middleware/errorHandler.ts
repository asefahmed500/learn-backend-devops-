import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { config } from '../config';
import { HttpStatus } from '../constants';

/**
 * Global error-handling middleware.
 * Must be registered LAST with 4 parameters so Express treats it as an error handler.
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ─── Operational AppError ────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // ─── Mongoose Validation Error ───────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
    return;
  }

  // ─── Mongoose Cast Error (bad ObjectId) ──────────────────────
  if (err instanceof mongoose.Error.CastError) {
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
    return;
  }

  // ─── Mongo Duplicate Key Error ───────────────────────────────
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    res.status(HttpStatus.CONFLICT).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    });
    return;
  }

  // ─── Unknown / programmer error ─────────────────────────────
  console.error('UNHANDLED ERROR:', err);
  res.status(HttpStatus.INTERNAL).json({
    success: false,
    message: 'Internal server error',
    ...(config.nodeEnv === 'development' && { error: err.message, stack: err.stack }),
  });
};
