import React from 'react';
import {
  Camera, ShieldCheck, Eye, Cpu, Sparkles, ArrowRight,
  Compass, FileText, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const HowItWorksPage = ({ setTab }) => {
  const pipelineSteps = [
    {
      step: 'Step 01',
      title: 'Facial Input Acquisition',
      desc: 'Users provide an image via gallery upload, capture a high-resolution snapshot with real-time oval face guide, or record a short video sequence.',
      icon: <Camera className="w-6 h-6 text-sky-600" />,
      details: [
        'Supports standard formats: JPG, JPEG, PNG, WEBM',
        'In-browser oval face boundary guide for camera orientation',
        'No permanent image retention without explicit assessment submission'
      ]
    },
    {
      step: 'Step 02',
      title: 'Image Quality Validation Guard',
      desc: 'Before executing ML inference, the system validates the image to protect against unreliable predictions.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      details: [
        'Single-face presence verification (flags multi-face or zero-face scenes)',
        'Laplacian variance blur detector and luminance exposure check',
        '3D head pose estimation (flags pitch/yaw rotation > 35°)'
      ]
    },
    {
      step: 'Step 03',
      title: 'MediaPipe 468-Point 3D Landmarking',
      desc: 'MediaPipe FaceLandmarker detects 468 precise coordinates across all facial landmarks.',
      icon: <Eye className="w-6 h-6 text-teal-600" />,
      details: [
        'Bilateral tracking: Oral commissures (61, 291), Eye pupils (33, 263)',
        'Eyebrow peaks (105, 334), Nose midline (1, 9, 168), Jaw contour (234, 454)',
        'Yields robust landmarks invariant to subtle perspective differences'
      ]
    },
    {
      step: 'Step 04',
      title: 'Geometric Normalization & Feature Extraction',
      desc: 'Normalizes coordinates by Inter-Ocular Distance (IOD) and rotates face to Glabella-Menton vertical axis.',
      icon: <Cpu className="w-6 h-6 text-indigo-600" />,
      details: [
        'Scale normalization: Removes dependency on distance from camera',
        'Mid-sagittal axis alignment: Removes head tilt variance',
        'Extracts mouth asymmetry, eye ptosis ratio, eyebrow elevation, and nose deviation'
      ]
    },
    {
      step: 'Step 05',
      title: 'Machine Learning Model Inference',
      desc: 'Feeds distance-invariant features into the trained ML model with calibrated decision thresholds.',
      icon: <Cpu className="w-6 h-6 text-purple-600" />,
      details: [
        'Prediction states: Stroke-associated, Non-stroke-associated, or Uncertain',
        'Trained on subject-level splits from Kaggle stroke dataset',
        'Calibrated confidence scores (labeled as statistical model confidence, not medical probability)'
      ]
    },
    {
      step: 'Step 06',
      title: 'Explainable AI (SHAP Attribution)',
      desc: 'Computes SHAP (SHapley Additive exPlanations) values to rank which anatomical features influenced the output.',
      icon: <Sparkles className="w-6 h-6 text-pink-600" />,
      details: [
        'Ranks features by High, Medium, Low contribution levels',
        'Shows direction of impact towards stroke or non-stroke pattern',
        'Renders landmark overlays on the user photo for visual confirmation'
      ]
    },
    {
      step: 'Step 07',
      title: 'Baseline Comparison & Reports',
      desc: 'Stores results in user history, compares against personal healthy baseline, and exports clinical PDF reports.',
      icon: <FileText className="w-6 h-6 text-rose-600" />,
      details: [
        'Compares current assessment with user baseline to isolate acute changes',
        'Longitudinal Recharts telemetry tracking measurements over weeks',
        'One-click professional PDF report generation with ReportLab'
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fbfe] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar setTab={setTab} currentTab="how-it-works" />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <button
          onClick={() => setTab('landing')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold">
            <Cpu className="w-3.5 h-3.5 text-sky-600" />
            <span>End-to-End Pipeline Walkthrough</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How the Screening System Works
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            A comprehensive, multi-stage engineering pipeline transforming facial images into explainable clinical insights.
          </p>
        </div>

        {/* Step-by-Step Cards */}
        <div className="space-y-6">
          {pipelineSteps.map((p, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs card-hover flex flex-col md:flex-row md:items-start gap-6"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-xs">
                {p.icon}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider">{p.step}</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{p.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {p.desc}
                </p>
                <ul className="space-y-1 pt-2">
                  {p.details.map((d, dIdx) => (
                    <li key={dIdx} className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Action Callout */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-600 text-white text-center space-y-4 shadow-lg shadow-sky-500/20">
          <h3 className="text-2xl font-bold">Experience the Analysis Live</h3>
          <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto">
            Test the pipeline with pre-loaded Kaggle clinical dataset samples or capture your own facial symmetry profile.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setTab('screening')}
              className="px-8 py-3.5 rounded-xl bg-white text-sky-800 font-bold hover:bg-sky-50 shadow-md transition-colors cursor-pointer text-sm"
            >
              Launch Screening Hub
            </button>
          </div>
        </div>
      </main>

      <Footer setTab={setTab} />
    </div>
  );
};
