import mongoose, { Schema } from 'mongoose';
import { IProject } from '../types';
import { ProjectStatus, ProjectPriority } from '../constants';

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.PLANNING,
    },
    startDate: { type: Date, default: Date.now },
    endDate: {
      type: Date,
      validate: {
        validator: function (this: IProject, value: Date) {
          return !value || value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    tags: { type: [String], default: [] },
    budget: { type: Number, min: [0, 'Budget cannot be negative'] },
    priority: {
      type: String,
      enum: Object.values(ProjectPriority),
      default: ProjectPriority.MEDIUM,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ────────────────────────────────────────────────
projectSchema.virtual('tasks', { ref: 'Task', localField: '_id', foreignField: 'project' });

// ─── Indexes ─────────────────────────────────────────────────
projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ startDate: -1 });
projectSchema.index({ name: 'text', description: 'text' });

// ─── Middleware ──────────────────────────────────────────────
projectSchema.pre('save', function (next) {
  if (!this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  next();
});

export const Project = mongoose.model<IProject>('Project', projectSchema);
