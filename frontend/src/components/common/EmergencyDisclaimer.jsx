import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';

export default function EmergencyDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div>
            <span className="font-bold">Medical Screening Prototype:</span> This software does not provide medical diagnosis or rule out stroke. If you or someone around you experiences sudden facial droop, arm weakness, or slurred speech, call <strong>112 (India)</strong> or <strong>911 (US)</strong> immediately.
          </div>
          <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
            Golden Window: Thrombolytic therapy must begin within 3 to 4.5 hours of symptom onset.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-5 my-4 shadow-xs">
      <div className="flex items-start space-x-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="font-black text-amber-950 dark:text-amber-100 flex items-center gap-2">
              Important Clinical & Medical Safety Notice
            </h4>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 self-start sm:self-auto">
              Screening Prototype
            </span>
          </div>
          
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            StrokeCare AI evaluates geometric facial landmark symmetry patterns. It is an AI-assisted research and screening tool and <strong>NOT a clinical diagnostic device</strong>. Facial landmarks alone cannot confirm or rule out stroke. A negative or symmetric outcome <strong>does not guarantee the absence of a stroke</strong> (such as posterior circulation or non-facial ischemic events).
          </p>

          <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-3 border border-amber-200/60 dark:border-amber-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-amber-950 dark:text-amber-100 font-bold block">
                F.A.S.T. Warning Signs: Sudden facial droop, arm weakness, speech difficulty?
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                The Golden Window: Emergency IV thrombolytic intervention is critical within 3 to 4.5 hours of onset.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition"
              >
                <PhoneCall className="w-3.5 h-3.5" /> India: Call 112
              </a>
              <a
                href="tel:911"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs shadow-xs transition"
              >
                <PhoneCall className="w-3.5 h-3.5" /> US: Call 911
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
