import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'hr' | 'manager' | 'employee';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  department: string;
  position: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['hr', 'manager', 'employee'] },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
