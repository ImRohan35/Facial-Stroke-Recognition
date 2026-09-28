import React, { useState, useEffect } from 'react';
import {
  Users, Search, RefreshCw, ChevronRight, Stethoscope,
  ArrowRight, ShieldCheck, Calendar
} from 'lucide-react';
import { getDoctorPatients } from '../services/api';

export const DoctorPatientListPage = ({ setTab, setSelectedPatientId }) => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await getDoctorPatients();
      setPatients(res.patients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPatient = (p, tab = 'doctor-patient-profile') => {
    if (setSelectedPatientId) setSelectedPatientId(p.patient_id);
    setTab(tab);
  };

  const filtered = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold">
          <Users className="w-3.5 h-3.5 text-teal-600" />
          <span>Patient Roster Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Patient List (Section 27)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Showing all patients who have granted clinical review permissions for facial asymmetry screening.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by patient name, email..."
          className="w-full text-xs bg-transparent focus:outline-none text-slate-900 dark:text-white"
        />
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <div
            key={p.patient_id}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white text-base">
                  {p.full_name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  Consented Access
                </span>
              </div>
              <p className="text-xs text-slate-400">{p.email} • {p.phone}</p>
              
              <div className="grid grid-cols-2 gap-3 mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Age & Gender</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{p.age} years • {p.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Latest Symmetry</span>
                  <span className="font-bold text-sky-600">{p.latest_symmetry || '—'}/100</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Latest Assessment</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{p.latest_assessment_date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Last Updated</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(p.last_updated).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => handleOpenPatient(p, 'doctor-facial-analysis')}
                className="text-teal-600 font-semibold hover:underline cursor-pointer"
              >
                Facial Analysis →
              </button>
              <button
                onClick={() => handleOpenPatient(p, 'doctor-patient-profile')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Open Patient Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
