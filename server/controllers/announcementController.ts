import { Response } from 'express';
import { dbStore } from '../services/dbStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// All authenticated roles: View published announcements
export async function getAnnouncements(req: AuthenticatedRequest, res: Response) {
  try {
    const announcements = await dbStore.getAllAnnouncements();
    return res.status(200).json({ success: true, count: announcements.length, announcements });
  } catch (error: any) {
    console.error('Get announcements error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve announcements.' });
  }
}

// HR Personnel: Create and publish company announcement
export async function createAnnouncement(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { title, content, category, priority, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Announcement title and content are required.',
      });
    }

    const created = await dbStore.createAnnouncement({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Medium',
      isPinned: Boolean(isPinned),
      publishedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      announcement: created,
    });
  } catch (error: any) {
    console.error('Create announcement error:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish announcement.' });
  }
}

// HR Personnel: Update announcement
export async function updateAnnouncement(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, content, category, priority, isPinned } = req.body;

    const updates: any = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (category) updates.category = category;
    if (priority) updates.priority = priority;
    if (isPinned !== undefined) updates.isPinned = Boolean(isPinned);

    const updated = await dbStore.updateAnnouncement(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      announcement: updated,
    });
  } catch (error: any) {
    console.error('Update announcement error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update announcement.' });
  }
}

// HR Personnel: Delete announcement
export async function deleteAnnouncement(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await dbStore.deleteAnnouncement(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement removed successfully.',
    });
  } catch (error: any) {
    console.error('Delete announcement error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete announcement.' });
  }
}
