import React, { useState, useEffect } from 'react';
import {
  Stethoscope, Search, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2
} from 'lucide-react';
import { getAdminDoctors } from '../services/api';

export const AdminDoctorManagementPage = ({ setTab }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await getAdminDoctors();
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => setTab('admin')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Admin Dashboard</span>
      </button>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold">
          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
          <span>Physician Licensure Roster</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Doctor Management (Section 30)
        </h1>
        <p className="text-xs text-slate-500">
          Verify medical credentials, hospital affiliations, and active patient rosters for clinical collaborators.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Physician</th>
                <th className="pb-3">License Number</th>
                <th className="pb-3">Hospital Affiliation</th>
                <th className="pb-3">Specialty</th>
                <th className="pb-3">Active Patients</th>
                <th className="pb-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {doctors.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                      {d.full_name[0]}
                    </div>
                    <span>{d.full_name}</span>
                  </td>
                  <td className="py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {d.license_number}
                  </td>
                  <td className="py-3.5 text-slate-700 dark:text-slate-300">
                    {d.hospital_affiliation}
                  </td>
                  <td className="py-3.5 text-slate-500">
                    {d.specialty}
                  </td>
                  <td className="py-3.5 font-bold text-sky-600">
                    {d.patient_count || 1} patients
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
