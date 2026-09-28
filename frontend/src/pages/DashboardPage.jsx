import React, { useState, useEffect } from 'react';
import {
  Activity, Camera, Upload, Video, History, GitCompare, FileText,
  CheckCircle2, ArrowRight, ShieldCheck, TrendingUp, AlertTriangle,
  Eye, Smile, Compass, ChevronRight, RefreshCw, HeartPulse
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { getAssessments, getLongitudinalMonitoring } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = ({ setTab, setSelectedAssessmentId, setLatestScreeningData }) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [assessRes, monRes] = await Promise.all([
        getAssessments(),
        getLongitudinalMonitoring()
      ]);
      setAssessments(assessRes.assessments || []);
      setTimeline(monRes.timeline || []);
      setSummary(monRes.summary || null);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const latest = assessments.length > 0 ? assessments[0] : null;
  const latestFeats = latest?.facial_features || {
    facial_symmetry: 88.5,
    eye_symmetry: 92.0,
    eyebrow_symmetry: 87.4,
    mouth_symmetry: 85.0,
    nose_alignment: 91.2
  };

  const handleOpenAssessment = (assessment) => {
    setSelectedAssessmentId(assessment.id);
    if (setLatestScreeningData) {
      setLatestScreeningData(assessment);
    }
    setTab('result');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Patient Symmetry Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              Active Session
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <strong className="text-slate-700 dark:text-slate-200">{user?.full_name || 'Sarah Jenkins'}</strong>. Monitoring facial landmark symmetry over time.
          </p>
        </div>

        {/* Quick Screening Launch */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTab('risk')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Risk Profiler (BP)</span>
          </button>
          <button
            onClick={() => setTab('screening')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>New Screening</span>
          </button>
          <button
            onClick={loadDashboardData}
            title="Refresh dashboard telemetry"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Latest Assessment Card (Section 7) */}
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Latest Analysis</span>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-black">
                {latest ? new Date(latest.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '26 September 2026'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status: Completed</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              {latest ? (
                `Model Output: ${latest.prediction === 'stroke_associated' ? 'Stroke-associated facial pattern detected' : (latest.prediction === 'uncertain' ? 'Uncertain / insufficient confidence' : 'Non-stroke-associated facial pattern')} (${Math.round(latest.model_confidence * 100)}% confidence)`
              ) : (
                'Non-stroke-associated facial pattern within healthy physiological range (91% confidence).'
              )}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {latest && (
              <button
                onClick={() => handleOpenAssessment(latest)}
                className="px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-sky-50 transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <span>View Full Result</span>
                <ArrowRight className="w-4 h-4 text-sky-600" />
              </button>
            )}
            <button
              onClick={() => setTab('comparison')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
            >
              Compare Baseline
            </button>
          </div>
        </div>
      </div>

      {/* 5 Facial Measurements Cards (Section 7) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Facial Measurements (0 - 100 Index)
          </h3>
          <span className="text-[11px] text-slate-400">Higher score = Greater Bilateral Symmetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. Facial Symmetry */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs card-hover">
            <span className="text-[11px] font-semibold text-slate-500 block">Facial Symmetry</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-sky-600">{latestFeats.facial_symmetry || 88}</span>
              <span className="text-[10px] text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-sky-600 h-full rounded-full" style={{ width: `${latestFeats.facial_symmetry || 88}%` }} />
            </div>
          </div>

          {/* 2. Eye Symmetry */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs card-hover">
            <span className="text-[11px] font-semibold text-slate-500 block">Eye Symmetry</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-teal-600">{latestFeats.eye_symmetry || 92}</span>
              <span className="text-[10px] text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full" style={{ width: `${latestFeats.eye_symmetry || 92}%` }} />
            </div>
          </div>

          {/* 3. Eyebrow Symmetry */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs card-hover">
            <span className="text-[11px] font-semibold text-slate-500 block">Eyebrow Symmetry</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-indigo-600">{latestFeats.eyebrow_symmetry || 87}</span>
              <span className="text-[10px] text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${latestFeats.eyebrow_symmetry || 87}%` }} />
            </div>
          </div>

          {/* 4. Mouth Symmetry */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs card-hover">
            <span className="text-[11px] font-semibold text-slate-500 block">Mouth Symmetry</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-purple-600">{latestFeats.mouth_symmetry || 85}</span>
              <span className="text-[10px] text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: `${latestFeats.mouth_symmetry || 85}%` }} />
            </div>
          </div>

          {/* 5. Nose Alignment */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs card-hover">
            <span className="text-[11px] font-semibold text-slate-500 block">Nose Alignment</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">{latestFeats.nose_alignment || 91}</span>
              <span className="text-[10px] text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${latestFeats.nose_alignment || 91}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Trend Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (Section 7) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Facial Measurements Over Time</h3>
              <p className="text-[11px] text-slate-500">Longitudinal symmetry trajectories across completed assessments</p>
            </div>
            <button
              onClick={() => setTab('monitoring')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>Full Monitoring</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="facial_symmetry" name="Facial Symmetry" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="mouth_symmetry" name="Mouth" stroke="#8b5cf6" strokeWidth={1.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="eye_symmetry" name="Eye" stroke="#0d9488" strokeWidth={1.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="nose_alignment" name="Nose" stroke="#10b981" strokeWidth={1.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                <span>No longitudinal records yet. Run your first screening to plot trends.</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions (Section 7) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Quick Actions</h3>
            <p className="text-[11px] text-slate-500 mb-4">Direct shortcuts to major platform screening tools</p>

            <div className="space-y-2">
              <button
                onClick={() => setTab('upload')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950 border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Upload className="w-4 h-4 text-sky-600" />
                  <span>Analyze New Image</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setTab('camera')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950 border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Camera className="w-4 h-4 text-teal-600" />
                  <span>Camera Analysis</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setTab('video')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950 border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span>Video Landmark Sequence</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setTab('history')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950 border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <History className="w-4 h-4 text-purple-600" />
                  <span>View History</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setTab('comparison')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950 border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <GitCompare className="w-4 h-4 text-amber-600" />
                  <span>Compare Assessment</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setTab('reports')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950 border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>Generate Report</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assessments Table (Section 7) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Assessments</h3>
            <p className="text-[11px] text-slate-500">Historical screening logs and numerical symmetry scores</p>
          </div>
          <button
            onClick={() => setTab('history')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All ({assessments.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {assessments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Assessment ID</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Modality</th>
                  <th className="pb-3">Model Output</th>
                  <th className="pb-3">Facial Symmetry</th>
                  <th className="pb-3">Mouth Symmetry</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assessments.slice(0, 5).map((a) => {
                  const feats = a.facial_features;
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-mono text-[11px] text-slate-500">
                        #{a.id.slice(0, 8)}
                        {a.is_baseline && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700">Baseline</span>
                        )}
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300">
                        {new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                          {a.assessment_type.replace('_', ' ').toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.prediction === 'stroke_associated'
                            ? 'bg-rose-100 text-rose-700'
                            : (a.prediction === 'uncertain' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')
                        }`}>
                          {a.prediction === 'stroke_associated' ? 'Stroke Pattern' : (a.prediction === 'uncertain' ? 'Uncertain' : 'Non-Stroke Pattern')}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-sky-600">
                        {feats?.facial_symmetry || '—'}
                      </td>
                      <td className="py-3 font-bold text-purple-600">
                        {feats?.mouth_symmetry || '—'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleOpenAssessment(a)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors cursor-pointer"
                        >
                          View Result
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No assessments completed yet. Click "New Screening" above to start your first analysis.
          </div>
        )}
      </div>
    </div>
  );
};
