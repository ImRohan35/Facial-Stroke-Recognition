import React, { useState, useEffect } from 'react';
import {
  Sun, Moon, User, Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const TopHeader = ({ currentTab, setTab }) => {
  const { user } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

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
    'settings': 'Account & Application Settings'
  };

  return (
    <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {pageTitles[currentTab] || 'Stroke Recognition AI'}
        </h1>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900">
          Clinical Screening Platform
        </span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-3">
        {/* Language Toggle (EN / हिंदी) */}
        <button
          onClick={toggleLanguage}
          title={language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-sky-600" />
          <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Light / Dark mode"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Pill */}
        <button
          onClick={() => setTab('profile')}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-500 to-teal-500 text-white flex items-center justify-center text-[10px] font-bold">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="max-w-[120px] truncate">{user?.full_name || 'My Profile'}</span>
        </button>
      </div>
    </header>
  );
};
