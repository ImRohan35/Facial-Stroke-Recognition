import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Share2, Eye, Calendar, CheckCircle2,
  RefreshCw, AlertCircle, ShieldCheck, ArrowRight, ExternalLink
} from 'lucide-react';
import { listReports, getAssessments, generatePdfReport } from '../services/api';

export const ReportsPage = ({ setTab, setSelectedAssessmentId }) => {
  const [reports, setReports] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const [repRes, assessRes] = await Promise.all([
        listReports(),
        getAssessments()
      ]);
      setReports(repRes.reports || []);
      const aList = assessRes.assessments || [];
      setAssessments(aList);
      if (aList.length > 0) {
        setSelectedAssessId(aList[0].id);
      }
    } catch (err) {
      console.error("Error loading reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!selectedAssessmentId) return;

    setGenerating(true);
    setMessage('');
    try {
      const res = await generatePdfReport(selectedAssessmentId);
      setMessage('PDF Clinical Report generated successfully.');
      window.open(res.download_url, '_blank');
      await loadReportsData();
    } catch (err) {
      setMessage('Failed to generate PDF report.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold">
          <FileText className="w-3.5 h-3.5 text-rose-600" />
          <span>ReportLab Clinical Summary Generation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Clinical Screening Reports (Section 28)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Generate, download, and share structured medical-grade PDF screening summaries containing quantitative facial symmetry indices, SHAP attributions, and baseline comparison.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Generate New Report Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Generate New PDF Report
        </h3>
        <p className="text-xs text-slate-500">
          Select a completed assessment scan to compile into an exportable PDF document.
        </p>

        <form onSubmit={handleCreateReport} className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedAssessmentId}
            onChange={(e) => setSelectedAssessId(e.target.value)}
            className="w-full sm:w-2/3 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            {assessments.map(a => (
              <option key={a.id} value={a.id}>
                Assessment #{a.id.slice(0, 8)} ({new Date(a.created_at).toLocaleDateString('en-GB')}) — {a.prediction === 'stroke_associated' ? 'Stroke Pattern' : 'Non-Stroke Pattern'} (Sym: {a.facial_features?.facial_symmetry || '—'})
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={generating || !selectedAssessmentId}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>{generating ? 'Generating PDF...' : 'Compile & Download PDF'}</span>
          </button>
        </form>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Generated Reports Repository
          </h3>
          <span className="text-xs text-slate-400">{reports.length} reports available</span>
        </div>

        {reports.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {reports.map((r) => (
              <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-slate-800 flex items-center justify-center text-rose-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{r.pdf_filename}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Compiled: {r.date_display} • Assessment #{r.assessment_id.slice(0, 8)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1.5 text-[10px]">
                      <span className="font-semibold text-sky-600">Symmetry: {r.facial_symmetry || '—'}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className={`font-semibold ${r.prediction === 'stroke_associated' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {r.prediction === 'stroke_associated' ? 'Stroke Pattern Detected' : 'Non-Stroke Pattern'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <a
                    href={r.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">
            No reports compiled yet. Use the form above to generate your first PDF report.
          </div>
        )}
      </div>

      {/* Mandatory Disclaimer Display (Section 28) */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 text-center leading-relaxed">
        «This application provides AI-assisted facial pattern analysis for research/screening purposes and is not a substitute for clinical diagnosis.»
      </div>
    </div>
  );
};
