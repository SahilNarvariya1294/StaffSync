import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Search, MapPin, Laptop, Filter, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';
import { AttendanceRecord } from '../../types';

export const HRAttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [metrics, setMetrics] = useState({ totalPresent: 0, onSiteCount: 0, remoteCount: 0 });
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadAttendance = async (date?: string) => {
    setIsLoading(true);
    try {
      const res = await api.getAllAttendance(date);
      if (res.success) {
        setRecords(res.records || []);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Failed to load attendance records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate]);

  const filteredRecords = records.filter((r) => {
    const emp = typeof r.employeeId === 'object' ? r.employeeId : null;
    const matchesSearch =
      emp?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp?.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Tracking</h2>
            <Badge variant="primary" size="sm">
              HR Module
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track daily employee attendance punches, work locations (On-site vs. Remote), and shift durations.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-700">Audit Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-medium text-slate-900 focus:outline-hidden cursor-pointer"
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Checked In</span>
            <span className="text-2xl font-black text-slate-900">{filteredRecords.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">On-Site Office</span>
            <span className="text-2xl font-black text-slate-900">
              {filteredRecords.filter((r) => r.workMode === 'On-site').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Remote Workers</span>
            <span className="text-2xl font-black text-slate-900">
              {filteredRecords.filter((r) => r.workMode === 'Remote').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Laptop className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee by name or department..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          Reset to Today
        </button>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading attendance log...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No attendance records found for {selectedDate}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Punch In</th>
                  <th className="py-3 px-4">Punch Out</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Punch Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => {
                  const emp = typeof record.employeeId === 'object' ? record.employeeId : null;
                  const inTime = new Date(record.checkIn).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const outTime = record.checkOut
                    ? new Date(record.checkOut).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : null;

                  const hours = Math.floor((record.workDurationMinutes || 0) / 60);
                  const mins = (record.workDurationMinutes || 0) % 60;

                  return (
                    <tr key={record._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp?.name || 'Employee'}</div>
                        <div className="text-[11px] text-slate-400">
                          {emp?.position} • {emp?.department}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">{record.date}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {inTime}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {outTime ? (
                          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {outTime}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Active Shift
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
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
                      <td className="py-3 px-4 max-w-xs text-slate-500 italic truncate">
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
