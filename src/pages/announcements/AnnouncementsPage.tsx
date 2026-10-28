import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Pin,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Announcement } from '../../types';

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal states for HR
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'General' | 'Policy' | 'Event' | 'Holiday' | 'Urgent'>('General');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [isPinned, setIsPinned] = useState(false);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAnnouncements();
      if (res.success) {
        setAnnouncements(res.announcements || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to load announcements.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('General');
    setPriority('Medium');
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setEditingId(item._id);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category);
    setPriority(item.priority);
    setIsPinned(item.isPinned);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      if (editingId) {
        const res = await api.updateAnnouncement(editingId, {
          title,
          content,
          category,
          priority,
          isPinned,
        });
        if (res.success) {
          setFeedback({ type: 'success', text: 'Announcement updated successfully!' });
        }
      } else {
        const res = await api.createAnnouncement({
          title,
          content,
          category,
          priority,
          isPinned,
        });
        if (res.success) {
          setFeedback({ type: 'success', text: 'Announcement published successfully!' });
        }
      }
      setIsModalOpen(false);
      await loadAnnouncements();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to publish announcement.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company announcement?')) return;
    try {
      const res = await api.deleteAnnouncement(id);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Announcement removed.' });
        await loadAnnouncements();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete announcement.' });
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Company Announcements & News</h2>
            <Badge variant="primary" size="sm">
              {isHR ? 'HR Publishing Portal' : 'Company Feed'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isHR
              ? 'Publish official company bulletins, policy updates, event notifications, and urgent directives.'
              : 'Stay informed with official company announcements and policy updates from HR.'}
          </p>
        </div>

        {isHR && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Publish Announcement
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 cursor-pointer focus:outline-hidden"
          >
            <option value="all">All Categories ({announcements.length})</option>
            <option value="General">General</option>
            <option value="Policy">Policy</option>
            <option value="Event">Event</option>
            <option value="Holiday">Holiday</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Feed of Announcements */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading announcements...</div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          No announcements found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((item) => {
            const author = typeof item.publishedBy === 'object' ? item.publishedBy : null;
            const priorityBadge = {
              High: <Badge variant="danger" size="sm">High Priority</Badge>,
              Medium: <Badge variant="warning" size="sm">Medium</Badge>,
              Low: <Badge variant="neutral" size="sm">Low</Badge>,
            }[item.priority];

            return (
              <div
                key={item._id}
                className={`bg-white rounded-xl p-5 border shadow-xs transition-shadow ${
                  item.isPinned ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          <Pin className="w-3 h-3" /> PINNED TO TOP
                        </span>
                      )}
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Published by {author?.name || 'HR Operations'}</span>
                      <span>•</span>
                      <span>{new Date(item.publishedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <Badge variant="primary" size="sm">
                      {item.category}
                    </Badge>
                    {priorityBadge}

                    {isHR && (
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit announcement"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          title="Delete announcement"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {item.content}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Announcement */}
      {isHR && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Announcement' : 'Publish New Announcement'}
          subtitle="Publish company-wide bulletin visible to all employees"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Announcement Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 Townhall & Benefits Renewal Notice"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="General">General</option>
                  <option value="Policy">Policy Update</option>
                  <option value="Event">Event / Summit</option>
                  <option value="Holiday">Holiday Notice</option>
                  <option value="Urgent">Urgent Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Content / Message Body *
              </label>
              <textarea
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the full announcement text here..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pinNotice"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="pinNotice" className="text-xs font-medium text-slate-700 cursor-pointer">
                Pin to top of employee feed
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Publishing...' : editingId ? 'Save Changes' : 'Publish Now'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
