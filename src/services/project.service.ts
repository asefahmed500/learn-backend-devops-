import mongoose from 'mongoose';
import { Project, Task } from '../models';
import { IProject, PaginatedResult } from '../types';
import { NotFoundError } from '../utils/AppError';
import { config } from '../config';

// ─── Interfaces ──────────────────────────────────────────────
interface ListProjectsQuery {
  status?: string;
  owner?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  limit?: number;
}

// ─── Service ─────────────────────────────────────────────────
export class ProjectService {
  async create(data: Record<string, unknown>): Promise<IProject> {
    const project = await Project.create(data);
    await project.populate([
      { path: 'owner', select: 'username email fullName' },
      { path: 'members', select: 'username email fullName' },
    ]);
    return project;
  }

  async list(query: ListProjectsQuery): Promise<PaginatedResult<IProject>> {
    const page = query.page || config.defaultPage;
    const limit = Math.min(query.limit || config.defaultLimit, config.maxLimit);
    const skip = (page - 1) * limit;
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [query.sortBy || 'createdAt']: sortOrder };

    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.owner) filter.owner = query.owner;
    if (query.priority) filter.priority = query.priority;
    if (query.search) filter.$text = { $search: query.search };

    const [data, total] = await Promise.all([
      Project.find(filter)
        .populate('owner', 'username email fullName')
        .populate('members', 'username email fullName')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getById(id: string): Promise<{ project: IProject; taskStats: unknown[] }> {
    const project = await Project.findById(id)
      .populate('owner', 'username email fullName')
      .populate('members', 'username email fullName')
      .populate({ path: 'tasks', populate: { path: 'assignedTo', select: 'username fullName' } });

    if (!project) throw new NotFoundError('Project');

    const taskStats = await Task.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return { project, taskStats };
  }

  async update(id: string, updates: Record<string, unknown>): Promise<IProject> {
    const project = await Project.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
      .populate('owner', 'username email fullName')
      .populate('members', 'username email fullName');

    if (!project) throw new NotFoundError('Project');
    return project;
  }

  async delete(id: string): Promise<void> {
    const project = await Project.findByIdAndDelete(id);
    if (!project) throw new NotFoundError('Project');
    await Task.deleteMany({ project: id });
  }

  async addMember(id: string, userId: string): Promise<IProject> {
    const project = await Project.findByIdAndUpdate(
      id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'username email fullName');

    if (!project) throw new NotFoundError('Project');
    return project;
  }

  async removeMember(id: string, userId: string): Promise<IProject> {
    const project = await Project.findByIdAndUpdate(
      id,
      { $pull: { members: userId } },
      { new: true }
    ).populate('members', 'username email fullName');

    if (!project) throw new NotFoundError('Project');
    return project;
  }

  async getAnalytics(id: string): Promise<unknown> {
    const analytics = await Task.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(id) } },
      {
        $facet: {
          statusDistribution: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          priorityDistribution: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
          timeTracking: [
            {
              $group: {
                _id: null,
                totalEstimated: { $sum: '$estimatedHours' },
                totalActual: { $sum: '$actualHours' },
                avgEstimated: { $avg: '$estimatedHours' },
                avgActual: { $avg: '$actualHours' },
              },
            },
          ],
          teamPerformance: [
            { $match: { assignedTo: { $exists: true } } },
            {
              $group: {
                _id: '$assignedTo',
                totalTasks: { $sum: 1 },
                completedTasks: { $sum: { $cond: ['$isCompleted', 1, 0] } },
              },
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: { username: '$user.username', fullName: '$user.fullName', totalTasks: 1, completedTasks: 1 } },
          ],
        },
      },
    ]);

    return analytics[0];
  }
}

export const projectService = new ProjectService();
