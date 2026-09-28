import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon, Activity, TrendingUp, Calendar,
  ArrowRight, ShieldCheck, RefreshCw, BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import { getLongitudinalMonitoring } from '../services/api';

export const MonitoringPage = ({ setTab }) => {
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeMetric, setActiveMetric] = useState('facial_symmetry');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonitoring();
  }, []);

  const loadMonitoring = async () => {
    setLoading(true);
    try {
      const res = await getLongitudinalMonitoring();
      setTimeline(res.timeline || []);
      setSummary(res.summary || null);
    } catch (err) {
      console.error("Monitoring load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const metricConfigs = {
    facial_symmetry: { label: 'Overall Facial Symmetry', color: '#0284c7', unit: '/ 100' },
    eye_symmetry: { label: 'Eye Opening Symmetry', color: '#0d9488', unit: '/ 100' },
    eyebrow_symmetry: { label: 'Eyebrow Arch Symmetry', color: '#6366f1', unit: '/ 100' },
    mouth_symmetry: { label: 'Mouth / Commissure Symmetry', color: '#8b5cf6', unit: '/ 100' },
    nose_alignment: { label: 'Nose Alignment to Midline', color: '#10b981', unit: '/ 100' },
    overall_asymmetry: { label: 'Overall Asymmetry Index', color: '#f43f5e', unit: 'pts' }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
            <LineChartIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Longitudinal Telemetry Tracker</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Progress Monitoring & Trends (Section 25)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Recharts longitudinal tracking of facial symmetry, eyes, eyebrows, mouth, and nose alignment over time.
          </p>
        </div>

        <button
          onClick={loadMonitoring}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Scans Recorded</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{summary.total_assessments}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 block">Current Facial Symmetry</span>
            <span className="text-2xl font-black text-sky-600 mt-1 block">{summary.current_symmetry || '—'}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 block">Historical Average</span>
            <span className="text-2xl font-black text-teal-600 mt-1 block">{summary.average_symmetry || '—'}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 block">Trajectory Status</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{summary.trend}</span>
          </div>
        </div>
      )}

      {/* Main Longitudinal Recharts Graph (Section 25) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {metricConfigs[activeMetric]?.label} Over Time
            </h3>
            <p className="text-xs text-slate-500">Weekly and monthly longitudinal symmetry tracking</p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {Object.keys(metricConfigs).map(key => (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeMetric === key
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {metricConfigs[key].label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricConfigs[activeMetric]?.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={metricConfigs[activeMetric]?.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis domain={activeMetric === 'overall_asymmetry' ? [0, 40] : [50, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  name={metricConfigs[activeMetric]?.label}
                  stroke={metricConfigs[activeMetric]?.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#metricGradient)"
                  dot={{ r: 4, fill: metricConfigs[activeMetric]?.color }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No longitudinal assessments recorded yet. Run your first screening to populate charts.
            </div>
          )}
        </div>
      </div>

      {/* Multi-Line Comprehensive Comparison Chart (All 6 Metrics) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          All Facial Measurements Simultaneously
        </h3>
        <p className="text-xs text-slate-500">
          Comparing Eye, Eyebrow, Mouth, Nose, and Overall Facial Symmetry curves
        </p>

        <div className="h-72 w-full">
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="facial_symmetry" name="Overall Symmetry" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="mouth_symmetry" name="Mouth Symmetry" stroke="#8b5cf6" strokeWidth={1.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="eye_symmetry" name="Eye Symmetry" stroke="#0d9488" strokeWidth={1.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="eyebrow_symmetry" name="Eyebrow Symmetry" stroke="#6366f1" strokeWidth={1.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="nose_alignment" name="Nose Alignment" stroke="#10b981" strokeWidth={1.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No tracking history found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
