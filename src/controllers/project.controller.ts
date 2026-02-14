import { Request, Response } from 'express';
import { projectService } from '../services';
import { asyncHandler } from '../middleware';
import { sendSuccess, sendCreated } from '../utils/response';
import { HttpStatus } from '../constants';

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.create(req.body);
  sendCreated(res, project, 'Project created successfully');
});

export const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectService.list(req.query as any);
  res.status(HttpStatus.OK).json({ success: true, ...result });
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const data = await projectService.getById(req.params.id);
  sendSuccess(res, data);
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.update(req.params.id, req.body);
  sendSuccess(res, project, 'Project updated successfully');
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await projectService.delete(req.params.id);
  sendSuccess(res, null, 'Project and associated tasks deleted successfully');
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.addMember(req.params.id, req.body.userId);
  sendSuccess(res, project, 'Member added successfully');
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.removeMember(req.params.id, req.params.userId);
  sendSuccess(res, project, 'Member removed successfully');
});

export const getProjectAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const analytics = await projectService.getAnalytics(req.params.id);
  sendSuccess(res, analytics);
});
