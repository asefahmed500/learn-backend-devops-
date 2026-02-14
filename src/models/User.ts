import mongoose, { Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';
import { UserRole } from '../constants';
import { config } from '../config';

// ─── Static method interface ─────────────────────────────────
interface IUserStatics extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveUsers(): Promise<IUser[]>;
}

// ─── Schema ──────────────────────────────────────────────────
const userSchema = new Schema<IUser, IUserStatics>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      lowercase: true,
      validate: {
        validator: (v: string) => /^[a-z0-9_]+$/.test(v),
        message: 'Username can only contain lowercase letters, numbers, and underscores',
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      enum: { values: Object.values(UserRole), message: '{VALUE} is not a valid role' },
      default: UserRole.USER,
    },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, isActive: 1 });

// ─── Virtuals ────────────────────────────────────────────────
userSchema.virtual('profileUrl').get(function () {
  return `/users/${this._id}`;
});

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'assignedTo',
});

// ─── Middleware ──────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(config.saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance methods ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    fullName: this.fullName,
    role: this.role,
    avatar: this.avatar,
    createdAt: this.createdAt,
  };
};

// ─── Static methods ──────────────────────────────────────────
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true }).select('-password');
};

// ─── Export ──────────────────────────────────────────────────
export const User = mongoose.model<IUser, IUserStatics>('User', userSchema);
