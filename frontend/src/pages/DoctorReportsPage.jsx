import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { ReportsPage } from './ReportsPage';

export const DoctorReportsPage = ({ patientId, setTab }) => {
  return (
    <div className="space-y-4">
      <div className="px-6 pt-4">
        <button
          onClick={() => setTab('doctor-patient-profile')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Patient Profile</span>
        </button>
      </div>

      <ReportsPage setTab={setTab} />
    </div>
  );
};
