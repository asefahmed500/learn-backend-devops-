import { Response } from 'express';
import { HttpStatus } from '../constants';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode: number = HttpStatus.OK
): void => {
  const response: ApiResponse<T> = { success: true, message, data };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created successfully'): void => {
  sendSuccess(res, data, message, HttpStatus.CREATED);
};

export const sendNoContent = (res: Response): void => {
  res.status(HttpStatus.NO_CONTENT).send();
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HttpStatus.INTERNAL,
  error?: string
): void => {
  const response: ApiResponse = { success: false, message, error };
  res.status(statusCode).json(response);
};
