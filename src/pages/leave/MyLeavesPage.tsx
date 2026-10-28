import React, { useState, useEffect } from 'react';
import { CalendarCheck, Plus, CheckCircle, Clock, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { api } from '../../services/api';
import { LeaveRequest, LeaveType } from '../../types';

export const MyLeavesPage: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const loadLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMyLeaves();
      if (res.success) {
        setLeaves(res.leaves || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load leaves.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  // Compute business days
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const days = calculateDays();
    if (days <= 0) {
      setFeedback({ type: 'error', message: 'End date must be equal to or after start date.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await api.applyLeave({
        leaveType,
        startDate,
        endDate,
        totalDays: days,
        reason,
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Leave request submitted successfully for HR approval!' });
        setIsApplyModalOpen(false);
        setReason('');
        setStartDate('');
        setEndDate('');
        await loadLeaves();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit leave request.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leave Applications</h2>
            <Badge variant="primary" size="sm">
              Employee Portal
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submit leave requests and monitor status decisions approved by Human Resources.
          </p>
        </div>

        <button
          onClick={() => {
            setFeedback(null);
            setIsApplyModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Apply for Leave
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Leave Application History Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            My Submitted Leave Requests ({leaves.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading your leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            You have not submitted any leave requests yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Requested Dates</th>
                  <th className="py-3 px-4">Total Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">HR Feedback & Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => {
                  const statusBadge = {
                    pending: <Badge variant="warning" size="sm">Pending HR</Badge>,
                    approved: <Badge variant="success" size="sm">Approved</Badge>,
                    rejected: <Badge variant="danger" size="sm">Rejected</Badge>,
                  }[leave.status];

                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{leave.leaveType}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {leave.startDate} to {leave.endDate}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{leave.totalDays} day(s)</td>
                      <td className="py-3 px-4 max-w-xs text-slate-700 italic">"{leave.reason}"</td>
                      <td className="py-3 px-4">{statusBadge}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {leave.reviewRemarks ? (
                          <span className="text-slate-800 font-medium">{leave.reviewRemarks}</span>
                        ) : leave.status === 'pending' ? (
                          <span className="text-slate-400 italic">Under HR review</span>
                        ) : (
                          <span className="text-slate-400 italic">No remarks recorded</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Apply for Leave */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Leave"
        subtitle="Submit your time-off request for HR approval"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category *</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="Annual">Annual Leave (Vacation)</option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual / Personal Leave</option>
              <option value="Maternity/Paternity">Maternity / Paternity Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {startDate && endDate && (
            <div className="p-2.5 bg-blue-50 rounded-lg text-xs text-blue-800 flex items-center justify-between">
              <span>Total calculated duration:</span>
              <span className="font-bold">{calculateDays()} calendar day(s)</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Absence *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain the reason for your leave request..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
