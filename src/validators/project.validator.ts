import { body, param, query } from 'express-validator';
import { ProjectStatus, ProjectPriority } from '../constants';

export const createProjectRules = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 100 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 500 }),
  body('owner').notEmpty().withMessage('Owner is required').isMongoId(),
  body('members').optional().isArray(),
  body('members.*').optional().isMongoId(),
  body('status').optional().isIn(Object.values(ProjectStatus)),
  body('priority').optional().isIn(Object.values(ProjectPriority)),
  body('startDate').optional().isISO8601().toDate(),
  body('endDate').optional().isISO8601().toDate(),
  body('budget').optional().isFloat({ min: 0 }),
  body('tags').optional().isArray(),
];

export const updateProjectRules = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('name').optional().trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('status').optional().isIn(Object.values(ProjectStatus)),
  body('priority').optional().isIn(Object.values(ProjectPriority)),
  body('endDate').optional().isISO8601().toDate(),
  body('budget').optional().isFloat({ min: 0 }),
];

export const getProjectByIdRules = [param('id').isMongoId().withMessage('Invalid project ID')];

export const addMemberRules = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('userId').notEmpty().withMessage('userId is required').isMongoId(),
];

export const removeMemberRules = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  param('userId').isMongoId().withMessage('Invalid user ID'),
];

export const listProjectsRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['createdAt', 'name', 'startDate', 'priority']),
  query('order').optional().isIn(['asc', 'desc']),
  query('status').optional().isIn(Object.values(ProjectStatus)),
  query('priority').optional().isIn(Object.values(ProjectPriority)),
  query('owner').optional().isMongoId(),
  query('search').optional().isString().trim(),
];
