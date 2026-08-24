import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RatingBadge } from '../components/RatingBadge';
import { db } from '../lib/db';
import { FALLBACK_PROBLEMS } from '../lib/codeforces';
import {
  BookOpen,
  PlusCircle,
  ThumbsUp,
  Search,
  Lock,
  Sparkles,
  X,
  Send,
  Code2,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export const Editorials = ({ onNavigate }) => {
  const { user } = useAuth();
  const [editorials, setEditorials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblemFilter, setSelectedProblemFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Publish Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isLockedAlertOpen, setIsLockedAlertOpen] = useState(false);

  // Publish Form State
  const [pubProblemId, setPubProblemId] = useState(FALLBACK_PROBLEMS[0].id);
  const [pubTitle, setPubTitle] = useState('');
  const [pubApproach, setPubApproach] = useState('');
  const [pubTimeComplexity, setPubTimeComplexity] = useState('O(N)');
  const [pubSpaceComplexity, setPubSpaceComplexity] = useState('O(1)');
  const [pubContent, setPubContent] = useState('');
  const [pubCodeSnippet, setPubCodeSnippet] = useState('');
  const [pubSuccessMsg, setPubSuccessMsg] = useState(false);

  const loadData = () => {
    setEditorials(db.getEditorials());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenPublish = () => {
    if (!user) return;
    // Strict requirement: User rating >= 2700 (Grandmaster rank)
    if (user.rating < 2700) {
      setIsLockedAlertOpen(true);
    } else {
      setIsPublishModalOpen(true);
    }
  };

  const handleUpvote = (id, e) => {
    e.stopPropagation();
    db.upvoteEditorial(id);
    loadData();
  };

  const handleCopyCode = (code, id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePublishSubmit = (e) => {
    e.preventDefault();
    if (!user) return;
    if (!pubTitle.trim() || !pubContent.trim() || !pubApproach.trim()) return;

    const prob = FALLBACK_PROBLEMS.find(p => p.id === pubProblemId) || FALLBACK_PROBLEMS[0];

    const newEditorial = {
      id: `ed_${Date.now()}`,
      problemId: prob.id,
      problemTitle: prob.name,
      rating: prob.rating,
      author: user.username,
      authorRating: user.rating,
      authorRankTier: user.rankTier,
      title: pubTitle.trim(),
      approach: pubApproach.trim(),
      timeComplexity: pubTimeComplexity.trim() || 'O(N)',
      spaceComplexity: pubSpaceComplexity.trim() || 'O(1)',
      content: pubContent.trim(),
      codeSnippet: pubCodeSnippet.trim() || undefined,
      upvotes: 1,
      timestamp: new Date().toISOString()
    };

    db.addEditorial(newEditorial);
    setPubSuccessMsg(true);
    setTimeout(() => {
      setPubSuccessMsg(false);
      setIsPublishModalOpen(false);
      setPubTitle('');
      setPubApproach('');
      setPubContent('');
      setPubCodeSnippet('');
      loadData();
    }, 1500);
  };

  const filteredEditorials = editorials.filter(ed => {
    const matchesSearch = ed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ed.problemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ed.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedProblemFilter === 'all' || ed.problemId === selectedProblemFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
              <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
              <span>Grandmaster Algorithmic Insights</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Community Editorial Board
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Explore step-by-step problem breakdowns, full solution code snippets, and time/space complexity analyses published by top-ranked Competitive Programmers.
            </p>
          </div>

          {/* Publish Editorial Trigger Button */}
          <button
            onClick={handleOpenPublish}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-purple flex items-center gap-2 shrink-0"
          >
            {user && user.rating >= 2700 ? (
              <PlusCircle className="w-4 h-4 text-yellow-300" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            <span>Publish Editorial (2700+ Elo)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search editorials by title, problem, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Problem Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Filter Problem:</span>
          <select
            value={selectedProblemFilter}
            onChange={(e) => setSelectedProblemFilter(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Problems</option>
            {FALLBACK_PROBLEMS.map(p => (
              <option key={p.id} value={p.id}>{p.name} [{p.rating}]</option>
            ))}
          </select>
        </div>

      </div>

      {/* Editorial Cards List */}
      <div className="space-y-4">
        {filteredEditorials.length === 0 ? (
          <div className="glass-panel p-12 rounded-xl text-center space-y-3 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm font-semibold">No editorials match your filter criteria.</p>
          </div>
        ) : (
          filteredEditorials.map((ed) => {
            const isExpanded = expandedId === ed.id;
            return (
              <div
                key={ed.id}
                onClick={() => setExpandedId(isExpanded ? null : ed.id)}
                className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 cursor-pointer glass-panel-hover transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-mono font-bold">
                        {ed.problemTitle} (Rating {ed.rating})
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(ed.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-heading font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {ed.title}
                    </h3>
                  </div>

                  {/* Author Badge & Upvotes */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Author:</span>
                      <strong className="text-slate-200">{ed.author}</strong>
                      <RatingBadge rating={ed.authorRating} size="sm" />
                    </div>

                    <button
                      onClick={(e) => handleUpvote(ed.id, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-mono font-bold transition-all"
                      title="Upvote Editorial"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{ed.upvotes}</span>
                    </button>
                  </div>
                </div>

                {/* Metadata Pills: Approach, Time Complexity, Space Complexity */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    <strong>Approach:</strong> {ed.approach}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                    <strong>Time:</strong> {ed.timeComplexity}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                    <strong>Space:</strong> {ed.spaceComplexity}
                  </span>
                </div>

                {/* Editorial Explanation Body */}
                <div className="text-xs text-slate-300 leading-relaxed font-sans pt-2">
                  <div className={`whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-2 opacity-90'}`}>
                    {ed.content}
                  </div>
                </div>

                {/* Full Solution Code Snippet (Expanded Mode) */}
                {isExpanded && ed.codeSnippet && (
                  <div
                    className="pt-3 border-t border-slate-800/80 space-y-2 animate-slide-up"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-indigo-400" />
                        <span>Full Solution Code Snippet</span>
                      </span>

                      <button
                        onClick={(e) => handleCopyCode(ed.codeSnippet, ed.id, e)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-mono flex items-center gap-1 transition-all"
                      >
                        {copiedId === ed.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 text-xs font-mono max-h-[340px] overflow-y-auto overflow-x-auto whitespace-pre custom-scrollbar">
                      <code>{ed.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                <div className="text-indigo-400 text-[11px] font-mono font-bold pt-1">
                  {isExpanded ? 'Click to collapse ▲' : 'Click to read full editorial & view solution code ▼'}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Locked Requirement Alert Modal (If rating < 2700) */}
      {isLockedAlertOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-amber-500/40 glow-purple animate-slide-up relative">
            <button
              onClick={() => setIsLockedAlertOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-white text-lg">
                  Grandmaster Elo Requirement
                </h3>
                <p className="text-xs text-amber-300 font-mono">Rating 2700+ Required to Publish</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              To maintain elite quality standards across AlgoArena editorials, publishing original solution breakdowns requires a minimum rating of <strong className="text-amber-400 font-mono">2700 Elo (Grandmaster Rank)</strong>.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1 mb-6">
              <div className="text-slate-400">Your Current Rating: <strong className="text-indigo-400">{user?.rating || 800} Elo</strong></div>
              <div className="text-slate-400">Required Rating: <strong className="text-amber-400">2700 Elo</strong></div>
            </div>

            <button
              onClick={() => setIsLockedAlertOpen(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow glow-blue"
            >
              Understand & Return to Practice
            </button>
          </div>
        </div>
      )}

      {/* Publish Editorial Modal Form (If rating >= 2700) */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-2xl w-full border border-purple-500/40 glow-purple animate-slide-up relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsPublishModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-purple-600/20 text-yellow-300 border border-purple-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-white text-lg">
                  Publish New Algorithm Editorial
                </h3>
                <p className="text-xs text-slate-400">Authorized Grandmaster Contributor ({user?.username})</p>
              </div>
            </div>

            {pubSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Editorial published successfully to the global board!</span>
              </div>
            )}

            <form onSubmit={handlePublishSubmit} className="space-y-4 text-xs font-sans">
              
              {/* Select Problem */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Target Problem
                </label>
                <select
                  value={pubProblemId}
                  onChange={(e) => setPubProblemId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                >
                  {FALLBACK_PROBLEMS.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.rating}] {p.name} ({p.tags.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Editorial Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematical Parity & Edge Case Proof"
                  value={pubTitle}
                  onChange={(e) => setPubTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Approach & Complexities */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Approach Pattern
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dynamic Programming"
                    value={pubApproach}
                    onChange={(e) => setPubApproach(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Time Complexity
                  </label>
                  <input
                    type="text"
                    placeholder="O(N log N)"
                    value={pubTimeComplexity}
                    onChange={(e) => setPubTimeComplexity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Space Complexity
                  </label>
                  <input
                    type="text"
                    placeholder="O(1)"
                    value={pubSpaceComplexity}
                    onChange={(e) => setPubSpaceComplexity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Explanation Content */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Editorial Explanation & Intuition
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain step-by-step mathematical reasoning, edge cases, and algorithmic transitions..."
                  value={pubContent}
                  onChange={(e) => setPubContent(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              {/* Full Solution Code Snippet */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Full Solution Code Snippet (C++ / Python / Java)
                </label>
                <textarea
                  rows={5}
                  placeholder="#include <iostream>&#10;using namespace std;&#10;..."
                  value={pubCodeSnippet}
                  onChange={(e) => setPubCodeSnippet(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-indigo-500 custom-scrollbar"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-purple flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Publish Editorial to Board</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
