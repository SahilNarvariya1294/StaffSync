import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  Megaphone,
  GraduationCap,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpen,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const role = user?.role || 'employee';

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['hr', 'manager', 'employee'],
    },
    // HR Personnel exclusive module
    {
      id: 'employees',
      label: 'Employee Management',
      icon: Users,
      roles: ['hr'],
    },
    // HR Leave Approval module
    {
      id: 'leave-approvals',
      label: 'Leave Approvals',
      icon: CalendarCheck,
      roles: ['hr'],
    },
    // HR Attendance Tracking module
    {
      id: 'attendance-tracking',
      label: 'Attendance Tracking',
      icon: Clock,
      roles: ['hr'],
    },
    // Manager exclusive modules
    {
      id: 'team-leaves',
      label: 'Team Leave Requests',
      icon: CalendarCheck,
      roles: ['manager'],
    },
    {
      id: 'training-programs',
      label: 'Training & Development',
      icon: GraduationCap,
      roles: ['manager'],
    },
    // Employee exclusive modules
    {
      id: 'my-profile',
      label: 'Personal Records',
      icon: UserCheck,
      roles: ['employee'],
    },
    {
      id: 'my-leaves',
      label: 'Leave Applications',
      icon: CalendarCheck,
      roles: ['employee'],
    },
    {
      id: 'my-attendance',
      label: 'Mark Attendance',
      icon: Clock,
      roles: ['employee'],
    },
    // Company Announcements: HR publishes, Employees/Managers view
    {
      id: 'announcements',
      label: role === 'hr' ? 'Announcements & News' : 'Company Announcements',
      icon: Megaphone,
      roles: ['hr', 'manager', 'employee'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              SS
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                StaffSync
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  HRMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Human Resources</p>
            </div>
          </div>
        </div>

        {/* Current Role Banner */}
        <div className="px-4 py-3 mx-4 mt-4 rounded-lg bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Role:</span>
            <span
              className={`font-semibold capitalize px-2 py-0.5 rounded text-[11px] ${
                role === 'hr'
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-700/60'
                  : role === 'manager'
                  ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/60'
                  : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
              }`}
            >
              {role === 'hr' ? 'HR Personnel' : role}
            </span>
          </div>
          <div className="text-xs font-medium text-slate-200 mt-1 truncate">{user?.name}</div>
          <div className="text-[11px] text-slate-400 truncate">{user?.position}</div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {role === 'hr'
              ? 'HR Operations'
              : role === 'manager'
              ? 'Team Leadership'
              : 'Employee Self-Service'}
          </div>

          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>MERN StaffSync v2.4</span>
          </div>
          <span className="text-slate-400">Strict RBAC</span>
        </div>
      </aside>
    </>
  );
};
