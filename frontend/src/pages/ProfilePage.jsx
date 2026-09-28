import React, { useState } from 'react';
import {
  User, Mail, Phone, Calendar, Shield, Stethoscope,
  Compass, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage = ({ setTab }) => {
  const { user } = useAuth();
  const [phone, setPhone] = useState('+1 (555) 234-8901');
  const [gender, setGender] = useState('Female');
  const [dob, setDob] = useState('1964-09-15');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
          Patient Account
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          My Clinical Profile
        </h1>
        <p className="text-xs text-slate-500">
          Manage your personal details, baseline reference status, and authorized physician linkages.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white text-2xl font-black flex items-center justify-center mx-auto shadow-md shadow-sky-500/20">
            {user?.full_name ? user.full_name[0] : 'S'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{user?.full_name || 'Sarah Jenkins'}</h3>
            <p className="text-xs text-slate-400">{user?.email || 'patient@strokecare.ai'}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              Role: Patient (Screening Cohort)
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Personal Baseline:</span>
              <span className="font-semibold text-emerald-600">Active ✓</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Authorized Doctor:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Dr. Marcus Vance, MD</span>
            </div>
          </div>
        </div>

        {/* Edit Details Form */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Demographic & Contact Details</h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.full_name || 'Sarah Jenkins'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  disabled
                  defaultValue={user?.email || 'patient@strokecare.ai'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
