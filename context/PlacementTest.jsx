import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MonacoIDE } from '../components/MonacoIDE';
import { TestcaseRunner } from '../components/TestcaseRunner';
import { SocraticCoach } from '../components/SocraticCoach';
import { judgeSubmission } from '../lib/judge';
import { FALLBACK_PROBLEMS } from '../lib/codeforces';
import { Trophy, Clock, CheckCircle2, ArrowRight, Award } from 'lucide-react';

// Calibrated placement problem set
const PLACEMENT_PROBLEMS = [
  {
    ...FALLBACK_PROBLEMS[0], // Watermelon 800
    difficultyLabel: 'Problem 1: Beginner Calibrator (Rating 800)',
    targetRating: 800
  },
  {
    ...FALLBACK_PROBLEMS[2], // Next Round 800
    difficultyLabel: 'Problem 2: Implementation Calibrator (Rating 1000)',
    targetRating: 1000
  },
  {
    ...FALLBACK_PROBLEMS[5], // Interesting drink 1100
    difficultyLabel: 'Problem 3: Algorithmic Calibrator (Rating 1300)',
    targetRating: 1300
  }
];

export const PlacementTest = ({ onNavigate }) => {
  const { user, completePlacementTest } = useAuth();
  
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [codes, setCodes] = useState(['', '', '']);
  const [languages, setLanguages] = useState(['cpp', 'cpp', 'cpp']);
  const [results, setResults] = useState([null, null, null]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [timeSeconds, setTimeSeconds] = useState(1800); // 30 minute test timer
  const [isFinished, setIsFinished] = useState(false);
  const [calibratedScore, setCalibratedScore] = useState(null);

  // Timer countdown
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setTimeSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  const currentProblem = PLACEMENT_PROBLEMS[activeProblemIdx];

  const handleRunTests = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const res = judgeSubmission(
        currentProblem.id,
        languages[activeProblemIdx],
        codes[activeProblemIdx],
        currentProblem.sampleTestcases
      );
      const newRes = [...results];
      newRes[activeProblemIdx] = res;
      setResults(newRes);
      setIsEvaluating(false);
    }, 400);
  };

  const finishTest = () => {
    let solvedCount = 0;
    let earnedRating = 800;

    results.forEach((res, idx) => {
      if (res && res.status === 'Accepted') {
        solvedCount++;
        earnedRating += PLACEMENT_PROBLEMS[idx].targetRating * 0.4;
      }
    });

    const timeBonus = Math.floor((timeSeconds / 1800) * 150);
    const finalRating = Math.round(earnedRating + timeBonus);

    setCalibratedScore(finalRating);
    setIsFinished(true);
    completePlacementTest(finalRating);
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col">
      
      {/* Top Banner */}
      <div className="bg-indigo-950/80 border-b border-indigo-500/30 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-yellow-400 animate-pulse" />
          <div>
            <h2 className="font-heading font-extrabold text-sm text-white">
              Mandatory Skill Calibration Placement Test
            </h2>
            <p className="text-xs text-indigo-300">
              Solve the 3 problems to calculate your initial Elo Rating & Rank Tier
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 font-mono text-sm px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-yellow-300">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span>{formatTimer(timeSeconds)}</span>
        </div>
      </div>

      {/* Problem Tabs Header */}
      <div className="bg-[#0f172a] border-b border-slate-800 px-6 py-2 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2">
          {PLACEMENT_PROBLEMS.map((prob, idx) => {
            const res = results[idx];
            const isAC = res?.status === 'Accepted';
            return (
              <button
                key={prob.id}
                onClick={() => setActiveProblemIdx(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeProblemIdx === idx
                    ? 'bg-indigo-600 text-white shadow-lg glow-blue'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>Problem {idx + 1}</span>
                {isAC && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={finishTest}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow glow-emerald flex items-center gap-1.5"
        >
          <span>Finish Placement Round</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Workspace Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Side: Problem Description */}
        <div className="lg:col-span-5 border-r border-slate-800 p-6 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-mono font-semibold mb-3">
            {currentProblem.difficultyLabel}
          </div>

          <h1 className="text-xl font-heading font-extrabold text-white mb-4">
            {currentProblem.name}
          </h1>

          <div className="prose prose-invert prose-xs leading-relaxed text-slate-300 space-y-4 mb-6">
            <p className="whitespace-pre-wrap">{currentProblem.description}</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                Input Format:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{currentProblem.inputSpecification}</p>
            </div>

            <div>
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                Output Format:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{currentProblem.outputSpecification}</p>
            </div>
          </div>
        </div>

        {/* Right Side: IDE + Testcase Output */}
        <div className="lg:col-span-7 flex flex-col p-4 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
          
          <div className="h-[420px]">
            <MonacoIDE
              code={codes[activeProblemIdx]}
              language={languages[activeProblemIdx]}
              onChange={(val) => {
                const newCodes = [...codes];
                newCodes[activeProblemIdx] = val;
                setCodes(newCodes);
              }}
              onLanguageChange={(lang) => {
                const newLangs = [...languages];
                newLangs[activeProblemIdx] = lang;
                setLanguages(newLangs);
              }}
              onRunTests={handleRunTests}
              onSubmit={handleRunTests}
              onAskCoach={() => setIsCoachOpen(true)}
              isEvaluating={isEvaluating}
            />
          </div>

          {/* Testcase Runner Result */}
          <TestcaseRunner
            judgeResult={results[activeProblemIdx]}
            sampleTestcases={currentProblem.sampleTestcases}
            isEvaluating={isEvaluating}
          />

        </div>

      </div>

      {/* Socratic Coach Drawer */}
      <SocraticCoach
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        problemTitle={currentProblem.name}
        problemDescription={currentProblem.description || ''}
        userCode={codes[activeProblemIdx]}
        userLanguage={languages[activeProblemIdx]}
      />

      {/* Finished Calibration Modal */}
      {isFinished && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center border border-indigo-500/30 glow-purple animate-slide-up">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 text-white shadow-xl mb-4">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-white mb-2">
              Calibration Complete!
            </h2>
            <p className="text-xs text-slate-300 mb-6">
              Based on your speed and solution accuracy across the placement problems, your starting Elo Rating has been established.
            </p>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 mb-6 space-y-2">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Initial Elo Rating
              </div>
              <div className="text-4xl font-heading font-extrabold text-indigo-400 font-mono">
                {calibratedScore}
              </div>
            </div>

            <button
              onClick={() => onNavigate('/dashboard')}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg glow-blue flex items-center justify-center gap-2"
            >
              <span>Enter Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
