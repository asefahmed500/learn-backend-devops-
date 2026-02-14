import { body, param, query } from 'express-validator';
import { UserRole } from '../constants';

export const createUserRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[a-z0-9_]+$/).withMessage('Username: lowercase letters, numbers, underscores only'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }),
  body('role').optional().isIn(Object.values(UserRole)).withMessage('Invalid role'),
];

export const updateUserRules = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('username').optional().trim().isLength({ min: 3, max: 30 }),
  body('email').optional().trim().isEmail(),
  body('fullName').optional().trim().isLength({ max: 100 }),
  body('role').optional().isIn(Object.values(UserRole)),
  body('isActive').optional().isBoolean(),
];

export const getUserByIdRules = [param('id').isMongoId().withMessage('Invalid user ID')];

export const getUsersByRoleRules = [
  param('role').isIn(Object.values(UserRole)).withMessage('Invalid role'),
];

export const listUsersRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['createdAt', 'username', 'email', 'fullName']),
  query('order').optional().isIn(['asc', 'desc']),
  query('role').optional().isIn(Object.values(UserRole)),
  query('isActive').optional().isIn(['true', 'false']),
  query('search').optional().isString().trim(),
];
