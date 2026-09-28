import React, { useState } from 'react';
import {
  Eye, ArrowRight, ArrowLeft, Layers, CheckCircle2,
  AlertTriangle, Brain, Sparkles, Filter
} from 'lucide-react';
import { FaceMeshCanvas } from '../components/common/FaceMeshCanvas';

export const FacialAsymmetryPage = ({ screeningData, setTab }) => {
  const [activeRegion, setActiveRegion] = useState('all'); // 'all', 'mouth', 'eyes', 'eyebrows', 'nose'

  const data = screeningData || {
    prediction: 'non_stroke_associated',
    prediction_display: 'Non-stroke-associated facial pattern',
    model_confidence: 0.91,
    image_url: null,
    annotated_image_url: null,
    facial_features: {
      facial_symmetry: 88.5,
      eye_symmetry: 94.0,
      eyebrow_symmetry: 87.5,
      mouth_symmetry: 84.0,
      nose_alignment: 91.0,
      jaw_symmetry: 89.0
    },
    ui_landmarks: []
  };

  const feats = data.facial_features || {};

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => setTab('result')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Assessment Result</span>
      </button>

      {/* Header (Section 22) */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
          Visual Anatomical Explanation
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Why did the model produce this result?
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Tracing the reasoning path from raw facial pixels to landmark mesh, regional geometry extraction, and model output.
        </p>
      </div>

      {/* 5-Step Visual Reasoning Flow (Section 22 Flowchart) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Reasoning Architecture Workflow
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center">
            <span className="text-[10px] font-extrabold text-sky-600">STEP 1</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Original Image</span>
            <span className="text-[10px] text-slate-400 mt-0.5">High-Res Capture</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center">
            <span className="text-[10px] font-extrabold text-teal-600">STEP 2</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Facial Landmarks</span>
            <span className="text-[10px] text-slate-400 mt-0.5">MediaPipe 468 3D Mesh</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center">
            <span className="text-[10px] font-extrabold text-indigo-600">STEP 3</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Important Regions</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Mouth, Brows, Eyes</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center">
            <span className="text-[10px] font-extrabold text-purple-600">STEP 4</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Feature Contributions</span>
            <span className="text-[10px] text-slate-400 mt-0.5">SHAP Attribution</span>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex flex-col justify-center items-center">
            <span className="text-[10px] font-extrabold text-sky-600 dark:text-sky-300">STEP 5</span>
            <span className="text-xs font-bold text-sky-900 dark:text-sky-200 mt-1">Model Output</span>
            <span className="text-[10px] text-sky-700 dark:text-sky-400 mt-0.5">{data.prediction_display}</span>
          </div>
        </div>
      </div>

      {/* Interactive Landmark & Regional Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas / Image Viewport */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Anatomical Mesh & Regional Overlay</span>
            </h3>

            {/* Region Filter Buttons */}
            <div className="flex items-center space-x-1 text-xs">
              <button
                onClick={() => setActiveRegion('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeRegion === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveRegion('mouth')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeRegion === 'mouth' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Mouth
              </button>
              <button
                onClick={() => setActiveRegion('eyes')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeRegion === 'eyes' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Eyes
              </button>
              <button
                onClick={() => setActiveRegion('eyebrows')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeRegion === 'eyebrows' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Brows
              </button>
            </div>
          </div>

          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
            {data.annotated_image_url ? (
              <img
                src={data.annotated_image_url}
                alt="Face Mesh Overlay"
                className="w-full h-full object-contain"
              />
            ) : (data.image_url ? (
              <FaceMeshCanvas
                imageUrl={data.image_url}
                landmarks={data.ui_landmarks}
                highlightRegion={activeRegion}
              />
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <Brain className="w-8 h-8 text-sky-500 mx-auto" />
                <p>MediaPipe landmark visualization rendered directly from bilateral 3D coordinates.</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Avoids speculative medical heatmaps: highlights verified landmark geometric boundaries.
          </p>
        </div>

        {/* Region Breakdown Cards */}
        <div className="space-y-4">
          {/* Mouth Region (Section 22) */}
          <div className={`p-4 rounded-xl border transition-all ${
            activeRegion === 'mouth' || activeRegion === 'all'
              ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Mouth Asymmetry</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">Important Feature</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Oral commissure elevation (Landmarks 61 vs 291). Significant indicator of acute unilateral lower facial weakness.
            </p>
            <div className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Symmetry Index: <span className="font-bold text-rose-600">{feats.mouth_symmetry || 64}/100</span>
            </div>
          </div>

          {/* Eyebrow Region (Section 22) */}
          <div className={`p-4 rounded-xl border transition-all ${
            activeRegion === 'eyebrows' || activeRegion === 'all'
              ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Eyebrow Asymmetry</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">Important Feature</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Frontalis muscle arch elevation disparity (Landmarks 105 vs 334). Evaluates upper facial motor involvement.
            </p>
            <div className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Symmetry Index: <span className="font-bold text-indigo-600">{feats.eyebrow_symmetry || 78}/100</span>
            </div>
          </div>

          {/* Eye Opening Region */}
          <div className={`p-4 rounded-xl border transition-all ${
            activeRegion === 'eyes' || activeRegion === 'all'
              ? 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300">Eye Symmetry</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">Low-Moderate</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Palpebral fissure height balance. Compares bilateral eye aperture ratios (Landmarks 159-145 vs 386-374).
            </p>
            <div className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Symmetry Index: <span className="font-bold text-teal-600">{feats.eye_symmetry || 94}/100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
