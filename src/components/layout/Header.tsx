import React from 'react';
import { Menu, LogOut, ShieldCheck, User as UserIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, title }) => {
  const { user, logout, switchRoleDemo, isLoading } = useAuth();

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as UserRole;
    if (selected && selected !== user?.role) {
      await switchRoleDemo(selected);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left title & mobile menu toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right controls: Quick Switcher + User Profile + Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Role Switcher for instant evaluation of all 3 roles */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100/90 py-1 px-2.5 rounded-lg border border-slate-200 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-600 font-medium">Switch Role:</span>
          <select
            value={user?.role || 'employee'}
            onChange={handleRoleChange}
            disabled={isLoading}
            className="bg-white border border-slate-300 text-slate-800 text-xs rounded font-medium px-2 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="hr">HR Personnel</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        {/* User badge */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs">
            {user?.name?.charAt(0) || <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left text-xs leading-tight">
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="text-slate-500 text-[11px]">{user?.department}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          title="Sign out of StaffSync"
          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
