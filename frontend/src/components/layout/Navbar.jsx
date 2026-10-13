import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, Sun, Moon, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Navbar = ({ setTab, currentTab }) => {
  const { user, logoutUser } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div 
          onClick={() => setTab('landing')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">Stroke Recognition</span>
              <span className="text-xs px-2 py-0.5 font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t('brandTagline')}</p>
          </div>
        </div>

        {/* Public Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setTab('landing')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'landing' ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t('home')}
          </button>
          <button
            onClick={() => setTab('about')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'about' ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t('about')}
          </button>
          <button
            onClick={() => setTab('how-it-works')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'how-it-works' ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t('howItWorks')}
          </button>
        </nav>

        {/* Action Buttons, Language & Theme */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            title={language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Light / Dark mode"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTab('dashboard')}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>{t('openDashboard')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { logoutUser(); setTab('landing'); }}
                className="px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {t('signOut')}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTab('login')}
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t('signIn')}
              </button>
              <button
                onClick={() => setTab('register')}
                className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t('register')}
              </button>
              <button
                onClick={() => setTab('screening')}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white shadow-sm shadow-sky-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>{t('startAnalysis')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
