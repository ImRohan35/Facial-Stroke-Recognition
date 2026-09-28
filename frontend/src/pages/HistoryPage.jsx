import React, { useState, useEffect } from 'react';
import {
  History, Eye, GitCompare, FileText, Trash2, Search,
  Calendar, CheckCircle2, AlertTriangle, HelpCircle, RefreshCw
} from 'lucide-react';
import { getAssessments, deleteAssessment, generatePdfReport } from '../services/api';

export const HistoryPage = ({ setTab, setSelectedAssessmentId, setLatestScreeningData }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await getAssessments();
      setAssessments(res.assessments || []);
    } catch (err) {
      console.error("Error loading assessment history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item) => {
    setSelectedAssessmentId(item.id);
    if (setLatestScreeningData) {
      setLatestScreeningData(item);
    }
    setTab('result');
  };

  const handleCompare = (item) => {
    setSelectedAssessmentId(item.id);
    setTab('comparison');
  };

  const handleGenerateReport = async (item) => {
    try {
      const res = await generatePdfReport(item.id);
      window.open(res.download_url, '_blank');
      setActionMessage(`PDF report for Assessment #${item.id.slice(0, 8)} generated successfully.`);
    } catch (err) {
      console.error("Report generation failed:", err);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete assessment #${item.id.slice(0, 8)}?`)) return;

    try {
      await deleteAssessment(item.id);
      setActionMessage(`Assessment #${item.id.slice(0, 8)} deleted successfully.`);
      setAssessments(prev => prev.filter(a => a.id !== item.id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filtered = assessments.filter(a =>
    a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.prediction.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.assessment_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5 text-teal-600" />
            <span>Screening Telemetry Repository</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Assessment History (Section 24)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Store, inspect, compare, and generate formal clinical PDF reports from all completed assessments.
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Assessment ID, model outcome, or modality..."
          className="w-full text-xs bg-transparent focus:outline-none text-slate-900 dark:text-white"
        />
      </div>

      {/* History Grid Cards (Section 24) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, idx) => {
          const feats = item.facial_features || {};
          const isStroke = item.prediction === 'stroke_associated';
          const isUncertain = item.prediction === 'uncertain';

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header Info */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    Assessment #{item.id.slice(0, 8)}
                  </span>
                  {item.is_baseline && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                      Personal Baseline
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span>•</span>
                  <span className="capitalize">{item.assessment_type.replace('_', ' ').toLowerCase()}</span>
                </div>

                {/* Outcome Badge */}
                <div className="mb-3">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isStroke
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : (isUncertain
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300')
                  }`}>
                    {isStroke ? <AlertTriangle className="w-3.5 h-3.5" /> : (isUncertain ? <HelpCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />)}
                    <span>{isStroke ? 'Stroke-associated pattern' : (isUncertain ? 'Uncertain confidence' : 'Non-stroke-associated pattern')}</span>
                  </span>
                </div>

                {/* Facial Measurements Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Facial</span>
                    <span className="text-sm font-bold text-sky-600">{feats.facial_symmetry || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Mouth</span>
                    <span className="text-sm font-bold text-purple-600">{feats.mouth_symmetry || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Eye</span>
                    <span className="text-sm font-bold text-teal-600">{feats.eye_symmetry || '—'}</span>
                  </div>
                </div>
              </div>

              {/* 4 Allowed Actions: View, Compare, Generate Report, Delete (Section 24) */}
              <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => handleView(item)}
                  title="View full assessment screen"
                  className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-100 text-center transition-colors cursor-pointer"
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={() => handleCompare(item)}
                  title="Compare with another scan or baseline"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-center transition-colors cursor-pointer"
                >
                  Compare
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerateReport(item)}
                  title="Generate ReportLab PDF report"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-center transition-colors cursor-pointer"
                >
                  Report
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  title="Delete assessment"
                  className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-center transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          No assessment records matched your search query.
        </div>
      )}
    </div>
  );
};
