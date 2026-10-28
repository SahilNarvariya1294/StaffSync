import mongoose, { Document, Schema, Types } from 'mongoose';

export type TrainingStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface ITrainingAssignment {
  employeeId: Types.ObjectId | string;
  progress: number; // 0 to 100
  status: TrainingStatus;
  completionDate?: string | null;
  notes?: string;
}

export interface ITrainingProgram extends Document {
  title: string;
  description: string;
  managerId: Types.ObjectId | string; // Manager User ref
  category: 'Technical' | 'Leadership' | 'Compliance' | 'Soft Skills' | 'Safety';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  assignedEmployees: ITrainingAssignment[];
  status: 'Planning' | 'Active' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

const TrainingAssignmentSchema = new Schema<ITrainingAssignment>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  completionDate: { type: String, default: null },
  notes: { type: String, default: '' },
});

export const TrainingProgramSchema = new Schema<ITrainingProgram>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['Technical', 'Leadership', 'Compliance', 'Soft Skills', 'Safety'],
      default: 'Technical',
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    assignedEmployees: [TrainingAssignmentSchema],
    status: {
      type: String,
      enum: ['Planning', 'Active', 'Completed'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export const TrainingProgramModel =
  mongoose.models.TrainingProgram ||
  mongoose.model<ITrainingProgram>('TrainingProgram', TrainingProgramSchema);
