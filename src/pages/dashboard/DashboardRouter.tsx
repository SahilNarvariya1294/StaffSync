import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { HRDashboard } from './HRDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { EmployeeDashboard } from './EmployeeDashboard';

interface DashboardRouterProps {
  onNavigate: (path: string) => void;
}

export const DashboardRouter: React.FC<DashboardRouterProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'hr':
      return <HRDashboard onNavigate={onNavigate} />;
    case 'manager':
      return <ManagerDashboard onNavigate={onNavigate} />;
    case 'employee':
    default:
      return <EmployeeDashboard onNavigate={onNavigate} />;
  }
};
