import React, { useState, useEffect } from 'react';
import {
  Clock,
  CalendarCheck,
  Megaphone,
  GraduationCap,
  CheckCircle2,
  LogIn,
  LogOut,
  MapPin,
  Laptop,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LeaveRequest, Announcement, TrainingProgram, AttendanceRecord } from '../../types';

interface EmployeeDashboardProps {
  onNavigate: (path: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigate }) => {
  const { user, employee } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [myTraining, setMyTraining] = useState<TrainingProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Punch actions state
  const [workMode, setWorkMode] = useState<'On-site' | 'Remote'>('On-site');
  const [punchNotes, setPunchNotes] = useState('');
  const [isPunching, setIsPunching] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [todayRes, leavesRes, annRes, trainRes] = await Promise.all([
        api.getTodayAttendance(),
        api.getMyLeaves(),
        api.getAnnouncements(),
        api.getMyTraining(),
      ]);

      if (todayRes.success) setTodayAttendance(todayRes.record || null);
      if (leavesRes.success) setMyLeaves(leavesRes.leaves || []);
      if (annRes.success) setAnnouncements(annRes.announcements || []);
      if (trainRes.success) setMyTraining(trainRes.programs || []);
    } catch (err) {
      console.error('Error loading employee dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async () => {
    setIsPunching(true);
    setPunchFeedback(null);
    try {
      const res = await api.checkIn(workMode, punchNotes);
      if (res.success) {
        setTodayAttendance(res.record);
        setPunchFeedback('Checked in successfully!');
        setPunchNotes('');
      }
    } catch (err: any) {
      setPunchFeedback(err.message || 'Check-in failed.');
    } finally {
      setIsPunching(false);
    }
  };

  const handleCheckOut = async () => {
    setIsPunching(true);
    setPunchFeedback(null);
    try {
      const res = await api.checkOut();
      if (res.success) {
        setTodayAttendance(res.record);
        setPunchFeedback('Checked out successfully!');
      }
    } catch (err: any) {
      setPunchFeedback(err.message || 'Check-out failed.');
    } finally {
      setIsPunching(false);
    }
  };

  const pendingLeaves = myLeaves.filter((l) => l.status === 'pending');
  const approvedLeaves = myLeaves.filter((l) => l.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Badge variant="primary" size="sm">
            Employee Workspace
          </Badge>
          <h2 className="text-2xl font-bold mt-2 tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            {user?.position} • {user?.department} • ID: {employee?.employeeId || 'EMP-Active'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('my-leaves')}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Apply for Leave
          </button>
          <button
            onClick={() => onNavigate('my-profile')}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            My Profile
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Today"
          value={
            todayAttendance?.checkOut
              ? 'Checked Out'
              : todayAttendance?.checkIn
              ? 'Checked In'
              : 'Not Marked'
          }
          subtitle={
            todayAttendance?.checkIn
              ? `In at ${new Date(todayAttendance.checkIn).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
              : 'Punch required today'
          }
          icon={Clock}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          action={{ label: 'Attendance History', onClick: () => onNavigate('my-attendance') }}
        />
        <StatCard
          title="Active Leave Requests"
          value={pendingLeaves.length}
          subtitle={`${approvedLeaves.length} approved this year`}
          icon={CalendarCheck}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          action={{ label: 'View Requests', onClick: () => onNavigate('my-leaves') }}
        />
        <StatCard
          title="Assigned Training"
          value={myTraining.length}
          subtitle="Skill development courses"
          icon={GraduationCap}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Company News"
          value={announcements.length}
          subtitle="Latest organizational notices"
          icon={Megaphone}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          action={{ label: 'Read All', onClick: () => onNavigate('announcements') }}
        />
      </div>

      {/* Main Grid: Attendance Punch Card & Latest Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Punch Box */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Daily Attendance Punch
              </h3>
              <p className="text-[11px] text-slate-500">Record your working hours for today</p>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {punchFeedback && (
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{punchFeedback}</span>
            </div>
          )}

          {/* Today's Punch Status Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Today's Record
            </span>

            {todayAttendance ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant={todayAttendance.checkOut ? 'neutral' : 'success'} size="md">
                    {todayAttendance.checkOut ? 'Shift Completed' : 'Currently Active'}
                  </Badge>
                  <Badge variant="info" size="sm">
                    {todayAttendance.workMode}
                  </Badge>
                </div>
                <div className="text-xs text-slate-600 pt-1">
                  <strong>Punch In:</strong>{' '}
                  {new Date(todayAttendance.checkIn).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {todayAttendance.checkOut && (
                    <>
                      {' • '}
                      <strong>Punch Out:</strong>{' '}
                      {new Date(todayAttendance.checkOut).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Duration: {Math.floor((todayAttendance.workDurationMinutes || 0) / 60)}h{' '}
                        {(todayAttendance.workDurationMinutes || 0) % 60}m
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-1">
                You have not checked in yet today.
              </div>
            )}
          </div>

          {/* Actions */}
          {!todayAttendance ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Work Location Mode:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkMode('On-site')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      workMode === 'On-site'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" /> On-site
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkMode('Remote')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      workMode === 'Remote'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" /> Remote
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Optional note (e.g. morning standup)"
                  value={punchNotes}
                  onChange={(e) => setPunchNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleCheckIn}
                disabled={isPunching}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {isPunching ? 'Recording Punch...' : 'Punch In Now'}
              </button>
            </div>
          ) : !todayAttendance.checkOut ? (
            <div className="pt-2">
              <button
                onClick={handleCheckOut}
                disabled={isPunching}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {isPunching ? 'Recording Punch...' : 'Punch Out (End of Day)'}
              </button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg text-center font-medium">
              Daily attendance recorded. Have a wonderful rest of your day!
            </div>
          )}
        </div>

        {/* Right Section: Latest Announcements & Training */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcements Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-purple-600" />
                  Latest Company Announcements
                </h3>
                <p className="text-xs text-slate-500">Official company updates from HR</p>
              </div>
              <button
                onClick={() => onNavigate('announcements')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Feed <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No announcements yet.</div>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.isPinned && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                            PINNED
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      </div>
                      <Badge variant="primary" size="sm">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>
                    <div className="text-[10px] text-slate-400">
                      Published {new Date(item.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Training Programs for Employee */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  My Professional Development Programs ({myTraining.length})
                </h3>
                <p className="text-xs text-slate-500">Tracks assigned by your team manager</p>
              </div>
            </div>

            {isLoading ? (
              <div className="py-4 text-center text-xs text-slate-400">Loading training...</div>
            ) : myTraining.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No active training programs currently assigned.
              </div>
            ) : (
              <div className="space-y-3">
                {myTraining.map((prog) => {
                  const assignment = prog.assignedEmployees?.find(
                    (a: any) =>
                      (a.employeeId?._id || a.employeeId)?.toString() === user?._id.toString()
                  );
                  const progress = assignment?.progress || 0;
                  const status = assignment?.status || 'Not Started';

                  return (
                    <div
                      key={prog._id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{prog.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {prog.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            status === 'Completed'
                              ? 'success'
                              : status === 'In Progress'
                              ? 'primary'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {status}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                          <span>My Completion</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
