import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Layout Components
import { AppSidebar } from './components/layout/AppSidebar';
import { TopHeader } from './components/layout/TopHeader';
import BottomNavigation from './components/layout/BottomNavigation';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Main Stroke AI Pages
import { DashboardPage } from './pages/DashboardPage';
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

const MainApp = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('landing');
  const [latestScreeningData, setLatestScreeningData] = useState(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  const handleScreeningComplete = (resultData) => {
    setLatestScreeningData(resultData);
    setSelectedAssessmentId(resultData.assessment_id);
    setCurrentTab('result');
  };

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

  // Unified Stroke Recognition Platform Layout (Sidebar + TopHeader + Scrollable Main Content)
  return (
    <div className="min-h-screen flex bg-[#f8fbfe] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <AppSidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <TopHeader currentTab={currentTab} setTab={setCurrentTab} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              setTab={setCurrentTab}
              setSelectedAssessmentId={setSelectedAssessmentId}
              setLatestScreeningData={setLatestScreeningData}
            />
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
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation currentTab={currentTab} setTab={setCurrentTab} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
