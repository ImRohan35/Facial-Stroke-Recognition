import React, { useState, useEffect } from 'react';
import {
  Bell, Search, Sun, Moon, Shield, Stethoscope, User,
  ChevronDown, ExternalLink, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TopHeader = ({ currentTab, setTab }) => {
  const { user, switchDemoRole } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }

    const handleStorage = () => {
      const darkActive = document.documentElement.classList.contains('dark');
      setDarkMode(darkActive);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const pageTitles = {
    'landing': 'Home',
    'about': 'About Project & Provenance',
    'how-it-works': 'How It Works Pipeline',
    'login': 'Sign In',
    'register': 'Registration',
    'dashboard': 'Patient Dashboard',
    'risk': 'Cardiovascular & Stroke Risk Profiler (AHA Guidelines)',
    'screening': 'AI Facial Screening Hub',
    'upload': 'Facial Image Upload',
    'camera': 'Real-Time Camera Capture',
    'video': 'Facial Landmark Sequence Analysis (Video)',
    'result': 'AI Facial Analysis Result',
    'explainable-ai': 'Explainable AI & Feature Contributions',
    'asymmetry': 'Facial Asymmetry Anatomical Breakdown',
    'baseline': 'Personal Physiological Baseline',
    'history': 'Screening Assessment History',
    'comparison': 'Assessment & Baseline Comparison',
    'monitoring': 'Longitudinal Symmetry Monitoring',
    'reports': 'Clinical Summary Reports',
    'profile': 'Patient Profile',
    'settings': 'Account & Application Settings',
    'doctor': 'Doctor Portal Dashboard',
    'doctor-patients': 'Authorized Patient Roster',
    'doctor-patient-profile': 'Clinical Patient File',
    'doctor-patient-history': 'Patient Longitudinal Assessments',
    'doctor-facial-analysis': 'Clinical Facial Analysis & Landmarks',
    'doctor-comparison': 'Patient Comparative Analysis',
    'doctor-reports': 'Clinical Report Review',
    'admin': 'Admin System Dashboard',
    'admin-users': 'User Management',
    'admin-doctors': 'Doctor Management',
    'admin-models': 'Machine Learning Benchmark & Model Management',
    'admin-logs': 'System Security & Audit Logs'
  };

  return (
    <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {pageTitles[currentTab] || 'Stroke Recognition AI'}
        </h1>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900">
          Research Screening Modality
        </span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-3">
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Light / Dark mode"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Demo Switcher Quick Pill */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Role: {user?.role || 'PATIENT'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Demo Persona
              </div>
              <button
                onClick={() => { switchDemoRole('PATIENT'); setTab('dashboard'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950 flex items-center space-x-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>Patient (Sarah Jenkins)</span>
              </button>
              <button
                onClick={() => { switchDemoRole('DOCTOR'); setTab('doctor'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950 flex items-center space-x-2 cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>Doctor (Dr. Marcus Vance)</span>
              </button>
              <button
                onClick={() => { switchDemoRole('ADMIN'); setTab('admin'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950 flex items-center space-x-2 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin (System Admin)</span>
              </button>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            {user?.full_name ? user.full_name[0] : 'S'}
          </div>
        </div>
      </div>
    </header>
  );
};
