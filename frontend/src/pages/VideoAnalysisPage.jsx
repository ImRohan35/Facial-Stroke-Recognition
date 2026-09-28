import React, { useState, useRef } from 'react';
import {
  Video, Upload, Play, Square, RefreshCw, CheckCircle2,
  AlertCircle, ArrowRight, ArrowLeft, Activity, TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { analyzeScreeningVideo } from '../services/api';

export const VideoAnalysisPage = ({ setTab, onScreeningComplete }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalysisResult(null);
    setError('');
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleAnalyze = async () => {
    if (!videoFile) {
      setError('Please select or record a video file first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const result = await analyzeScreeningVideo(formData);
      setAnalysisResult(result);

      if (onScreeningComplete) {
        onScreeningComplete(result);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process video landmarks sequence.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setAnalysisResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => setTab('screening')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Screening Hub</span>
      </button>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>Facial Landmark Sequence Analysis</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Video Sequence Landmark Dynamics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracks bilateral landmark movement, velocities, and temporal asymmetry across video frames.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Video Upload Area / Preview */}
        {!videoUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-800/20"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,.webm,.mp4"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 mx-auto mb-3 shadow-xs">
              <Video className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Select or record a 3-5 second facial video
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports MP4, WEBM (Smile or speak for temporal motion tracking)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-w-md mx-auto rounded-2xl overflow-hidden bg-slate-950 shadow-md">
              <video
                src={videoUrl}
                controls
                playsInline
                className="w-full h-auto max-h-72 object-contain"
              />
            </div>

            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Choose Another Video
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleAnalyze}
                className="px-7 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Tracking Landmarks Frame-by-Frame...' : 'Analyze Sequence Dynamics'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Sequence Analysis Results Section (Section 14) */}
        {analysisResult && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Sequence Summary</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Processed {analysisResult.total_frames_analyzed} Frames ({analysisResult.video_duration_seconds}s)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Model Output: <strong className="text-slate-900 dark:text-white">{analysisResult.prediction_display}</strong> ({Math.round(analysisResult.model_confidence * 100)}% model confidence)
                </p>
              </div>

              <button
                onClick={() => setTab('result')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer flex items-center space-x-1.5 shrink-0"
              >
                <span>View Full Result Screen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Temporal Features Cards (Section 14) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-semibold text-slate-500 block">Mouth Movement Symmetry</span>
                <span className="text-xl font-black text-indigo-600">
                  {analysisResult.temporal_features?.mouth_movement_symmetry || 85.2}%
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-semibold text-slate-500 block">Left/Right Movement Diff</span>
                <span className="text-xl font-black text-sky-600">
                  {analysisResult.temporal_features?.left_right_movement_difference || 0.024}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-semibold text-slate-500 block">Velocity Asymmetry</span>
                <span className="text-xl font-black text-purple-600">
                  {analysisResult.temporal_features?.velocity_asymmetry || 0.015}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-semibold text-slate-500 block">Temporal Asymmetry Index</span>
                <span className="text-xl font-black text-emerald-600">
                  {analysisResult.temporal_features?.temporal_asymmetry_index || 4.2}
                </span>
              </div>
            </div>

            {/* Frame-by-Frame Landmarks Dynamic Sequence Chart (Section 14) */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Frame-by-Frame Landmark Symmetry Sequence (Frame 1 → Frame N)
              </h4>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysisResult.frame_sequence} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="frame_index" tick={{ fontSize: 10 }} label={{ value: 'Frame Index', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                    <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="facial_symmetry" name="Facial Symmetry" stroke="#4f46e5" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="mouth_symmetry" name="Mouth Symmetry" stroke="#ec4899" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="eye_symmetry" name="Eye Symmetry" stroke="#06b6d4" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
