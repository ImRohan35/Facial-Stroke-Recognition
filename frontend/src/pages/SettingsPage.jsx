import React, { useState, useEffect } from 'react';
import {
  Settings, Sun, Moon, Shield, Bell, Lock,
  Trash2, CheckCircle2, AlertCircle, Clock, Calendar, Database, ShieldCheck
} from 'lucide-react';
import axios from 'axios';

export const SettingsPage = ({ setTab }) => {
  const [darkMode, setDarkMode] = useState(false);
  
  // Reminders state (Section 22)
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState('WEEKLY');
  const [reminderTime, setReminderTime] = useState('09:00');

  // Privacy & Consent state (Section 21)
  const [dataSharingConsent, setDataSharingConsent] = useState(false);
  const [researchConsent, setResearchConsent] = useState(false);
  const [storedCount, setStoredCount] = useState(0);

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [remRes, privRes] = await Promise.all([
        axios.get('/api/v1/screening/reminders'),
        axios.get('/api/v1/screening/privacy')
      ]);

      if (remRes.data) {
        setReminderEnabled(remRes.data.reminder_enabled || false);
        setReminderFrequency(remRes.data.reminder_frequency || 'WEEKLY');
        setReminderTime(remRes.data.reminder_time || '09:00');
      }

      if (privRes.data) {
        setDataSharingConsent(privRes.data.data_sharing_consent || false);
        setResearchConsent(privRes.data.research_consent || false);
        setStoredCount(privRes.data.total_stored_assessments || 0);
      }
    } catch (err) {
      console.warn("Could not load backend settings:", err);
    }
  };

  const handleToggleTheme = (isDark) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    }
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Promise.all([
        axios.post('/api/v1/screening/reminders', {
          reminder_enabled: reminderEnabled,
          reminder_frequency: reminderFrequency,
          reminder_time: reminderTime
        }),
        axios.post('/api/v1/screening/privacy/consent', {
          data_sharing_consent: dataSharingConsent,
          research_consent: researchConsent
        })
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
          Application Preferences & Privacy
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Settings & Privacy Center
        </h1>
        <p className="text-xs text-slate-500">
          Manage assessment reminders, private image governance, data sharing consent, and user appearance.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All preferences saved successfully to database.</span>
        </div>
      )}

      {/* Assessment Reminders (Section 22) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Scheduled Assessment Reminders</h3>
              <p className="text-xs text-slate-500">Optional reminders for consistent personal baseline tracking</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        {reminderEnabled && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>Reminder Frequency</span>
              </label>
              <select
                value={reminderFrequency}
                onChange={(e) => setReminderFrequency(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              >
                <option value="DAILY">Daily Morning Check</option>
                <option value="WEEKLY">Weekly Check-in (Recommended)</option>
                <option value="BIWEEKLY">Bi-Weekly Assessment</option>
                <option value="MONTHLY">Monthly Overview</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>Preferred Time</span>
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Privacy Center & Image Governance (Section 21 & 32) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Privacy Center & Data Governance</h3>
            <p className="text-xs text-slate-500">Strict patient data isolation and model training ethics</p>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
          <strong>Non-Ingestion Guarantee:</strong> User-uploaded facial photos and live camera captures are strictly confidential. They are <strong>NEVER</strong> automatically added to machine learning training sets or shared publicly.
        </div>

        <div className="space-y-3 pt-2 text-xs">
          <label className="flex items-start space-x-3 text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={dataSharingConsent}
              onChange={(e) => setDataSharingConsent(e.target.checked)}
              className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
            />
            <div>
              <span className="font-semibold block">Authorized Doctor Sharing</span>
              <span className="text-slate-400 text-[11px]">
                Allow verified assigned healthcare provider to review my assessment reports and facial asymmetry progression.
              </span>
            </div>
          </label>

          <label className="flex items-start space-x-3 text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={researchConsent}
              onChange={(e) => setResearchConsent(e.target.checked)}
              className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
            />
            <div>
              <span className="font-semibold block">De-Identified Academic Research Consent (Optional)</span>
              <span className="text-slate-400 text-[11px]">
                Allow anonymous numerical symmetry statistics (no images or names) to contribute to open facial asymmetry research.
              </span>
            </div>
          </label>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Total Stored Patient Assessments: <strong className="text-slate-800 dark:text-white">{storedCount} records</strong></span>
          <button
            type="button"
            onClick={() => setTab('history')}
            className="text-sky-600 hover:text-sky-700 font-bold"
          >
            Manage / Purge Records →
          </button>
        </div>
      </div>

      {/* Theme Customization (Dark / Light Mode) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Display Theme</h3>
        <p className="text-xs text-slate-500">Select preferred visual presentation theme for the healthcare interface.</p>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          <button
            type="button"
            onClick={() => handleToggleTheme(false)}
            className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
              !darkMode
                ? 'border-sky-500 bg-sky-50/50 shadow-xs font-bold text-sky-900'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sun className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <span className="text-xs block">Light Theme</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleTheme(true)}
            className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
              darkMode
                ? 'border-sky-500 bg-sky-950/50 shadow-xs font-bold text-sky-200'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className="w-6 h-6 mx-auto mb-2 text-sky-400" />
            <span className="text-xs block">Dark Theme</span>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveAll}
          disabled={loading}
          className="px-7 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Saving Preferences...' : 'Save All Preferences'}
        </button>
      </div>
    </div>
  );
};
