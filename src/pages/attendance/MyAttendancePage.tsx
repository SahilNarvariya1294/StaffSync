import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, CheckCircle2, MapPin, Laptop, Calendar, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';
import { AttendanceRecord } from '../../types';

export const MyAttendancePage: React.FC = () => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [workMode, setWorkMode] = useState<'On-site' | 'Remote'>('On-site');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPunching, setIsPunching] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live digital clock
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.getTodayAttendance(),
        api.getMyAttendance(),
      ]);

      if (todayRes.success) {
        setTodayRecord(todayRes.record || null);
      }
      if (historyRes.success) {
        setHistory(historyRes.records || []);
      }
    } catch (err: any) {
      console.error('Failed to load my attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handlePunchIn = async () => {
    setIsPunching(true);
    setMessage(null);
    try {
      const res = await api.checkIn(workMode, notes);
      if (res.success) {
        setMessage({ type: 'success', text: 'Checked in successfully! Shift started.' });
        setNotes('');
        await loadAttendance();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Check-in failed.' });
    } finally {
      setIsPunching(false);
    }
  };

  const handlePunchOut = async () => {
    setIsPunching(true);
    setMessage(null);
    try {
      const res = await api.checkOut();
      if (res.success) {
        setMessage({ type: 'success', text: 'Checked out successfully! Shift completed.' });
        await loadAttendance();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Check-out failed.' });
    } finally {
      setIsPunching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Mark Attendance</h2>
          <Badge variant="primary" size="sm">
            Employee Portal
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Punch your daily start and end working hours and review your verified attendance history.
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Live Punch Card Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Real-Time Attendance Clock
          </span>
          <div className="text-4xl font-black font-mono text-slate-900 tracking-tight">
            {currentTime}
          </div>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Punch Controls */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          {!todayRecord ? (
            <div className="w-full space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWorkMode('On-site')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
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
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    workMode === 'Remote'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" /> Remote
                </button>
              </div>

              <input
                type="text"
                placeholder="Optional daily check-in note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />

              <button
                onClick={handlePunchIn}
                disabled={isPunching}
                className="w-full py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {isPunching ? 'Processing...' : 'Punch In Now'}
              </button>
            </div>
          ) : !todayRecord.checkOut ? (
            <div className="w-full space-y-2 text-center md:text-right">
              <div className="text-xs text-slate-600">
                Shift active since{' '}
                <strong className="text-emerald-700">
                  {new Date(todayRecord.checkIn).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>{' '}
                ({todayRecord.workMode})
              </div>
              <button
                onClick={handlePunchOut}
                disabled={isPunching}
                className="w-full md:w-auto py-2.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {isPunching ? 'Processing...' : 'Punch Out (End Shift)'}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <div className="text-xs font-bold text-emerald-800">Today's Shift Completed</div>
              <div className="text-[11px] text-emerald-700 mt-1">
                Duration: {Math.floor((todayRecord.workDurationMinutes || 0) / 60)}h{' '}
                {(todayRecord.workDurationMinutes || 0) % 60}m
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Personal Attendance History Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            My Attendance History ({history.length} days logged)
          </h3>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading your history...</div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No attendance logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Punch In</th>
                  <th className="py-3 px-4">Punch Out</th>
                  <th className="py-3 px-4">Work Duration</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => {
                  const inTime = new Date(record.checkIn).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const outTime = record.checkOut
                    ? new Date(record.checkOut).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  const hours = Math.floor((record.workDurationMinutes || 0) / 60);
                  const mins = (record.workDurationMinutes || 0) % 60;

                  return (
                    <tr key={record._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{record.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{inTime}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{outTime}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {record.checkOut ? `${hours}h ${mins}m` : 'In Progress'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={record.workMode === 'On-site' ? 'info' : 'primary'}
                          size="sm"
                        >
                          {record.workMode}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success" size="sm">
                          Present
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic truncate max-w-xs">
                        {record.notes || '—'}
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
