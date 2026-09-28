import React from 'react';
import { ArrowLeft, GitCompare, User } from 'lucide-react';
import { ComparisonPage } from './ComparisonPage';

export const DoctorComparisonPage = ({ patientId, setTab }) => {
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

      <ComparisonPage setTab={setTab} />
    </div>
  );
};
