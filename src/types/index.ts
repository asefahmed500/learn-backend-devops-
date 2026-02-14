import { Document, Types } from 'mongoose';

// ─── Pagination ──────────────────────────────────────────────
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── API Response ────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// ─── User ────────────────────────────────────────────────────
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'user' | 'admin' | 'manager';
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getPublicProfile(): Record<string, unknown>;
}

export interface IUserModel {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveUsers(): Promise<IUser[]>;
}

// ─── Task ────────────────────────────────────────────────────
export interface IComment {
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ITask extends Document {
  title: string;
  description: string;
  project: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: string[];
  comments: IComment[];
  dependencies: Types.ObjectId[];
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isOverdue?: boolean;
  markAsComplete(): Promise<ITask>;
  addComment(userId: Types.ObjectId, text: string): Promise<ITask>;
}

// ─── Project ─────────────────────────────────────────────────
export interface IProject extends Document {
  name: string;
  description: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';
  startDate: Date;
  endDate?: Date;
  tags: string[];
  budget?: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}
