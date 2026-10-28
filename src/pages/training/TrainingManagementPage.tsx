import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Users,
  CheckCircle,
  Clock,
  Award,
  Search,
  Filter,
  Sliders,
  Calendar,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TrainingProgram, EmployeeProfile } from '../../types';

export const TrainingManagementPage: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [teamMembers, setTeamMembers] = useState<EmployeeProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal: Create Program
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Technical' | 'Leadership' | 'Compliance' | 'Soft Skills' | 'Safety'>('Technical');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal: Update Team Member Progress
  const [progressModal, setProgressModal] = useState<{
    program: TrainingProgram;
    assignment: any;
  } | null>(null);
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState<'Not Started' | 'In Progress' | 'Completed'>('In Progress');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isManager) {
        const [progRes, teamRes] = await Promise.all([
          api.getManagedTraining(),
          api.getTeamMembers(),
        ]);
        if (progRes.success) setPrograms(progRes.programs || []);
        if (teamRes.success) setTeamMembers(teamRes.team || []);
      } else {
        const progRes = await api.getMyTraining();
        if (progRes.success) setPrograms(progRes.programs || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to load training programs.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isManager]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !startDate || !endDate) {
      setFeedback({ type: 'error', text: 'Please fill in all required training program details.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await api.createTraining({
        title,
        description,
        category,
        startDate,
        endDate,
        assignedEmployeeIds: selectedEmployees,
      });

      if (res.success) {
        setFeedback({ type: 'success', text: 'Training and development program launched successfully!' });
        setIsCreateModalOpen(false);
        setTitle('');
        setDescription('');
        setSelectedEmployees([]);
        await loadData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to create training program.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openProgressModal = (program: TrainingProgram, assignment: any) => {
    setProgressModal({ program, assignment });
    setEditProgress(assignment.progress);
    setEditStatus(assignment.status);
    setEditNotes(assignment.notes || '');
  };

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressModal) return;
    setIsUpdatingProgress(true);
    setFeedback(null);
    try {
      const empId =
        typeof progressModal.assignment.employeeId === 'object'
          ? progressModal.assignment.employeeId._id
          : progressModal.assignment.employeeId;

      const res = await api.updateEmployeeTrainingProgress(progressModal.program._id, {
        employeeId: empId,
        progress: editProgress,
        status: editStatus,
        notes: editNotes,
      });

      if (res.success) {
        setFeedback({ type: 'success', text: 'Team member progress updated successfully!' });
        setProgressModal(null);
        await loadData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update progress.' });
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const toggleEmployeeSelection = (userId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const filteredPrograms = programs.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Training & Development Programs
            </h2>
            <Badge variant="info" size="sm">
              {isManager ? 'Manager Module' : 'Skill Portal'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isManager
              ? 'Design curriculum programs, assign team members, and monitor skill progression towards career milestones.'
              : 'View skill tracks assigned to you, monitor milestones, and complete training programs.'}
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => {
              setFeedback(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Training Program
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

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search programs by title or topic..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Program Cards */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading training programs...</div>
      ) : filteredPrograms.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          No training programs found.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPrograms.map((prog) => {
            const totalAssigned = prog.assignedEmployees?.length || 0;
            const avg =
              totalAssigned > 0
                ? Math.round(
                    prog.assignedEmployees.reduce((acc, curr) => acc + curr.progress, 0) /
                      totalAssigned
                  )
                : 0;

            return (
              <div
                key={prog._id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {prog.title}
                      </h3>
                      <Badge variant="primary" size="sm">
                        {prog.category}
                      </Badge>
                      <Badge
                        variant={prog.status === 'Active' ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {prog.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {prog.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Timeline: {prog.startDate} to {prog.endDate}</span>
                      <span>•</span>
                      <span>{totalAssigned} team member(s) enrolled</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center min-w-[120px] self-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Team Progress
                    </span>
                    <span className="text-2xl font-black text-blue-600">{avg}%</span>
                  </div>
                </div>

                {/* Team Members Progress List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Assigned Team Members & Progress Status
                  </h4>

                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                    {prog.assignedEmployees?.map((assignment, index) => {
                      const empUser =
                        typeof assignment.employeeId === 'object'
                          ? assignment.employeeId
                          : null;

                      const statusBadge = {
                        'Not Started': <Badge variant="neutral" size="sm">Not Started</Badge>,
                        'In Progress': <Badge variant="primary" size="sm">In Progress</Badge>,
                        'Completed': <Badge variant="success" size="sm">Completed</Badge>,
                      }[assignment.status];

                      return (
                        <div
                          key={index}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {empUser?.name || 'Assigned Member'}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                ({empUser?.position || empUser?.department || 'Staff'})
                              </span>
                              {statusBadge}
                            </div>
                            {assignment.notes && (
                              <p className="text-[11px] text-slate-500 italic">
                                Note: {assignment.notes}
                              </p>
                            )}

                            {/* Mini Progress Bar */}
                            <div className="flex items-center gap-2 pt-1 max-w-md">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    assignment.status === 'Completed'
                                      ? 'bg-emerald-600'
                                      : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${assignment.progress}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-slate-700 font-mono w-10 text-right">
                                {assignment.progress}%
                              </span>
                            </div>
                          </div>

                          {isManager && (
                            <button
                              onClick={() => openProgressModal(prog, assignment)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
                            >
                              <Sliders className="w-3.5 h-3.5 text-blue-600" /> Update Progress
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Program (Manager only) */}
      {isManager && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Team Training Program"
          subtitle="Establish a new training program and enroll direct reports"
          maxWidth="xl"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Program Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. System Scalability & Microservices Mastery"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Technical">Technical</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Soft Skills">Soft Skills</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target End Date *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Program Description & Objectives *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline program modules, learning targets, and expectations..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Select Team Members */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assign Team Members ({selectedEmployees.length} selected)
              </label>

              {teamMembers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No direct reports currently assigned to you.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                  {teamMembers.map((emp) => {
                    const u = typeof emp.userId === 'object' ? emp.userId : null;
                    if (!u) return null;
                    const isSelected = selectedEmployees.includes(u._id);

                    return (
                      <div
                        key={emp._id}
                        onClick={() => toggleEmployeeSelection(u._id)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div>{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{u.position}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-blue-600 pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Launching...' : 'Launch Training Program'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Update Team Member Progress */}
      {isManager && (
        <Modal
          isOpen={!!progressModal}
          onClose={() => setProgressModal(null)}
          title="Update Team Member Progress"
          subtitle={`Program: ${progressModal?.program?.title}`}
        >
          <form onSubmit={handleProgressSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Completion Progress (%)</label>
                <span className="text-xs font-bold font-mono text-blue-600">{editProgress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={editProgress}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setEditProgress(val);
                  if (val === 100) setEditStatus('Completed');
                  else if (val > 0) setEditStatus('In Progress');
                  else setEditStatus('Not Started');
                }}
                className="w-full cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Program Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manager Assessment & Notes
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notes on completed milestones, project presentations, etc."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProgressModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingProgress}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
              >
                {isUpdatingProgress ? 'Saving...' : 'Save Progress'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
