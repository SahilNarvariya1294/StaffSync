import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Clock,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { api } from '../../services/api';
import { LeaveRequest, LeaveStatus } from '../../types';

export const LeaveManagementPage: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review modal
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAllLeaves();
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await api.reviewLeave(selectedLeave._id, reviewAction, remarks);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Leave request marked as ${reviewAction.toUpperCase()}!`,
        });
        setSelectedLeave(null);
        setRemarks('');
        await loadLeaves();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Review submission failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const emp = typeof leave.employeeId === 'object' ? leave.employeeId : null;
    const matchesSearch =
      emp?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp?.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.leaveType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || leave.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = leaves.filter((l) => l.status === 'pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leave Approvals</h2>
          <Badge variant="primary" size="sm">
            HR Module
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Review company-wide leave applications, evaluate operational coverage, and approve or reject requests with audit remarks.
        </p>
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-blue-50 border-blue-600 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Requests</span>
          <span className="text-xl font-bold text-slate-900">{leaves.length}</span>
        </button>

        <button
          onClick={() => setFilterStatus('pending')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            filterStatus === 'pending'
              ? 'bg-amber-50 border-amber-600 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Pending Review</span>
          <span className="text-xl font-bold text-amber-900">{pendingCount}</span>
        </button>

        <button
          onClick={() => setFilterStatus('approved')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            filterStatus === 'approved'
              ? 'bg-emerald-50 border-emerald-600 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Approved</span>
          <span className="text-xl font-bold text-emerald-900">{approvedCount}</span>
        </button>

        <button
          onClick={() => setFilterStatus('rejected')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            filterStatus === 'rejected'
              ? 'bg-rose-50 border-rose-600 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-rose-700 block">Rejected</span>
          <span className="text-xl font-bold text-rose-900">{rejectedCount}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by employee name or reason..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 cursor-pointer focus:outline-hidden"
          >
            <option value="all">All Statuses ({leaves.length})</option>
            <option value="pending">Pending Review ({pendingCount})</option>
            <option value="approved">Approved ({approvedCount})</option>
            <option value="rejected">Rejected ({rejectedCount})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading leave requests...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No leave requests found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Dates & Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status & Review</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((leave) => {
                  const emp = typeof leave.employeeId === 'object' ? leave.employeeId : null;
                  const reviewer = typeof leave.reviewedBy === 'object' ? leave.reviewedBy : null;

                  const statusBadge = {
                    pending: <Badge variant="warning" size="sm">Pending HR</Badge>,
                    approved: <Badge variant="success" size="sm">Approved</Badge>,
                    rejected: <Badge variant="danger" size="sm">Rejected</Badge>,
                  }[leave.status];

                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp?.name || 'Employee'}</div>
                        <div className="text-[11px] text-slate-400">{emp?.department}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{leave.leaveType}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900 block">
                          {leave.startDate} to {leave.endDate}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {leave.totalDays} business day(s)
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-slate-700 italic truncate" title={leave.reason}>
                          "{leave.reason}"
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div>{statusBadge}</div>
                        {leave.reviewRemarks && (
                          <div className="text-[10px] text-slate-500 mt-1 max-w-xs truncate" title={leave.reviewRemarks}>
                            Note: {leave.reviewRemarks}
                          </div>
                        )}
                        {reviewer && (
                          <div className="text-[10px] text-slate-400">By {reviewer.name}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {leave.status === 'pending' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedLeave(leave);
                                setReviewAction('approved');
                                setRemarks('Approved as requested.');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLeave(leave);
                                setReviewAction('rejected');
                                setRemarks('Schedule conflicts with current team priorities.');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setReviewAction(leave.status === 'approved' ? 'rejected' : 'approved');
                              setRemarks(leave.reviewRemarks || '');
                            }}
                            className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                          >
                            Re-evaluate
                          </button>
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

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        title={reviewAction === 'approved' ? 'Approve Leave Application' : 'Reject Leave Application'}
        subtitle={`Applicant: ${
          typeof selectedLeave?.employeeId === 'object' ? selectedLeave?.employeeId.name : 'Employee'
        }`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-slate-700">
            <p>
              <strong>Leave Type:</strong> {selectedLeave?.leaveType}
            </p>
            <p>
              <strong>Dates:</strong> {selectedLeave?.startDate} to {selectedLeave?.endDate} (
              {selectedLeave?.totalDays} days)
            </p>
            <p>
              <strong>Reason provided:</strong> {selectedLeave?.reason}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              HR Review Remarks & Justification *
            </label>
            <textarea
              required
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks recorded in the employee audit file..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedLeave(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer ${
                reviewAction === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {isSubmitting ? 'Submitting...' : `Confirm ${reviewAction === 'approved' ? 'Approval' : 'Rejection'}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
