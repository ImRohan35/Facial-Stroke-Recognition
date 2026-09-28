import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Stethoscope, Activity, Cpu, ScrollText,
  CheckCircle2, AlertTriangle, RefreshCw, ArrowRight
} from 'lucide-react';
import { getAdminDashboard } from '../services/api';

export const AdminDashboardPage = ({ setTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getAdminDashboard();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              System Administration Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              Admin Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System monitoring, assessment statistics, active ML pipeline configuration, and audit event logs.
          </p>
        </div>

        <button
          onClick={loadStats}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.total_users || 3}</span>
          <span className="block text-[11px] text-slate-400 mt-1">Across all registered roles</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Physicians</span>
            <Stethoscope className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-2xl font-black text-teal-600">{stats?.total_doctors || 1}</span>
          <span className="block text-[11px] text-slate-400 mt-1">Verified clinician accounts</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Scans Run</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-indigo-600">{stats?.total_screenings || 12}</span>
          <span className="block text-[11px] text-slate-400 mt-1">Image & video assessments</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Model</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-xl font-black text-purple-600">{stats?.active_model || 'XGBoost'}</span>
          <span className="block text-[11px] text-emerald-600 font-semibold mt-1">High Sensitivity Mode</span>
        </div>
      </div>

      {/* Outcome Breakdown & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assessment Outcome Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Stroke-Associated Patterns Flagged</span>
                <span className="font-bold text-rose-600">{stats?.stroke_associated_count || 4}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '33%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Non-Stroke Patterns (Control Symmetries)</span>
                <span className="font-bold text-emerald-600">{stats?.non_stroke_associated_count || 7}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '58%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Uncertain / Insufficient Confidence</span>
                <span className="font-bold text-amber-600">{stats?.uncertain_count || 1}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '9%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Administration Navigation Quick Links */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admin Management Portals</h3>

          <div className="space-y-2">
            <button
              onClick={() => setTab('admin-models')}
              className="w-full p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 border border-purple-100 dark:border-purple-900 text-left flex items-center justify-between text-xs font-semibold text-purple-950 dark:text-purple-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>Multi-Model Benchmark (XGBoost, RF, SVM, LogReg)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600" />
            </button>

            <button
              onClick={() => setTab('admin-users')}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4 text-sky-600" />
                <span>User Accounts & Role Permissions</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setTab('admin-doctors')}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Doctor Licensure & Hospital Management</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setTab('admin-logs')}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <ScrollText className="w-4 h-4 text-emerald-600" />
                <span>System Security & Audit Logs</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
