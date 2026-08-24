import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MonacoIDE } from '../components/MonacoIDE';
import { TestcaseRunner } from '../components/TestcaseRunner';
import { SocraticCoach } from '../components/SocraticCoach';
import { RatingBadge } from '../components/RatingBadge';
import { fetchCodeforcesProblems, fetchCodeforcesStatement, FALLBACK_PROBLEMS } from '../lib/codeforces';
import { judgeSubmission } from '../lib/judge';
import { db } from '../lib/db';
import {
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Code2,
  ChevronLeft,
  BookOpen,
  Grid,
  Layers,
  Zap,
  RefreshCw,
  Download,
  FileText
} from 'lucide-react';

export const Practice = ({ initialProblemId }) => {
  const { user, recordSolvedProblem } = useAuth();

  const [problems, setProblems] = useState(FALLBACK_PROBLEMS);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStatement, setIsFetchingStatement] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  // IDE State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [judgeResult, setJudgeResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [acToast, setAcToast] = useState(false);

  // Auto-fetch full problem statement if not imported yet
  const handleImportStatement = async (problem) => {
    if (!problem || !problem.contestId || !problem.index) return;
    setIsFetchingStatement(true);
    try {
      const statement = await fetchCodeforcesStatement(problem.contestId, problem.index);
      if (statement) {
        const updated = { ...problem, ...statement, isStatementImported: true };
        setSelectedProblem(updated);
        setProblems(prev => prev.map(p => p.id === updated.id ? updated : p));
      }
    } catch (err) {
      console.warn('Error importing statement:', err);
    } finally {
      setIsFetchingStatement(false);
    }
  };

  useEffect(() => {
    if (selectedProblem && selectedProblem.contestId && selectedProblem.index && (!selectedProblem.isStatementImported || selectedProblem.description?.length < 100)) {
      handleImportStatement(selectedProblem);
    }
  }, [selectedProblem?.id]);

  // Load Codeforces Problems
  useEffect(() => {
    const loadProblems = async () => {
      setIsLoading(true);
      const tagParam = selectedTag === 'all' ? undefined : selectedTag;
      const minRat = selectedRating === 'all' ? undefined : parseInt(selectedRating, 10);
      const maxRat = selectedRating === 'all' ? undefined : (parseInt(selectedRating, 10) >= 2000 ? 3500 : parseInt(selectedRating, 10) + 100);

      const fetched = await fetchCodeforcesProblems(tagParam, minRat, maxRat);
      if (fetched && fetched.length > 0) {
        setProblems(fetched);
        if (initialProblemId) {
          const match = fetched.find(p => p.id === initialProblemId);
          if (match) setSelectedProblem(match);
        }
      }
      setIsLoading(false);
    };
    loadProblems();
  }, [selectedTag, selectedRating]);

  // Handle Search Filter
  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.contestId && `${p.contestId}${p.index}`.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Code Execution Trigger
  const handleRunTests = () => {
    if (!selectedProblem) return;
    setIsEvaluating(true);
    setAcToast(false);
    setTimeout(() => {
      const res = judgeSubmission(
        selectedProblem.id,
        language,
        code,
        selectedProblem.sampleTestcases
      );
      setJudgeResult(res);
      setIsEvaluating(false);

      if (res.status === 'Accepted' && user) {
        setAcToast(true);
        recordSolvedProblem(selectedProblem.id, selectedProblem.rating);

        const sub = {
          id: `sub_${Date.now()}`,
          username: user.username,
          problemId: selectedProblem.id,
          problemTitle: selectedProblem.name,
          language,
          code,
          status: 'Accepted',
          executionTime: res.executionTimeMs,
          passedTestcases: res.passedTestcases,
          totalTestcases: res.totalTestcases,
          timestamp: new Date().toISOString()
        };
        db.addSubmission(sub);
      }
    }, 450);
  };

  // Phase 1: Codeforces Problem Catalog Explorer (When NO problem is opened yet)
  if (!selectedProblem) {
    return (
      <div className="min-h-screen bg-[#0b0f19] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Parsed Official Codeforces Problemset</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                Codeforces Problem Catalog
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Browse thousands of official Codeforces competitive programming problems. Filter by difficulty ratings or tags, then open any problem directly in the Monaco IDE workspace!
              </p>
            </div>

            <button
              onClick={() => {
                if (filteredProblems.length > 0) {
                  const rand = filteredProblems[Math.floor(Math.random() * filteredProblems.length)];
                  setSelectedProblem(rand);
                  setJudgeResult(null);
                  setAcToast(false);
                }
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg glow-blue flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Random Problem Challenge</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 1,000+ problems by name or ID (e.g., 4A, Theatre Square)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category / Tag Selector */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-slate-950 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Category Tags</option>
                <option value="implementation">Implementation</option>
                <option value="math">Math</option>
                <option value="dp">Dynamic Programming (DP)</option>
                <option value="greedy">Greedy Algorithms</option>
                <option value="graphs">Graph Theory</option>
                <option value="binary search">Binary Search</option>
                <option value="strings">Strings</option>
                <option value="trees">Trees</option>
                <option value="data structures">Data Structures</option>
                <option value="constructive algorithms">Constructive Algorithms</option>
                <option value="sorting">Sorting</option>
                <option value="brute force">Brute Force</option>
                <option value="number theory">Number Theory</option>
                <option value="two pointers">Two Pointers</option>
              </select>
            </div>

            {/* Rating Selector */}
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="all">All Rating Difficulties</option>
              <option value="800">Rating 800 (Easy / Newbie)</option>
              <option value="900">Rating 900</option>
              <option value="1000">Rating 1000 (Pupil)</option>
              <option value="1100">Rating 1100</option>
              <option value="1200">Rating 1200 (Specialist)</option>
              <option value="1300">Rating 1300</option>
              <option value="1400">Rating 1400 (Expert)</option>
              <option value="1500">Rating 1500 (Hard)</option>
              <option value="1600">Rating 1600</option>
              <option value="1800">Rating 1800 (Candidate Master)</option>
              <option value="2000">Rating 2000+ (Master / GM)</option>
            </select>
          </div>

        </div>

        {/* Loading Spinner or Problem Grid */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">Parsing Codeforces problems from API...</span>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 space-y-3">
            <Code2 className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm font-semibold">No Codeforces problems found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProblems.map((prob) => {
              const isSolved = user?.solvedProblems?.includes(prob.id);

              return (
                <div
                  key={prob.id}
                  onClick={() => {
                    setSelectedProblem(prob);
                    setJudgeResult(null);
                    setAcToast(false);
                  }}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 cursor-pointer glass-panel-hover transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded bg-slate-900 text-indigo-400 border border-slate-800 text-xs font-mono font-bold">
                        Rating: {prob.rating}
                      </span>

                      {isSolved ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Solved</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          {prob.index ? `Contest ${prob.contestId}${prob.index}` : 'Standard'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-heading font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {prob.name}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {prob.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Codeforces Problem
                    </span>
                    <button className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5">
                      <span>Solve in IDE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    );
  }

  // Phase 2: IDE & Problem Statement Workspace (When a specific problem is selected)
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0b0f19] flex flex-col">
      
      {/* Workspace Navigation Header Bar */}
      <div className="bg-[#0f172a] border-b border-slate-800 px-6 py-2.5 flex items-center justify-between">
        
        {/* Back to Catalog Button */}
        <button
          onClick={() => {
            setSelectedProblem(null);
            setJudgeResult(null);
            setAcToast(false);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-indigo-400" />
          <span>Back to Codeforces Catalog</span>
        </button>

        {/* Active Problem Info */}
        <div className="flex items-center gap-3">
          <h2 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
            <span>{selectedProblem.name}</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-mono font-bold">
            Rating: {selectedProblem.rating}
          </span>
        </div>

        {/* Quick Switch to Next Random Question */}
        <button
          onClick={() => {
            if (filteredProblems.length > 0) {
              const rand = filteredProblems[Math.floor(Math.random() * filteredProblems.length)];
              setSelectedProblem(rand);
              setJudgeResult(null);
              setAcToast(false);
            }
          }}
          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
          title="Hop to Next Random Problem"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Next Random</span>
        </button>

      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* Left Side: Problem Statement View */}
        <div className="lg:col-span-5 border-r border-slate-800 p-6 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar bg-[#0d1322] space-y-6">
          
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap gap-1.5">
                {selectedProblem.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleImportStatement(selectedProblem)}
                disabled={isFetchingStatement}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                title="Fetch / Refresh complete statement from Codeforces"
              >
                {isFetchingStatement ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                ) : (
                  <FileText className="w-3 h-3 text-indigo-400" />
                )}
                <span>{selectedProblem.isStatementImported ? 'Statement Imported' : 'Import Statement'}</span>
              </button>
            </div>

            <h1 className="text-xl font-heading font-extrabold text-white">
              {selectedProblem.name}
            </h1>
            {selectedProblem.contestId && (
              <span className="text-xs font-mono text-slate-400 mt-1 block">
                Codeforces Problem {selectedProblem.contestId}{selectedProblem.index} • Limits: {selectedProblem.timeLimitSeconds || 1}s, {selectedProblem.memoryLimitMB || 256}MB
              </span>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-invert prose-xs leading-relaxed text-slate-300 space-y-4">
            <p className="whitespace-pre-wrap">{selectedProblem.description}</p>
          </div>

          {/* Input / Output Format */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                Input Format:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedProblem.inputSpecification}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                Output Format:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedProblem.outputSpecification}
              </p>
            </div>
          </div>

          {/* Sample Testcases Display */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Sample Test Cases:
            </h4>
            {selectedProblem.sampleTestcases.map((tc, idx) => (
              <div key={idx} className="space-y-2 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold mb-1">INPUT {idx + 1}:</div>
                  <pre className="text-slate-200 overflow-x-auto whitespace-pre-wrap">{tc.input}</pre>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold mb-1">OUTPUT {idx + 1}:</div>
                  <pre className="text-emerald-300 overflow-x-auto whitespace-pre-wrap">{tc.output}</pre>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Side: Monaco IDE & Test Output Sidebar View */}
        <div className="lg:col-span-7 flex flex-col p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
          
          {/* AC Success Toast */}
          {acToast && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between glow-emerald animate-slide-up">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="font-bold text-white text-sm">Accepted (AC)!</strong>
                  <p className="text-[11px]">Problem solved! Incremental Elo rating recorded.</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
            </div>
          )}

          {/* Monaco IDE Container */}
          <div className="h-[430px]">
            <MonacoIDE
              code={code}
              language={language}
              onChange={setCode}
              onLanguageChange={setLanguage}
              onRunTests={handleRunTests}
              onSubmit={handleRunTests}
              onAskCoach={() => setIsCoachOpen(true)}
              isEvaluating={isEvaluating}
            />
          </div>

          {/* Testcase Runner Component */}
          <TestcaseRunner
            judgeResult={judgeResult}
            sampleTestcases={selectedProblem.sampleTestcases}
            isEvaluating={isEvaluating}
          />

        </div>

      </div>

      {/* Socratic Coach Drawer */}
      <SocraticCoach
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        problemTitle={selectedProblem.name}
        problemDescription={selectedProblem.description || ''}
        userCode={code}
        userLanguage={language}
      />

    </div>
  );
};
