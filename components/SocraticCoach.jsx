import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { askSocraticCoach } from '../lib/gemini';
import {
  Sparkles,
  X,
  Send,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Key,
  Bot
} from 'lucide-react';

export const SocraticCoach = ({
  isOpen,
  onClose,
  problemTitle,
  problemDescription,
  userCode,
  userLanguage
}) => {
  const { geminiApiKey, updateGeminiApiKey } = useAuth();
  const [keyInput, setKeyInput] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const [hintType, setHintType] = useState('conceptual');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `👋 Greetings! I am your **Socratic CP Coach** powered by Google Gemini. \n\nI will never give you direct code solutions or explicit pseudocode. Instead, I will ask probing questions to help you discover the correct data structures, mathematical patterns, and edge cases yourself!\n\nHow can I guide you today?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    if (keyInput.trim()) {
      updateGeminiApiKey(keyInput.trim());
      setKeyInput('');
    }
  };

  const handleRequestHint = async (selectedType) => {
    const type = selectedType || hintType;
    if (!geminiApiKey) {
      setErrorMsg('Please enter your Google Gemini API Key below to activate the coach.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    const questionText = userQuestion.trim() || undefined;
    const userMsg = questionText || (type === 'conceptual' ? 'Need conceptual hint' : type === 'edge_cases' ? 'Check edge cases' : 'Probe code logic');
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setUserQuestion('');

    try {
      const response = await askSocraticCoach({
        apiKey: geminiApiKey,
        problemTitle,
        problemDescription,
        userCode,
        userLanguage,
        userQuestion: questionText,
        hintType: type
      });

      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to connect to Gemini API. Check your key or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#0f172a] border-l border-indigo-500/30 shadow-2xl flex flex-col animate-slide-up">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-yellow-300 border border-indigo-500/40">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-slate-100 flex items-center gap-2 text-base">
              Socratic CP Coach
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Gemini 1.5
              </span>
            </h3>
            <p className="text-xs text-slate-400">No code solutions • Guiding questions only</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Guardrail Banner */}
      <div className="bg-indigo-950/60 border-b border-indigo-500/20 px-4 py-2.5 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-xs text-indigo-200 leading-snug">
          <strong>Strict Guardrail active:</strong> The AI tutor asks guiding questions to help you think like a Competitive Programmer without writing solution code for you.
        </p>
      </div>

      {!geminiApiKey && (
        <div className="m-4 p-4 rounded-xl bg-amber-950/40 border border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-2">
            <Key className="w-4 h-4" />
            <span>Google Gemini API Key Required</span>
          </div>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            Enter your custom Gemini API key to unlock Socratic AI assistance. Your key is stored client-side in your browser state.
          </p>
          <form onSubmit={handleSaveApiKey} className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow"
            >
              Save Key
            </button>
          </form>
        </div>
      )}

      {errorMsg && (
        <div className="mx-4 mt-2 p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30 mt-1">
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl rounded-bl-none text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Analyzing logic & constructing Socratic questions...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => handleRequestHint('conceptual')}
            disabled={isLoading || !geminiApiKey}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Conceptual Hint</span>
          </button>
          <button
            onClick={() => handleRequestHint('edge_cases')}
            disabled={isLoading || !geminiApiKey}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <span>Edge Cases Pointer</span>
          </button>
          <button
            onClick={() => handleRequestHint('logic_probe')}
            disabled={isLoading || !geminiApiKey}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Probe My Logic</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRequestHint();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question about your solution logic..."
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            disabled={isLoading || !geminiApiKey}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !geminiApiKey || (!userQuestion.trim() && isLoading)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
