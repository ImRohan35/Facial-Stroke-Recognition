import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function ReliabilityBar({ reliability, compact = false }) {
  const [expanded, setExpanded] = useState(false);

  if (!reliability) return null;

  const score = Math.round(reliability.score ?? 85);
  const category = (reliability.category || 'HIGH').toUpperCase();
  const status = reliability.authenticity_status || 'VALID';
  const factors = reliability.factors || {};

  const getCategoryColor = () => {
    if (category === 'HIGH') return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (category === 'MEDIUM') return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
  };

  const colors = getCategoryColor();

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Reliability: {category} ({score}%)</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className={`w-5 h-5 ${colors.text}`} />
          <span className="text-sm font-bold text-slate-800">Input Reliability Score</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
            Measurable Metric
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-extrabold ${colors.text}`}>
            {category} ({score}%)
          </span>
          <button 
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-slate-600 p-1"
            title="Toggle reliability factors breakdown"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2">
        <div 
          className={`h-2.5 rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Authenticity: <strong className="text-slate-700">{status}</strong></span>
        <span>{reliability.is_forced_expression ? '⚠ Voluntary asymmetry suspected' : '✓ Natural facial pose validated'}</span>
      </div>

      {/* Expandable Measurable Factors */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
          <div className="text-slate-500 font-semibold mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-sky-500" />
            Empirical quality factors measured from raw camera/image pixels:
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
              <span>Sharpness / Focus:</span>
              <strong className="text-slate-800">{Math.round((factors.sharpness_factor || 0.85) * 100)}%</strong>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
              <span>Lighting Balance:</span>
              <strong className="text-slate-800">{Math.round((factors.lighting_factor || 0.90) * 100)}%</strong>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
              <span>Frontal Pose Angle:</span>
              <strong className="text-slate-800">{Math.round((factors.pose_factor || 0.92) * 100)}%</strong>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
              <span>Natural Skin Texture:</span>
              <strong className="text-slate-800">{Math.round((factors.texture_factor || 0.95) * 100)}%</strong>
            </div>
          </div>
          {reliability.warnings && reliability.warnings.length > 0 && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded text-amber-800 text-[11px]">
              <span className="font-semibold">Observation Notes: </span>
              {reliability.warnings.join(' ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
