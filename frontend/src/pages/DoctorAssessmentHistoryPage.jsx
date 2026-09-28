import React, { useState, useEffect } from 'react';
import {
  History, Calendar, ArrowLeft, Eye, GitCompare, FileText, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { getDoctorPatientDetail } from '../services/api';

export const DoctorAssessmentHistoryPage = ({ patientId, setTab, setSelectedAssessmentId }) => {
  const [assessments, setAssessments] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, [patientId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await getDoctorPatientDetail(patientId || 'sarah-jenkins-profile');
      setAssessments(data.assessments || []);
      setPatientName(data.patient?.full_name || 'Sarah Jenkins');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = (a) => {
    if (setSelectedAssessmentId) setSelectedAssessmentId(a.id);
    setTab('doctor-facial-analysis');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => setTab('doctor-patient-profile')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Patient Profile</span>
      </button>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold">
          <History className="w-3.5 h-3.5 text-teal-600" />
          <span>Patient Assessment Chronology</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Assessment History: {patientName}
        </h1>
        <p className="text-xs text-slate-500">
          Chronological repository of all image, camera, and video landmark assessments conducted for this patient.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Scan ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Model Output</th>
                <th className="pb-3">Facial Sym</th>
                <th className="pb-3">Mouth Sym</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assessments.map((a) => {
                const isStroke = a.prediction === 'stroke_associated';
                const feats = a.facial_features || {};

                return (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 font-mono text-slate-700 dark:text-slate-300 font-bold">
                      #{a.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-400">
                      {new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 capitalize text-slate-500">
                      {a.assessment_type.replace('_', ' ').toLowerCase()}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isStroke ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isStroke ? 'Stroke Pattern' : 'Non-Stroke Pattern'}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-sky-600">{feats.facial_symmetry || '—'}</td>
                    <td className="py-3.5 font-bold text-purple-600">{feats.mouth_symmetry || '—'}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleInspect(a)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 cursor-pointer"
                      >
                        Inspect Landmarks
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
