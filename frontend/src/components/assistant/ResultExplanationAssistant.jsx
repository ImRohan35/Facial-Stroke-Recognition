import React, { useState } from 'react';
import {
  MessageSquare, HelpCircle, Send, Sparkles, AlertCircle,
  PhoneCall, ShieldAlert, Globe, CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

export default function ResultExplanationAssistant({ assessment }) {
  const { language, toggleLanguage } = useLanguage();
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: language === 'hi'
        ? "नमस्ते! मैं आपका Explainable AI सहायक हूँ। मैं आपके चेहरे की समरूपता (Symmetry), मुंह के टेढ़ेपन, मॉडल विश्वास स्तर और रिपोर्ट के बारे में आपके सभी सवालों का उत्तर दे सकता हूँ।"
        : "Hello! I am your AI Educational Assistant. I can explain the facial asymmetry features measured from your assessment, what the model confidence indicates, and what next steps to take."
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestionsEn = [
    "What should I do if stroke is detected?",
    "What does mouth asymmetry mean?",
    "Explain my report simply",
    "What is the B.E. F.A.S.T. protocol?",
    "What do model confidence numbers indicate?",
    "What facial exercises can help recover?"
  ];

  const suggestedQuestionsHi = [
    "मुझे क्या करना चाहिए?",
    "मुंह की समरूपता का क्या मतलब है?",
    "B.E. F.A.S.T. के लक्षण क्या हैं?",
    "रिपोर्ट कैसे समझें और डाउनलोड करें?",
    "क्या मुझे तुरंत अस्पताल जाना चाहिए?",
    "चेहरे के व्यायाम (Exercises) क्या हैं?"
  ];

  const activeQuestions = language === 'hi' ? suggestedQuestionsHi : suggestedQuestionsEn;

  const handleSend = async (qText) => {
    const q = (qText || inputQuestion).trim();
    if (!q) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const feats = assessment?.facial_features || {};
      const res = await axios.post('/api/v1/screening/assistant', {
        question: q,
        assessment_id: assessment?.assessment_id,
        prediction: assessment?.prediction,
        facial_symmetry: feats.facial_symmetry,
        mouth_symmetry: feats.mouth_symmetry,
        eye_symmetry: feats.eye_symmetry,
        model_confidence: assessment?.model_confidence
      });

      const reply = res.data?.answer || "I can explain the landmark metrics and how bilateral symmetry is evaluated.";
      const isEmergency = res.data?.is_emergency;
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: reply,
          isEmergency: isEmergency
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: language === 'hi'
            ? "MediaPipe ने आपके चेहरे के 468 लैंडमार्क बिंदुओं का विश्लेषण करके क्षैतिज और ऊर्ध्वाधर समरूपता स्कोर निकाला है। किसी भी चिकित्सीय आपात स्थिति में हमेशा 112 या डॉक्टर से संपर्क करें।"
            : "MediaPipe extracted 468 bilateral landmarks to compute horizontal and vertical symmetry scores. For clinical evaluation, always consult a licensed healthcare professional or neurologist."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render bold markdown and linebreaks safely
  const formatAssistantText = (text) => {
    return text.split('\n').map((line, idx) => {
      // Bold formatting
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="min-h-[1.2em]">
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={pIdx} className="font-bold">{p.slice(2, -2)}</strong>;
            }
            return p;
          })}
        </p>
      );
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'hi' ? 'AI परिणाम व्याख्या सहायक (Explainable AI)' : 'AI Result Explanation Assistant'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'द्विभाषी बायोमार्कर व रिपोर्ट अंतर्दृष्टि (हिंदी / English)' : 'Educational biomarker & report insights (Not medical advice)'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 hover:bg-sky-50 cursor-pointer"
          >
            <Globe className="w-3 h-3 text-sky-600" />
            <span>{language === 'hi' ? 'Switch to English' : 'हिंदी में पूछें'}</span>
          </button>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-800">
            Explainable AI
          </span>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
        <span className="text-slate-400 flex items-center gap-1 whitespace-nowrap pl-1 text-[11px] font-semibold">
          <HelpCircle className="w-3.5 h-3.5" /> {language === 'hi' ? 'पूछें:' : 'Ask:'}
        </span>
        {activeQuestions.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(sq)}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-sky-300 rounded-full text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs transition font-medium cursor-pointer"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="p-4 space-y-3.5 max-h-80 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none shadow-xs'
                  : m.isEmergency
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100 border border-rose-200 dark:border-rose-900 rounded-tl-none space-y-2'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700 space-y-1'
              }`}
            >
              {m.sender === 'assistant' ? formatAssistantText(m.text) : m.text}

              {m.isEmergency && (
                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href="tel:112"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call 112 (India Emergency)</span>
                  </a>
                  <a
                    href="tel:911"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-white font-bold text-xs hover:bg-slate-800 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call 911 (Global)</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl px-4 py-2 text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700">
              <span className="animate-spin inline-block w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full" />
              <span>{language === 'hi' ? 'उत्तर तैयार किया जा रहा है...' : 'Generating explanation...'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            language === 'hi'
              ? 'मुंह के टेढ़ेपन, स्ट्रोक सुझाव, या रिपोर्ट के बारे में कोई भी सवाल पूछें...'
              : 'Ask about symmetry scores, what to do, confidence, or landmarks...'
          }
          className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputQuestion.trim() || loading}
          className="p-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
