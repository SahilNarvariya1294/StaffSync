import mongoose, { Document, Schema, Types } from 'mongoose';

export type AnnouncementCategory = 'General' | 'Policy' | 'Event' | 'Holiday' | 'Urgent';
export type AnnouncementPriority = 'Low' | 'Medium' | 'High';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  publishedBy: Types.ObjectId | string; // HR User ref
  publishedAt: Date;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['General', 'Policy', 'Event', 'Holiday', 'Urgent'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date, default: Date.now },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AnnouncementModel =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
