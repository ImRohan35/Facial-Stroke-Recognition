import React from 'react';
import {
  LayoutDashboard, Camera, Upload, Video, FileCheck, BrainCircuit,
  Eye, Compass, History, GitCompare, LineChart, FileText,
  User, Settings, Stethoscope, Users, UserCheck, Cpu, ScrollText,
  Brain, LogOut, ChevronRight, HeartPulse
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AppSidebar = ({ currentTab, setTab, role = 'PATIENT' }) => {
  const { user, logoutUser, switchDemoRole } = useAuth();

  const patientMenuItems = [
    { section: 'Overview' },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { section: 'Risk Assessment' },
    { id: 'risk', label: 'Risk Factors (BP/Health)', icon: <HeartPulse className="w-4 h-4 text-rose-500" /> },
    { section: 'AI Facial Screening' },
    { id: 'screening', label: 'Screening Hub', icon: <Camera className="w-4 h-4" /> },
    { id: 'upload', label: 'Image Upload', icon: <Upload className="w-4 h-4" /> },
    { id: 'camera', label: 'Camera Capture', icon: <Camera className="w-4 h-4" /> },
    { id: 'video', label: 'Video Analysis', icon: <Video className="w-4 h-4" /> },
    { section: 'Results & Explainability' },
    { id: 'result', label: 'Analysis Result', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'explainable-ai', label: 'Explainable AI', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'asymmetry', label: 'Facial Asymmetry', icon: <Eye className="w-4 h-4" /> },
    { section: 'Personal Tracking' },
    { id: 'baseline', label: 'Personal Baseline', icon: <Compass className="w-4 h-4" /> },
    { id: 'history', label: 'Assessment History', icon: <History className="w-4 h-4" /> },
    { id: 'comparison', label: 'Comparison', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'monitoring', label: 'Monitoring Trends', icon: <LineChart className="w-4 h-4" /> },
    { id: 'reports', label: 'Clinical Reports', icon: <FileText className="w-4 h-4" /> },
    { section: 'Account' },
    { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const doctorMenuItems = [
    { section: 'Clinical Portal' },
    { id: 'doctor', label: 'Doctor Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'doctor-patients', label: 'Patient List', icon: <Users className="w-4 h-4" /> },
    { section: 'Patient Analysis' },
    { id: 'doctor-patient-profile', label: 'Patient Profile', icon: <User className="w-4 h-4" /> },
    { id: 'doctor-patient-history', label: 'Assessment History', icon: <History className="w-4 h-4" /> },
    { id: 'doctor-facial-analysis', label: 'Facial Analysis', icon: <Eye className="w-4 h-4" /> },
    { id: 'doctor-comparison', label: 'Patient Comparison', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'doctor-reports', label: 'Doctor Reports', icon: <FileText className="w-4 h-4" /> },
    { section: 'Account' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const adminMenuItems = [
    { section: 'System Administration' },
    { id: 'admin', label: 'Admin Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'admin-users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'admin-doctors', label: 'Doctor Management', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'admin-models', label: 'Model Management', icon: <Cpu className="w-4 h-4" /> },
    { id: 'admin-logs', label: 'Audit Logs', icon: <ScrollText className="w-4 h-4" /> },
    { section: 'Account' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  let items = patientMenuItems;
  if (role === 'DOCTOR') items = doctorMenuItems;
  if (role === 'ADMIN') items = adminMenuItems;

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

        {/* Role Selector Badge */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            <span className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${role === 'DOCTOR' ? 'bg-teal-500' : (role === 'ADMIN' ? 'bg-purple-500' : 'bg-sky-500')}`}></span>
              <span>Portal: {role}</span>
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => { switchDemoRole('PATIENT'); setTab('dashboard'); }}
                title="Switch to Patient View"
                className={`px-1.5 py-0.5 rounded text-[10px] ${role === 'PATIENT' ? 'bg-sky-600 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                P
              </button>
              <button
                onClick={() => { switchDemoRole('DOCTOR'); setTab('doctor'); }}
                title="Switch to Doctor View"
                className={`px-1.5 py-0.5 rounded text-[10px] ${role === 'DOCTOR' ? 'bg-teal-600 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Dr
              </button>
              <button
                onClick={() => { switchDemoRole('ADMIN'); setTab('admin'); }}
                title="Switch to Admin View"
                className={`px-1.5 py-0.5 rounded text-[10px] ${role === 'ADMIN' ? 'bg-purple-600 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Ad
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-0.5">
          {items.map((item, idx) => {
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
          <p className="text-[10px] text-slate-400 truncate">{user?.email || 'patient@strokecare.ai'}</p>
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
