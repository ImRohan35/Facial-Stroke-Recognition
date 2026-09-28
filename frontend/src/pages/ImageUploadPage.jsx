import React, { useState, useRef } from 'react';
import {
  Upload, Image as ImageIcon, CheckCircle2, AlertCircle,
  ArrowRight, RefreshCw, X, ShieldCheck, ArrowLeft, Layers, Camera, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { analyzeScreeningImage } from '../services/api';
import EmergencyDisclaimer from '../components/common/EmergencyDisclaimer';

export const ImageUploadPage = ({ setTab, onScreeningComplete }) => {
  const [mode, setMode] = useState('single'); // 'single' | 'multi'
  
  // Single image state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Multi-image state
  const [neutralFile, setNeutralFile] = useState(null);
  const [neutralPreview, setNeutralPreview] = useState(null);
  const [smileFile, setSmileFile] = useState(null);
  const [smilePreview, setSmilePreview] = useState(null);
  const [eyeFile, setEyeFile] = useState(null);
  const [eyePreview, setEyePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState('');
  const [qualityWarning, setQualityWarning] = useState(null);

  const singleInputRef = useRef(null);
  const neutralInputRef = useRef(null);
  const smileInputRef = useRef(null);
  const eyeInputRef = useRef(null);

  const handleSingleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file format. Please upload a valid JPG, JPEG, or PNG image.');
      return;
    }

    setError('');
    setQualityWarning(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRetakeSingle = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    setQualityWarning(null);
    if (singleInputRef.current) singleInputRef.current.value = '';
  };

  const handleAnalyzeSingle = async () => {
    if (!selectedFile) {
      setError('Please select a facial image first.');
      return;
    }

    setLoading(true);
    setError('');
    setQualityWarning(null);
    setProcessingStage('Uploading and validating image integrity...');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('assessment_type', 'UPLOAD');

      setProcessingStage('Running anti-manipulation & quality checks...');
      
      const res = await axios.post('/api/v1/screening/image', formData);
      const result = res.data;

      setProcessingStage('Generating explainable AI results...');

      if (result.prediction === 'uncertain' && result.authenticity_status && result.authenticity_status !== 'VALID') {
        setQualityWarning(result.message || 'Image was flagged by input validation layer. Please review guidelines.');
      }

      if (onScreeningComplete) {
        onScreeningComplete(result);
      }
      setTab('result');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'An error occurred during facial analysis. Please ensure a clear, unedited front-facing image.');
    } finally {
      setLoading(false);
      setProcessingStage('');
    }
  };

  const handleAnalyzeMulti = async () => {
    if (!neutralFile) {
      setError('Front-facing neutral baseline photo is required for multi-image session.');
      return;
    }

    setLoading(true);
    setError('');
    setQualityWarning(null);
    setProcessingStage('Validating multi-view landmarks...');

    try {
      const formData = new FormData();
      formData.append('neutral_image', neutralFile);
      if (smileFile) formData.append('smile_image', smileFile);
      if (eyeFile) formData.append('eye_image', eyeFile);

      setProcessingStage('Extracting resting and dynamic bilateral asymmetry vectors...');

      const res = await axios.post('/api/v1/screening/multi-image', formData);
      const result = res.data;

      if (result.prediction === 'uncertain' && result.authenticity_status !== 'VALID') {
        setQualityWarning(result.message || 'Multi-view session flagged by validation checks.');
      }

      if (onScreeningComplete) {
        onScreeningComplete(result);
      }
      setTab('result');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to analyze multi-image session. Please verify all photos are valid front-facing images.');
    } finally {
      setLoading(false);
      setProcessingStage('');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => setTab('screening')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Screening Hub</span>
      </button>

      <EmergencyDisclaimer compact />

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Upload Facial Image
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports single front-facing photo or multi-view assessment session. Unedited natural photos required.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                mode === 'single'
                  ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Standard Photo
            </button>
            <button
              type="button"
              onClick={() => setMode('multi')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                mode === 'multi'
                  ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-View Session</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {qualityWarning && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="flex items-center space-x-2 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Input Validation Advisory</span>
            </div>
            <p className="leading-relaxed pl-6">{qualityWarning}</p>
          </div>
        )}

        {/* SINGLE IMAGE MODE */}
        {mode === 'single' ? (
          <div>
            {!previewUrl ? (
              <div
                onClick={() => singleInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-sky-500 dark:hover:border-sky-400 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-800/20"
              >
                <input
                  ref={singleInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleSingleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-slate-800 flex items-center justify-center text-sky-600 mx-auto mb-3 shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Select front-facing natural facial photograph
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, JPEG, or PNG (Max 15MB) • Avoid beauty filters or voluntary grimaces
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-950 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Selected Face Preview"
                    className="max-h-80 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRetakeSingle}
                    title="Remove photo"
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-900 text-xs text-sky-800 dark:text-sky-300 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-sky-600" />
                  <span>Image ready. The system will perform anti-manipulation checks before extracting 468 MediaPipe landmarks.</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* MULTI-IMAGE SESSION MODE */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Photo 1: Neutral */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">1. Neutral Face</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">Required</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">Straight, relaxed resting facial expression.</p>
                </div>
                {neutralPreview ? (
                  <div className="relative rounded-lg overflow-hidden h-36 bg-slate-950 flex items-center justify-center">
                    <img src={neutralPreview} alt="Neutral" className="h-full w-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => { setNeutralFile(null); setNeutralPreview(null); }}
                      className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => neutralInputRef.current?.click()}
                    className="h-36 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-xs text-slate-600 hover:border-sky-500 bg-white dark:bg-slate-900"
                  >
                    <Upload className="w-5 h-5 text-sky-600 mb-1" />
                    <span>Upload Neutral</span>
                  </button>
                )}
                <input
                  ref={neutralInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setNeutralFile(f); setNeutralPreview(URL.createObjectURL(f)); }
                  }}
                />
              </div>

              {/* Photo 2: Smile */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">2. Natural Smile</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">Optional</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">Evaluates dynamic oral commissure displacement.</p>
                </div>
                {smilePreview ? (
                  <div className="relative rounded-lg overflow-hidden h-36 bg-slate-950 flex items-center justify-center">
                    <img src={smilePreview} alt="Smile" className="h-full w-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => { setSmileFile(null); setSmilePreview(null); }}
                      className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => smileInputRef.current?.click()}
                    className="h-36 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-xs text-slate-600 hover:border-sky-500 bg-white dark:bg-slate-900"
                  >
                    <Upload className="w-5 h-5 text-sky-600 mb-1" />
                    <span>Upload Smile</span>
                  </button>
                )}
                <input
                  ref={smileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setSmileFile(f); setSmilePreview(URL.createObjectURL(f)); }
                  }}
                />
              </div>

              {/* Photo 3: Eye/Upper Face */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">3. Eye / Ptosis View</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">Optional</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">Evaluates palpebral fissure and eyebrow elevation.</p>
                </div>
                {eyePreview ? (
                  <div className="relative rounded-lg overflow-hidden h-36 bg-slate-950 flex items-center justify-center">
                    <img src={eyePreview} alt="Eye" className="h-full w-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => { setEyeFile(null); setEyePreview(null); }}
                      className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => eyeInputRef.current?.click()}
                    className="h-36 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-xs text-slate-600 hover:border-sky-500 bg-white dark:bg-slate-900"
                  >
                    <Upload className="w-5 h-5 text-sky-600 mb-1" />
                    <span>Upload Eye View</span>
                  </button>
                )}
                <input
                  ref={eyeInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setEyeFile(f); setEyePreview(URL.createObjectURL(f)); }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Live Processing Stage Feedback */}
        {loading && (
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-center space-x-3">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full flex-shrink-0" />
            <div>
              <p className="font-bold text-sky-950">Screening Pipeline Active</p>
              <p className="text-sky-700">{processingStage || 'Processing input image...'}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            {mode === 'single' ? (
              !previewUrl ? (
                <button
                  type="button"
                  onClick={() => singleInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors cursor-pointer flex items-center space-x-2"
                >
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  <span>Select Image</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRetakeSingle}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake</span>
                </button>
              )
            ) : (
              <span className="text-xs text-slate-400">
                {neutralFile ? 'Neutral baseline loaded' : 'Neutral photo required'}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={loading || (mode === 'single' ? !previewUrl : !neutralFile)}
            onClick={mode === 'single' ? handleAnalyzeSingle : handleAnalyzeMulti}
            className="px-7 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Processing...' : (mode === 'single' ? 'Analyze Image' : 'Analyze Multi-View Session')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
