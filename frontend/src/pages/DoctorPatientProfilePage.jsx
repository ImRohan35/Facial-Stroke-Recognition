import React, { useState, useEffect } from 'react';
import {
  User, Calendar, Phone, Mail, Compass, History, Eye,
  GitCompare, FileText, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { getDoctorPatientDetail } from '../services/api';

export const DoctorPatientProfilePage = ({ patientId, setTab, setSelectedAssessmentId }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, [patientId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      // If patientId is not provided, use default
      const id = patientId || 'sarah-jenkins-profile';
      const data = await getDoctorPatientDetail(id);
      setProfileData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const patient = profileData?.patient || {
    full_name: 'Sarah Jenkins',
    email: 'patient@strokecare.ai',
    gender: 'Female',
    date_of_birth: '1964-09-15',
    phone: '+1 (555) 234-8901'
  };

  const baseline = profileData?.baseline?.measurements || {
    facial_symmetry: 92.4,
    eye_symmetry: 95.0,
    eyebrow_symmetry: 91.5,
    mouth_symmetry: 89.2,
    nose_alignment: 93.0
  };

  const assessments = profileData?.assessments || [];
  const timeline = profileData?.monitoring_timeline || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => setTab('doctor-patients')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Patient List</span>
      </button>

      {/* Patient Header Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-sky-600 text-white text-2xl font-bold flex items-center justify-center shadow-md shadow-teal-500/20">
            {patient.full_name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{patient.full_name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{patient.email} • {patient.phone}</p>
            <div className="flex items-center space-x-2 mt-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800 text-[10px]">
                Consented Clinical File
              </span>
              <span className="text-slate-400">DOB: {patient.date_of_birth}</span>
            </div>
          </div>
        </div>

        {/* Doctor Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTab('doctor-facial-analysis')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Facial Analysis</span>
          </button>
          <button
            onClick={() => setTab('doctor-comparison')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Baseline</span>
          </button>
          <button
            onClick={() => setTab('doctor-reports')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Clinical Reports</span>
          </button>
        </div>
      </div>

      {/* Baseline Measurements Snapshot (Section 27) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Compass className="w-4 h-4 text-teal-600" />
            <span>Patient's Personal Baseline Reference (0 - 100 Index)</span>
          </h3>
          <span className="text-xs text-emerald-600 font-semibold">Active Baseline ✓</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <span className="text-[11px] text-slate-500 block">Facial Symmetry</span>
            <span className="text-xl font-bold text-sky-600 mt-0.5 block">{baseline.facial_symmetry}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <span className="text-[11px] text-slate-500 block">Eye Symmetry</span>
            <span className="text-xl font-bold text-teal-600 mt-0.5 block">{baseline.eye_symmetry}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <span className="text-[11px] text-slate-500 block">Eyebrow Symmetry</span>
            <span className="text-xl font-bold text-indigo-600 mt-0.5 block">{baseline.eyebrow_symmetry}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <span className="text-[11px] text-slate-500 block">Mouth Symmetry</span>
            <span className="text-xl font-bold text-purple-600 mt-0.5 block">{baseline.mouth_symmetry}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <span className="text-[11px] text-slate-500 block">Nose Alignment</span>
            <span className="text-xl font-bold text-emerald-600 mt-0.5 block">{baseline.nose_alignment}</span>
          </div>
        </div>
      </div>

      {/* Longitudinal Monitoring Telemetry Chart (Section 27) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Longitudinal Symmetry Telemetry
        </h3>

        <div className="h-64 w-full">
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#64748b" />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="facial_symmetry" name="Overall" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="mouth_symmetry" name="Mouth" stroke="#8b5cf6" strokeWidth={1.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="eye_symmetry" name="Eye" stroke="#0d9488" strokeWidth={1.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No historical trajectory records.
            </div>
          )}
        </div>
      </div>

      {/* Chronological Assessments List (Section 27) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Completed Assessments ({assessments.length})
          </h3>
          <button
            onClick={() => setTab('doctor-patient-history')}
            className="text-xs font-semibold text-teal-600 hover:underline cursor-pointer"
          >
            View Full Chronology →
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {assessments.slice(0, 4).map((a) => (
            <div key={a.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">#{a.id.slice(0, 8)}</span>
                <span className="text-slate-400 ml-2">{new Date(a.created_at).toLocaleDateString('en-GB')}</span>
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                  {a.assessment_type}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-bold text-sky-600">Sym: {a.facial_features?.facial_symmetry || '—'}</span>
                <button
                  onClick={() => { if (setSelectedAssessmentId) setSelectedAssessmentId(a.id); setTab('doctor-facial-analysis'); }}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 cursor-pointer"
                >
                  Inspect Analysis
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
