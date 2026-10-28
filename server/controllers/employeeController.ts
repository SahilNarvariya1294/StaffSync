import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../services/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getAllEmployees(req: AuthenticatedRequest, res: Response) {
  try {
    const employees = await dbStore.getAllEmployees();
    return res.status(200).json({ success: true, count: employees.length, employees });
  } catch (error: any) {
    console.error('Get all employees error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employees list.' });
  }
}

export async function createEmployee(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      position,
      employeeId,
      phone,
      address,
      dateOfJoining,
      managerId,
      salary,
      workLocation,
      skills,
      emergencyContact,
    } = req.body;

    if (!name || !email || !password || !role || !department || !position || !dateOfJoining) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, role, department, position, and date of joining are required.',
      });
    }

    const existingUser = await dbStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await dbStore.createUser({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      department,
      position,
      status: 'active',
    });

    const empId = employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEmployee = await dbStore.createEmployee({
      userId: newUser._id,
      employeeId: empId,
      phone: phone || '',
      address: address || '',
      dateOfJoining,
      managerId: managerId || null,
      salary: Number(salary) || 0,
      workLocation: workLocation || 'On-site',
      skills: Array.isArray(skills) ? skills : [],
      emergencyContact: emergencyContact || { name: '', phone: '', relationship: '' },
    });

    return res.status(201).json({
      success: true,
      message: 'Employee record created successfully.',
      employee: newEmployee,
    });
  } catch (error: any) {
    console.error('Create employee error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create employee record.' });
  }
}

export async function updateEmployeeRecord(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req.params;
    const {
      name,
      department,
      position,
      role,
      status,
      phone,
      address,
      dateOfJoining,
      managerId,
      salary,
      workLocation,
      skills,
      emergencyContact,
    } = req.body;

    // Update user details
    const userUpdates: any = {};
    if (name) userUpdates.name = name;
    if (department) userUpdates.department = department;
    if (position) userUpdates.position = position;
    if (role) userUpdates.role = role;
    if (status) userUpdates.status = status;

    if (Object.keys(userUpdates).length > 0) {
      await dbStore.updateUser(userId, userUpdates);
    }

    // Update employee profile
    const empUpdates: any = {};
    if (phone !== undefined) empUpdates.phone = phone;
    if (address !== undefined) empUpdates.address = address;
    if (dateOfJoining) empUpdates.dateOfJoining = dateOfJoining;
    if (managerId !== undefined) empUpdates.managerId = managerId || null;
    if (salary !== undefined) empUpdates.salary = Number(salary);
    if (workLocation) empUpdates.workLocation = workLocation;
    if (skills !== undefined) empUpdates.skills = Array.isArray(skills) ? skills : [];
    if (emergencyContact) empUpdates.emergencyContact = emergencyContact;

    const updatedEmployee = await dbStore.updateEmployee(userId, empUpdates);

    return res.status(200).json({
      success: true,
      message: 'Employee record updated successfully.',
      employee: updatedEmployee,
    });
  } catch (error: any) {
    console.error('Update employee error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update employee record.' });
  }
}

export async function getManagersList(req: AuthenticatedRequest, res: Response) {
  try {
    const allUsers = await dbStore.getAllUsers();
    const managers = allUsers.filter((u) => u.role === 'manager' || u.role === 'hr');
    return res.status(200).json({ success: true, managers });
  } catch (error: any) {
    console.error('Get managers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve managers.' });
  }
}
