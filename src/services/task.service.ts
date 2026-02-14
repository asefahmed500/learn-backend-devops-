import mongoose, { Types } from 'mongoose';
import { Task } from '../models';
import { ITask, PaginatedResult } from '../types';
import { NotFoundError } from '../utils/AppError';
import { config } from '../config';

// ─── Interfaces ──────────────────────────────────────────────
interface ListTasksQuery {
  status?: string;
  priority?: string;
  project?: string;
  assignedTo?: string;
  createdBy?: string;
  isOverdue?: string;
  search?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  limit?: number;
}

// ─── Service ─────────────────────────────────────────────────
export class TaskService {
  async create(data: Record<string, unknown>): Promise<ITask> {
    const task = await Task.create(data);
    await task.populate([
      { path: 'project', select: 'name status' },
      { path: 'assignedTo', select: 'username email fullName' },
      { path: 'createdBy', select: 'username email fullName' },
    ]);
    return task;
  }

  async list(query: ListTasksQuery): Promise<PaginatedResult<ITask>> {
    const page = query.page || config.defaultPage;
    const limit = Math.min(query.limit || config.defaultLimit, config.maxLimit);
    const skip = (page - 1) * limit;
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [query.sortBy || 'createdAt']: sortOrder };

    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.project) filter.project = query.project;
    if (query.assignedTo) filter.assignedTo = query.assignedTo;
    if (query.createdBy) filter.createdBy = query.createdBy;
    if (query.isOverdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.isCompleted = false;
    }
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const [data, total] = await Promise.all([
      Task.find(filter)
        .populate('project', 'name status')
        .populate('assignedTo', 'username email fullName')
        .populate('createdBy', 'username email')
        .populate({ path: 'comments.user', select: 'username fullName avatar' })
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getById(id: string): Promise<ITask> {
    const task = await Task.findById(id)
      .populate('project', 'name description status owner')
      .populate('assignedTo', 'username email fullName avatar')
      .populate('createdBy', 'username email fullName')
      .populate('dependencies', 'title status priority')
      .populate({ path: 'comments.user', select: 'username fullName avatar' });

    if (!task) throw new NotFoundError('Task');
    return task;
  }

  async update(id: string, updates: Record<string, unknown>): Promise<ITask> {
    const task = await Task.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
      .populate('project', 'name')
      .populate('assignedTo', 'username email fullName');

    if (!task) throw new NotFoundError('Task');
    return task;
  }

  async delete(id: string): Promise<void> {
    const task = await Task.findByIdAndDelete(id);
    if (!task) throw new NotFoundError('Task');
  }

  async complete(id: string): Promise<ITask> {
    const task = await Task.findById(id);
    if (!task) throw new NotFoundError('Task');
    return task.markAsComplete();
  }

  async addComment(id: string, userId: string, text: string): Promise<ITask> {
    const task = await Task.findById(id);
    if (!task) throw new NotFoundError('Task');
    await task.addComment(new mongoose.Types.ObjectId(userId), text);
    await task.populate({ path: 'comments.user', select: 'username fullName avatar' });
    return task;
  }

  async getStatistics(projectId?: string): Promise<unknown> {
    const matchStage: Record<string, unknown> = projectId
      ? { project: new mongoose.Types.ObjectId(projectId) }
      : {};

    const stats = await Task.aggregate([
      { $match: matchStage },
      {
        $facet: {
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 }, avgEstimatedHours: { $avg: '$estimatedHours' } } }],
          byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
          overall: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                completedTasks: { $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] } },
                overdueTasks: {
                  $sum: {
                    $cond: [{ $and: [{ $lt: ['$dueDate', new Date()] }, { $eq: ['$isCompleted', false] }] }, 1, 0],
                  },
                },
                totalEstimatedHours: { $sum: '$estimatedHours' },
                totalActualHours: { $sum: '$actualHours' },
              },
            },
          ],
          byAssignee: [
            { $match: { assignedTo: { $exists: true } } },
            {
              $group: {
                _id: '$assignedTo',
                taskCount: { $sum: 1 },
                completedCount: { $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] } },
              },
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            {
              $project: {
                username: '$user.username',
                fullName: '$user.fullName',
                taskCount: 1,
                completedCount: 1,
                completionRate: { $multiply: [{ $divide: ['$completedCount', '$taskCount'] }, 100] },
              },
            },
            { $sort: { taskCount: -1 } },
          ],
        },
      },
    ]);

    return stats[0];
  }

  async getOverdueTasks(): Promise<ITask[]> {
    return Task.find({ dueDate: { $lt: new Date() }, isCompleted: false })
      .populate('assignedTo', 'username email')
      .populate('project', 'name')
      .sort({ dueDate: 1 });
  }

  async bulkUpdate(taskIds: string[], updates: Record<string, unknown>): Promise<{ matchedCount: number; modifiedCount: number }> {
    const result = await Task.updateMany({ _id: { $in: taskIds } }, { $set: updates }, { runValidators: true });
    return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
  }
}

export const taskService = new TaskService();
