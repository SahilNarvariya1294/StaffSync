import { Response } from 'express';
import { dbStore } from '../services/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// Employee: Submit Leave Request
export async function applyLeave(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { leaveType, startDate, endDate, totalDays, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !totalDays || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, start date, end date, total days, and reason are required.',
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be prior to start date.',
      });
    }

    // Get employee profile to assign managerId if exists
    const employee = await dbStore.getEmployeeByUserId(req.user._id);
    const managerId = employee?.managerId?._id || employee?.managerId || null;

    const leave = await dbStore.createLeaveRequest({
      employeeId: req.user._id,
      managerId,
      leaveType,
      startDate,
      endDate,
      totalDays: Number(totalDays),
      reason,
    });

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully.',
      leave,
    });
  } catch (error: any) {
    console.error('Apply leave error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit leave request.' });
  }
}

// Employee: View own leave requests
export async function getMyLeaves(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const leaves = await dbStore.getLeaveRequests({ employeeId: req.user._id });
    return res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (error: any) {
    console.error('Get my leaves error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve leave history.' });
  }
}

// HR Personnel: View all leave requests
export async function getAllLeaves(req: AuthenticatedRequest, res: Response) {
  try {
    const leaves = await dbStore.getLeaveRequests();
    return res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (error: any) {
    console.error('Get all leaves error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve leaves.' });
  }
}

// HR Personnel: Review, Approve or Reject Leave Request
export async function reviewLeave(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'.",
      });
    }

    const updated = await dbStore.updateLeaveStatus(id, status, req.user._id, remarks);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Leave request marked as ${status}.`,
      leave: updated,
    });
  } catch (error: any) {
    console.error('Review leave error:', error);
    return res.status(500).json({ success: false, message: 'Failed to review leave request.' });
  }
}

// Managers: Oversee leave requests for their team
export async function getTeamLeaves(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get all employees who report to this manager
    const allEmployees = await dbStore.getAllEmployees();
    const teamUserIds = allEmployees
      .filter((e) => (e.managerId?._id || e.managerId)?.toString() === req.user!._id.toString())
      .map((e) => (e.userId?._id || e.userId).toString());

    // Fetch leaves
    const allLeaves = await dbStore.getLeaveRequests();
    const teamLeaves = allLeaves.filter((l) => {
      const empId = (l.employeeId?._id || l.employeeId)?.toString();
      const mgrId = (l.managerId?._id || l.managerId)?.toString();
      return teamUserIds.includes(empId) || mgrId === req.user!._id.toString();
    });

    return res.status(200).json({ success: true, count: teamLeaves.length, leaves: teamLeaves });
  } catch (error: any) {
    console.error('Get team leaves error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve team leaves.' });
  }
}
