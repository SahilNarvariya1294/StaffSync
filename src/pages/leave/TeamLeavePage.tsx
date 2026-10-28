import React, { useState, useEffect } from 'react';
import { CalendarCheck, Search, Filter, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';
import { LeaveRequest } from '../../types';

export const TeamLeavePage: React.FC = () => {
  const [teamLeaves, setTeamLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTeamLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTeamLeaves();
      if (res.success) {
        setTeamLeaves(res.leaves || []);
      }
    } catch (err) {
      console.error('Failed to load team leaves:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamLeaves();
  }, []);

  const filteredLeaves = teamLeaves.filter((leave) => {
    const emp = typeof leave.employeeId === 'object' ? leave.employeeId : null;
    const matchesSearch =
      emp?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.leaveType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || leave.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = teamLeaves.filter((l) => l.status === 'pending').length;
  const approvedCount = teamLeaves.filter((l) => l.status === 'approved').length;
  const rejectedCount = teamLeaves.filter((l) => l.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Team Leave Oversight</h2>
          <Badge variant="info" size="sm">
            Manager Module
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Oversee scheduled absences and pending leave applications for your team members to ensure coverage.
        </p>
      </div>

      {/* Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Requests</span>
          <span className="text-xl font-bold text-slate-900">{teamLeaves.length}</span>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Awaiting HR</span>
          <span className="text-xl font-bold text-amber-900">{pendingCount}</span>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Approved Leaves</span>
          <span className="text-xl font-bold text-emerald-900">{approvedCount}</span>
        </div>
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-700 block">Rejected</span>
          <span className="text-xl font-bold text-rose-900">{rejectedCount}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team member or reason..."
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
            <option value="all">All Requests ({teamLeaves.length})</option>
            <option value="pending">Pending HR Decision ({pendingCount})</option>
            <option value="approved">Approved ({approvedCount})</option>
            <option value="rejected">Rejected ({rejectedCount})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading team leave records...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No team leave requests found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Team Member</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Requested Dates</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">HR Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((leave) => {
                  const emp = typeof leave.employeeId === 'object' ? leave.employeeId : null;
                  const statusBadge = {
                    pending: <Badge variant="warning" size="sm">Pending HR</Badge>,
                    approved: <Badge variant="success" size="sm">Approved</Badge>,
                    rejected: <Badge variant="danger" size="sm">Rejected</Badge>,
                  }[leave.status];

                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp?.name || 'Team Member'}</div>
                        <div className="text-[11px] text-slate-400">{emp?.position}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{leave.leaveType}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900 block">
                          {leave.startDate} to {leave.endDate}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">{leave.totalDays} day(s)</span>
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
                            HR Note: {leave.reviewRemarks}
                          </div>
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
    </div>
  );
};
