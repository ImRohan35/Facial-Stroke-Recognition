import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';

export default function EmergencyDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Screening & Research Tool:</span> This application does NOT provide medical diagnosis. If acute symptoms or sudden weakness occur, seek emergency care immediately.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 my-4 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
        </div>
        <div className="flex-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-2">
            Important Clinical & Emergency Care Notice
          </h4>
          <p className="mb-2 text-slate-600">
            This AI system analyzes facial patterns associated with the classes represented in its training data. It is an AI-assisted research and screening platform and <strong>NOT a clinical diagnostic device</strong>.
          </p>
          <div className="bg-white/80 rounded-lg p-2.5 border border-amber-200/60 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-amber-900 font-medium">
              Experiencing acute facial droop, arm weakness, speech difficulty, or severe sudden headache?
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white font-bold rounded-md tracking-wide">
              <PhoneCall className="w-3.5 h-3.5" /> Call Emergency Services (911 / 112 / 108) Immediately
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
