// ─── HTTP Status Codes ───────────────────────────────────────
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE = 422,
  INTERNAL = 500,
}

// ─── User Roles ──────────────────────────────────────────────
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager',
}

// ─── Task Status ─────────────────────────────────────────────
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  REVIEW = 'review',
  DONE = 'done',
}

// ─── Task Priority ───────────────────────────────────────────
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// ─── Project Status ──────────────────────────────────────────
export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on-hold',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

// ─── Project Priority ────────────────────────────────────────
export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
