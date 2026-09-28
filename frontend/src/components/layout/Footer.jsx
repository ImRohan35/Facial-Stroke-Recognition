import React from 'react';
import { Brain, Shield, Info, HeartPulse } from 'lucide-react';

export const Footer = ({ setTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Stroke Recognition AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              An Explainable AI-Based Stroke Recognition and Facial Asymmetry Analysis Platform using MediaPipe 468-point 3D facial landmarks, geometric feature engineering, and Machine Learning.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Trained on Kaggle Annotated Facial Images Dataset (3,715 cohorts)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Project Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setTab('landing')} className="hover:text-white transition-colors cursor-pointer">
                  Public Landing Page
                </button>
              </li>
              <li>
                <button onClick={() => setTab('about')} className="hover:text-white transition-colors cursor-pointer">
                  About Project & Provenance
                </button>
              </li>
              <li>
                <button onClick={() => setTab('how-it-works')} className="hover:text-white transition-colors cursor-pointer">
                  How It Works Pipeline
                </button>
              </li>
              <li>
                <button onClick={() => setTab('screening')} className="hover:text-white transition-colors cursor-pointer">
                  AI Screening (Image & Video)
                </button>
              </li>
              <li>
                <button onClick={() => setTab('models')} className="hover:text-white transition-colors cursor-pointer">
                  Model Version Benchmarks
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Research Disclaimer</h4>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] leading-relaxed text-slate-300">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Screening System Only</span>
              </div>
              This application provides AI-assisted facial pattern analysis for research and screening purposes and is not a substitute for clinical diagnosis. It is not a clinical diagnostic device.
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Stroke Recognition AI Research Project. All rights reserved.</p>
          <div className="flex space-x-6 mt-3 sm:mt-0">
            <span>MediaPipe FaceLandmarker</span>
            <span>XGBoost / Random Forest</span>
            <span>SHAP Explainable AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
