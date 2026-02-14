import { Router } from 'express';
import {
  createTask, getAllTasks, getTaskById, updateTask, deleteTask,
  completeTask, addComment, getTaskStatistics, getOverdueTasks, bulkUpdateTasks,
} from '../controllers';
import { validate } from '../middleware';
import { createTaskRules, updateTaskRules, getTaskByIdRules, addCommentRules, bulkUpdateRules, listTasksRules } from '../validators';

const router = Router();

// Custom routes — before /:id
router.get('/analytics/statistics', listTasksRules, validate, getTaskStatistics);
router.get('/status/overdue', getOverdueTasks);
router.patch('/bulk/update', bulkUpdateRules, validate, bulkUpdateTasks);

// CRUD
router.post('/', createTaskRules, validate, createTask);
router.get('/', listTasksRules, validate, getAllTasks);
router.get('/:id', getTaskByIdRules, validate, getTaskById);
router.put('/:id', updateTaskRules, validate, updateTask);
router.delete('/:id', getTaskByIdRules, validate, deleteTask);

// Actions
router.patch('/:id/complete', getTaskByIdRules, validate, completeTask);
router.post('/:id/comments', addCommentRules, validate, addComment);

export default router;
