import mongoose, { Model, Schema, Types } from 'mongoose';
import { ITask, IComment } from '../types';
import { TaskStatus, TaskPriority } from '../constants';

// ─── Comment sub-schema ─────────────────────────────────────
const commentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ─── Static method interface ─────────────────────────────────
interface ITaskStatics extends Model<ITask> {
  findOverdueTasks(): Promise<ITask[]>;
  findByProject(projectId: Types.ObjectId): Promise<ITask[]>;
}

// ─── Schema ──────────────────────────────────────────────────
const taskSchema = new Schema<ITask, ITaskStatics>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: [true, 'Task must belong to a project'] },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (this: ITask, value: Date) {
          // Only validate when creating new, not when updating
          return !value || !this.isNew || value > new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    estimatedHours: { type: Number, min: [0, 'Estimated hours cannot be negative'] },
    actualHours: { type: Number, min: [0, 'Actual hours cannot be negative'] },
    tags: { type: [String], default: [] },
    attachments: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ title: 'text', description: 'text' });

// ─── Virtuals ────────────────────────────────────────────────
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.isCompleted) return false;
  return new Date() > this.dueDate;
});

taskSchema.virtual('progress').get(function () {
  const map: Record<string, number> = { todo: 0, 'in-progress': 50, review: 75, done: 100 };
  return map[this.status] ?? 0;
});

// ─── Middleware ──────────────────────────────────────────────
taskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === TaskStatus.DONE) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }
  if (this.isModified('status') && this.status !== TaskStatus.DONE) {
    this.isCompleted = false;
    this.completedAt = undefined;
  }
  next();
});

// ─── Instance methods ────────────────────────────────────────
taskSchema.methods.markAsComplete = async function (): Promise<ITask> {
  this.status = TaskStatus.DONE;
  this.isCompleted = true;
  this.completedAt = new Date();
  return this.save();
};

taskSchema.methods.addComment = async function (userId: Types.ObjectId, text: string): Promise<ITask> {
  this.comments.push({ user: userId, text, createdAt: new Date() } as IComment);
  return this.save();
};

// ─── Static methods ──────────────────────────────────────────
taskSchema.statics.findOverdueTasks = function () {
  return this.find({ dueDate: { $lt: new Date() }, isCompleted: false });
};

taskSchema.statics.findByProject = function (projectId: Types.ObjectId) {
  return this.find({ project: projectId });
};

// ─── Export ──────────────────────────────────────────────────
export const Task = mongoose.model<ITask, ITaskStatics>('Task', taskSchema);
