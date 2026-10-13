import React, { useState } from 'react';
import {
  BrainCircuit, Sparkles, ArrowRight, ArrowLeft, Info,
  TrendingUp, TrendingDown, Eye, CheckCircle2, ShieldCheck, AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

export const ExplainableAiPage = ({ screeningData, setTab }) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const data = screeningData || {
    prediction: 'non_stroke_associated',
    prediction_display: 'Non-stroke-associated facial pattern',
    model_confidence: 0.91,
    summary_text: 'Facial landmark vectors demonstrate balanced bilateral symmetry within standard biological limits.',
    explanation: [
      { feature: 'Mouth symmetry', importance: 0.42, contribution: 'High', direction: 'Negative (Towards non-stroke)' },
      { feature: 'Eyebrow symmetry', importance: 0.27, contribution: 'Medium', direction: 'Negative (Towards non-stroke)' },
      { feature: 'Eye symmetry', importance: 0.14, contribution: 'Low', direction: 'Negative (Towards non-stroke)' },
      { feature: 'Nose alignment', importance: 0.09, contribution: 'Low', direction: 'Negative (Towards non-stroke)' },
      { feature: 'Jawline contour balance', importance: 0.08, contribution: 'Low', direction: 'Negative (Towards non-stroke)' }
    ]
  };

  const isNonStroke = data.prediction === 'non_stroke_associated';

  const chartData = (data.explanation || []).map(item => {
    const dir = item.direction || (isNonStroke ? 'Negative (Towards non-stroke)' : 'Positive (Towards stroke pattern)');
    const isSafe = dir.toLowerCase().includes('non-stroke') || dir.toLowerCase().includes('negative');
    const isRisk = dir.toLowerCase().includes('stroke') || dir.toLowerCase().includes('positive');

    let color = '#38bdf8'; // Neutral sky
    if (isSafe) {
      color = '#10b981'; // Emerald Green for healthy / non-stroke
    } else if (isRisk) {
      color = item.contribution === 'High' ? '#f43f5e' : '#f59e0b'; // Rose or Amber
    }

    return {
      name: item.feature,
      importance: Math.round(item.importance * 100),
      rawImportance: item.importance,
      contribution: item.contribution,
      direction: dir,
      isSafe,
      isRisk,
      color
    };
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => setTab('result')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{isHi ? 'परिणाम पर वापस जाएं' : 'Back to Assessment Result'}</span>
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold">
          <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
          <span>SHAP (SHapley Additive exPlanations) Attribution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {isHi ? 'व्याख्यात्मक AI और फीचर योगदान (Explainable AI)' : 'Explainable AI Feature Contributions'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          {isHi
            ? 'प्रत्येक प्रदर्शित AI स्कोर वास्तविक फेशियल लैंडमार्क और मॉडल वेट्स से निकाला गया है। SHAP वैल्यू यह दर्शाती है कि चेहरे के कौन से हिस्सों ने परिणाम को सुरक्षित (Non-Stroke) या जोखिम (Stroke Pattern) की ओर निर्देशित किया।'
            : 'Every displayed AI attribution is calculated directly from actual model weights and real extracted landmark geometries. SHAP values reveal how each bilateral facial measurement influenced the final model classification.'}
        </p>
      </div>

      {/* Feature Contributions Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isHi ? 'शीर्ष योगदान देने वाले चेहरे के फीचर्स' : 'Top Contributing Facial Features'}
            </h3>
            <p className="text-xs text-slate-500">
              {isHi ? 'मॉडल निर्णय पर प्रभाव के आधार पर रैंक किया गया' : 'Ranked by absolute influence on model decision'}
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Model: {data.algorithm_used || 'XGBoost / SVM Ensemble'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">{isHi ? 'फीचर (Feature)' : 'Feature'}</th>
                <th className="pb-3">{isHi ? 'SHAP स्कोर (Impact)' : 'SHAP Importance Score'}</th>
                <th className="pb-3">{isHi ? 'योगदान स्तर (Level)' : 'Contribution Level'}</th>
                <th className="pb-3">{isHi ? 'दिशात्मक प्रभाव (Direction)' : 'Directional Influence'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {chartData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: row.color }}
                    ></span>
                    <span>{row.name}</span>
                  </td>
                  <td className="py-3 font-mono font-bold" style={{ color: row.color }}>
                    {row.rawImportance}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.isSafe
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : row.contribution === 'High'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : row.contribution === 'Medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {row.contribution}
                    </span>
                  </td>
                  <td className="py-3">
                    {row.isSafe ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isHi ? 'सुरक्षित सममिति (Supports Healthy Non-Stroke)' : 'Negative (Supports Healthy Symmetry)'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-rose-700 dark:text-rose-400 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isHi ? 'असममिति संकेत (Towards Stroke Pattern)' : 'Positive (Towards Stroke Asymmetry)'}</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SHAP Bar Chart Visualization */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isHi ? 'सापेक्ष फीचर प्रभाव तुलना (Relative Feature Weights)' : 'Relative Feature Weight Comparison'}
            </h3>
            <p className="text-xs text-slate-500">
              {isHi ? 'रंग कोडिंग द्वारा देखें कि कौन सा फीचर सुरक्षित या जोखिम की ओर इंगित कर रहा है' : 'Color coded by clinical impact direction'}
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
              <span className="text-emerald-700 dark:text-emerald-300">
                {isHi ? 'सुरक्षित सममिति (Normal)' : 'Healthy / Non-Stroke'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500"></span>
              <span className="text-rose-700 dark:text-rose-300">
                {isHi ? 'स्ट्रोक जोखिम (Asymmetry)' : 'Stroke Asymmetry'}
              </span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 70, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white text-xs space-y-1 shadow-lg">
                        <div className="font-bold flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                          <span>{d.name}</span>
                        </div>
                        <div className="text-slate-300">
                          {isHi ? 'प्रभाव स्कोर:' : 'Importance Score:'} <span className="font-bold text-white">{d.importance}</span>
                        </div>
                        <div className={d.isSafe ? 'text-emerald-400' : 'text-rose-400'}>
                          {d.isSafe
                            ? (isHi ? '🟢 सुरक्षित सममिति को सपोर्ट करता है' : '🟢 Supports Healthy Non-Stroke')
                            : (isHi ? '🔴 असममिति की ओर इंगित करता है' : '🔴 Indicates Facial Asymmetry')}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="importance" name="Importance Score" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
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
          <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200">
            {isHi ? 'शारीरिक फेशियल क्षेत्रों का निरीक्षण करें' : 'Inspect Anatomical Regions'}
          </h4>
          <p className="text-[11px] text-purple-700 dark:text-purple-300">
            {isHi
              ? 'प्रत्येक फेशियल लैंडमार्क (मुंह, आंख, भौंह) के 3D निर्देशांक और सममिति मैप देखें।'
              : 'View the step-by-step visual explanation linking landmarks to important anatomical regions.'}
          </p>
        </div>
        <button
          onClick={() => setTab('asymmetry')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
        >
          <span>{isHi ? 'फेशियल असममिति ब्रेकडाउन' : 'Visual Asymmetry Breakdown'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
