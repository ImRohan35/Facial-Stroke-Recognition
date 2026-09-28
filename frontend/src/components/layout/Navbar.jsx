import React from 'react';
import { HeartPulse, ArrowRight, ShieldCheck, Activity, Brain } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ setTab, currentTab }) => {
  const { user, logoutUser, switchDemoRole } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div 
          onClick={() => setTab('landing')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Stroke Recognition</span>
              <span className="text-xs px-2 py-0.5 font-bold bg-sky-100 text-sky-700 rounded-full">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Explainable Facial Asymmetry & Landmark Analysis</p>
          </div>
        </div>

        {/* Public Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setTab('landing')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'landing' ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setTab('about')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'about' ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            About Project
          </button>
          <button
            onClick={() => setTab('how-it-works')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'how-it-works' ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            How It Works
          </button>
        </nav>

        {/* Action Buttons & Auth */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTab('dashboard')}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => logoutUser()}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTab('login')}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-sky-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('register')}
                className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Register
              </button>
              <button
                onClick={() => setTab('screening')}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white shadow-sm shadow-sky-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Start Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
