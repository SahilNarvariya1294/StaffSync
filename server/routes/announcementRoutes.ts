import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// All authenticated roles (Employee, Manager, HR) can view announcements
router.get('/', getAnnouncements);

// HR Personnel only: create, update, delete announcements
router.post('/', requireRole(['hr']), createAnnouncement);
router.put('/:id', requireRole(['hr']), updateAnnouncement);
router.delete('/:id', requireRole(['hr']), deleteAnnouncement);

export default router;
