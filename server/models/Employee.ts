import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEmployee extends Document {
  userId: Types.ObjectId | string;
  employeeId: string; // e.g. EMP-1001
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  dateOfJoining: string; // YYYY-MM-DD
  managerId?: Types.ObjectId | string | null;
  skills: string[];
  salary?: number;
  workLocation: 'On-site' | 'Remote' | 'Hybrid';
  createdAt: Date;
  updatedAt: Date;
}

export const EmployeeSchema = new Schema<IEmployee>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
    dateOfJoining: { type: String, required: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    skills: [{ type: String }],
    salary: { type: Number, default: 0 },
    workLocation: { type: String, enum: ['On-site', 'Remote', 'Hybrid'], default: 'On-site' },
  },
  { timestamps: true }
);

export const EmployeeModel = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
