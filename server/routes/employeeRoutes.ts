import { Router } from 'express';
import {
  getAllEmployees,
  createEmployee,
  updateEmployeeRecord,
  getManagersList,
} from '../controllers/employeeController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Only HR personnel can manage employee records
router.use(authenticate);
router.use(requireRole(['hr']));

router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.put('/:userId', updateEmployeeRecord);
router.get('/meta/managers', getManagersList);

export default router;
