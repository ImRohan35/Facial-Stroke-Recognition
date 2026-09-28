import React, { useState, useEffect } from 'react';
import {
  Calendar, ArrowRight, Camera, FileText, Bot, Shield, Activity,
  ChevronRight, Heart, Sparkles, CheckCircle2, AlertTriangle, TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getScreeningHistory, getLatestRiskAssessment, getRecoverySummary } from '../services/api';

export const PatientDashboard = ({ setTab, setSelectedAssessmentId, onOpenEmergency }) => {
  const [history, setHistory] = useState([]);
  const [latestRisk, setLatestRisk] = useState(null);
  const [recoverySummary, setRecoverySummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histData, riskData, recData] = await Promise.allSettled([
          getScreeningHistory(),
          getLatestRiskAssessment(),
          getRecoverySummary()
        ]);
        if (histData.status === 'fulfilled') setHistory(histData.value);
        if (riskData.status === 'fulfilled') setLatestRisk(riskData.value);
        if (recData.status === 'fulfilled') setRecoverySummary(recData.value);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const latestAssessment = history.length > 0 ? history[0] : null;

  // Health Trend Data (Matching the reference chart: Jan, Feb, Mar, Apr, May)
  const trendData = [
    { month: 'Jan', facial: 82, eye: 90, mouth: 75 },
    { month: 'Feb', facial: 84, eye: 91, mouth: 76 },
    { month: 'Mar', facial: 85, eye: 92, mouth: 78 },
    { month: 'Apr', facial: 86, eye: 92, mouth: 79 },
    { month: 'May', facial: 88, eye: 94, mouth: 81 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back, Rahul!</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Take control of your brain health with AI-powered insights.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-sky-600" />
          <span>Last Assessment: {latestAssessment ? new Date(latestAssessment.created_at).toLocaleDateString() : '24 Sept 2024'}</span>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Latest Screening */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Latest Screening</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-emerald-600">
              {latestAssessment?.classification === 'STROKE_ASSOCIATED_PATTERN' ? 'Attention' : 'Normal'}
            </div>
          </div>
          <button
            onClick={() => setTab('screening')}
            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1 cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 2: Risk Factors */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Risk Factors</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-rose-600">
              {latestRisk ? `${latestRisk.attention_risk_count} Active` : '3 Active'}
            </div>
          </div>
          <button
            onClick={() => setTab('risk')}
            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1 cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Recovery Progress */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Recovery Progress</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-sky-600">72%</div>
          </div>
          <button
            onClick={() => setTab('recovery')}
            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1 cursor-pointer"
          >
            <span>View Progress</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 4: Health Check */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Health Check</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-purple-600">4/5 Completed</div>
          </div>
          <button
            onClick={() => setTab('screening')}
            className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center space-x-1 cursor-pointer"
          >
            <span>Complete Now</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Middle Row (2 Columns: Recent Facial Analysis & Risk Factor Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Recent Facial Analysis */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Facial Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Landmark Photo Thumbnail */}
            <div className="sm:col-span-5 relative rounded-2xl overflow-hidden bg-slate-900 aspect-square shadow-inner">
              <img
                src="/face_mesh_landmarks.jpg"
                alt="Recent Facial Analysis"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Symmetry Metrics Breakdown */}
            <div className="sm:col-span-7 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-600">Facial Symmetry</span>
                  <span className="text-emerald-600">86/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '86%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-600">Eye Symmetry</span>
                  <span className="text-emerald-600">92/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-600">Eyebrow Symmetry</span>
                  <span className="text-emerald-600">88/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-600">Mouth Symmetry</span>
                  <span className="text-emerald-600">79/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '79%' }} />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setTab('screening')}
                  className="w-full py-2 rounded-xl text-xs font-bold border border-sky-300 text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer text-center"
                >
                  View Full Analysis
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Risk Factor Summary */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Risk Factor Summary</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                <div className="flex items-center space-x-2 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Blood Pressure</span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-100 text-rose-700">High</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                <div className="flex items-center space-x-2 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Smoking</span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-100 text-rose-700">Yes</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                <div className="flex items-center space-x-2 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Diabetes</span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">No</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                <div className="flex items-center space-x-2 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Physical Activity</span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-100 text-amber-700">Low</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                <div className="flex items-center space-x-2 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Cholesterol</span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-100 text-rose-700">High</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setTab('risk')}
            className="w-full py-2 rounded-xl text-xs font-bold border border-sky-300 text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer text-center"
          >
            View All Factors
          </button>
        </div>
      </div>

      {/* Bottom Row (2 Columns: Your Health Trend & Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Your Health Trend */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Your Health Trend</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
              Last 6 Months
            </span>
          </div>

          <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[60, 100]} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="facial" name="Facial Symmetry" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="eye" name="Eye Movement" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="mouth" name="Mouth Movement" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Card: Quick Actions (2x2 Grid) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => setTab('screening')}
              className="p-4 rounded-2xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 hover:border-sky-300 transition-all text-left space-y-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Take New Screening</div>
                <div className="text-[10px] text-slate-500">AI camera check</div>
              </div>
            </button>

            <button
              onClick={() => setTab('risk')}
              className="p-4 rounded-2xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 hover:border-teal-300 transition-all text-left space-y-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Update Health Info</div>
                <div className="text-[10px] text-slate-500">Cardiovascular factors</div>
              </div>
            </button>

            <button
              onClick={() => setTab('reports')}
              className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left space-y-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">View Reports</div>
                <div className="text-[10px] text-slate-500">PDF summaries</div>
              </div>
            </button>

            <button
              onClick={() => setTab('assistant')}
              className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 transition-all text-left space-y-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Chat with AI</div>
                <div className="text-[10px] text-slate-500">Healthcare assistant</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
