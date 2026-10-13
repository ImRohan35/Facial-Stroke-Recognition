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
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const faceMeshRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [showLiveMesh, setShowLiveMesh] = useState(true);
  const [liveHeadTilt, setLiveHeadTilt] = useState(null);
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
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [facingMode]);

  // Live Landmark Tracking Loop
  useEffect(() => {
    if (!cameraActive || !showLiveMesh) {
      if (overlayCanvasRef.current) {
        const ctx = overlayCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
      }
      return;
    }

    let isRunning = true;

    // Initialize MediaPipe FaceMesh if available globally
    if (window.FaceMesh && !faceMeshRef.current) {
      try {
        const fm = new window.FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });
        fm.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        fm.onResults(onLiveLandmarksResults);
        faceMeshRef.current = fm;
      } catch (e) {
        console.warn('MediaPipe initialization fallback:', e);
      }
    }

    const processFrame = async () => {
      if (!isRunning) return;
      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        if (faceMeshRef.current) {
          try {
            await faceMeshRef.current.send({ image: video });
          } catch (err) {
            // fallback frame drawing if busy
          }
        }
      }
      if (isRunning) {
        animFrameIdRef.current = requestAnimationFrame(processFrame);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(processFrame);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [cameraActive, showLiveMesh]);

  const onLiveLandmarksResults = (results) => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      setLiveHeadTilt(null);
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    const w = canvas.width;
    const h = canvas.height;

    const pt = (idx) => {
      const lm = landmarks[idx];
      return lm ? { x: lm.x * w, y: lm.y * h } : null;
    };

    // Anatomical index sets
    const mouthIndices = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 13];
    const eyeIndices = [33, 160, 158, 133, 153, 144, 263, 387, 385, 362, 380, 373];
    const browIndices = [70, 63, 105, 66, 107, 300, 293, 334, 296, 336];
    const noseIndices = [9, 168, 1, 2, 164, 0, 197, 195, 5, 4];
    const jawIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

    // Compute live tilt roll angle
    const lEye = pt(33);
    const rEye = pt(263);
    if (lEye && rEye) {
      const rollDeg = Math.atan2(rEye.y - lEye.y, rEye.x - lEye.x) * (180 / Math.PI);
      setLiveHeadTilt(Math.round(rollDeg * 10) / 10);
    }

    // Connect contours
    const drawPoly = (indices, strokeColor, lineWidth = 1.5) => {
      ctx.beginPath();
      let started = false;
      indices.forEach((idx) => {
        const p = pt(idx);
        if (p) {
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else { ctx.lineTo(p.x, p.y); }
        }
      });
      if (started) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    };

    // Eyebrows (Purple)
    drawPoly([70, 63, 105, 66, 107], 'rgba(168, 85, 247, 0.8)', 2);
    drawPoly([300, 293, 334, 296, 336], 'rgba(168, 85, 247, 0.8)', 2);

    // Eyes (Cyan)
    drawPoly([33, 160, 158, 133, 153, 144, 33], 'rgba(6, 182, 212, 0.8)', 2);
    drawPoly([263, 387, 385, 362, 380, 373, 263], 'rgba(6, 182, 212, 0.8)', 2);

    // Lips (Red / Coral)
    drawPoly([61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 61], 'rgba(244, 63, 94, 0.85)', 2);

    // Jawline (Amber)
    drawPoly([234, 127, 162, 21, 54, 103, 67, 109, 10, 338, 297, 332, 284, 251, 389, 356, 454], 'rgba(245, 158, 11, 0.5)', 1.5);

    // Draw individual points with distinct colors
    const drawDots = (indices, color, radius = 3) => {
      ctx.fillStyle = color;
      indices.forEach((idx) => {
        const p = pt(idx);
        if (p) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    };

    drawDots(jawIndices, '#f59e0b', 2);
    drawDots(noseIndices, '#10b981', 3.5);
    drawDots(browIndices, '#a855f7', 3.5);
    drawDots(eyeIndices, '#06b6d4', 3.5);
    drawDots(mouthIndices, '#f43f5e', 4);

    // Mid-sagittal line (Neon Green dashed)
    const glabella = pt(9) || pt(168);
    const menton = pt(152);
    if (glabella && menton) {
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(glabella.x, glabella.y);
      ctx.lineTo(menton.x, menton.y);
      ctx.stroke();
      ctx.restore();
    }

    // Oral Commissure Vector (Hot Pink dashed)
    const lMouth = pt(61);
    const rMouth = pt(291);
    if (lMouth && rMouth) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(lMouth.x, lMouth.y);
      ctx.lineTo(rMouth.x, rMouth.y);
      ctx.stroke();
      ctx.restore();
    }
  };

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

        {/* Live Landmark Mesh Toggle & Status Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Live Facial Landmark Mesh:
            </span>
            <button
              type="button"
              onClick={() => setShowLiveMesh(!showLiveMesh)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                showLiveMesh
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>{showLiveMesh ? 'ON (Active Tracking)' : 'OFF'}</span>
            </button>
          </div>

          {liveHeadTilt !== null && (
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
              <span>Pose Tilt: {liveHeadTilt}°</span>
              <span className="text-slate-400 font-normal">(Auto-Normalized)</span>
            </div>
          )}
        </div>

        {/* Camera Viewport with Real-Time Multi-Color Landmarks & Oval Guide */}
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

              {/* Real-Time Facial Landmarks Overlay Canvas */}
              {showLiveMesh && (
                <canvas
                  ref={overlayCanvasRef}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100"
                />
              )}

              {/* Standardized Oval Face Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-64 sm:w-56 sm:h-72 border-2 border-dashed border-sky-400/60 rounded-[50%] shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] flex items-center justify-center">
                  <div className="w-full h-[1px] bg-sky-400/20"></div>
                </div>
                <div className="absolute bottom-4 bg-slate-900/90 backdrop-blur-xs px-4 py-1.5 rounded-full text-xs font-semibold text-slate-200 border border-slate-700 shadow-md">
                  {captureStep === 1
                    ? 'Step 1: Relax face & look straight ahead'
                    : 'Step 2: Smile naturally for voluntary movement check'}
                </div>
              </div>

              {/* Flip Camera Button */}
              <button
                type="button"
                onClick={handleFlipCamera}
                title="Switch front/back camera"
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-colors cursor-pointer shadow-md"
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

        {/* Anatomical Landmark Color Legend */}
        {showLiveMesh && !capturedDataUrl && (
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Landmark Regions:</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] inline-block shadow-xs"></span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">Mouth & Lips</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] inline-block shadow-xs"></span>
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">Eyes & Apertures</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] inline-block shadow-xs"></span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">Eyebrows</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shadow-xs"></span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Nose / Midline</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block shadow-xs"></span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">Jawline & Mandible</span>
            </div>
          </div>
        )}

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
