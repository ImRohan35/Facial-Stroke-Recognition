import React, { useState, useEffect } from 'react';
import {
  GitCompare, ArrowRight, TrendingUp, TrendingDown, RefreshCw,
  Calendar, CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { getAssessments, getAssessmentComparison } from '../services/api';

export const ComparisonPage = ({ setTab }) => {
  const [assessments, setAssessments] = useState([]);
  const [assessmentAId, setAssessmentAId] = useState('');
  const [assessmentBId, setAssessmentBId] = useState('');
  const [useBaseline, setUseBaseline] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAssessments();
      const list = res.assessments || [];
      setAssessments(list);

      if (list.length >= 2) {
        setAssessmentAId(list[1].id);
        setAssessmentBId(list[0].id);
        fetchComparison(list[1].id, list[0].id, false);
      } else if (list.length === 1) {
        setAssessmentAId(list[0].id);
        setAssessmentBId(list[0].id);
        fetchComparison(list[0].id, list[0].id, false);
      }
    } catch (err) {
      console.error("Comparison load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async (aId, bId, baselineFlag) => {
    try {
      const data = await getAssessmentComparison(aId, bId, baselineFlag);
      setComparisonData(data);
    } catch (err) {
      console.error("Fetch comparison failed:", err);
    }
  };

  const handleRunComparison = () => {
    fetchComparison(assessmentAId, assessmentBId, useBaseline);
  };

  const aMetrics = comparisonData?.assessment_a?.measurements || {
    facial_symmetry: 91,
    eye_symmetry: 95,
    eyebrow_symmetry: 92,
    mouth_symmetry: 89,
    nose_alignment: 93
  };

  const bMetrics = comparisonData?.assessment_b?.measurements || {
    facial_symmetry: 82,
    eye_symmetry: 94,
    eyebrow_symmetry: 78,
    mouth_symmetry: 64,
    nose_alignment: 91
  };

  const deltas = comparisonData?.deltas || {
    facial_symmetry: -9.0,
    eye_symmetry: -1.0,
    eyebrow_symmetry: -14.0,
    mouth_symmetry: -25.0,
    nose_alignment: -2.0
  };

  const chartData = [
    { name: 'Facial', A: aMetrics.facial_symmetry, B: bMetrics.facial_symmetry },
    { name: 'Eye', A: aMetrics.eye_symmetry, B: bMetrics.eye_symmetry },
    { name: 'Eyebrow', A: aMetrics.eyebrow_symmetry, B: bMetrics.eyebrow_symmetry },
    { name: 'Mouth', A: aMetrics.mouth_symmetry, B: bMetrics.mouth_symmetry },
    { name: 'Nose', A: aMetrics.nose_alignment, B: bMetrics.nose_alignment }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold">
          <GitCompare className="w-3.5 h-3.5 text-sky-600" />
          <span>Longitudinal Telemetry Comparison</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Assessment & Baseline Comparison (Section 26)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Select any two assessments (or your Personal Baseline vs Current Assessment) to inspect numerical deltas and visual symmetry trajectories.
        </p>
      </div>

      {/* Selector Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Reference: Assessment A
            </label>
            <select
              value={assessmentAId}
              onChange={(e) => setAssessmentAId(e.target.value)}
              disabled={useBaseline}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-50"
            >
              {assessments.map(a => (
                <option key={a.id} value={a.id}>
                  #{a.id.slice(0, 8)} ({new Date(a.created_at).toLocaleDateString('en-GB')}) {a.is_baseline ? '(Baseline)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Comparison: Assessment B
            </label>
            <select
              value={assessmentBId}
              onChange={(e) => setAssessmentBId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {assessments.map(a => (
                <option key={a.id} value={a.id}>
                  #{a.id.slice(0, 8)} ({new Date(a.created_at).toLocaleDateString('en-GB')})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunComparison}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Update Comparison</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-1 text-xs">
          <input
            type="checkbox"
            id="useBaselineCheck"
            checked={useBaseline}
            onChange={(e) => {
              setUseBaseline(e.target.checked);
              fetchComparison(assessmentAId, assessmentBId, e.target.checked);
            }}
            className="rounded text-sky-600 focus:ring-sky-500"
          />
          <label htmlFor="useBaselineCheck" className="text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
            Compare directly against Personal Baseline as Assessment A
          </label>
        </div>
      </div>

      {/* Comparison Numerical Table (Section 26 Example Layout) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Symmetry Comparison Table
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Facial Metric</th>
                <th className="pb-3 text-center">Previous Assessment (A)</th>
                <th className="pb-3 text-center">Current Assessment (B)</th>
                <th className="pb-3 text-center">Numerical Delta (B - A)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">Facial Symmetry</td>
                <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">{aMetrics.facial_symmetry}</td>
                <td className="py-3 text-center font-bold text-sky-600">{bMetrics.facial_symmetry}</td>
                <td className={`py-3 text-center font-bold ${deltas.facial_symmetry < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {deltas.facial_symmetry > 0 ? `+${deltas.facial_symmetry}` : deltas.facial_symmetry} pts
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">Eye Symmetry</td>
                <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">{aMetrics.eye_symmetry}</td>
                <td className="py-3 text-center font-bold text-teal-600">{bMetrics.eye_symmetry}</td>
                <td className={`py-3 text-center font-bold ${deltas.eye_symmetry < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {deltas.eye_symmetry > 0 ? `+${deltas.eye_symmetry}` : deltas.eye_symmetry} pts
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">Mouth Symmetry</td>
                <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">{aMetrics.mouth_symmetry}</td>
                <td className="py-3 text-center font-bold text-purple-600">{bMetrics.mouth_symmetry}</td>
                <td className={`py-3 text-center font-bold ${deltas.mouth_symmetry < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {deltas.mouth_symmetry > 0 ? `+${deltas.mouth_symmetry}` : deltas.mouth_symmetry} pts
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">Eyebrow Symmetry</td>
                <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">{aMetrics.eyebrow_symmetry}</td>
                <td className="py-3 text-center font-bold text-indigo-600">{bMetrics.eyebrow_symmetry}</td>
                <td className={`py-3 text-center font-bold ${deltas.eyebrow_symmetry < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {deltas.eyebrow_symmetry > 0 ? `+${deltas.eyebrow_symmetry}` : deltas.eyebrow_symmetry} pts
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">Nose Alignment</td>
                <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">{aMetrics.nose_alignment}</td>
                <td className="py-3 text-center font-bold text-emerald-600">{bMetrics.nose_alignment}</td>
                <td className={`py-3 text-center font-bold ${deltas.nose_alignment < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {deltas.nose_alignment > 0 ? `+${deltas.nose_alignment}` : deltas.nose_alignment} pts
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Grouped Bar Chart (Section 26) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Visual Symmetry Profile Comparison
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="A" name="Assessment A / Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="B" name="Assessment B (Current)" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Neutral Scientific Interpretation (Section 26) */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
        <h4 className="font-bold text-slate-800 dark:text-slate-200">Neutral Interpretation Note</h4>
        <p className="leading-relaxed">
          {comparisonData?.interpretation || (
            `Compared to Assessment A, Assessment B shows a shift of ${deltas.facial_symmetry} points in overall facial symmetry index. ` +
            `Mouth symmetry shifted by ${deltas.mouth_symmetry} pts, eye opening symmetry by ${deltas.eye_symmetry} pts, and eyebrow symmetry by ${deltas.eyebrow_symmetry} pts.`
          )}
        </p>
        <p className="text-[11px] text-slate-400">
          Geometric symmetry variations can arise from lighting, posture, camera tilt, or facial expression. Interpretation is provided strictly as comparative engineering metrics.
        </p>
      </div>
    </div>
  );
};
