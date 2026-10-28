import { Response } from 'express';
import { dbStore } from '../services/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ITrainingAssignment, TrainingStatus } from '../models/TrainingProgram.js';

// Manager: View training programs managed by this manager
export async function getManagedTrainingPrograms(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const programs = await dbStore.getTrainingProgramsByManager(req.user._id);
    return res.status(200).json({ success: true, count: programs.length, programs });
  } catch (error: any) {
    console.error('Get managed training programs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve training programs.' });
  }
}

// Manager: Get team members eligible for training assignment
export async function getTeamMembers(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const allEmployees = await dbStore.getAllEmployees();
    // Team members who report to this manager
    const team = allEmployees.filter(
      (e) => (e.managerId?._id || e.managerId)?.toString() === req.user!._id.toString()
    );

    return res.status(200).json({ success: true, count: team.length, team });
  } catch (error: any) {
    console.error('Get team members error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve team members.' });
  }
}

// Manager: Create a new training and development program
export async function createTrainingProgram(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { title, description, category, startDate, endDate, assignedEmployeeIds } = req.body;

    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, start date, and end date are required.',
      });
    }

    const assignedEmployees: ITrainingAssignment[] = Array.isArray(assignedEmployeeIds)
      ? assignedEmployeeIds.map((empId: string) => ({
          employeeId: empId,
          progress: 0,
          status: 'Not Started' as TrainingStatus,
          notes: 'Enrolled by team manager.',
        }))
      : [];

    const program = await dbStore.createTrainingProgram({
      title,
      description,
      managerId: req.user._id,
      category: category || 'Technical',
      startDate,
      endDate,
      assignedEmployees,
      status: 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Training and development program created successfully.',
      program,
    });
  } catch (error: any) {
    console.error('Create training program error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create training program.' });
  }
}

// Manager: Update program details
export async function updateTrainingProgram(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, category, startDate, endDate, status } = req.body;

    const updates: any = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (startDate) updates.startDate = startDate;
    if (endDate) updates.endDate = endDate;
    if (status) updates.status = status;

    const updated = await dbStore.updateTrainingProgram(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Training program not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Training program updated successfully.',
      program: updated,
    });
  } catch (error: any) {
    console.error('Update training program error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update training program.' });
  }
}

// Manager: Update employee progress or assign/update status
export async function updateEmployeeProgress(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { employeeId, progress, status, notes } = req.body;

    if (!employeeId || progress === undefined || !status) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, progress percentage (0-100), and status are required.',
      });
    }

    const clampedProgress = Math.min(100, Math.max(0, Number(progress)));
    const updated = await dbStore.updateEmployeeTrainingProgress(
      id,
      employeeId,
      clampedProgress,
      status,
      notes
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Training program or employee not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Employee training progress updated successfully.',
      program: updated,
    });
  } catch (error: any) {
    console.error('Update progress error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update progress.' });
  }
}

// Employee: View training programs assigned to self
export async function getMyTrainingPrograms(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const programs = await dbStore.getTrainingProgramsForEmployee(req.user._id);
    return res.status(200).json({ success: true, count: programs.length, programs });
  } catch (error: any) {
    console.error('Get my training error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve training programs.' });
  }
}
