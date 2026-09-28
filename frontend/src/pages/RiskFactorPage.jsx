import React, { useState, useEffect } from 'react';
import {
  Heart, Activity, AlertTriangle, CheckCircle2, ShieldAlert,
  ArrowRight, RefreshCw, Info, Calendar, Sparkles, Scale, User,
  Flame, Cigarette, Stethoscope, ChevronRight, BarChart3
} from 'lucide-react';
import { submitRiskAssessment, getLatestRiskAssessment, getRiskHistory } from '../services/api';

export const RiskFactorPage = ({ setTab }) => {
  const [formData, setFormData] = useState({
    age: 45,
    hypertension: true,
    heart_disease: false,
    diabetes: false,
    smoking_status: 'never',
    physical_activity: 'moderate',
    bmi: 24.5,
    avg_glucose_level: 110,
    family_stroke_history: false,
    prior_transient_ischemic_attack: false,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [latestResult, setLatestResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Optional BMI quick calculator
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [useBmiCalc, setUseBmiCalc] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setFetching(true);
    try {
      const [latestRes, histRes] = await Promise.allSettled([
        getLatestRiskAssessment(),
        getRiskHistory()
      ]);

      if (latestRes.status === 'fulfilled' && latestRes.value) {
        setLatestResult(latestRes.value);
        setFormData({
          age: latestRes.value.age || 45,
          hypertension: latestRes.value.hypertension ?? false,
          heart_disease: latestRes.value.heart_disease ?? false,
          diabetes: latestRes.value.diabetes ?? false,
          smoking_status: latestRes.value.smoking_status || 'never',
          physical_activity: latestRes.value.physical_activity || 'moderate',
          bmi: latestRes.value.bmi || 24.5,
          avg_glucose_level: latestRes.value.avg_glucose_level || 110,
          family_stroke_history: latestRes.value.family_stroke_history ?? false,
          prior_transient_ischemic_attack: latestRes.value.prior_transient_ischemic_attack ?? false,
        });
      }
      if (histRes.status === 'fulfilled' && histRes.value) {
        setHistory(Array.isArray(histRes.value) ? histRes.value : (histRes.value?.history || []));
      }
    } catch (err) {
      console.warn("Could not load prior risk assessments:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleBmiCalc = (h, w) => {
    if (h > 50 && w > 20) {
      const hM = h / 100;
      const calculated = parseFloat((w / (hM * hM)).toFixed(1));
      setFormData(prev => ({ ...prev, bmi: calculated }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        age: parseInt(formData.age, 10),
        hypertension: Boolean(formData.hypertension),
        heart_disease: Boolean(formData.heart_disease),
        diabetes: Boolean(formData.diabetes),
        smoking_status: formData.smoking_status,
        physical_activity: formData.physical_activity,
        bmi: formData.bmi ? parseFloat(formData.bmi) : null,
        avg_glucose_level: formData.avg_glucose_level ? parseFloat(formData.avg_glucose_level) : null,
        family_stroke_history: Boolean(formData.family_stroke_history),
        prior_transient_ischemic_attack: Boolean(formData.prior_transient_ischemic_attack)
      };

      const result = await submitRiskAssessment(payload);
      setLatestResult(result);
      setSuccessMsg('Cardiovascular risk evaluation successfully updated!');
      // refresh history
      const hist = await getRiskHistory();
      if (hist) setHistory(Array.isArray(hist) ? hist : (hist?.history || []));
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to submit risk assessment. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (count) => {
    if (count === 0) {
      return {
        label: 'Low Risk Profile',
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        desc: 'No major clinical risk flags active. Maintain healthy lifestyle.'
      };
    }
    if (count <= 2) {
      return {
        label: 'Moderate Risk Profile',
        badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        desc: `${count} active factor(s) flagged for routine physician attention.`
      };
    }
    return {
      label: 'Elevated Risk Profile',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      desc: `${count} active clinical risk factors identified. Medical consultation strongly advised.`
    };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Cardiovascular & Stroke Risk Profiler
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Assesses underlying stroke probability factors (High Blood Pressure, Blood Glucose, BMI, Diabetes, Lifestyle) according to <strong>American Heart Association (AHA / ASA) Stroke Prevention Guidelines</strong>.
          </p>
        </div>

        <button
          onClick={() => setTab('screening')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer shrink-0"
        >
          <Activity className="w-4 h-4 text-sky-600" />
          <span>Go to Facial Screening Hub</span>
        </button>
      </div>

      {/* Difference Clarification Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-teal-500/10 border border-sky-200 dark:border-sky-900/60 flex items-start space-x-3 text-xs text-slate-700 dark:text-slate-300">
        <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">
            How Does This Differ From Facial AI Screening?
          </p>
          <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-400">
            • <strong>Facial Screening</strong> scans for <em>immediate/acute neurological onset</em> (sudden drooping or asymmetric movement after a stroke begins).<br />
            • <strong>This Risk Profiler</strong> tracks your <em>long-term chances</em> based on systemic markers like <strong>Blood Pressure (Hypertension)</strong>, <strong>Diabetes/Glucose</strong>, and <strong>Cardiovascular history</strong> so you can take preventive action early.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Clinical & Lifestyle Metrics
            </h2>
            <span className="text-[11px] text-slate-400">AHA Guideline Input</span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2 border border-rose-200 dark:border-rose-900">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center space-x-2 border border-emerald-200 dark:border-emerald-900">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Blood Pressure / Hypertension (Highlighting the User's Primary Question) */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                    BP
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-white block">
                      High Blood Pressure / Hypertension
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Systolic &gt; 130 mmHg or Diastolic &gt; 80 mmHg (Major stroke risk factor)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hypertension: false })}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      !formData.hypertension
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Normal (&lt;120/80)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hypertension: true })}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      formData.hypertension
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Elevated / High BP
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Age & Glucose */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  required
                />
                <span className="text-[10px] text-slate-400">Stroke risk doubles every decade after 55</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Avg. Blood Glucose Level (mg/dL)
                </label>
                <input
                  type="number"
                  min="40"
                  max="400"
                  step="0.1"
                  value={formData.avg_glucose_level}
                  onChange={(e) => setFormData({ ...formData, avg_glucose_level: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g. 105"
                />
                <span className="text-[10px] text-slate-400">Normal fasting: 70-100 mg/dL; Elevated: &ge; 140</span>
              </div>
            </div>

            {/* 3. Diabetes & Heart Disease */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Diabetes Diagnosis</span>
                  <span className="text-[10px] text-slate-400">Type 1 or Type 2 Diabetes</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.diabetes}
                  onChange={(e) => setFormData({ ...formData, diabetes: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded-sm focus:ring-sky-500 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Heart Disease / CAD</span>
                  <span className="text-[10px] text-slate-400">Atrial Fibrillation or prior cardiac issue</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.heart_disease}
                  onChange={(e) => setFormData({ ...formData, heart_disease: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded-sm focus:ring-sky-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 4. BMI & Quick Calculator */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Body Mass Index (BMI: kg/m²)
                  </label>
                  <span className="text-[10px] text-slate-400">Normal: 18.5 - 24.9 | Overweight: 25 - 29.9 | Obese: &ge; 30</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseBmiCalc(!useBmiCalc)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                >
                  {useBmiCalc ? 'Close Calculator' : 'Compute from Height/Weight'}
                </button>
              </div>

              {useBmiCalc && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => {
                        const h = parseFloat(e.target.value) || 0;
                        setHeightCm(h);
                        handleBmiCalc(h, weightKg);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => {
                        const w = parseFloat(e.target.value) || 0;
                        setWeightKg(w);
                        handleBmiCalc(heightCm, w);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <input
                type="number"
                min="10"
                max="70"
                step="0.1"
                value={formData.bmi}
                onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-bold"
              />
            </div>

            {/* 5. Lifestyle: Smoking & Physical Activity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Smoking Status
                </label>
                <select
                  value={formData.smoking_status}
                  onChange={(e) => setFormData({ ...formData, smoking_status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                >
                  <option value="never">Never Smoked</option>
                  <option value="formerly">Former Smoker (Quit)</option>
                  <option value="current">Current Smoker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Activity Level
                </label>
                <select
                  value={formData.physical_activity}
                  onChange={(e) => setFormData({ ...formData, physical_activity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                >
                  <option value="high">High (&gt;150 mins moderate/vigorous/wk)</option>
                  <option value="moderate">Moderate (60 - 150 mins/wk)</option>
                  <option value="low">Low / Sedentary Lifestyle (&lt;60 mins/wk)</option>
                </select>
              </div>
            </div>

            {/* 6. Medical History */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Family Stroke History</span>
                  <span className="text-[10px] text-slate-400">First-degree relative (parent/sibling)</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.family_stroke_history}
                  onChange={(e) => setFormData({ ...formData, family_stroke_history: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded-sm focus:ring-sky-500 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Prior TIA / Mini-Stroke</span>
                  <span className="text-[10px] text-slate-400">Temporary focal neurological symptoms</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.prior_transient_ischemic_attack}
                  onChange={(e) => setFormData({ ...formData, prior_transient_ischemic_attack: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded-sm focus:ring-sky-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-sky-600 hover:from-rose-700 hover:to-sky-700 text-white shadow-md shadow-rose-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating Risk Factor Syntheses...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    <span>Assess Cardiovascular & Stroke Risk Factors</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Active Synthesis & Clinical Advice (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Risk Summary Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-rose-600" />
                <span>Current Assessment Result</span>
              </h2>
              {latestResult && (
                <span className="text-[10px] text-slate-400">
                  {new Date(latestResult.created_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {latestResult ? (
              <div className="space-y-4">
                {/* Risk Badge */}
                {(() => {
                  const badge = getRiskBadge(latestResult.attention_risk_count);
                  return (
                    <div className={`p-4 rounded-xl border ${badge.badgeClass} space-y-1.5`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider">
                          {badge.label}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/70 dark:bg-slate-900/70 border border-current">
                          {latestResult.attention_risk_count} Attention Flags
                        </span>
                      </div>
                      <p className="text-xs opacity-90">{badge.desc}</p>
                    </div>
                  );
                })()}

                {/* Flagged Factors List */}
                <div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Identified Attention Factors:
                  </h3>
                  {latestResult.flagged_factors?.length > 0 ? (
                    <div className="space-y-1.5">
                      {latestResult.flagged_factors.map((factor, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 rounded-lg text-xs bg-rose-50/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-100 dark:border-rose-900/60 flex items-center space-x-2"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span className="font-semibold">{factor}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero high-risk cardiovascular factors flagged.</span>
                    </div>
                  )}
                </div>

                {/* Educational Advice */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center space-x-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>AHA Clinical Recommendation</span>
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {latestResult.educational_advice}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Heart className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2 animate-pulse" />
                <p className="text-xs">No risk assessment submitted yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Fill in your metrics on the left and click Assess.
                </p>
              </div>
            )}
          </div>

          {/* Historical Trends List */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Prior Assessments History
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {item.attention_risk_count} Risk Factors Active
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.attention_risk_count === 0
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.attention_risk_count <= 2
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {item.attention_risk_count === 0 ? 'Normal' : item.attention_risk_count <= 2 ? 'Moderate' : 'Elevated'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskFactorPage;
