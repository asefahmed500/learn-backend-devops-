import { Router } from 'express';
import {
  createProject, getAllProjects, getProjectById, updateProject, deleteProject,
  addMember, removeMember, getProjectAnalytics,
} from '../controllers';
import { validate } from '../middleware';
import {
  createProjectRules, updateProjectRules, getProjectByIdRules,
  addMemberRules, removeMemberRules, listProjectsRules,
} from '../validators';

const router = Router();

// CRUD
router.post('/', createProjectRules, validate, createProject);
router.get('/', listProjectsRules, validate, getAllProjects);
router.get('/:id', getProjectByIdRules, validate, getProjectById);
router.put('/:id', updateProjectRules, validate, updateProject);
router.delete('/:id', getProjectByIdRules, validate, deleteProject);

// Members
router.post('/:id/members', addMemberRules, validate, addMember);
router.delete('/:id/members/:userId', removeMemberRules, validate, removeMember);

// Analytics
router.get('/:id/analytics', getProjectByIdRules, validate, getProjectAnalytics);

export default router;
