import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from '../services/dbStore.js';
import { JWT_SECRET, AuthenticatedRequest } from '../middleware/auth.js';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await dbStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact HR.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const tokenPayload = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      position: user.position,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    const employee = await dbStore.getEmployeeByUserId(user._id.toString());

    const { password: _, ...safeUser } = user;
    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser,
      employee,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await dbStore.findUserById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const employee = await dbStore.getEmployeeByUserId(user._id.toString());
    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      user: safeUser,
      employee,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

// Allows employees to maintain their own personal records
export async function updateMyProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { phone, address, emergencyContact, skills } = req.body;
    const updatedEmployee = await dbStore.updateEmployee(req.user._id, {
      phone,
      address,
      emergencyContact,
      skills: Array.isArray(skills) ? skills : [],
    });

    return res.status(200).json({
      success: true,
      message: 'Personal profile records updated successfully.',
      employee: updatedEmployee,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update personal record.' });
  }
}
