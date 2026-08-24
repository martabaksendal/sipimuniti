import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { askSocraticCoach } from '../lib/gemini';
import { Bot, MessageSquare, X, Send, Sparkles, HelpCircle, Key, ChevronDown, Minimize2 } from 'lucide-react';

export const LiveAIChat = () => {
  const { geminiApiKey } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '👋 Hi! I am your 24/7 **CPmunnity Live AI Assistant**. \n\nAsk me anything about Competitive Programming principles (DP, Greedy, DnC, Graphs), C++/Python syntax, or how to solve algorithmic problems!'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (customText) => {
    const textToSend = customText || inputText.trim();
    if (!textToSend) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    if (!customText) setInputText('');
    setIsLoading(true);

    try {
      if (geminiApiKey) {
        const response = await askSocraticCoach({
          apiKey: geminiApiKey,
          problemTitle: 'General Competitive Programming Query',
          problemDescription: 'User asking general CP algorithms or platform questions.',
          userCode: '',
          userLanguage: 'cpp',
          userQuestion: textToSend,
          hintType: 'conceptual'
        });
        setMessages(prev => [...prev, { role: 'assistant', text: response }]);
      } else {
        // High quality offline fallback responses for general questions
        setTimeout(() => {
          let reply = 'Great question! In Competitive Programming:\n\n';
          const lower = textToSend.toLowerCase();
          if (lower.includes('dp') || lower.includes('dynamic')) {
            reply += '• **Dynamic Programming (DP)** solves complex problems by breaking them into overlapping subproblems and storing results (memoization/tabulation).\n• Key formula: $dp[i] = \max(dp[i-1], dp[i-2] + \text{cost})$.';
          } else if (lower.includes('dnc') || lower.includes('divide')) {
            reply += '• **Divide & Conquer (DnC)** breaks a problem into smaller independent subproblems, solves them recursively, and merges the solutions (e.g. Merge Sort, Binary Search).';
          } else if (lower.includes('greedy')) {
            reply += '• **Greedy Algorithms** make the locally optimal choice at each step hoping to find the global optimum (e.g. Interval Scheduling, Huffman Coding).';
          } else {
            reply += `To get live AI responses powered by Google Gemini, add your Gemini API Key in **Settings** or the assistant drawer!\n\nFor "${textToSend}": Focus on identifying the time complexity constraint ($N \le 10^5 \implies O(N \log N)$) and choose the appropriate data structure.`;
          }
          setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        }, 500);
      }
    } catch (err) {
      console.warn('Live AI Chat Gemini call error:', err);
      const errorDetail = err?.message || 'Network error connecting to Gemini API.';
      let reply = `⚠️ **Gemini API Notice:** ${errorDetail}\n\n*Providing smart CP guidance below:*\n\n`;
      const lower = textToSend.toLowerCase();
      if (lower.includes('dp') || lower.includes('dynamic')) {
        reply += '• **Dynamic Programming (DP)** breaks complex state transitions into smaller overlapping subproblems.\n• Key formulation: State definition $dp[i]$ and base cases.';
      } else if (lower.includes('dnc') || lower.includes('divide')) {
        reply += '• **Divide & Conquer (DnC)** divides search spaces in half (e.g., Binary Search, Merge Sort).';
      } else if (lower.includes('greedy')) {
        reply += '• **Greedy Algorithms** select locally optimal choices (e.g., Interval Scheduling, Kruskal MST).';
      } else {
        reply += `For "${textToSend}": Evaluate constraints ($N \\le 10^5 \\implies O(N \\log N)$) and choose suitable data structures like Segment Trees, Vectors, or Maps.`;
      }
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-2xl hover:scale-105 transition-all duration-200 glow-purple flex items-center gap-2"
          title="Open Live AI Chat Assistant"
        >
          <Bot className="w-6 h-6 stroke-[2.5]" />
          <span className="hidden sm:inline font-heading font-extrabold text-xs tracking-wider uppercase pr-1">
            Ask AI
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute top-1 right-1" />
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full sm:w-[400px] h-[520px] bg-[#0f172a] border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-600/20 text-yellow-300 border border-purple-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-white text-sm flex items-center gap-1.5">
                  AlgoArena Live AI Chat
                </h3>
                <p className="text-[10px] text-slate-400">Ask general CP questions anytime</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-[#0d1322]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-2xl rounded-bl-none text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>AI thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Prompts & Form */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              <button
                onClick={() => handleSend('Explain Dynamic Programming memoization')}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 whitespace-nowrap"
              >
                💡 Explain DP
              </button>
              <button
                onClick={() => handleSend('What is Divide and Conquer?')}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 whitespace-nowrap"
              >
                ⚡ Divide & Conquer
              </button>
              <button
                onClick={() => handleSend('How to choose Greedy vs DP?')}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 whitespace-nowrap"
              >
                🎯 Greedy vs DP
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask any CP concept or code logic..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center justify-center disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
