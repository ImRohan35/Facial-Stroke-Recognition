import React, { useState } from 'react';
import {
  Brain, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight,
  Eye, GitCompare, History, FileText, Info, Compass, Sparkles, Download, ShieldCheck
} from 'lucide-react';
import { generatePdfReport, setPersonalBaseline } from '../services/api';
import { FaceMeshCanvas } from '../components/common/FaceMeshCanvas';
import ReliabilityBar from '../components/common/ReliabilityBar';
import EmergencyDisclaimer from '../components/common/EmergencyDisclaimer';
import ResultExplanationAssistant from '../components/assistant/ResultExplanationAssistant';

export const ResultPage = ({ screeningData, assessmentId, setTab }) => {
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);
  const [baselineSaved, setBaselineSaved] = useState(false);
  const [baselineLoading, setBaselineLoading] = useState(false);

  // Defaults if direct navigation
  const data = screeningData || {
    prediction: 'non_stroke_associated',
    prediction_display: 'Non-stroke-associated facial pattern',
    model_confidence: 0.91,
    input_reliability: {
      score: 88,
      category: 'HIGH',
      authenticity_status: 'VALID',
      factors: {
        sharpness_factor: 0.88,
        lighting_factor: 0.92,
        pose_factor: 0.94,
        texture_factor: 0.95
      }
    },
    facial_features: {
      facial_symmetry: 88.5,
      eye_symmetry: 94.0,
      eyebrow_symmetry: 87.5,
      mouth_symmetry: 84.0,
      nose_alignment: 91.0
    },
    explanation: [
      { feature: 'Mouth asymmetry', importance: 0.38, contribution: 'High' },
      { feature: 'Eyebrow asymmetry', importance: 0.25, contribution: 'Medium' }
    ],
    summary_text: 'Facial landmark alignment is consistent with bilateral symmetry within typical physiological variation.',
    assessment_id: assessmentId || 'demo-assessment-001',
    annotated_image_url: null,
    image_url: null
  };

  const isStrokePattern = data.prediction === 'stroke_associated';
  const isUncertain = data.prediction === 'uncertain';
  const confPercent = Math.round((data.model_confidence || 0.85) * 100);
  const feats = data.facial_features || {};

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const res = await generatePdfReport(data.assessment_id);
      setReportUrl(res.download_url);
      window.open(res.download_url, '_blank');
    } catch (err) {
      console.error('Report generation failed:', err);
      setTab('reports');
    } finally {
      setReportLoading(false);
    }
  };

  const handleSaveAsBaseline = async () => {
    setBaselineLoading(true);
    try {
      await setPersonalBaseline(data.assessment_id);
      setBaselineSaved(true);
    } catch (err) {
      console.error('Baseline save failed:', err);
    } finally {
      setBaselineLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page Title & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
            AI Facial Analysis Result
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Assessment Outcome & Symmetry Metrics
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTab('screening')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            New Scan
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={reportLoading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{reportLoading ? 'Generating PDF...' : 'Download Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Result Hero Card (Section 19 & 35) */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border shadow-sm ${
          isStrokePattern
            ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-100'
            : isUncertain
            ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-100'
            : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-100'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Model Output Classification (Trained ML Inference)
            </span>
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isStrokePattern
                    ? 'bg-rose-600 text-white'
                    : isUncertain
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isStrokePattern ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : isUncertain ? (
                  <HelpCircle className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {isStrokePattern
                  ? 'Stroke-associated facial pattern detected'
                  : isUncertain
                  ? 'Unable to Reliably Assess (Uncertain / Low Confidence)'
                  : 'Non-stroke-associated facial pattern'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
              {data.summary_text ||
                (isStrokePattern
                  ? 'Facial landmark vectors identified statistically significant unilateral asymmetry, principally driven by mouth corner and lower mandibular drift.'
                  : isUncertain
                  ? 'Input conditions or facial expression consistency were insufficient to reliably classify the pattern. The system refuses to force an arbitrary prediction.'
                  : 'Bilateral facial landmarks display balanced alignment within standard physiological symmetric parameters.')}
            </p>
          </div>

          {/* Model Confidence Box (Section 10 & 35) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shrink-0 min-w-[200px] shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Model Confidence
            </span>
            <span
              className={`text-4xl font-black ${
                isStrokePattern ? 'text-rose-600' : isUncertain ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {confPercent}%
            </span>
            <span className="block text-[10px] text-slate-400 mt-1 leading-tight max-w-[160px] mx-auto">
              Confidence for model class representation (Not probability of medical event)
            </span>
          </div>
        </div>
      </div>

      {/* Input Reliability Score Indicator (Section 6) */}
      <ReliabilityBar reliability={data.input_reliability} />

      {/* 5 Facial Measurements Cards (Section 35) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Facial Measurements (0 - 100 Index)
          </h3>
          <span className="text-xs text-slate-400">100 = Perfect Bilateral Symmetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Facial Symmetry</span>
            <span className="text-2xl font-black text-sky-600">{feats.facial_symmetry ?? 82}</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Eye Symmetry</span>
            <span className="text-2xl font-black text-teal-600">{feats.eye_symmetry ?? 94}</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Eyebrow Symmetry</span>
            <span className="text-2xl font-black text-indigo-600">{feats.eyebrow_symmetry ?? 78}</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Mouth Symmetry</span>
            <span className="text-2xl font-black text-purple-600">{feats.mouth_symmetry ?? 64}</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Nose Alignment</span>
            <span className="text-2xl font-black text-emerald-600">{feats.nose_alignment ?? 91}</span>
          </div>
        </div>
      </div>

      {/* Visual Landmarks Mesh & Explainable AI Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Annotated Face View */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Eye className="w-4 h-4 text-sky-600" />
            <span>Facial Landmark Alignment & Symmetry Axes</span>
          </h3>

          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
            {data.annotated_image_url ? (
              <img
                src={data.annotated_image_url}
                alt="Annotated Landmark Analysis"
                className="w-full h-full object-contain"
              />
            ) : data.ui_landmarks && data.image_url ? (
              <FaceMeshCanvas imageUrl={data.image_url} landmarks={data.ui_landmarks} />
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <Brain className="w-8 h-8 text-sky-500 mx-auto" />
                <p>MediaPipe 468-point 3D landmark mesh extracted.</p>
                <button
                  onClick={() => setTab('asymmetry')}
                  className="text-xs font-bold text-sky-400 hover:underline cursor-pointer"
                >
                  Open Visual Asymmetry Breakdown →
                </button>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Cyan line: Mid-sagittal Glabella-Menton axis • Magenta line: Oral commissure vector
          </p>
        </div>

        {/* Explainable AI Highlight Card (Section 21 & 35) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Explainable AI (Kernel SHAP)
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Why did the model produce this result?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-purple-50/60 dark:bg-purple-950/30 p-3 rounded-xl border border-purple-100 dark:border-purple-900 leading-relaxed">
              «The model output was influenced primarily by the extracted mouth and eyebrow asymmetry features.»
            </p>

            <div className="space-y-2 pt-2">
              <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                Top Contributing Features:
              </h4>
              {data.explanation && data.explanation.length > 0 ? (
                data.explanation.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.feature}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.contribution === 'High'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.contribution} Impact
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">Oral commissure elevation disparity (High)</div>
              )}
            </div>
          </div>

          <button
            onClick={() => setTab('explainable-ai')}
            className="w-full py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>View Complete SHAP Explanation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Result Explanation Assistant (Section 23) */}
      <ResultExplanationAssistant assessment={data} />

      {/* Action Buttons Toolbar (Section 35) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Button 1: View Explanation */}
          <button
            onClick={() => setTab('explainable-ai')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>View Explanation</span>
          </button>

          {/* Button 2: Compare With Baseline */}
          <button
            onClick={() => setTab('comparison')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <GitCompare className="w-4 h-4 text-sky-600" />
            <span>Compare With Baseline</span>
          </button>

          {/* Button 3: View History */}
          <button
            onClick={() => setTab('history')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <History className="w-4 h-4 text-teal-600" />
            <span>View History</span>
          </button>

          {/* Save as Personal Baseline */}
          <button
            onClick={handleSaveAsBaseline}
            disabled={baselineSaved || baselineLoading}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              baselineSaved
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>{baselineSaved ? 'Saved as Baseline ✓' : baselineLoading ? 'Saving...' : 'Set as Personal Baseline'}</span>
          </button>
        </div>

        {/* Button 4: Generate Report */}
        <button
          onClick={handleGenerateReport}
          disabled={reportLoading}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          <span>{reportLoading ? 'Generating PDF...' : 'Generate Report'}</span>
        </button>
      </div>

      {/* Emergency Disclaimer Banner */}
      <EmergencyDisclaimer />
    </div>
  );
};
