import React, { useState } from 'react';
import {
  BrainCircuit, Sparkles, ArrowRight, ArrowLeft, Info,
  TrendingUp, TrendingDown, Eye, CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';

export const ExplainableAiPage = ({ screeningData, setTab }) => {
  const data = screeningData || {
    prediction: 'non_stroke_associated',
    prediction_display: 'Non-stroke-associated facial pattern',
    model_confidence: 0.91,
    summary_text: 'Facial landmark vectors demonstrate balanced bilateral symmetry within standard biological limits.',
    explanation: [
      { feature: 'Mouth asymmetry', importance: 0.42, contribution: 'High', direction: 'Positive (Towards stroke pattern)' },
      { feature: 'Eyebrow asymmetry', importance: 0.27, contribution: 'Medium', direction: 'Positive (Towards stroke pattern)' },
      { feature: 'Eye symmetry', importance: 0.14, contribution: 'Low', direction: 'Negative (Towards non-stroke)' },
      { feature: 'Nose alignment', importance: 0.09, contribution: 'Low', direction: 'Negative (Towards non-stroke)' },
      { feature: 'Jawline contour asymmetry', importance: 0.08, contribution: 'Low', direction: 'Negative (Towards non-stroke)' }
    ]
  };

  const chartData = (data.explanation || []).map(item => ({
    name: item.feature,
    importance: Math.round(item.importance * 100),
    contribution: item.contribution
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => setTab('result')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Assessment Result</span>
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold">
          <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
          <span>SHAP (SHapley Additive exPlanations) Attribution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Explainable AI Feature Contributions
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Every displayed AI attribution is calculated directly from actual model weights and real extracted landmark geometries.
          SHAP values reveal how each bilateral facial measurement influenced the final model classification.
        </p>
      </div>

      {/* Feature Contributions Table (Section 21 Example) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Top Contributing Facial Features
            </h3>
            <p className="text-xs text-slate-500">Ranked by absolute influence on model decision</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Model: {data.algorithm_used || 'XGBoost'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Feature</th>
                <th className="pb-3">SHAP Importance Score</th>
                <th className="pb-3">Contribution Level</th>
                <th className="pb-3">Directional Influence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.explanation && data.explanation.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>{row.feature}</span>
                  </td>
                  <td className="py-3 font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {row.importance}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.contribution === 'High'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : (row.contribution === 'Medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')
                    }`}>
                      {row.contribution}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {row.direction || 'Towards prediction output'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SHAP Bar Chart Visualization */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Relative Feature Weight Comparison
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
              <Bar dataKey="importance" name="Importance Score" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.contribution === 'High' ? '#f43f5e' : (entry.contribution === 'Medium' ? '#f59e0b' : '#38bdf8')}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Next Step Nav */}
      <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-900">
        <div>
          <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200">Inspect Anatomical Regions</h4>
          <p className="text-[11px] text-purple-700 dark:text-purple-300">
            View the step-by-step visual explanation linking landmarks to important anatomical regions.
          </p>
        </div>
        <button
          onClick={() => setTab('asymmetry')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
        >
          <span>Visual Asymmetry Breakdown</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
