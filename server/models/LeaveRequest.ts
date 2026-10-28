import mongoose, { Document, Schema, Types } from 'mongoose';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'Annual' | 'Sick' | 'Casual' | 'Maternity/Paternity' | 'Unpaid';

export interface ILeaveRequest extends Document {
  employeeId: Types.ObjectId | string; // User reference
  managerId?: Types.ObjectId | string | null;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: Types.ObjectId | string | null;
  reviewedAt?: Date | null;
  reviewRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    leaveType: {
      type: String,
      required: true,
      enum: ['Annual', 'Sick', 'Casual', 'Maternity/Paternity', 'Unpaid'],
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    totalDays: { type: Number, required: true, min: 0.5 },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewRemarks: { type: String, default: '' },
  },
  { timestamps: true }
);

export const LeaveRequestModel =
  mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
