import { Router } from 'express';
import {
  getTodayStatus,
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
} from '../controllers/attendanceController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Employee attendance actions
router.get('/today', getTodayStatus);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my', getMyAttendance);

// HR Personnel action: Track employee attendance
router.get('/all', requireRole(['hr']), getAllAttendance);

export default router;
