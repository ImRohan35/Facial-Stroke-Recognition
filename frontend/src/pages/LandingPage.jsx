import React from 'react';
import {
  Brain, Camera, ArrowRight, ShieldCheck, Activity, Eye,
  BarChart3, Sparkles, ChevronRight, CheckCircle2, FileText,
  Clock, GitCompare, UserCheck, Stethoscope, Cpu, Layers
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const LandingPage = ({ setTab }) => {
  const steps = [
    {
      num: '01',
      title: 'Upload / Capture',
      desc: 'Select a facial photo from gallery or capture with device camera with real-time oval face guide.',
      icon: <Camera className="w-5 h-5 text-sky-600" />
    },
    {
      num: '02',
      title: 'Facial Landmark Detection',
      desc: 'MediaPipe 468-point 3D Face Landmarker maps bilateral contours with IOD scale normalization.',
      icon: <Eye className="w-5 h-5 text-teal-600" />
    },
    {
      num: '03',
      title: 'AI Analysis',
      desc: 'Trained Machine Learning algorithms (XGBoost, Random Forest, SVM) evaluate asymmetry patterns.',
      icon: <Cpu className="w-5 h-5 text-indigo-600" />
    },
    {
      num: '04',
      title: 'Explainable Result',
      desc: 'SHAP feature attribution highlights anatomical features that drove the prediction.',
      icon: <Sparkles className="w-5 h-5 text-purple-600" />
    }
  ];

  const features = [
    {
      icon: <Eye className="w-5 h-5 text-sky-600" />,
      title: 'Facial Landmark Analysis',
      desc: '468 anatomical 3D points track oral commissure elevation, palpebral fissure balance, and frontalis arch.'
    },
    {
      icon: <Brain className="w-5 h-5 text-teal-600" />,
      title: 'Stroke-Associated Pattern Recognition',
      desc: 'Identifies unilateral facial paralysis and asymmetry signatures correlated with acute stroke presentations.'
    },
    {
      icon: <Cpu className="w-5 h-5 text-indigo-600" />,
      title: 'Machine Learning',
      desc: 'Benchmarked across XGBoost, Random Forest, SVM, and Logistic Regression on 3,715 clinical cohort images.'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      title: 'Explainable AI (SHAP)',
      desc: 'SHapley Additive exPlanations quantify feature importance so clinicians understand why a result was produced.'
    },
    {
      icon: <Layers className="w-5 h-5 text-sky-600" />,
      title: 'Personal Baseline',
      desc: 'Store your healthy facial symmetry profile to differentiate natural asymmetry from acute changes.'
    },
    {
      icon: <Clock className="w-5 h-5 text-emerald-600" />,
      title: 'Assessment History',
      desc: 'Audit-ready chronological scan repository with filterable records, measurements, and model confidence.'
    },
    {
      icon: <Activity className="w-5 h-5 text-amber-600" />,
      title: 'Progress Monitoring',
      desc: 'Interactive Recharts longitudinal telemetry tracking facial, eye, eyebrow, mouth, and nose symmetry over time.'
    },
    {
      icon: <FileText className="w-5 h-5 text-rose-600" />,
      title: 'Doctor Reports',
      desc: 'One-click clinical PDF report generation with ReportLab for collaborative physician review.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fbfe] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar setTab={setTab} currentTab="landing" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/50 via-transparent to-transparent dark:from-sky-950/20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-xs font-bold border border-sky-200/80 dark:border-sky-800 shadow-xs">
              <Brain className="w-3.5 h-3.5 text-sky-600" />
              <span>Research & Screening Platform</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">Kaggle Clinical Dataset Integration</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              AI-Powered Facial Analysis for{' '}
              <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Stroke-Associated Pattern
              </span>{' '}
              Recognition
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Analyze facial asymmetry and landmark patterns using MediaPipe, Machine Learning and Explainable AI.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={() => setTab('screening')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Start Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTab('how-it-works')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Learn More</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setTab('dashboard')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Live Dashboard</span>
              </button>
            </div>

            {/* Quick Demo Cases Notice */}
            <div className="pt-4 flex items-center justify-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero Hardcoded Outputs</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Real SHAP Explanations</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Unseen Subject Split</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Flowchart Section */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-1.5">
              Computational Architecture
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              How It Works Pipeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              From raw camera capture to normalized geometric landmarks, ML inference, and explainable feature ranking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {steps.map((st, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 relative flex flex-col justify-between card-hover"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-xs">
                      {st.icon}
                    </div>
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-600">{st.num}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{st.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Flowchart Connector Representation */}
          <div className="mt-8 p-4 bg-sky-50/70 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-900 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-sky-800 dark:text-sky-300">
            <span>Upload / Capture</span>
            <span>→</span>
            <span>Image Quality Guard</span>
            <span>→</span>
            <span>MediaPipe 468 Landmarks</span>
            <span>→</span>
            <span>Facial Asymmetry Analysis</span>
            <span>→</span>
            <span>ML Prediction (XGBoost/RF)</span>
            <span>→</span>
            <span>Explainable AI (SHAP)</span>
            <span>→</span>
            <span>Clinical PDF Report</span>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-1.5">
              Core Capabilities
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Key Features & Innovations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Full-stack AI platform designed to analyze facial asymmetry and landmark motion sequences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((ft, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                    {ft.icon}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{ft.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ft.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Try-It-Now CTA Banner */}
      <section className="py-12 bg-gradient-to-r from-sky-600 via-teal-600 to-sky-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to evaluate facial landmark asymmetry?</h3>
          <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto">
            Test immediately with our pre-loaded Kaggle clinical dataset samples or upload your own front-facing image.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setTab('screening')}
              className="px-7 py-3 rounded-xl bg-white text-sky-800 font-bold hover:bg-sky-50 shadow-md transition-colors cursor-pointer text-sm"
            >
              Launch AI Screening
            </button>
            <button
              onClick={() => setTab('about')}
              className="px-6 py-3 rounded-xl bg-sky-700/80 hover:bg-sky-700 text-white font-semibold border border-sky-400/40 transition-colors cursor-pointer text-sm"
            >
              Read Research Documentation
            </button>
          </div>
        </div>
      </section>

      <Footer setTab={setTab} />
    </div>
  );
};
