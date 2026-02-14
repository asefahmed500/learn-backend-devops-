import { Request, Response } from 'express';
import { userService } from '../services';
import { asyncHandler } from '../middleware';
import { sendSuccess, sendCreated } from '../utils/response';
import { HttpStatus } from '../constants';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const profile = await userService.create(req.body);
  sendCreated(res, profile, 'User created successfully');
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.list(req.query as any);
  res.status(HttpStatus.OK).json({ success: true, ...result });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const data = await userService.getById(req.params.id);
  sendSuccess(res, data);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.update(req.params.id, req.body);
  sendSuccess(res, user, 'User updated successfully');
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.delete(req.params.id);
  sendSuccess(res, null, 'User deleted successfully');
});

export const getActiveUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.getActiveUsers();
  sendSuccess(res, users);
});

export const getUsersByRole = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getUsersByRole(req.params.role);
  sendSuccess(res, users);
});
