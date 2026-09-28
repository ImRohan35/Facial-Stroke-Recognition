import React from 'react';
import {
  Brain, ShieldCheck, Database, GitBranch, Cpu, FileText,
  AlertCircle, CheckCircle2, ChevronRight, Layers, ArrowLeft
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const AboutPage = ({ setTab }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fbfe] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar setTab={setTab} currentTab="about" />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Back Link */}
        <button
          onClick={() => setTab('landing')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        {/* Title Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold">
            <Brain className="w-3.5 h-3.5 text-sky-600" />
            <span>Academic & Scientific Research Foundation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            About the Project
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Explainable AI-Based Stroke Recognition Using Facial Asymmetry and Facial Landmark Sequence Analysis with Machine Learning.
          </p>
        </div>

        {/* Clinical Disclaimer Callout */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Essential Research & Screening System Disclaimer</span>
          </div>
          <p className="leading-relaxed">
            This platform is an AI-assisted research and early-screening system designed to detect facial asymmetry patterns.
            It is <strong>NOT a clinical diagnostic device</strong> and cannot substitute for an urgent in-person evaluation by a qualified medical doctor, neurologist, or emergency services.
          </p>
        </div>

        {/* Section 1: Objective & Technical Contribution */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-sky-600" />
            <span>Primary Research Focus & Technical Contribution</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The project addresses the critical challenge of objective, non-invasive stroke screening by analyzing subtle unilateral facial motor impairment. 
            When acute neurological ischemic events occur, central facial nerve paresis typically causes lower facial droop, oral commissure deviation, and frontalis tone asymmetry.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 block mb-1">01. Computer Vision</span>
              <p className="text-xs text-slate-600 dark:text-slate-300">MediaPipe 468-point 3D landmark mesh with IOD scale normalization.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block mb-1">02. Machine Learning</span>
              <p className="text-xs text-slate-600 dark:text-slate-300">Benchmarked across XGBoost, Random Forest, SVM, and Logistic Regression.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block mb-1">03. Explainable AI</span>
              <p className="text-xs text-slate-600 dark:text-slate-300">SHAP feature attributions explaining model decisions without black-box obscurity.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Real Clinical Dataset Provenance */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-teal-600" />
            <span>Dataset Provenance & Class Cohorts</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The machine learning pipeline is integrated with and trained upon the peer-reviewed Kaggle dataset:
            <strong className="block text-slate-800 dark:text-slate-200 mt-1">Annotated Facial Images for Stroke Classification by Abdussalam Elhanashy (CC BY-SA 4.0).</strong>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <span className="text-2xl font-black text-sky-600">3,749</span>
              <span className="block text-[11px] text-slate-500 mt-1">Total Source Images</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <span className="text-2xl font-black text-emerald-600">3,715</span>
              <span className="block text-[11px] text-slate-500 mt-1">Extracted Landmarks (99.09%)</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <span className="text-2xl font-black text-rose-600">1,244</span>
              <span className="block text-[11px] text-slate-500 mt-1">Stroke Cohort (33.5%)</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <span className="text-2xl font-black text-indigo-600">2,471</span>
              <span className="block text-[11px] text-slate-500 mt-1">Control Cohort (66.5%)</span>
            </div>
          </div>
        </section>

        {/* Section 3: Data Leakage Prevention & False Positive Control */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            <span>Data Leakage Prevention & False Positive Control</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-300">
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Subject-Level Split</h3>
              <p className="leading-relaxed">
                To guarantee zero data leakage, images belonging to identical individuals remain strictly within either the training, validation, or test partition. Testing is performed exclusively on subjects unseen during training.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">False Positive Control</h3>
              <p className="leading-relaxed">
                Rather than optimizing purely for raw accuracy, our validation protocol tunes decision thresholds to balance high sensitivity (Recall) with verified specificity, reporting full confusion matrices and False Positive Rates.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-4">
          <button
            onClick={() => setTab('screening')}
            className="px-8 py-3.5 rounded-xl font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md transition-all cursor-pointer text-sm"
          >
            Launch Facial Screening Now
          </button>
        </div>
      </main>

      <Footer setTab={setTab} />
    </div>
  );
};
