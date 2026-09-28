import React, { useState } from 'react';
import { MessageSquare, HelpCircle, Send, Sparkles, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function ResultExplanationAssistant({ assessment }) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello! I am your AI Educational Assistant. I can explain the facial asymmetry features measured from your assessment, what the model confidence indicates, and how to understand your results."
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "What does mouth asymmetry mean?",
    "What does model confidence mean?",
    "Explain my report simply",
    "What does input reliability mean?",
    "Why was my result marked uncertain?"
  ];

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

      const reply = res.data?.answer || "I can help explain the facial landmark metrics and how bilateral symmetry is evaluated.";
      setMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "I am an educational reference tool. In this assessment, MediaPipe extracted 468 bilateral landmarks to compute horizontal and vertical symmetry scores. For clinical evaluation, always consult a licensed neurologist."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Result Explanation Assistant</h3>
            <p className="text-xs text-slate-500">Educational biomarker & report insights (Not medical advice)</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold border border-sky-200">
          Educational Mode
        </span>
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
        <span className="text-slate-400 flex items-center gap-1 whitespace-nowrap pl-1">
          <HelpCircle className="w-3.5 h-3.5" /> Ask:
        </span>
        {suggestedQuestions.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(sq)}
            className="px-2.5 py-1 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-full text-slate-700 whitespace-nowrap text-xs transition font-medium"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 rounded-2xl px-4 py-2 text-xs flex items-center gap-2">
              <span className="animate-spin inline-block w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full" />
              Generating educational explanation...
            </div>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your symmetry scores, confidence, or landmarks..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputQuestion.trim() || loading}
          className="p-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
