import { Request, Response } from 'express';
import { taskService } from '../services';
import { asyncHandler } from '../middleware';
import { sendSuccess, sendCreated } from '../utils/response';
import { HttpStatus } from '../constants';

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.create(req.body);
  sendCreated(res, task, 'Task created successfully');
});

export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.list(req.query as any);
  res.status(HttpStatus.OK).json({ success: true, ...result });
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.getById(req.params.id);
  sendSuccess(res, task);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.update(req.params.id, req.body);
  sendSuccess(res, task, 'Task updated successfully');
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.delete(req.params.id);
  sendSuccess(res, null, 'Task deleted successfully');
});

export const completeTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.complete(req.params.id);
  sendSuccess(res, task, 'Task marked as complete');
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.addComment(req.params.id, req.body.userId, req.body.text);
  sendSuccess(res, task, 'Comment added successfully');
});

export const getTaskStatistics = asyncHandler(async (req: Request, res: Response) => {
  const stats = await taskService.getStatistics(req.query.projectId as string | undefined);
  sendSuccess(res, stats);
});

export const getOverdueTasks = asyncHandler(async (_req: Request, res: Response) => {
  const tasks = await taskService.getOverdueTasks();
  sendSuccess(res, tasks);
});

export const bulkUpdateTasks = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.bulkUpdate(req.body.taskIds, req.body.updates);
  sendSuccess(res, result, 'Tasks updated successfully');
});
