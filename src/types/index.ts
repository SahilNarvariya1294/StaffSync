export type UserRole = 'hr' | 'manager' | 'employee';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  name: string;
  department: string;
  position: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface EmployeeProfile {
  _id: string;
  userId: string | User;
  employeeId: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  dateOfJoining: string;
  managerId?: {
    _id: string;
    name: string;
    email: string;
    position?: string;
  } | null;
  skills: string[];
  salary?: number;
  workLocation: 'On-site' | 'Remote' | 'Hybrid';
  createdAt?: string;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'Annual' | 'Sick' | 'Casual' | 'Maternity/Paternity' | 'Unpaid';

export interface LeaveRequest {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    department: string;
    position: string;
  } | string;
  managerId?: string | null;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  reviewedAt?: string | null;
  reviewRemarks?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    department: string;
    position: string;
  } | string;
  date: string;
  checkIn: string;
  checkOut?: string | null;
  workDurationMinutes?: number;
  status: 'present' | 'absent' | 'half-day' | 'late';
  workMode: 'On-site' | 'Remote';
  notes?: string;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  category: 'General' | 'Policy' | 'Event' | 'Holiday' | 'Urgent';
  priority: 'Low' | 'Medium' | 'High';
  publishedBy: {
    _id: string;
    name: string;
    email: string;
    position?: string;
  } | string;
  publishedAt: string;
  isPinned: boolean;
  createdAt: string;
}

export interface TrainingAssignment {
  employeeId: {
    _id: string;
    name: string;
    email: string;
    department: string;
    position: string;
  } | string;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  completionDate?: string | null;
  notes?: string;
}

export interface TrainingProgram {
  _id: string;
  title: string;
  description: string;
  managerId: {
    _id: string;
    name: string;
    email: string;
    position?: string;
  } | string;
  category: 'Technical' | 'Leadership' | 'Compliance' | 'Soft Skills' | 'Safety';
  startDate: string;
  endDate: string;
  assignedEmployees: TrainingAssignment[];
  status: 'Planning' | 'Active' | 'Completed';
  createdAt: string;
}
