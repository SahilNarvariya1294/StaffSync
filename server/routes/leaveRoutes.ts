import { Router } from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  getTeamLeaves,
} from '../controllers/leaveController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Employee functions
router.post('/', requireRole(['employee', 'manager', 'hr']), applyLeave);
router.get('/my', getMyLeaves);

// Manager function: Oversee team leaves
router.get('/team', requireRole(['manager']), getTeamLeaves);

// HR Personnel functions: Review and approve/reject, view all
router.get('/all', requireRole(['hr']), getAllLeaves);
router.patch('/:id/review', requireRole(['hr']), reviewLeave);

export default router;
