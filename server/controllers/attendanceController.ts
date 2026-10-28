import { Response } from 'express';
import { dbStore } from '../services/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// Employee: Get today's attendance status
export async function getTodayStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const record = await dbStore.getTodayAttendance(req.user._id, todayDate);

    return res.status(200).json({
      success: true,
      todayDate,
      record,
      isCheckedIn: !!record,
      isCheckedOut: !!record?.checkOut,
    });
  } catch (error: any) {
    console.error('Get today status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance status.' });
  }
}

// Employee: Mark Check-In
export async function checkIn(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const existing = await dbStore.getTodayAttendance(req.user._id, todayDate);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today.',
        record: existing,
      });
    }

    const { workMode, notes } = req.body;
    const mode = workMode === 'Remote' ? 'Remote' : 'On-site';

    const record = await dbStore.markCheckIn(req.user._id, todayDate, mode, notes);
    return res.status(201).json({
      success: true,
      message: 'Check-in recorded successfully.',
      record,
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record check-in.' });
  }
}

// Employee: Mark Check-Out
export async function checkOut(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const existing = await dbStore.getTodayAttendance(req.user._id, todayDate);

    if (!existing) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today. Please check in first.',
      });
    }

    if (existing.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out for today.',
        record: existing,
      });
    }

    const updated = await dbStore.markCheckOut(req.user._id, todayDate);
    return res.status(200).json({
      success: true,
      message: 'Check-out recorded successfully. Have a great evening!',
      record: updated,
    });
  } catch (error: any) {
    console.error('Check-out error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record check-out.' });
  }
}

// Employee: View personal attendance history
export async function getMyAttendance(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const records = await dbStore.getEmployeeAttendanceHistory(req.user._id);
    return res.status(200).json({ success: true, count: records.length, records });
  } catch (error: any) {
    console.error('Get my attendance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch personal attendance history.' });
  }
}

// HR Personnel: Track all employee attendance
export async function getAllAttendance(req: AuthenticatedRequest, res: Response) {
  try {
    const { date } = req.query;
    const records = await dbStore.getAllAttendance(typeof date === 'string' ? date : undefined);

    const totalPresent = records.filter((r) => r.status === 'present').length;
    const onSiteCount = records.filter((r) => r.workMode === 'On-site').length;
    const remoteCount = records.filter((r) => r.workMode === 'Remote').length;

    return res.status(200).json({
      success: true,
      count: records.length,
      metrics: {
        totalPresent,
        onSiteCount,
        remoteCount,
      },
      records,
    });
  } catch (error: any) {
    console.error('Get all attendance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to track attendance.' });
  }
}
