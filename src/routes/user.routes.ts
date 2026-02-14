import { Router } from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser, getActiveUsers, getUsersByRole } from '../controllers';
import { validate } from '../middleware';
import { createUserRules, updateUserRules, getUserByIdRules, getUsersByRoleRules, listUsersRules } from '../validators';

const router = Router();

// Custom routes — defined BEFORE /:id to avoid conflicts
router.get('/active/list', getActiveUsers);
router.get('/role/:role', getUsersByRoleRules, validate, getUsersByRole);

// CRUD
router.post('/', createUserRules, validate, createUser);
router.get('/', listUsersRules, validate, getAllUsers);
router.get('/:id', getUserByIdRules, validate, getUserById);
router.put('/:id', updateUserRules, validate, updateUser);
router.delete('/:id', getUserByIdRules, validate, deleteUser);

export default router;
