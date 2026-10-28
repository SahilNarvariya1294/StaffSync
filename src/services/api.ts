const TOKEN_KEY = 'staffsync_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<any>('/api/auth/me'),
  updateMyProfile: (profile: any) =>
    request<any>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  // Employee Management (HR)
  getEmployees: () => request<any>('/api/employees'),
  createEmployee: (data: any) =>
    request<any>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEmployee: (userId: string, data: any) =>
    request<any>(`/api/employees/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getManagers: () => request<any>('/api/employees/meta/managers'),

  // Leave Management
  applyLeave: (leaveData: any) =>
    request<any>('/api/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    }),
  getMyLeaves: () => request<any>('/api/leaves/my'),
  getAllLeaves: () => request<any>('/api/leaves/all'),
  getTeamLeaves: () => request<any>('/api/leaves/team'),
  reviewLeave: (leaveId: string, status: 'approved' | 'rejected', remarks?: string) =>
    request<any>(`/api/leaves/${leaveId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    }),

  // Attendance Management
  getTodayAttendance: () => request<any>('/api/attendance/today'),
  checkIn: (workMode: 'On-site' | 'Remote', notes?: string) =>
    request<any>('/api/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ workMode, notes }),
    }),
  checkOut: () =>
    request<any>('/api/attendance/check-out', {
      method: 'POST',
    }),
  getMyAttendance: () => request<any>('/api/attendance/my'),
  getAllAttendance: (date?: string) =>
    request<any>(`/api/attendance/all${date ? `?date=${encodeURIComponent(date)}` : ''}`),

  // Announcements
  getAnnouncements: () => request<any>('/api/announcements'),
  createAnnouncement: (data: any) =>
    request<any>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAnnouncement: (id: string, data: any) =>
    request<any>(`/api/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAnnouncement: (id: string) =>
    request<any>(`/api/announcements/${id}`, {
      method: 'DELETE',
    }),

  // Training & Development
  getMyTraining: () => request<any>('/api/training/my'),
  getManagedTraining: () => request<any>('/api/training/managed'),
  getTeamMembers: () => request<any>('/api/training/team-members'),
  createTraining: (data: any) =>
    request<any>('/api/training', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTraining: (id: string, data: any) =>
    request<any>(`/api/training/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateEmployeeTrainingProgress: (programId: string, data: any) =>
    request<any>(`/api/training/${programId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
