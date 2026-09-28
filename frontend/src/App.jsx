import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import { AppSidebar } from './components/layout/AppSidebar';
import { TopHeader } from './components/layout/TopHeader';
import BottomNavigation from './components/layout/BottomNavigation';

// Public Pages (1 - 5)
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Patient Pages (6 - 20)
import { DashboardPage } from './pages/DashboardPage';
import { RiskFactorPage } from './pages/RiskFactorPage';
import { ScreeningPage } from './pages/ScreeningPage';
import { ImageUploadPage } from './pages/ImageUploadPage';
import { CameraCapturePage } from './pages/CameraCapturePage';
import { VideoAnalysisPage } from './pages/VideoAnalysisPage';
import { ResultPage } from './pages/ResultPage';
import { ExplainableAiPage } from './pages/ExplainableAiPage';
import { FacialAsymmetryPage } from './pages/FacialAsymmetryPage';
import { BaselinePage } from './pages/BaselinePage';
import { HistoryPage } from './pages/HistoryPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

// Doctor Pages (21 - 27)
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { DoctorPatientListPage } from './pages/DoctorPatientListPage';
import { DoctorPatientProfilePage } from './pages/DoctorPatientProfilePage';
import { DoctorAssessmentHistoryPage } from './pages/DoctorAssessmentHistoryPage';
import { DoctorFacialAnalysisPage } from './pages/DoctorFacialAnalysisPage';
import { DoctorComparisonPage } from './pages/DoctorComparisonPage';
import { DoctorReportsPage } from './pages/DoctorReportsPage';

// Admin Pages (28 - 32)
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUserManagementPage } from './pages/AdminUserManagementPage';
import { AdminDoctorManagementPage } from './pages/AdminDoctorManagementPage';
import { AdminModelManagementPage } from './pages/AdminModelManagementPage';
import { AdminAuditLogsPage } from './pages/AdminAuditLogsPage';

const MainApp = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('landing');
  const [latestScreeningData, setLatestScreeningData] = useState(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const handleScreeningComplete = (resultData) => {
    setLatestScreeningData(resultData);
    setSelectedAssessmentId(resultData.assessment_id);
    setCurrentTab('result');
  };

  // Determine current role for layout
  let currentRole = 'PATIENT';
  if (currentTab.startsWith('doctor')) {
    currentRole = 'DOCTOR';
  } else if (currentTab.startsWith('admin')) {
    currentRole = 'ADMIN';
  } else if (user?.role) {
    currentRole = user.role;
  }

  // Public Standalone Pages (Landing, About, How It Works, Login, Register)
  if (currentTab === 'landing') {
    return <LandingPage setTab={setCurrentTab} />;
  }
  if (currentTab === 'about') {
    return <AboutPage setTab={setCurrentTab} />;
  }
  if (currentTab === 'how-it-works') {
    return <HowItWorksPage setTab={setCurrentTab} />;
  }
  if (currentTab === 'login') {
    return <LoginPage setTab={setCurrentTab} />;
  }
  if (currentTab === 'register') {
    return <RegisterPage setTab={setCurrentTab} />;
  }

  // Authenticated Portal Layout (Sidebar + TopHeader + Scrollable Main Content)
  return (
    <div className="min-h-screen flex bg-[#f8fbfe] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Dynamic Role-Aware Sidebar */}
      <AppSidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
        role={currentRole}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <TopHeader currentTab={currentTab} setTab={setCurrentTab} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto">
          {/* Patient Pages (6 - 20) */}
          {currentTab === 'dashboard' && (
            <DashboardPage
              setTab={setCurrentTab}
              setSelectedAssessmentId={setSelectedAssessmentId}
              setLatestScreeningData={setLatestScreeningData}
            />
          )}

          {currentTab === 'risk' && (
            <RiskFactorPage setTab={setCurrentTab} />
          )}

          {currentTab === 'screening' && (
            <ScreeningPage
              setTab={setCurrentTab}
              onScreeningComplete={handleScreeningComplete}
            />
          )}

          {currentTab === 'upload' && (
            <ImageUploadPage
              setTab={setCurrentTab}
              onScreeningComplete={handleScreeningComplete}
            />
          )}

          {currentTab === 'camera' && (
            <CameraCapturePage
              setTab={setCurrentTab}
              onScreeningComplete={handleScreeningComplete}
            />
          )}

          {currentTab === 'video' && (
            <VideoAnalysisPage
              setTab={setCurrentTab}
              onScreeningComplete={handleScreeningComplete}
            />
          )}

          {currentTab === 'result' && (
            <ResultPage
              screeningData={latestScreeningData}
              assessmentId={selectedAssessmentId}
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'explainable-ai' && (
            <ExplainableAiPage
              screeningData={latestScreeningData}
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'asymmetry' && (
            <FacialAsymmetryPage
              screeningData={latestScreeningData}
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'baseline' && (
            <BaselinePage
              setTab={setCurrentTab}
              setSelectedAssessmentId={setSelectedAssessmentId}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              setTab={setCurrentTab}
              setSelectedAssessmentId={setSelectedAssessmentId}
              setLatestScreeningData={setLatestScreeningData}
            />
          )}

          {currentTab === 'comparison' && (
            <ComparisonPage
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'monitoring' && (
            <MonitoringPage
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsPage
              setTab={setCurrentTab}
              setSelectedAssessmentId={setSelectedAssessmentId}
            />
          )}

          {currentTab === 'profile' && (
            <ProfilePage
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              setTab={setCurrentTab}
            />
          )}

          {/* Doctor Pages (21 - 27) */}
          {currentTab === 'doctor' && (
            <DoctorDashboardPage
              setTab={setCurrentTab}
              setSelectedPatientId={setSelectedPatientId}
            />
          )}

          {currentTab === 'doctor-patients' && (
            <DoctorPatientListPage
              setTab={setCurrentTab}
              setSelectedPatientId={setSelectedPatientId}
            />
          )}

          {currentTab === 'doctor-patient-profile' && (
            <DoctorPatientProfilePage
              patientId={selectedPatientId}
              setTab={setCurrentTab}
              setSelectedAssessmentId={setSelectedAssessmentId}
            />
          )}

          {currentTab === 'doctor-patient-history' && (
            <DoctorAssessmentHistoryPage
              patientId={selectedPatientId}
              setTab={setCurrentTab}
              setSelectedAssessmentId={setSelectedAssessmentId}
            />
          )}

          {currentTab === 'doctor-facial-analysis' && (
            <DoctorFacialAnalysisPage
              assessmentId={selectedAssessmentId}
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'doctor-comparison' && (
            <DoctorComparisonPage
              patientId={selectedPatientId}
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'doctor-reports' && (
            <DoctorReportsPage
              patientId={selectedPatientId}
              setTab={setCurrentTab}
            />
          )}

          {/* Admin Pages (28 - 32) */}
          {currentTab === 'admin' && (
            <AdminDashboardPage
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'admin-users' && (
            <AdminUserManagementPage
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'admin-doctors' && (
            <AdminDoctorManagementPage
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'admin-models' && (
            <AdminModelManagementPage
              setTab={setCurrentTab}
            />
          )}

          {currentTab === 'admin-logs' && (
            <AdminAuditLogsPage
              setTab={setCurrentTab}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation (Section 24) */}
        {currentRole === 'PATIENT' && (
          <BottomNavigation currentTab={currentTab} setTab={setCurrentTab} />
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
