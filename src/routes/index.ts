import { Router } from 'express';
import userRoutes from './user.routes';
import taskRoutes from './task.routes';
import projectRoutes from './project.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/projects', projectRoutes);

export default router;
