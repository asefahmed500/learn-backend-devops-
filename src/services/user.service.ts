import { User } from '../models';
import { Task } from '../models';
import { IUser, PaginatedResult } from '../types';
import { NotFoundError, ConflictError } from '../utils/AppError';
import { config } from '../config';

// ─── Interfaces ──────────────────────────────────────────────
interface ListUsersQuery {
  role?: string;
  isActive?: string;
  search?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  limit?: number;
}

interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

// ─── Service ─────────────────────────────────────────────────
export class UserService {
  async create(dto: CreateUserDTO): Promise<Record<string, unknown>> {
    const existing = await User.findOne({ $or: [{ email: dto.email }, { username: dto.username }] });
    if (existing) throw new ConflictError('User with this email or username already exists');

    const user = await User.create({ ...dto, role: dto.role || 'user' });
    return user.getPublicProfile();
  }

  async list(query: ListUsersQuery): Promise<PaginatedResult<IUser>> {
    const page = query.page || config.defaultPage;
    const limit = Math.min(query.limit || config.defaultLimit, config.maxLimit);
    const skip = (page - 1) * limit;
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [query.sortBy || 'createdAt']: sortOrder };

    const filter: Record<string, unknown> = {};
    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    if (query.search) {
      filter.$or = [
        { username: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { fullName: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      User.find(filter).select('-password').sort(sort).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getById(id: string): Promise<{ user: IUser; taskStats: unknown[] }> {
    const user = await User.findById(id)
      .select('-password')
      .populate({ path: 'tasks', select: 'title status priority dueDate', options: { limit: 10, sort: { createdAt: -1 } } });

    if (!user) throw new NotFoundError('User');

    const taskStats = await Task.aggregate([
      { $match: { assignedTo: user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return { user, taskStats };
  }

  async update(id: string, updates: Record<string, unknown>): Promise<IUser> {
    delete updates.password; // prevent password update via this endpoint
    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).select('-password');
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async delete(id: string): Promise<void> {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new NotFoundError('User');
  }

  async getActiveUsers(): Promise<IUser[]> {
    return User.findActiveUsers();
  }

  async getUsersByRole(role: string): Promise<IUser[]> {
    return User.find({ role, isActive: true }).select('-password');
  }
}

export const userService = new UserService();
