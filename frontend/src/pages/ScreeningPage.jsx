import React, { useState, useEffect } from 'react';
import {
  Camera, Upload, Video, ShieldCheck, CheckCircle2,
  Sparkles, ArrowRight, Brain, AlertCircle, Info
} from 'lucide-react';
import { getSampleCases, analyzeScreeningImage } from '../services/api';

export const ScreeningPage = ({ setTab, onScreeningComplete }) => {
  const [samples, setSamples] = useState([]);
  const [loadingSample, setLoadingSample] = useState(false);
  const [evalError, setEvalError] = useState('');

  useEffect(() => {
    loadSampleCases();
  }, []);

  const loadSampleCases = async () => {
    try {
      const data = await getSampleCases();
      setSamples(data.samples || []);
    } catch (err) {
      console.error("Error loading sample cases:", err);
    }
  };

  const handleTestSample = async (sample) => {
    if (!sample.image_base64) {
      setEvalError("Sample image data is not available on this local deployment.");
      return;
    }
    setLoadingSample(true);
    setEvalError('');
    try {
      const formData = new FormData();
      formData.append('image_base64', sample.image_base64);
      formData.append('assessment_type', 'UPLOAD');

      const result = await analyzeScreeningImage(formData);
      if (onScreeningComplete) {
        onScreeningComplete(result);
      }
    } catch (err) {
      setEvalError(err.response?.data?.detail || "Error evaluating sample image.");
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold">
          <Camera className="w-3.5 h-3.5 text-sky-600" />
          <span>Multimodal Screening Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          AI Facial Asymmetry Screening
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Choose an input modality below to extract MediaPipe landmarks and compute distance-invariant facial asymmetry.
        </p>
      </div>

      {evalError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{evalError}</span>
        </div>
      )}

      {/* 3 Main Modality Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Modality 1: Image Upload */}
        <div
          onClick={() => setTab('upload')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-slate-800 flex items-center justify-center text-sky-600 mb-4 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Upload From Gallery</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Upload a front-facing portrait photo (JPG, JPEG, PNG). The system performs quality checks and landmark extraction.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:text-sky-700">
            <span>Select Image File</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Modality 2: Camera Capture */}
        <div
          onClick={() => setTab('camera')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-slate-800 flex items-center justify-center text-teal-600 mb-4 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Live Camera Capture</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Open your device camera with an interactive oval face guide for optimal lighting and frontal angle alignment.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 group-hover:text-teal-700">
            <span>Open Camera</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Modality 3: Video Sequence */}
        <div
          onClick={() => setTab('video')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Video Landmark Sequence</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Record or upload a 5-second video to track dynamic facial landmark movements, velocity, and temporal asymmetry.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
            <span>Analyze Video Sequence</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Pre-loaded Benchmark Sample Cases */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Instant Test: Kaggle Clinical Dataset Cohort Samples</span>
            </h3>
            <p className="text-xs text-slate-500">
              Test actual acute stroke patterns and healthy controls with real ML inference without needing a camera.
            </p>
          </div>
          {loadingSample && (
            <span className="text-xs font-semibold text-sky-600 animate-pulse">Running inference...</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {samples.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.expected_prediction === 'stroke_associated' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {s.expected_prediction === 'stroke_associated' ? 'Stroke Case' : 'Control Case'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{s.filename}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{s.description}</p>
              </div>

              <button
                type="button"
                disabled={loadingSample}
                onClick={() => handleTestSample(s)}
                className="w-full py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <span>Test This Case</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
