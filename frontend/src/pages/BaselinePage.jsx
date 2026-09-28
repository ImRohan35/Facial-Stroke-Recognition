import React, { useState, useEffect } from 'react';
import {
  Compass, ArrowRight, CheckCircle2, AlertCircle, RefreshCw,
  GitCompare, Image as ImageIcon, Calendar, Info
} from 'lucide-react';
import { getPersonalBaseline, getAssessments, setPersonalBaseline } from '../services/api';

export const BaselinePage = ({ setTab, setSelectedAssessmentId }) => {
  const [baselineData, setBaselineData] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessId, setSelectedAssessId] = useState('');
  const [notes, setNotes] = useState('Personal physiological symmetry reference profile');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBaseline();
  }, []);

  const loadBaseline = async () => {
    setLoading(true);
    try {
      const [baseRes, assessRes] = await Promise.all([
        getPersonalBaseline(),
        getAssessments()
      ]);
      setBaselineData(baseRes.has_baseline ? baseRes.baseline : null);
      setAssessments(assessRes.assessments || []);
      if (assessRes.assessments?.length > 0) {
        setSelectedAssessId(assessRes.assessments[0].id);
      }
    } catch (err) {
      console.error("Baseline fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBaseline = async (e) => {
    e.preventDefault();
    if (!selectedAssessId) return;

    setUpdating(true);
    setMessage('');
    try {
      await setPersonalBaseline(selectedAssessId, notes);
      setMessage('Baseline successfully updated.');
      await loadBaseline();
    } catch (err) {
      setMessage('Failed to update baseline reference.');
    } finally {
      setUpdating(false);
    }
  };

  const meas = baselineData?.measurements || {
    facial_symmetry: 92.4,
    eye_symmetry: 95.0,
    eyebrow_symmetry: 91.5,
    mouth_symmetry: 89.2,
    nose_alignment: 93.0
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
          <Compass className="w-3.5 h-3.5 text-indigo-600" />
          <span>Personal Physiological Reference</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Personal Baseline Facial Assessment
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Most individuals possess natural physiological asymmetry. Establishing your personal baseline allows the platform to isolate sudden acute changes from normal biological variances.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Baseline Status Card (Section 23) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {baselineData ? 'Active Personal Baseline' : 'No Baseline Set'}
              </h3>
              <p className="text-xs text-slate-400">
                {baselineData ? `Recorded on ${new Date(baselineData.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}` : 'Select an assessment below to establish your reference.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTab('comparison')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare With Current</span>
            </button>
          </div>
        </div>

        {/* Stored Baseline Measurements (Section 23) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Stored Baseline Symmetry Values (0-100 Index)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">Facial Symmetry</span>
              <span className="text-2xl font-black text-sky-600 mt-1 block">{meas.facial_symmetry}</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">Eye Symmetry</span>
              <span className="text-2xl font-black text-teal-600 mt-1 block">{meas.eye_symmetry}</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">Eyebrow Symmetry</span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">{meas.eyebrow_symmetry}</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">Mouth Symmetry</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block">{meas.mouth_symmetry}</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">Nose Alignment</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{meas.nose_alignment}</span>
            </div>
          </div>
        </div>

        {/* Update Baseline Form */}
        <form onSubmit={handleSetBaseline} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Set or Update Baseline from Completed Assessment
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Select Assessment Record
              </label>
              <select
                value={selectedAssessId}
                onChange={(e) => setSelectedAssessId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    Assessment #{a.id.slice(0, 8)} ({new Date(a.created_at).toLocaleDateString('en-GB')}) - Sym: {a.facial_features?.facial_symmetry || '—'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Reference Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Asymptomatic reference photo taken in natural light"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating || !selectedAssessId}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{updating ? 'Saving Baseline...' : 'Save as Active Baseline'}</span>
          </button>
        </form>
      </div>

      {/* Neutral Scientific Note (Section 23) */}
      <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 leading-relaxed text-center">
        Numerical differences between baseline and subsequent screenings quantify geometric landmark displacement. 
        Differences should <strong>not</strong> be interpreted as proof of a medical event without professional neurological diagnosis.
      </div>
    </div>
  );
};
