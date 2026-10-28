import mongoose, { Document, Schema, Types } from 'mongoose';

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'late';

export interface IAttendance extends Document {
  employeeId: Types.ObjectId | string; // User reference
  date: string; // YYYY-MM-DD
  checkIn: string; // ISO string
  checkOut?: string | null; // ISO string
  workDurationMinutes?: number;
  status: AttendanceStatus;
  workMode: 'On-site' | 'Remote';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AttendanceSchema = new Schema<IAttendance>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, default: null },
    workDurationMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'late'],
      default: 'present',
    },
    workMode: {
      type: String,
      enum: ['On-site', 'Remote'],
      default: 'On-site',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const AttendanceModel =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
