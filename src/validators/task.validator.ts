import { body, param, query } from 'express-validator';
import { TaskStatus, TaskPriority } from '../constants';

export const createTaskRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 1000 }),
  body('project').notEmpty().withMessage('Project is required').isMongoId().withMessage('Invalid project ID'),
  body('createdBy').notEmpty().withMessage('createdBy is required').isMongoId(),
  body('assignedTo').optional().isMongoId(),
  body('status').optional().isIn(Object.values(TaskStatus)),
  body('priority').optional().isIn(Object.values(TaskPriority)),
  body('dueDate').optional().isISO8601().toDate(),
  body('estimatedHours').optional().isFloat({ min: 0 }),
  body('tags').optional().isArray(),
];

export const updateTaskRules = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('title').optional().trim().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(Object.values(TaskStatus)),
  body('priority').optional().isIn(Object.values(TaskPriority)),
  body('dueDate').optional().isISO8601().toDate(),
  body('estimatedHours').optional().isFloat({ min: 0 }),
  body('actualHours').optional().isFloat({ min: 0 }),
];

export const getTaskByIdRules = [param('id').isMongoId().withMessage('Invalid task ID')];

export const addCommentRules = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('userId').notEmpty().withMessage('userId is required').isMongoId(),
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 500 }),
];

export const bulkUpdateRules = [
  body('taskIds').isArray({ min: 1 }).withMessage('taskIds must be a non-empty array'),
  body('taskIds.*').isMongoId().withMessage('Each taskId must be a valid Mongo ID'),
  body('updates').isObject().withMessage('updates must be an object'),
];

export const listTasksRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['createdAt', 'dueDate', 'priority', 'status', 'title']),
  query('order').optional().isIn(['asc', 'desc']),
  query('status').optional().isIn(Object.values(TaskStatus)),
  query('priority').optional().isIn(Object.values(TaskPriority)),
  query('project').optional().isMongoId(),
  query('assignedTo').optional().isMongoId(),
  query('createdBy').optional().isMongoId(),
  query('isOverdue').optional().isIn(['true', 'false']),
  query('search').optional().isString().trim(),
];
