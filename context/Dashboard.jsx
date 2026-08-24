import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RatingBadge } from '../components/RatingBadge';
import { db } from '../lib/db';
import { FALLBACK_PROBLEMS } from '../lib/codeforces';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Code2,
  ArrowRight,
  Award,
  Zap,
  Activity,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export const Dashboard = ({ onNavigate, onSelectProblem }) => {
  const { user } = useAuth();

  if (!user) return null;

  const userSubmissions = db.getUserSubmissions(user.username);
  const acCount = user.solvedProblems?.length || userSubmissions.filter(s => s.status === 'Accepted').length;

  // Filter pool matching user rating tier
  const eligibleProblems = FALLBACK_PROBLEMS.filter(p => {
    return p.rating <= user.rating + 300 && p.rating >= user.rating - 200;
  });

  // Recommended problems state with shuffle capability
  const [recommendedProblems, setRecommendedProblems] = useState(() => {
    return [...eligibleProblems].sort(() => Math.random() - 0.5).slice(0, 4);
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshQuestions = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const shuffled = [...eligibleProblems].sort(() => Math.random() - 0.5).slice(0, 4);
      setRecommendedProblems(shuffled);
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-500/20 relative overflow-hidden bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                Welcome back, <span className="text-indigo-400">{user.username}</span>!
              </h1>
              <RatingBadge rating={user.rating} size="lg" />
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              You are on a <strong className="text-orange-400">{user.streak} day streak</strong>! Solve standard problems to gain Elo points and boost your competitive programming tier.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefreshQuestions}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shadow flex items-center gap-2 transition-all"
              title="Refresh / Shuffle Homepage Question Recommendations"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Questions</span>
            </button>

            <button
              onClick={() => onNavigate('/practice')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg glow-blue flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              <span>Open Practice IDE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Rating Card */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Elo</div>
            <div className="text-2xl font-heading font-extrabold text-white font-mono">{user.rating}</div>
            <div className="text-[11px] text-indigo-300 font-mono">Max: {user.maxRating}</div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Flame className="w-6 h-6 fill-orange-400 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Streak</div>
            <div className="text-2xl font-heading font-extrabold text-white font-mono">{user.streak} Days</div>
            <div className="text-[11px] text-slate-400">Keep daily momentum</div>
          </div>
        </div>

        {/* Solved Problems */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Solved Problems</div>
            <div className="text-2xl font-heading font-extrabold text-white font-mono">{acCount}</div>
            <div className="text-[11px] text-emerald-400">+1 Elo per 5 solved</div>
          </div>
        </div>

        {/* Rank Tier */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rank Tier</div>
            <div className="text-lg font-heading font-extrabold text-purple-300">{user.rankTier}</div>
            <div className="text-[11px] text-slate-400">Codeforces standard</div>
          </div>
        </div>

      </div>

      {/* Main Content Grid: Recommended Problems + Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recommended Practice Problems */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Recommended for Your Rating</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshQuestions}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
                title="Shuffle Question List"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => onNavigate('/practice')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {recommendedProblems.map((prob) => {
              const isSolved = user.solvedProblems?.includes(prob.id);
              return (
                <div
                  key={prob.id}
                  onClick={() => {
                    if (onSelectProblem) onSelectProblem(prob.id);
                    onNavigate('/practice');
                  }}
                  className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 cursor-pointer glass-panel-hover flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-indigo-400 font-mono text-xs font-bold">
                      {prob.rating}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {prob.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {prob.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isSolved ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Solved</span>
                      </span>
                    ) : (
                      <button className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1">
                        <span>Solve</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>Recent Submissions</span>
          </h2>

          <div className="glass-panel p-5 rounded-xl border border-slate-800 min-h-[280px]">
            {userSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2 text-center">
                <Code2 className="w-8 h-8 opacity-40" />
                <p className="text-xs font-medium">No recent submissions yet.</p>
                <button
                  onClick={() => onNavigate('/practice')}
                  className="text-xs text-indigo-400 font-semibold hover:underline"
                >
                  Start solving problems in the Practice IDE
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {userSubmissions.slice(0, 5).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{sub.problemTitle}</div>
                      <div className="text-[10px] text-slate-500">{sub.language.toUpperCase()} • {new Date(sub.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        sub.status === 'Accepted'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
