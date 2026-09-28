import React, { useState, useEffect } from 'react';
import {
  Stethoscope, Users, Activity, FileText, CheckCircle2,
  AlertTriangle, ArrowRight, RefreshCw, ChevronRight, User, Eye
} from 'lucide-react';
import { getDoctorPatients } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DoctorDashboardPage = ({ setTab, setSelectedPatientId }) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await getDoctorPatients();
      setPatients(res.patients || []);
    } catch (err) {
      console.error("Doctor dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient, targetTab = 'doctor-patient-profile') => {
    if (setSelectedPatientId) {
      setSelectedPatientId(patient.patient_id);
    }
    setTab(targetTab);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Doctor Clinical Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              Vascular Neurology
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <strong className="text-slate-700 dark:text-slate-200">{user?.full_name || 'Dr. Marcus Vance, MD'}</strong>. Reviewing authorized patient symmetry telemetry.
          </p>
        </div>

        <button
          onClick={loadPatients}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Roster</span>
        </button>
      </div>

      {/* Quick Clinical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Patients</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{patients.length || 1}</span>
          <span className="block text-[11px] text-emerald-600 mt-1 font-medium">Consented clinical access</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Asymmetry Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-600">
            {patients.filter(p => p.prediction === 'stroke_associated').length}
          </span>
          <span className="block text-[11px] text-slate-400 mt-1">Requires clinical evaluation</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Baselines</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-2xl font-black text-teal-600">
            {patients.filter(p => p.has_baseline).length || 1}
          </span>
          <span className="block text-[11px] text-slate-400 mt-1">Reference profiles recorded</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active AI Model</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-xl font-black text-indigo-600">XGBoost (v1.0)</span>
          <span className="block text-[11px] text-slate-400 mt-1">Sensitivity-optimized</span>
        </div>
      </div>

      {/* Patient List (Section 27) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Authorized Patient Roster</h3>
            <p className="text-xs text-slate-500">Patients with active clinical review authorization</p>
          </div>

          <button
            onClick={() => setTab('doctor-patients')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1 cursor-pointer"
          >
            <span>Full Patient Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-[10px] uppercase">
                <th className="pb-3">Patient</th>
                <th className="pb-3">Age / Gender</th>
                <th className="pb-3">Latest Assessment</th>
                <th className="pb-3">Symmetry</th>
                <th className="pb-3">Outcome Status</th>
                <th className="pb-3">Last Updated</th>
                <th className="pb-3 text-right">Clinical Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {patients.map((p) => (
                <tr
                  key={p.patient_id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onClick={() => handleSelectPatient(p)}
                >
                  <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-bold">
                      {p.full_name[0]}
                    </div>
                    <span>{p.full_name}</span>
                  </td>
                  <td className="py-3.5 text-slate-600 dark:text-slate-400">
                    {p.age} yrs • {p.gender}
                  </td>
                  <td className="py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                    {p.latest_assessment_date}
                  </td>
                  <td className="py-3.5 font-bold text-sky-600">
                    {p.latest_symmetry || '—'}/100
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.prediction === 'stroke_associated'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}>
                      {p.prediction === 'stroke_associated' ? 'Asymmetry Flagged' : 'Normal Symmetry'}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400 text-[11px]">
                    {new Date(p.last_updated).toLocaleDateString('en-GB')}
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelectPatient(p, 'doctor-facial-analysis'); }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 cursor-pointer"
                    >
                      Facial Analysis
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelectPatient(p, 'doctor-patient-profile'); }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 cursor-pointer"
                    >
                      Open File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
