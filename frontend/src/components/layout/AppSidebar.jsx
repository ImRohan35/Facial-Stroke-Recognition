import React from 'react';
import {
  LayoutDashboard, Camera, Upload, Video, FileCheck, BrainCircuit,
  Eye, Compass, History, GitCompare, LineChart, FileText,
  User, Settings, Brain, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const AppSidebar = ({ currentTab, setTab }) => {
  const { user, logoutUser } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    { section: t('overview') || 'Overview' },
    { id: 'dashboard', label: t('dashboard') || 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { section: t('aiFacialScreening') || 'AI Facial Screening' },
    { id: 'screening', label: t('screeningHub') || 'Screening Hub', icon: <Camera className="w-4 h-4" /> },
    { id: 'upload', label: t('imageUpload') || 'Image Upload', icon: <Upload className="w-4 h-4" /> },
    { id: 'camera', label: t('cameraCapture') || 'Camera Capture', icon: <Camera className="w-4 h-4" /> },
    { id: 'video', label: t('videoAnalysis') || 'Video Analysis', icon: <Video className="w-4 h-4" /> },
    { section: t('resultsAndXai') || 'Results & Explainability' },
    { id: 'result', label: t('analysisResult') || 'Analysis Result', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'explainable-ai', label: t('explainableAi') || 'Explainable AI', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'asymmetry', label: t('facialAsymmetry') || 'Facial Asymmetry', icon: <Eye className="w-4 h-4" /> },
    { section: t('personalTracking') || 'Personal Tracking' },
    { id: 'baseline', label: t('personalBaseline') || 'Personal Baseline', icon: <Compass className="w-4 h-4" /> },
    { id: 'history', label: t('assessmentHistory') || 'Assessment History', icon: <History className="w-4 h-4" /> },
    { id: 'comparison', label: t('comparison') || 'Comparison', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'monitoring', label: t('monitoringTrends') || 'Monitoring Trends', icon: <LineChart className="w-4 h-4" /> },
    { id: 'reports', label: t('clinicalReports') || 'Clinical Reports', icon: <FileText className="w-4 h-4" /> },
    { section: t('account') || 'Account' },
    { id: 'profile', label: t('myProfile') || 'My Profile', icon: <User className="w-4 h-4" /> },
    { id: 'settings', label: t('settings') || 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div
          onClick={() => setTab('landing')}
          className="h-16 px-5 flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">Stroke Recognition</span>
              <span className="text-[10px] px-1.5 py-0.2 font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Explainable Screening Platform</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-0.5">
          {menuItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx} className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {item.section}
                </div>
              );
            }

            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-100 dark:border-sky-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-500" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Sign Out */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-2 text-[11px] text-slate-500 dark:text-slate-400">
          <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">{user?.full_name || 'Sarah Jenkins'}</p>
          <p className="text-[10px] text-slate-400 truncate">{user?.email || 'user@strokecare.ai'}</p>
        </div>
        <button
          onClick={() => { logoutUser(); setTab('landing'); }}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
