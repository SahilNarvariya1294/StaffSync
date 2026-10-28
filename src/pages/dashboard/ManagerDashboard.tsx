import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, GraduationCap, Award, ArrowUpRight, Plus, CheckCircle2 } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';
import { LeaveRequest, TrainingProgram, EmployeeProfile } from '../../types';

interface ManagerDashboardProps {
  onNavigate: (path: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onNavigate }) => {
  const [teamMembers, setTeamMembers] = useState<EmployeeProfile[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<LeaveRequest[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [membersRes, leavesRes, trainingRes] = await Promise.all([
        api.getTeamMembers(),
        api.getTeamLeaves(),
        api.getManagedTraining(),
      ]);

      if (membersRes.success) setTeamMembers(membersRes.team || []);
      if (leavesRes.success) setTeamLeaves(leavesRes.leaves || []);
      if (trainingRes.success) setTrainingPrograms(trainingRes.programs || []);
    } catch (err) {
      console.error('Error loading manager dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingTeamLeaves = teamLeaves.filter((l) => l.status === 'pending');
  const activePrograms = trainingPrograms.filter((p) => p.status === 'Active');

  // Calculate average team training progress
  let totalAssignments = 0;
  let totalProgress = 0;
  trainingPrograms.forEach((p) => {
    p.assignedEmployees?.forEach((a) => {
      totalAssignments++;
      totalProgress += a.progress;
    });
  });
  const avgProgress = totalAssignments > 0 ? Math.round(totalProgress / totalAssignments) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="max-w-3xl">
          <Badge variant="info" size="sm">
            Team Management
          </Badge>
          <h2 className="text-2xl font-bold mt-2 tracking-tight">Manager Dashboard</h2>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Oversee team leave requests, monitor department availability, and manage professional training and development programs for your direct reports.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Direct Reports"
          value={teamMembers.length}
          subtitle="Team engineers & designers"
          icon={Users}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Team Leave Requests"
          value={teamLeaves.length}
          subtitle={`${pendingTeamLeaves.length} pending HR decision`}
          icon={CalendarCheck}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          action={{ label: 'Oversee Leaves', onClick: () => onNavigate('team-leaves') }}
        />
        <StatCard
          title="Training Programs"
          value={trainingPrograms.length}
          subtitle={`${activePrograms.length} currently active`}
          icon={GraduationCap}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          action={{ label: 'Manage Programs', onClick: () => onNavigate('training-programs') }}
        />
        <StatCard
          title="Avg Team Skill Progress"
          value={`${avgProgress}%`}
          subtitle={`Across ${totalAssignments} assigned module(s)`}
          icon={Award}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Main Grid: Team Leaves Oversight & Active Training Programs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Leave Oversight */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-indigo-600" />
                Team Leave Overview ({teamLeaves.length})
              </h3>
              <p className="text-xs text-slate-500">Monitor your team's scheduled leaves</p>
            </div>
            <button
              onClick={() => onNavigate('team-leaves')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Full Roster <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading team leaves...</div>
          ) : teamLeaves.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No leave requests from your team yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {teamLeaves.slice(0, 4).map((leave) => {
                const emp = typeof leave.employeeId === 'object' ? leave.employeeId : null;
                const statusBadge = {
                  pending: <Badge variant="warning" size="sm">Pending HR</Badge>,
                  approved: <Badge variant="success" size="sm">Approved</Badge>,
                  rejected: <Badge variant="danger" size="sm">Rejected</Badge>,
                }[leave.status];

                return (
                  <div key={leave._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{emp?.name || 'Team Member'}</span>
                        <span className="text-[11px] text-slate-400">• {leave.leaveType}</span>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{leave.reason}"</p>
                      <p className="text-[11px] text-slate-400">
                        {leave.startDate} to {leave.endDate} ({leave.totalDays} days)
                      </p>
                    </div>
                    <div>{statusBadge}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Training & Development Programs */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                Team Training Programs ({trainingPrograms.length})
              </h3>
              <p className="text-xs text-slate-500">Skill tracks and team progress</p>
            </div>
            <button
              onClick={() => onNavigate('training-programs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading training programs...</div>
          ) : trainingPrograms.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-slate-500">No training programs created yet.</p>
              <button
                onClick={() => onNavigate('training-programs')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Create Program
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {trainingPrograms.slice(0, 3).map((prog) => {
                const totalAssigned = prog.assignedEmployees?.length || 0;
                const completedCount =
                  prog.assignedEmployees?.filter((a) => a.status === 'Completed').length || 0;
                const progAvg =
                  totalAssigned > 0
                    ? Math.round(
                        prog.assignedEmployees.reduce((acc, curr) => acc + curr.progress, 0) /
                          totalAssigned
                      )
                    : 0;

                return (
                  <div
                    key={prog._id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{prog.title}</h4>
                        <span className="text-[10px] text-slate-500">
                          {prog.category} • {totalAssigned} assigned team member(s)
                        </span>
                      </div>
                      <Badge variant={prog.status === 'Active' ? 'primary' : 'neutral'} size="sm">
                        {prog.status}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                        <span>Overall Completion</span>
                        <span>{progAvg}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${progAvg}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {completedCount} of {totalAssigned} completed • Target: {prog.endDate}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
