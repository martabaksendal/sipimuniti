import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { RatingBadge } from '../components/RatingBadge';
import { db } from '../lib/db';
import { MessageSquare, Send } from 'lucide-react';

export const Chatwall = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const loadMessages = () => {
    setMessages(db.getChatMessages());
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!user || !inputText.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      username: user.username,
      rating: user.rating,
      rankTier: user.rankTier,
      text: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    db.addChatMessage(newMsg);
    setInputText('');
    loadMessages();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0b0f19] p-4 sm:p-6 max-w-5xl mx-auto flex flex-col">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 glow-purple">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-extrabold text-white">
              Global Algorithmic Chatwall
            </h1>
            <p className="text-xs text-slate-400">
              Discuss competitive programming techniques, time complexities, and share insights
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Arena Chat</span>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-800 p-4 overflow-y-auto min-h-[440px] max-h-[560px] space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = user && msg.username.toLowerCase() === user.username.toLowerCase();
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                  {msg.username[0].toUpperCase()}
                </div>
              )}

              <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end text-right' : 'items-start'}`}>
                {/* User info bar */}
                <div className={`flex items-center gap-2 text-xs font-mono ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span className="font-bold text-slate-200">{msg.username}</span>
                  <RatingBadge rating={msg.rating} size="sm" />
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Send Message Form */}
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder={user ? "Share algorithmic ideas or ask the community..." : "Log in to join the conversation"}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={!user}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 font-sans"
        />
        <button
          type="submit"
          disabled={!user || !inputText.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg glow-blue flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Post</span>
        </button>
      </form>

    </div>
  );
};
