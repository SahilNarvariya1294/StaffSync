import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Phone,
  MapPin,
  HeartHandshake,
  CheckCircle,
  Briefcase,
  Calendar,
  Building,
  Save,
  Tag,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const MyProfilePage: React.FC = () => {
  const { user, employee, refreshProfile } = useAuth();
  const [phone, setPhone] = useState(employee?.phone || '');
  const [address, setAddress] = useState(employee?.address || '');
  const [emergencyName, setEmergencyName] = useState(employee?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(employee?.emergencyContact?.phone || '');
  const [emergencyRel, setEmergencyRel] = useState(employee?.emergencyContact?.relationship || '');
  const [skillsText, setSkillsText] = useState(employee?.skills?.join(', ') || '');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (employee) {
      setPhone(employee.phone || '');
      setAddress(employee.address || '');
      setEmergencyName(employee.emergencyContact?.name || '');
      setEmergencyPhone(employee.emergencyContact?.phone || '');
      setEmergencyRel(employee.emergencyContact?.relationship || '');
      setSkillsText(employee.skills?.join(', ') || '');
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const skillsArray = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.updateMyProfile({
        phone,
        address,
        skills: skillsArray,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRel,
        },
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Personal records updated successfully!' });
        await refreshProfile();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update personal records.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Personal Records</h2>
          <Badge variant="primary" size="sm">
            Self-Service
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Review your official employee profile and update your contact info, residential address, emergency contacts, and professional skills.
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
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Official Employment Details (Read-only verified records) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-600" />
          Official Employment Records (HR Verified)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Legal Name</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{user?.name}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee ID</span>
            <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
              {employee?.employeeId || 'EMP-1003'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Work Email</span>
            <span className="font-medium text-slate-800 mt-0.5 block truncate">{user?.email}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
            <span className="font-medium text-slate-800 mt-0.5 block">{user?.department}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Position / Title</span>
            <span className="font-medium text-slate-800 mt-0.5 block">{user?.position}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporting Manager</span>
            <span className="font-medium text-slate-800 mt-0.5 block">
              {employee?.managerId?.name || 'David Miller (Engineering Lead)'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Joining</span>
            <span className="font-medium text-slate-800 mt-0.5 block">
              {employee?.dateOfJoining || '2023-01-10'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Work Location</span>
            <span className="font-medium text-slate-800 mt-0.5 block">
              {employee?.workLocation || 'Hybrid'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Status</span>
            <div className="mt-1">
              <Badge variant="success" size="sm">
                Active Employee
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Personal Records Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-600" />
            Maintain Personal Contact & Emergency Information
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Keep your personal contact details and emergency contacts current.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Primary Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Residential Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 45 Silicon Way, Austin, TX"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            Emergency Contact Information
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Contact Full Name
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g. Elena Rivera"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+1 (555) 776-5544"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={emergencyRel}
                onChange={(e) => setEmergencyRel(e.target.value)}
                placeholder="e.g. Sister, Spouse"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Professional & Technical Skills (comma separated)
          </label>
          <input
            type="text"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="React, TypeScript, Node.js, System Design"
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skillsText
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-medium"
                >
                  {skill}
                </span>
              ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Updating Records...' : 'Save Personal Records'}
          </button>
        </div>
      </form>
    </div>
  );
};
