import bcrypt from 'bcryptjs';
import { dbManager } from '../config/db.js';
import { UserModel, IUser } from '../models/User.js';
import { EmployeeModel, IEmployee } from '../models/Employee.js';
import { LeaveRequestModel, ILeaveRequest } from '../models/LeaveRequest.js';
import { AttendanceModel, IAttendance } from '../models/Attendance.js';
import { AnnouncementModel, IAnnouncement } from '../models/Announcement.js';
import { TrainingProgramModel, ITrainingProgram } from '../models/TrainingProgram.js';

function generateId(): string {
  // Generate MongoDB-compatible 24 hex char ObjectId string
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
}

export class DBStore {
  // Check if Mongoose is actively connected
  private get useMongo(): boolean {
    return dbManager.isConnected;
  }

  /* ================= USERS ================= */
  async findUserByEmail(email: string): Promise<any | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (this.useMongo) {
      return await UserModel.findOne({ email: cleanEmail }).lean();
    }
    const state = dbManager.getState();
    return state.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  }

  async findUserById(id: string): Promise<any | null> {
    if (this.useMongo) {
      return await UserModel.findById(id).lean();
    }
    const state = dbManager.getState();
    return state.users.find((u) => u._id.toString() === id.toString()) || null;
  }

  async getAllUsers(): Promise<any[]> {
    if (this.useMongo) {
      return await UserModel.find().select('-password').lean();
    }
    const state = dbManager.getState();
    return state.users.map(({ password, ...rest }) => rest);
  }

  async createUser(userData: Partial<IUser>): Promise<any> {
    if (this.useMongo) {
      const created = await UserModel.create(userData);
      return created.toObject();
    }
    const state = dbManager.getState();
    const newUser = {
      _id: generateId(),
      ...userData,
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.users.push(newUser);
    dbManager.saveState();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<IUser>): Promise<any> {
    if (this.useMongo) {
      return await UserModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).select('-password').lean();
    }
    const state = dbManager.getState();
    const index = state.users.findIndex((u) => u._id.toString() === id.toString());
    if (index === -1) return null;
    state.users[index] = {
      ...state.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    dbManager.saveState();
    const { password, ...safeUser } = state.users[index];
    return safeUser;
  }

  /* ================= EMPLOYEES ================= */
  async getEmployeeByUserId(userId: string): Promise<any | null> {
    if (this.useMongo) {
      return await EmployeeModel.findOne({ userId }).populate('userId', '-password').populate('managerId', 'name email position').lean();
    }
    const state = dbManager.getState();
    const emp = state.employees.find((e) => e.userId.toString() === userId.toString());
    if (!emp) return null;
    return this.populateEmployee(emp);
  }

  async getAllEmployees(): Promise<any[]> {
    if (this.useMongo) {
      return await EmployeeModel.find()
        .populate('userId', '-password')
        .populate('managerId', 'name email position')
        .lean();
    }
    const state = dbManager.getState();
    return state.employees.map((e) => this.populateEmployee(e));
  }

  async createEmployee(employeeData: Partial<IEmployee>): Promise<any> {
    if (this.useMongo) {
      const created = await EmployeeModel.create(employeeData);
      return await EmployeeModel.findById(created._id)
        .populate('userId', '-password')
        .populate('managerId', 'name email position')
        .lean();
    }
    const state = dbManager.getState();
    const newEmp = {
      _id: generateId(),
      ...employeeData,
      skills: employeeData.skills || [],
      emergencyContact: employeeData.emergencyContact || { name: '', phone: '', relationship: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.employees.push(newEmp);
    dbManager.saveState();
    return this.populateEmployee(newEmp);
  }

  async updateEmployee(userId: string, updates: Partial<IEmployee>): Promise<any> {
    if (this.useMongo) {
      return await EmployeeModel.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true }
      ).populate('userId', '-password').populate('managerId', 'name email position').lean();
    }
    const state = dbManager.getState();
    const index = state.employees.findIndex((e) => e.userId.toString() === userId.toString());
    if (index === -1) return null;
    state.employees[index] = {
      ...state.employees[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    dbManager.saveState();
    return this.populateEmployee(state.employees[index]);
  }

  private populateEmployee(emp: any) {
    const state = dbManager.getState();
    const user = state.users.find((u) => u._id.toString() === (emp.userId?._id || emp.userId).toString());
    let manager = null;
    if (emp.managerId) {
      const mgr = state.users.find((u) => u._id.toString() === (emp.managerId?._id || emp.managerId).toString());
      if (mgr) {
        manager = { _id: mgr._id, name: mgr.name, email: mgr.email, position: mgr.position };
      }
    }
    const { password, ...safeUser } = user || {};
    return {
      ...emp,
      userId: safeUser || emp.userId,
      managerId: manager,
    };
  }

  /* ================= LEAVE REQUESTS ================= */
  async createLeaveRequest(data: Partial<ILeaveRequest>): Promise<any> {
    if (this.useMongo) {
      const created = await LeaveRequestModel.create(data);
      return await LeaveRequestModel.findById(created._id)
        .populate('employeeId', 'name email department position')
        .populate('reviewedBy', 'name email')
        .lean();
    }
    const state = dbManager.getState();
    const newLeave = {
      _id: generateId(),
      ...data,
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      reviewRemarks: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.leaveRequests.unshift(newLeave);
    dbManager.saveState();
    return this.populateLeave(newLeave);
  }

  async getLeaveRequests(filter?: { employeeId?: string; managerId?: string }): Promise<any[]> {
    if (this.useMongo) {
      const query: any = {};
      if (filter?.employeeId) query.employeeId = filter.employeeId;
      if (filter?.managerId) query.managerId = filter.managerId;
      return await LeaveRequestModel.find(query)
        .populate('employeeId', 'name email department position')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    }
    const state = dbManager.getState();
    let list = [...state.leaveRequests];
    if (filter?.employeeId) {
      list = list.filter((l) => (l.employeeId?._id || l.employeeId).toString() === filter.employeeId);
    }
    if (filter?.managerId) {
      list = list.filter((l) => (l.managerId?._id || l.managerId)?.toString() === filter.managerId);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list.map((l) => this.populateLeave(l));
  }

  async updateLeaveStatus(
    leaveId: string,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    remarks?: string
  ): Promise<any> {
    if (this.useMongo) {
      return await LeaveRequestModel.findByIdAndUpdate(
        leaveId,
        {
          $set: {
            status,
            reviewedBy,
            reviewedAt: new Date(),
            reviewRemarks: remarks || '',
          },
        },
        { new: true }
      )
        .populate('employeeId', 'name email department position')
        .populate('reviewedBy', 'name email')
        .lean();
    }
    const state = dbManager.getState();
    const index = state.leaveRequests.findIndex((l) => l._id.toString() === leaveId.toString());
    if (index === -1) return null;
    state.leaveRequests[index] = {
      ...state.leaveRequests[index],
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewRemarks: remarks || '',
      updatedAt: new Date().toISOString(),
    };
    dbManager.saveState();
    return this.populateLeave(state.leaveRequests[index]);
  }

  private populateLeave(leave: any) {
    const state = dbManager.getState();
    const empUser = state.users.find((u) => u._id.toString() === (leave.employeeId?._id || leave.employeeId).toString());
    let reviewer = null;
    if (leave.reviewedBy) {
      const rev = state.users.find((u) => u._id.toString() === (leave.reviewedBy?._id || leave.reviewedBy).toString());
      if (rev) reviewer = { _id: rev._id, name: rev.name, email: rev.email };
    }
    return {
      ...leave,
      employeeId: empUser ? { _id: empUser._id, name: empUser.name, email: empUser.email, department: empUser.department, position: empUser.position } : leave.employeeId,
      reviewedBy: reviewer,
    };
  }

  /* ================= ATTENDANCE ================= */
  async getTodayAttendance(employeeId: string, todayDate: string): Promise<any | null> {
    if (this.useMongo) {
      return await AttendanceModel.findOne({ employeeId, date: todayDate }).lean();
    }
    const state = dbManager.getState();
    return state.attendance.find((a) => (a.employeeId?._id || a.employeeId).toString() === employeeId.toString() && a.date === todayDate) || null;
  }

  async markCheckIn(employeeId: string, date: string, workMode: 'On-site' | 'Remote', notes?: string): Promise<any> {
    const checkIn = new Date().toISOString();
    if (this.useMongo) {
      const record = await AttendanceModel.findOneAndUpdate(
        { employeeId, date },
        {
          $setOnInsert: {
            employeeId,
            date,
            checkIn,
            checkOut: null,
            workDurationMinutes: 0,
            status: 'present',
            workMode,
            notes: notes || '',
          },
        },
        { upsert: true, new: true }
      ).populate('employeeId', 'name email department position').lean();
      return record;
    }
    const state = dbManager.getState();
    const existing = state.attendance.find(
      (a) => (a.employeeId?._id || a.employeeId).toString() === employeeId.toString() && a.date === date
    );
    if (existing) {
      return this.populateAttendance(existing);
    }
    const newRecord = {
      _id: generateId(),
      employeeId,
      date,
      checkIn,
      checkOut: null,
      workDurationMinutes: 0,
      status: 'present',
      workMode,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.attendance.unshift(newRecord);
    dbManager.saveState();
    return this.populateAttendance(newRecord);
  }

  async markCheckOut(employeeId: string, date: string): Promise<any> {
    const checkOut = new Date().toISOString();
    if (this.useMongo) {
      const existing: any = await AttendanceModel.findOne({ employeeId, date });
      if (!existing) return null;
      const duration = Math.round((new Date(checkOut).getTime() - new Date(existing.checkIn).getTime()) / 60000);
      existing.checkOut = checkOut;
      existing.workDurationMinutes = Math.max(0, duration);
      await existing.save();
      return existing.toObject();
    }
    const state = dbManager.getState();
    const index = state.attendance.findIndex(
      (a) => (a.employeeId?._id || a.employeeId).toString() === employeeId.toString() && a.date === date
    );
    if (index === -1) return null;
    const item = state.attendance[index];
    const duration = Math.round((new Date(checkOut).getTime() - new Date(item.checkIn).getTime()) / 60000);
    state.attendance[index] = {
      ...item,
      checkOut,
      workDurationMinutes: Math.max(0, duration),
      updatedAt: new Date().toISOString(),
    };
    dbManager.saveState();
    return this.populateAttendance(state.attendance[index]);
  }

  async getAllAttendance(dateFilter?: string): Promise<any[]> {
    if (this.useMongo) {
      const query: any = {};
      if (dateFilter) query.date = dateFilter;
      return await AttendanceModel.find(query)
        .populate('employeeId', 'name email department position')
        .sort({ date: -1, createdAt: -1 })
        .lean();
    }
    const state = dbManager.getState();
    let list = [...state.attendance];
    if (dateFilter) {
      list = list.filter((a) => a.date === dateFilter);
    }
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list.map((a) => this.populateAttendance(a));
  }

  async getEmployeeAttendanceHistory(employeeId: string): Promise<any[]> {
    if (this.useMongo) {
      return await AttendanceModel.find({ employeeId })
        .populate('employeeId', 'name email department position')
        .sort({ date: -1 })
        .lean();
    }
    const state = dbManager.getState();
    const list = state.attendance.filter(
      (a) => (a.employeeId?._id || a.employeeId).toString() === employeeId.toString()
    );
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list.map((a) => this.populateAttendance(a));
  }

  private populateAttendance(att: any) {
    const state = dbManager.getState();
    const empUser = state.users.find((u) => u._id.toString() === (att.employeeId?._id || att.employeeId).toString());
    return {
      ...att,
      employeeId: empUser ? { _id: empUser._id, name: empUser.name, email: empUser.email, department: empUser.department, position: empUser.position } : att.employeeId,
    };
  }

  /* ================= ANNOUNCEMENTS ================= */
  async getAllAnnouncements(): Promise<any[]> {
    if (this.useMongo) {
      return await AnnouncementModel.find()
        .populate('publishedBy', 'name email position')
        .sort({ isPinned: -1, publishedAt: -1 })
        .lean();
    }
    const state = dbManager.getState();
    const list = [...state.announcements];
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
    return list.map((item) => this.populateAnnouncement(item));
  }

  async createAnnouncement(data: Partial<IAnnouncement>): Promise<any> {
    if (this.useMongo) {
      const created = await AnnouncementModel.create(data);
      return await AnnouncementModel.findById(created._id)
        .populate('publishedBy', 'name email position')
        .lean();
    }
    const state = dbManager.getState();
    const newItem = {
      _id: generateId(),
      ...data,
      isPinned: data.isPinned || false,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.announcements.unshift(newItem);
    dbManager.saveState();
    return this.populateAnnouncement(newItem);
  }

  async updateAnnouncement(id: string, updates: Partial<IAnnouncement>): Promise<any> {
    if (this.useMongo) {
      return await AnnouncementModel.findByIdAndUpdate(id, { $set: updates }, { new: true })
        .populate('publishedBy', 'name email position')
        .lean();
    }
    const state = dbManager.getState();
    const index = state.announcements.findIndex((a) => a._id.toString() === id.toString());
    if (index === -1) return null;
    state.announcements[index] = {
      ...state.announcements[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    dbManager.saveState();
    return this.populateAnnouncement(state.announcements[index]);
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    if (this.useMongo) {
      const res = await AnnouncementModel.findByIdAndDelete(id);
      return !!res;
    }
    const state = dbManager.getState();
    const initialLen = state.announcements.length;
    state.announcements = state.announcements.filter((a) => a._id.toString() !== id.toString());
    dbManager.saveState();
    return state.announcements.length < initialLen;
  }

  private populateAnnouncement(item: any) {
    const state = dbManager.getState();
    const publisher = state.users.find((u) => u._id.toString() === (item.publishedBy?._id || item.publishedBy).toString());
    return {
      ...item,
      publishedBy: publisher ? { _id: publisher._id, name: publisher.name, email: publisher.email, position: publisher.position } : item.publishedBy,
    };
  }

  /* ================= TRAINING PROGRAMS ================= */
  async getTrainingProgramsByManager(managerId: string): Promise<any[]> {
    if (this.useMongo) {
      return await TrainingProgramModel.find({ managerId })
        .populate('managerId', 'name email position')
        .populate('assignedEmployees.employeeId', 'name email department position')
        .sort({ createdAt: -1 })
        .lean();
    }
    const state = dbManager.getState();
    const list = state.trainingPrograms.filter(
      (t) => (t.managerId?._id || t.managerId).toString() === managerId.toString()
    );
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list.map((t) => this.populateTraining(t));
  }

  async getTrainingProgramsForEmployee(employeeId: string): Promise<any[]> {
    if (this.useMongo) {
      return await TrainingProgramModel.find({
        'assignedEmployees.employeeId': employeeId,
      })
        .populate('managerId', 'name email position')
        .populate('assignedEmployees.employeeId', 'name email department position')
        .sort({ createdAt: -1 })
        .lean();
    }
    const state = dbManager.getState();
    const list = state.trainingPrograms.filter((t) =>
      t.assignedEmployees?.some(
        (a: any) => (a.employeeId?._id || a.employeeId).toString() === employeeId.toString()
      )
    );
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list.map((t) => this.populateTraining(t));
  }

  async createTrainingProgram(data: Partial<ITrainingProgram>): Promise<any> {
    if (this.useMongo) {
      const created = await TrainingProgramModel.create(data);
      return await TrainingProgramModel.findById(created._id)
        .populate('managerId', 'name email position')
        .populate('assignedEmployees.employeeId', 'name email department position')
        .lean();
    }
    const state = dbManager.getState();
    const newProg = {
      _id: generateId(),
      ...data,
      assignedEmployees: data.assignedEmployees || [],
      status: data.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.trainingPrograms.unshift(newProg);
    dbManager.saveState();
    return this.populateTraining(newProg);
  }

  async updateTrainingProgram(id: string, updates: Partial<ITrainingProgram>): Promise<any> {
    if (this.useMongo) {
      return await TrainingProgramModel.findByIdAndUpdate(id, { $set: updates }, { new: true })
        .populate('managerId', 'name email position')
        .populate('assignedEmployees.employeeId', 'name email department position')
        .lean();
    }
    const state = dbManager.getState();
    const index = state.trainingPrograms.findIndex((t) => t._id.toString() === id.toString());
    if (index === -1) return null;
    state.trainingPrograms[index] = {
      ...state.trainingPrograms[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    dbManager.saveState();
    return this.populateTraining(state.trainingPrograms[index]);
  }

  async updateEmployeeTrainingProgress(
    programId: string,
    employeeId: string,
    progress: number,
    status: 'Not Started' | 'In Progress' | 'Completed',
    notes?: string
  ): Promise<any> {
    if (this.useMongo) {
      const prog: any = await TrainingProgramModel.findById(programId);
      if (!prog) return null;
      const assignment = prog.assignedEmployees.find(
        (a: any) => a.employeeId.toString() === employeeId.toString()
      );
      if (assignment) {
        assignment.progress = progress;
        assignment.status = status;
        if (notes !== undefined) assignment.notes = notes;
        if (status === 'Completed' && !assignment.completionDate) {
          assignment.completionDate = new Date().toISOString().split('T')[0];
        }
      }
      await prog.save();
      return await TrainingProgramModel.findById(programId)
        .populate('managerId', 'name email position')
        .populate('assignedEmployees.employeeId', 'name email department position')
        .lean();
    }
    const state = dbManager.getState();
    const index = state.trainingPrograms.findIndex((t) => t._id.toString() === programId.toString());
    if (index === -1) return null;
    const prog = state.trainingPrograms[index];
    const aIndex = prog.assignedEmployees.findIndex(
      (a: any) => (a.employeeId?._id || a.employeeId).toString() === employeeId.toString()
    );
    if (aIndex !== -1) {
      prog.assignedEmployees[aIndex].progress = progress;
      prog.assignedEmployees[aIndex].status = status;
      if (notes !== undefined) prog.assignedEmployees[aIndex].notes = notes;
      if (status === 'Completed') {
        prog.assignedEmployees[aIndex].completionDate = new Date().toISOString().split('T')[0];
      }
      prog.updatedAt = new Date().toISOString();
      dbManager.saveState();
    }
    return this.populateTraining(state.trainingPrograms[index]);
  }

  private populateTraining(prog: any) {
    const state = dbManager.getState();
    const manager = state.users.find((u) => u._id.toString() === (prog.managerId?._id || prog.managerId).toString());
    const populatedAssignments = (prog.assignedEmployees || []).map((a: any) => {
      const emp = state.users.find((u) => u._id.toString() === (a.employeeId?._id || a.employeeId).toString());
      return {
        ...a,
        employeeId: emp ? { _id: emp._id, name: emp.name, email: emp.email, department: emp.department, position: emp.position } : a.employeeId,
      };
    });
    return {
      ...prog,
      managerId: manager ? { _id: manager._id, name: manager.name, email: manager.email, position: manager.position } : prog.managerId,
      assignedEmployees: populatedAssignments,
    };
  }
}

export const dbStore = new DBStore();
