import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, RefreshCw, CheckCircle2, AlertCircle, ArrowRight,
  ArrowLeft, FlipHorizontal, Eye, ShieldCheck, Sparkles, Check, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import EmergencyDisclaimer from '../components/common/EmergencyDisclaimer';

export const CameraCapturePage = ({ setTab, onScreeningComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState('');
  const [qualityWarning, setQualityWarning] = useState(null);
  const [facingMode, setFacingMode] = useState('user');

  // Multi-step capture state
  const [captureStep, setCaptureStep] = useState(1); // 1: Relax, 2: Smile, 3: Review
  const [neutralFrame, setNeutralFrame] = useState(null);
  const [smileFrame, setSmileFrame] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    setError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access device camera. Please grant camera permission in your browser settings.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const grabCurrentFrameBlob = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    return { dataUrl, canvas };
  };

  const handleCaptureSingle = () => {
    const frame = grabCurrentFrameBlob();
    if (!frame) return;
    setCapturedDataUrl(frame.dataUrl);
    frame.canvas.toBlob((blob) => {
      setCapturedBlob(blob);
    }, 'image/jpeg', 0.95);
    stopCamera();
  };

  const handleStepCapture = (step) => {
    const frame = grabCurrentFrameBlob();
    if (!frame) return;

    frame.canvas.toBlob((blob) => {
      if (step === 1) {
        setNeutralFrame({ blob, dataUrl: frame.dataUrl });
        setCaptureStep(2);
      } else if (step === 2) {
        setSmileFrame({ blob, dataUrl: frame.dataUrl });
        setCaptureStep(3);
        stopCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  const handleRetake = () => {
    setCapturedBlob(null);
    setCapturedDataUrl(null);
    setNeutralFrame(null);
    setSmileFrame(null);
    setCaptureStep(1);
    setError('');
    setQualityWarning(null);
    startCamera();
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setQualityWarning(null);
    setProcessingStage('Performing input validation & landmark extraction...');

    try {
      let res;
      if (neutralFrame && smileFrame) {
        // Multi-step session submission
        setProcessingStage('Evaluating resting vs dynamic smile asymmetry...');
        const formData = new FormData();
        formData.append('neutral_image', neutralFrame.blob, 'camera_neutral.jpg');
        formData.append('smile_image', smileFrame.blob, 'camera_smile.jpg');
        res = await axios.post('/api/v1/screening/multi-image', formData);
      } else {
        // Single frame submission
        setProcessingStage('Validating image quality & running ML model...');
        const formData = new FormData();
        if (capturedBlob) {
          formData.append('image', capturedBlob, 'camera_capture.jpg');
        } else if (capturedDataUrl) {
          formData.append('image_base64', capturedDataUrl);
        } else if (neutralFrame) {
          formData.append('image', neutralFrame.blob, 'camera_capture.jpg');
        }
        formData.append('assessment_type', 'LIVE_CAMERA');
        res = await axios.post('/api/v1/screening/image', formData);
      }

      const result = res.data;

      if (result.prediction === 'uncertain' && result.authenticity_status !== 'VALID') {
        setQualityWarning(result.message || 'The camera image was flagged by input validation checks.');
      }

      if (onScreeningComplete) {
        onScreeningComplete(result);
      }
      setTab('result');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'An error occurred during facial analysis. Please ensure a clear front-facing image.');
    } finally {
      setLoading(false);
      setProcessingStage('');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => {
          stopCamera();
          setTab('screening');
        }}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Screening Hub</span>
      </button>

      <EmergencyDisclaimer compact />

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Camera Guided Assessment
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standardized capture with positioning guide. Images are held in temporary memory and never stored without your submission.
          </p>
        </div>

        {/* Step Guide Tabs */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 grid grid-cols-3 gap-2 text-center text-xs">
          <div className={`p-2 rounded-lg font-bold ${captureStep === 1 && !capturedDataUrl ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}>
            <span>Step 1: Relax Face</span>
          </div>
          <div className={`p-2 rounded-lg font-bold ${captureStep === 2 ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}>
            <span>Step 2: Smile Naturally</span>
          </div>
          <div className={`p-2 rounded-lg font-bold ${captureStep === 3 || capturedDataUrl ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}>
            <span>Step 3: AI Screening</span>
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

        {/* Standardized Controlled Instructions Card (Section 2) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Keep face straight & relaxed</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Look directly at camera</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Entire face clearly visible</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Avoid beauty filters</span>
          </div>
        </div>

        {/* Camera Viewport with Oval Face Guide */}
        <div className="relative max-w-lg mx-auto bg-slate-950 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center shadow-lg border border-slate-800">
          {!capturedDataUrl && captureStep !== 3 ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Standardized Oval Face Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-64 sm:w-56 sm:h-72 border-2 border-dashed border-sky-400/90 rounded-[50%] shadow-[0_0_0_9999px_rgba(15,23,42,0.6)] flex items-center justify-center">
                  <div className="w-full h-[1px] bg-sky-400/30"></div>
                </div>
                <div className="absolute bottom-4 bg-slate-900/90 backdrop-blur-xs px-4 py-1.5 rounded-full text-xs font-semibold text-slate-200 border border-slate-700">
                  {captureStep === 1
                    ? 'Step 1: Relax your face and look straight ahead'
                    : 'Step 2: Smile naturally for voluntary movement check'}
                </div>
              </div>

              {/* Flip Camera Button */}
              <button
                type="button"
                onClick={handleFlipCamera}
                title="Switch front/back camera"
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-colors cursor-pointer"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 relative">
              {capturedDataUrl ? (
                <img
                  src={capturedDataUrl}
                  alt="Captured Portrait"
                  className="max-h-full w-auto object-contain"
                />
              ) : (
                <div className="grid grid-cols-2 gap-2 p-4 h-full w-full">
                  {neutralFrame && (
                    <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                      <img src={neutralFrame.dataUrl} alt="Neutral" className="h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">Neutral</span>
                    </div>
                  )}
                  {smileFrame && (
                    <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                      <img src={smileFrame.dataUrl} alt="Smile" className="h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">Smile</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Processing State Feedback */}
        {loading && (
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-center space-x-3">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full flex-shrink-0" />
            <div>
              <p className="font-bold text-sky-950">Screening Pipeline Active</p>
              <p className="text-sky-700">{processingStage}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            {!capturedDataUrl && captureStep !== 3 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepCapture(captureStep)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{captureStep === 1 ? 'Capture Step 1 (Relax)' : 'Capture Step 2 (Smile)'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCaptureSingle}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Quick Single Capture
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRetake}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Session</span>
              </button>
            )}
          </div>

          {(capturedDataUrl || captureStep === 3) && (
            <button
              type="button"
              disabled={loading}
              onClick={handleAnalyze}
              className="px-7 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Analyzing...' : 'Run Stroke-Associated Analysis'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
