import { Router } from 'express';
import { login, getMe, updateMyProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateMyProfile);

export default router;
