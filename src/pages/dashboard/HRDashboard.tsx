import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, Clock, Megaphone, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { api } from '../../services/api';
import { EmployeeProfile, LeaveRequest, AttendanceRecord, Announcement } from '../../types';

interface HRDashboardProps {
  onNavigate: (path: string) => void;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({ onNavigate }) => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal state
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [remarks, setRemarks] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [empRes, leaveRes, attRes, annRes] = await Promise.all([
        api.getEmployees(),
        api.getAllLeaves(),
        api.getAllAttendance(),
        api.getAnnouncements(),
      ]);

      if (empRes.success) setEmployees(empRes.employees || []);
      if (leaveRes.success) setLeaves(leaveRes.leaves || []);
      if (attRes.success) setAttendance(attRes.records || []);
      if (annRes.success) setAnnouncements(annRes.announcements || []);
    } catch (err) {
      console.error('Error loading HR dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingLeaves = leaves.filter((l) => l.status === 'pending');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === todayStr);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;
    setIsSubmittingReview(true);
    try {
      await api.reviewLeave(selectedLeave._id, reviewAction, remarks);
      setSelectedLeave(null);
      setRemarks('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to review leave.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="max-w-3xl">
          <Badge variant="primary" size="sm">
            HR Operations Control
          </Badge>
          <h2 className="text-2xl font-bold mt-2 tracking-tight">HR Personnel Dashboard</h2>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Monitor organizational headcount, review and approve employee leave requests, track daily employee attendance, and publish company announcements.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workforce"
          value={employees.length}
          subtitle="Active employee records"
          icon={Users}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          action={{ label: 'Manage Directory', onClick: () => onNavigate('employees') }}
        />
        <StatCard
          title="Pending Leave Requests"
          value={pendingLeaves.length}
          subtitle="Awaiting HR approval"
          icon={CalendarCheck}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          action={{ label: 'Review Leaves', onClick: () => onNavigate('leave-approvals') }}
        />
        <StatCard
          title="Today's Attendance"
          value={todayAttendance.length}
          subtitle={`${todayAttendance.filter((a) => a.workMode === 'On-site').length} on-site, ${todayAttendance.filter((a) => a.workMode === 'Remote').length} remote`}
          icon={Clock}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          action={{ label: 'Attendance Log', onClick: () => onNavigate('attendance-tracking') }}
        />
        <StatCard
          title="Company News"
          value={announcements.length}
          subtitle={`${announcements.filter((a) => a.isPinned).length} pinned notice(s)`}
          icon={Megaphone}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          action={{ label: 'Post Announcement', onClick: () => onNavigate('announcements') }}
        />
      </div>

      {/* Main Grid: Pending Approvals & Today's Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pending Leaves */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-600" />
                Pending Leave Applications ({pendingLeaves.length})
              </h3>
              <p className="text-xs text-slate-500">Employee requests requiring HR review</p>
            </div>
            <button
              onClick={() => onNavigate('leave-approvals')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading leave requests...</div>
          ) : pendingLeaves.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">All leave requests are reviewed!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No pending applications at this time.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingLeaves.slice(0, 4).map((leave) => {
                const emp = typeof leave.employeeId === 'object' ? leave.employeeId : null;
                return (
                  <div key={leave._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{emp?.name || 'Employee'}</span>
                        <span className="text-[11px] text-slate-400">({emp?.department})</span>
                        <Badge variant="warning" size="sm">
                          {leave.leaveType}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 italic">"{leave.reason}"</p>
                      <p className="text-[11px] text-slate-400">
                        {leave.startDate} to {leave.endDate} • <strong>{leave.totalDays} day(s)</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedLeave(leave);
                          setReviewAction('approved');
                          setRemarks('Approved as requested.');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLeave(leave);
                          setReviewAction('rejected');
                          setRemarks('Unable to approve due to operational requirements.');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Today's Attendance Overview */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Live Attendance
              </h3>
              <p className="text-xs text-slate-500">Today's employee check-ins</p>
            </div>
            <button
              onClick={() => onNavigate('attendance-tracking')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Full Log <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading attendance...</div>
          ) : todayAttendance.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No employees checked in yet today.
            </div>
          ) : (
            <div className="space-y-3">
              {todayAttendance.slice(0, 5).map((att) => {
                const emp = typeof att.employeeId === 'object' ? att.employeeId : null;
                const checkInTime = new Date(att.checkIn).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={att._id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{emp?.name || 'Staff'}</p>
                      <p className="text-[11px] text-slate-500">{emp?.department || 'StaffSync'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-800">{checkInTime}</span>
                      <div className="mt-0.5">
                        <Badge
                          variant={att.workMode === 'On-site' ? 'info' : 'neutral'}
                          size="sm"
                        >
                          {att.workMode}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        title={reviewAction === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
        subtitle={`Reviewing request from ${
          typeof selectedLeave?.employeeId === 'object' ? selectedLeave?.employeeId.name : 'Employee'
        }`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700">
            <p>
              <strong>Leave Type:</strong> {selectedLeave?.leaveType}
            </p>
            <p>
              <strong>Duration:</strong> {selectedLeave?.startDate} to {selectedLeave?.endDate} (
              {selectedLeave?.totalDays} days)
            </p>
            <p>
              <strong>Reason:</strong> {selectedLeave?.reason}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              HR Review Remarks
            </label>
            <textarea
              required
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide comments or conditions regarding this approval/rejection..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedLeave(null)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer ${
                reviewAction === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {isSubmittingReview ? 'Saving...' : `Confirm ${reviewAction === 'approved' ? 'Approval' : 'Rejection'}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
