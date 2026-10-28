import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardRouter } from './pages/dashboard/DashboardRouter';
import { EmployeeListPage } from './pages/employees/EmployeeListPage';
import { MyProfilePage } from './pages/employees/MyProfilePage';
import { LeaveManagementPage } from './pages/leave/LeaveManagementPage';
import { TeamLeavePage } from './pages/leave/TeamLeavePage';
import { MyLeavesPage } from './pages/leave/MyLeavesPage';
import { HRAttendancePage } from './pages/attendance/HRAttendancePage';
import { MyAttendancePage } from './pages/attendance/MyAttendancePage';
import { AnnouncementsPage } from './pages/announcements/AnnouncementsPage';
import { TrainingManagementPage } from './pages/training/TrainingManagementPage';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-xl bg-blue-600 font-bold flex items-center justify-center text-xl animate-pulse mb-3">
          SS
        </div>
        <p className="text-sm font-semibold tracking-wide">Loading StaffSync HRMS...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Role-based Access Control Guard
  const renderCurrentPage = () => {
    switch (currentPath) {
      case 'dashboard':
        return <DashboardRouter onNavigate={setCurrentPath} />;

      // HR exclusive routes
      case 'employees':
        if (user.role !== 'hr') return <DashboardRouter onNavigate={setCurrentPath} />;
        return <EmployeeListPage />;

      case 'leave-approvals':
        if (user.role !== 'hr') return <DashboardRouter onNavigate={setCurrentPath} />;
        return <LeaveManagementPage />;

      case 'attendance-tracking':
        if (user.role !== 'hr') return <DashboardRouter onNavigate={setCurrentPath} />;
        return <HRAttendancePage />;

      // Manager exclusive routes
      case 'team-leaves':
        if (user.role !== 'manager') return <DashboardRouter onNavigate={setCurrentPath} />;
        return <TeamLeavePage />;

      case 'training-programs':
        if (user.role !== 'manager' && user.role !== 'employee') {
          return <DashboardRouter onNavigate={setCurrentPath} />;
        }
        return <TrainingManagementPage />;

      // Employee exclusive routes
      case 'my-profile':
        if (user.role !== 'employee') return <DashboardRouter onNavigate={setCurrentPath} />;
        return <MyProfilePage />;

      case 'my-leaves':
        if (user.role !== 'employee') return <DashboardRouter onNavigate={setCurrentPath} />;
        return <MyLeavesPage />;

      case 'my-attendance':
        if (user.role !== 'employee') return <DashboardRouter onNavigate={setCurrentPath} />;
        return <MyAttendancePage />;

      // Shared routes
      case 'announcements':
        return <AnnouncementsPage />;

      default:
        return <DashboardRouter onNavigate={setCurrentPath} />;
    }
  };

  const getPageTitle = () => {
    switch (currentPath) {
      case 'dashboard':
        return `${user.role === 'hr' ? 'HR' : user.role === 'manager' ? 'Manager' : 'Employee'} Dashboard`;
      case 'employees':
        return 'Employee Management';
      case 'leave-approvals':
        return 'Leave Approvals & Review';
      case 'attendance-tracking':
        return 'Company Attendance Tracking';
      case 'team-leaves':
        return 'Team Leave Oversight';
      case 'training-programs':
        return user.role === 'manager' ? 'Training & Development' : 'Assigned Training Programs';
      case 'my-profile':
        return 'My Personal Records';
      case 'my-leaves':
        return 'My Leave Applications';
      case 'my-attendance':
        return 'Daily Attendance Punch';
      case 'announcements':
        return 'Company Announcements';
      default:
        return 'StaffSync HRMS';
    }
  };

  return (
    <AppLayout
      currentPath={currentPath}
      onNavigate={setCurrentPath}
      title={getPageTitle()}
    >
      {renderCurrentPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
