import { Router } from 'express';
import {
  getManagedTrainingPrograms,
  getTeamMembers,
  createTrainingProgram,
  updateTrainingProgram,
  updateEmployeeProgress,
  getMyTrainingPrograms,
} from '../controllers/trainingController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Employee: View my training programs
router.get('/my', getMyTrainingPrograms);

// Manager only: Manage training and development programs for teams
router.get('/managed', requireRole(['manager']), getManagedTrainingPrograms);
router.get('/team-members', requireRole(['manager']), getTeamMembers);
router.post('/', requireRole(['manager']), createTrainingProgram);
router.put('/:id', requireRole(['manager']), updateTrainingProgram);
router.patch('/:id/progress', requireRole(['manager']), updateEmployeeProgress);

export default router;
