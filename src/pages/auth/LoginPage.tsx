import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, Lock, Mail, Users, CheckCircle } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('hr@staffsync.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoRole: UserRole) => {
    const creds: Record<UserRole, { email: string; pass: string }> = {
      hr: { email: 'hr@staffsync.com', pass: 'password123' },
      manager: { email: 'manager@staffsync.com', pass: 'password123' },
      employee: { email: 'employee@staffsync.com', pass: 'password123' },
    };
    const c = creds[demoRole];
    setEmail(c.email);
    setPassword(c.pass);
    setError(null);
    setIsSubmitting(true);
    try {
      await login(c.email, c.pass);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-xl shadow-blue-500/20 mb-4">
          SS
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">StaffSync HRMS</h2>
        <p className="mt-1 text-sm text-slate-400">
          Modern Human Resource Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@staffsync.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs font-medium text-slate-400 mb-2.5 text-center">
              Quick Sign-In by Role:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('hr')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-purple-800/40 hover:border-purple-600 transition-colors cursor-pointer text-center"
              >
                <span className="text-[11px] font-semibold text-purple-300">HR Personnel</span>
                <span className="text-[9px] text-slate-400">Sarah Jenkins</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('manager')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-indigo-800/40 hover:border-indigo-600 transition-colors cursor-pointer text-center"
              >
                <span className="text-[11px] font-semibold text-indigo-300">Manager</span>
                <span className="text-[9px] text-slate-400">David Miller</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('employee')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-emerald-800/40 hover:border-emerald-600 transition-colors cursor-pointer text-center"
              >
                <span className="text-[11px] font-semibold text-emerald-300">Employee</span>
                <span className="text-[9px] text-slate-400">Alex Rivera</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature summary note */}
        <div className="mt-6 text-center text-xs text-slate-500">
          MERN Stack • Role-Based Access Control • MongoDB Data Models
        </div>
      </div>
    </div>
  );
};
