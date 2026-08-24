import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RatingBadge } from '../components/RatingBadge';
import { MonacoIDE } from '../components/MonacoIDE';
import { TestcaseRunner } from '../components/TestcaseRunner';
import { SocraticCoach } from '../components/SocraticCoach';
import { CompetitionCalendar } from '../components/CompetitionCalendar';
import { db } from '../lib/db';
import { FALLBACK_PROBLEMS } from '../lib/codeforces';
import { judgeSubmission } from '../lib/judge';
import {
  Trophy,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  Zap,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  Award,
  AlertCircle,
  Play,
  Flame,
  X,
  List,
  Calendar as CalendarIcon,
  ExternalLink,
  Swords,
  ShieldAlert,
  UserCheck,
  RotateCcw,
  PlusCircle,
  Lock,
  Send
} from 'lucide-react';

// 5 Codeforces Showcase Problems in Progressive Difficulty Order (800 -> 1500)
const SHOWCASE_CONTEST_PROBLEMS = [
  {
    ...FALLBACK_PROBLEMS[0], // Watermelon 800
    contestLabel: 'Problem A: Watermelon',
    points: 500
  },
  {
    ...FALLBACK_PROBLEMS[3], // Theatre Square 1000
    contestLabel: 'Problem B: Theatre Square',
    points: 750
  },
  {
    ...FALLBACK_PROBLEMS[5], // Interesting drink 1100
    contestLabel: 'Problem C: Interesting drink',
    points: 1000
  },
  {
    ...FALLBACK_PROBLEMS[7], // Two Buttons 1400
    contestLabel: 'Problem D: Two Buttons',
    points: 1500
  },
  {
    ...FALLBACK_PROBLEMS[6], // Boredom 1500
    contestLabel: 'Problem E: Boredom',
    points: 2000
  }
];

export const Competitions = ({ onNavigate }) => {
  const { user, updateUserRating, recordSolvedProblem } = useAuth();
  const [contests, setContests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [registeredContestIds, setRegisteredContestIds] = useState(['contest-live-showcase', 'contest-w102']);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  
  // Live Contest Arena State
  const [inLiveArena, setInLiveArena] = useState(false);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [codes, setCodes] = useState(['', '', '', '', '']);
  const [languages, setLanguages] = useState(['cpp', 'cpp', 'cpp', 'cpp', 'cpp']);
  const [results, setResults] = useState([null, null, null, null, null]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [contestSeconds, setContestSeconds] = useState(5400); // 90 mins timer
  const [contestScore, setContestScore] = useState(0);
  const [acToast, setAcToast] = useState(false);

  // 1v1 Challenge Friend State
  const [inDuelArena, setInDuelArena] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState('Errichto_Fan');
  const [duelDifficulty, setDuelDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
  const [duelProblem, setDuelProblem] = useState(FALLBACK_PROBLEMS[5]); // Interesting drink 1100
  const [duelCode, setDuelCode] = useState('');
  const [duelLanguage, setDuelLanguage] = useState('cpp');
  const [duelResult, setDuelResult] = useState(null);
  const [duelSeconds, setDuelSeconds] = useState(900); // 15 mins timer
  const [opponentProgress, setOpponentProgress] = useState(15);
  const [opponentStatusText, setOpponentStatusText] = useState('Reading problem statement...');
  const [duelWinner, setDuelWinner] = useState(null); // 'user' | 'opponent' | null

  // Host Competition Modal State
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [hostTitle, setHostTitle] = useState('');
  const [hostDescription, setHostDescription] = useState('');
  const [questionCount, setQuestionCount] = useState(3);
  const [problemCodes, setProblemCodes] = useState(['4A', '1A', '706B', '520B', '455A']);
  const [hostDate, setHostDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [hostTime, setHostTime] = useState('18:00');
  const [hostDuration, setHostDuration] = useState('90');
  const [hostSuccessMsg, setHostSuccessMsg] = useState(false);

  useEffect(() => {
    setContests(db.getContests());
    setLeaderboard(db.getLeaderboard());
  }, []);

  const handleOpenHostModal = () => {
    setIsHostModalOpen(true);
  };

  const handleQuestionCountChange = (count) => {
    setQuestionCount(count);
    setProblemCodes(prev => {
      const next = [...prev];
      const defaults = ['4A', '71A', '158A', '1A', '706B'];
      while (next.length < count) {
        next.push(defaults[next.length] || '4A');
      }
      return next.slice(0, count);
    });
  };

  const handleProblemCodeChange = (idx, val) => {
    const next = [...problemCodes];
    next[idx] = val.trim();
    setProblemCodes(next);
  };

  const handleHostSubmit = (e) => {
    e.preventDefault();
    if (!hostTitle.trim() || !hostDescription.trim()) return;

    const startIso = new Date(`${hostDate}T${hostTime}:00`).toISOString();
    const startTimeMs = new Date(startIso).getTime();
    const nowMs = Date.now();
    const durationMs = (parseInt(hostDuration, 10) || 90) * 60000;

    let contestStatus = 'UPCOMING';
    if (startTimeMs <= nowMs && nowMs <= startTimeMs + durationMs) {
      contestStatus = 'LIVE';
    } else if (nowMs > startTimeMs + durationMs) {
      contestStatus = 'FINISHED';
    }

    const selectedProblems = problemCodes.slice(0, questionCount).map((rawCode, idx) => {
      const cleaned = (rawCode || '4A').toUpperCase().replace(/^CF_?/i, '');
      const cfId = `cf_${cleaned}`;
      const found = FALLBACK_PROBLEMS.find(
        p => p.id.toUpperCase() === cfId || `${p.contestId}${p.index}`.toUpperCase() === cleaned
      );

      return {
        id: found ? found.id : `cf_${cleaned}`,
        title: found ? `Problem ${String.fromCharCode(65 + idx)}: ${found.name}` : `Problem ${String.fromCharCode(65 + idx)} (${cleaned})`,
        rating: found ? found.rating : 800 + idx * 200,
        points: (idx + 1) * 500
      };
    });

    const newContest = {
      id: `contest_${Date.now()}`,
      title: hostTitle.trim(),
      description: hostDescription.trim(),
      startTime: startIso,
      durationMinutes: parseInt(hostDuration, 10) || 90,
      status: contestStatus,
      registeredCount: 1,
      problems: selectedProblems
    };

    const currentList = db.getContests();
    currentList.unshift(newContest);
    localStorage.setItem('cpmunnity_contests_v1', JSON.stringify(currentList));
    localStorage.setItem('algoarena_contests_v1', JSON.stringify(currentList));

    setHostSuccessMsg(true);
    setTimeout(() => {
      setHostSuccessMsg(false);
      setIsHostModalOpen(false);
      setHostTitle('');
      setHostDescription('');
      setContests(currentList);
    }, 1200);
  };

  // 1v1 Duel Mutual Acceptance State
  const [duelInviteState, setDuelInviteState] = useState(null); // null | 'waiting' | 'accepted'
  const [countdownNum, setCountdownNum] = useState(3);

  const handleStartDuel = () => {
    let prob = FALLBACK_PROBLEMS[5]; // default 1100
    if (duelDifficulty === 'easy') prob = FALLBACK_PROBLEMS[0]; // 800
    if (duelDifficulty === 'hard') prob = FALLBACK_PROBLEMS[6]; // 1500

    setDuelProblem(prob);
    setDuelCode('');
    setDuelResult(null);
    setDuelSeconds(900);
    setOpponentProgress(10);
    setOpponentStatusText('Reading problem statement...');
    setDuelWinner(null);

    // Send mutual acceptance invitation notification
    db.addNotification({
      id: `notif_${Date.now()}`,
      type: 'DUEL_INVITE',
      fromUser: user?.username || 'You',
      fromRating: user?.rating || 800,
      difficulty: duelDifficulty,
      problemTitle: prob.name,
      timestamp: 'Just now',
      status: 'pending',
      read: false
    });

    setDuelInviteState('waiting');
  };

  const handleOpponentAcceptDuel = () => {
    setDuelInviteState('accepted');
    setCountdownNum(3);

    const timer = setInterval(() => {
      setCountdownNum(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setDuelInviteState(null);
          setInDuelArena(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRunDuelTests = () => {
    setIsEvaluating(true);

    setTimeout(() => {
      const res = judgeSubmission(
        duelProblem.id,
        duelLanguage,
        duelCode,
        duelProblem.sampleTestcases
      );

      setDuelResult(res);
      setIsEvaluating(false);

      if (res.status === 'Accepted' && !duelWinner) {
        setDuelWinner('user');
        updateUserRating(25);
        recordSolvedProblem(duelProblem.id, duelProblem.rating);
        setLeaderboard(db.getLeaderboard());
      }
    }, 500);
  };

  const handleRegister = (contestId) => {
    if (!registeredContestIds.includes(contestId)) {
      setRegisteredContestIds([...registeredContestIds, contestId]);
    }
  };

  const handleRunContestTests = () => {
    setIsEvaluating(true);
    setAcToast(false);
    const currProb = SHOWCASE_CONTEST_PROBLEMS[activeProblemIdx];

    setTimeout(() => {
      const res = judgeSubmission(
        currProb.id,
        languages[activeProblemIdx],
        codes[activeProblemIdx],
        currProb.sampleTestcases
      );

      const newResults = [...results];
      newResults[activeProblemIdx] = res;
      setResults(newResults);
      setIsEvaluating(false);

      if (res.status === 'Accepted') {
        setAcToast(true);
        if (!results[activeProblemIdx] || results[activeProblemIdx].status !== 'Accepted') {
          setContestScore(prev => prev + currProb.points);
          updateUserRating(15);
          recordSolvedProblem(currProb.id, currProb.rating);
          setLeaderboard(db.getLeaderboard());
        }
      }
    }, 450);
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const generateGoogleCalUrl = (contest) => {
    const title = encodeURIComponent(contest.title);
    const details = encodeURIComponent(contest.description);
    const start = new Date(contest.startTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(new Date(contest.startTime).getTime() + contest.durationMinutes * 60000)
      .toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`;
  };

  const currentContestProblem = SHOWCASE_CONTEST_PROBLEMS[activeProblemIdx];

  // 1v1 Duel Arena View Mode
  if (inDuelArena) {
    const opponentUser = db.getUserByUsername(selectedOpponent) || { username: selectedOpponent, rating: 1980, rankTier: 'Candidate Master' };

    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col">
        {/* 1v1 Duel Status Header */}
        <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border-b border-purple-500/40 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setInDuelArena(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm text-white">{user?.username}</span>
              <RatingBadge rating={user?.rating || 800} size="sm" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3.5 py-1 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/50 text-xs font-mono font-extrabold flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>1v1 DUEL VS {selectedOpponent.toUpperCase()}</span>
            </div>

            <div className="font-mono text-sm font-bold px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-yellow-300">
              <Clock className="w-4 h-4 text-indigo-400 inline mr-1.5" />
              <span>{formatTimer(duelSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono text-xs">
              <div className="text-slate-200 font-bold flex items-center justify-end gap-1.5">
                <span>{selectedOpponent}</span>
                <RatingBadge rating={opponentUser.rating} size="sm" />
              </div>
              <div className="text-[10px] text-purple-300 animate-pulse">{opponentStatusText}</div>
            </div>

            <div className="w-24 bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-rose-500 h-full transition-all duration-500"
                style={{ width: `${opponentProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          <div className="lg:col-span-5 border-r border-slate-800 p-6 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar bg-[#0d1322] space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-mono font-bold">
                1v1 Duel Target (Rating {duelProblem.rating})
              </span>
            </div>

            <h1 className="text-xl font-heading font-extrabold text-white">
              {duelProblem.name}
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {duelProblem.description}
            </p>

            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <strong className="text-slate-400 font-mono uppercase text-[10px]">Input Format:</strong>
                <p className="text-slate-300 leading-relaxed">{duelProblem.inputSpecification}</p>
              </div>
              <div>
                <strong className="text-slate-400 font-mono uppercase text-[10px]">Output Format:</strong>
                <p className="text-slate-300 leading-relaxed">{duelProblem.outputSpecification}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col p-4 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
            {duelWinner === 'user' && (
              <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-100 text-xs flex items-center justify-between glow-emerald animate-slide-up">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-300 shrink-0" />
                  <div>
                    <strong className="font-extrabold text-white text-base">VICTORY! 1v1 Duel Won!</strong>
                    <p className="text-[11px]">You solved the problem before {selectedOpponent}! Earned +25 Elo points.</p>
                  </div>
                </div>
                <button
                  onClick={handleStartDuel}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Rematch 1v1
                </button>
              </div>
            )}

            {duelWinner === 'opponent' && (
              <div className="p-4 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-100 text-xs flex items-center justify-between glow-purple animate-slide-up">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                  <div>
                    <strong className="font-extrabold text-white text-base">DEFEAT! {selectedOpponent} Won</strong>
                    <p className="text-[11px]">Your opponent submitted an Accepted solution first. Keep practicing!</p>
                  </div>
                </div>
                <button
                  onClick={handleStartDuel}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Try Again
                </button>
              </div>
            )}

            <div className="h-[430px]">
              <MonacoIDE
                code={duelCode}
                language={duelLanguage}
                onChange={setDuelCode}
                onLanguageChange={setDuelLanguage}
                onRunTests={handleRunDuelTests}
                onSubmit={handleRunDuelTests}
                onAskCoach={() => setIsCoachOpen(true)}
                isEvaluating={isEvaluating}
              />
            </div>

            <TestcaseRunner
              judgeResult={duelResult}
              sampleTestcases={duelProblem.sampleTestcases}
              isEvaluating={isEvaluating}
            />
          </div>
        </div>

        <SocraticCoach
          isOpen={isCoachOpen}
          onClose={() => setIsCoachOpen(false)}
          problemTitle={duelProblem.name}
          problemDescription={duelProblem.description || ''}
          userCode={duelCode}
          userLanguage={duelLanguage}
        />
      </div>
    );
  }

  // Live Competition Showcase Arena View
  if (inLiveArena) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col">
        <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-indigo-950/90 border-b border-rose-500/30 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setInLiveArena(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <h2 className="font-heading font-extrabold text-sm text-white">
                  AlgoArena Live Championship #103
                </h2>
              </div>
              <p className="text-xs text-rose-300">5 Codeforces Problems (Rating 800 - 1500)</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Score: </span>
              <strong className="text-emerald-400 text-sm">{contestScore} pts</strong>
            </div>

            <div className="flex items-center gap-2 font-mono text-sm px-4 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-yellow-300">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>{formatTimer(contestSeconds)}</span>
            </div>

            <button
              onClick={() => setInLiveArena(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
            >
              Exit Arena
            </button>
          </div>
        </div>

        <div className="bg-[#0f172a] border-b border-slate-800 px-6 py-2 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2">
            {SHOWCASE_CONTEST_PROBLEMS.map((prob, idx) => {
              const res = results[idx];
              const isAC = res?.status === 'Accepted';
              return (
                <button
                  key={prob.id}
                  onClick={() => {
                    setActiveProblemIdx(idx);
                    setAcToast(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeProblemIdx === idx
                      ? 'bg-rose-600 text-white shadow-lg glow-purple'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{prob.contestLabel}</span>
                  <span className="text-[10px] font-mono opacity-80">({prob.points}pts)</span>
                  {isAC && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          <div className="lg:col-span-5 border-r border-slate-800 p-6 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar bg-[#0d1322]">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-mono font-bold">
                Rating: {currentContestProblem.rating}
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 text-yellow-300 border border-amber-500/20 text-xs font-mono font-bold">
                {currentContestProblem.points} Points
              </span>
            </div>

            <h1 className="text-xl font-heading font-extrabold text-white mb-4">
              {currentContestProblem.name}
            </h1>

            <div className="prose prose-invert prose-xs leading-relaxed text-slate-300 space-y-4 mb-6">
              <p className="whitespace-pre-wrap">{currentContestProblem.description}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Input Format:</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{currentContestProblem.inputSpecification}</p>
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Output Format:</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{currentContestProblem.outputSpecification}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col p-4 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
            {acToast && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between glow-emerald animate-slide-up">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="font-bold text-white text-sm">Contest Problem AC!</strong>
                    <p className="text-[11px]">Earned +{currentContestProblem.points} Contest Points!</p>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
              </div>
            )}

            <div className="h-[430px]">
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
                onRunTests={handleRunContestTests}
                onSubmit={handleRunContestTests}
                onAskCoach={() => setIsCoachOpen(true)}
                isEvaluating={isEvaluating}
              />
            </div>

            <TestcaseRunner
              judgeResult={results[activeProblemIdx]}
              sampleTestcases={currentContestProblem.sampleTestcases}
              isEvaluating={isEvaluating}
            />
          </div>
        </div>

        <SocraticCoach
          isOpen={isCoachOpen}
          onClose={() => setIsCoachOpen(false)}
          problemTitle={currentContestProblem.name}
          problemDescription={currentContestProblem.description || ''}
          userCode={codes[activeProblemIdx]}
          userLanguage={languages[activeProblemIdx]}
        />
      </div>
    );
  }

  // Standard Competitions Lobby View
  return (
    <div className="min-h-screen bg-[#0b0f19] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Weekly Rated Rounds & 1v1 Duels</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Competitive Contests & 1v1 Duel Arena
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Participate in scheduled timed competitive rounds, host official contests (2700+ Elo), or challenge fellow programmers to 1v1 speed duels!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Create Competition Button */}
            <button
              onClick={handleOpenHostModal}
              className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg glow-purple flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-yellow-300" />
              <span>Create Competition Round</span>
            </button>

            <button
              onClick={() => setInLiveArena(true)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl glow-purple flex items-center gap-2 animate-pulse"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>ENTER LIVE SHOWCASE COMPETITION</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1v1 Challenge Friend Section */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-600/20 text-yellow-300 border border-purple-500/30 glow-purple">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-extrabold text-white">
              1v1 Speed Duel Arena (Challenge a Friend)
            </h3>
            <p className="text-xs text-slate-300">
              Challenge a programmer to a 15-minute speed solving duel. First to solve the problem gets <strong className="text-emerald-400">+25 Elo</strong>!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
              Opponent Handle / Username:
            </label>
            <input
              type="text"
              placeholder="Type player handle (e.g. Errichto_Fan, tourist_bot)..."
              value={selectedOpponent}
              onChange={(e) => setSelectedOpponent(e.target.value)}
              className="w-full bg-slate-950 text-white font-mono text-xs font-bold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
              Duel Difficulty:
            </label>
            <select
              value={duelDifficulty}
              onChange={(e) => setDuelDifficulty(e.target.value)}
              className="w-full bg-slate-950 text-white font-semibold text-xs rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="easy">Easy (Rating 800)</option>
              <option value="medium">Medium (Rating 1100)</option>
              <option value="hard">Hard (Rating 1500)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleStartDuel}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-purple flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4 text-yellow-300" />
              <span>Challenge 1v1 Duel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Contest Schedule / Calendar + Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Contest Schedule</span>
            </h2>

            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-indigo-600 text-white shadow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Month Calendar</span>
              </button>
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <CompetitionCalendar
              contests={contests}
              registeredIds={registeredContestIds}
              onRegister={handleRegister}
              onEnterLive={() => setInLiveArena(true)}
            />
          ) : (
            <div className="space-y-4">
              {contests.map((contest) => {
                const isRegistered = registeredContestIds.includes(contest.id);
                const isLive = contest.status === 'LIVE';
                const isUpcoming = contest.status === 'UPCOMING';

                return (
                  <div
                    key={contest.id}
                    className={`glass-panel p-5 rounded-xl border space-y-4 relative overflow-hidden ${
                      isLive ? 'border-rose-500/40 glow-purple bg-slate-900/90' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase mb-2 ${
                          isLive
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : isUpcoming
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isLive ? '● LIVE NOW' : contest.status}
                        </span>
                        <h3 className="text-base font-heading font-bold text-white">
                          {contest.title}
                        </h3>
                      </div>

                      <div className="text-right font-mono text-xs text-slate-400">
                        <div className="flex items-center gap-1 text-slate-300 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{contest.durationMinutes} mins</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[11px]">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span>{contest.registeredCount + (isRegistered ? 1 : 0)} registered</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {contest.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                      {contest.problems.map((p, pIdx) => (
                        <span key={p.id} className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {isUpcoming
                            ? `Problem ${String.fromCharCode(65 + pIdx)} = ${p.rating} rating (${p.points} pts)`
                            : `${p.title} (${p.points} pts)`}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Rated for all ranks
                      </span>

                      <div className="flex items-center gap-2">
                        {isUpcoming && (
                          <a
                            href={generateGoogleCalUrl(contest)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                            title="Add to Google Calendar"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Add to Cal</span>
                          </a>
                        )}

                        {isLive ? (
                          <button
                            onClick={() => setInLiveArena(true)}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg glow-purple flex items-center gap-2"
                          >
                            <Zap className="w-4 h-4 text-yellow-300" />
                            <span>ENTER COMPETITION</span>
                          </button>
                        ) : isRegistered ? (
                          <span className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Registered</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRegister(contest.id)}
                            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow glow-blue transition-all"
                          >
                            Register Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Standings Leaderboard */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>Global Arena Standings</span>
          </h2>

          <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4 text-right">Solved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboard.map((entry) => {
                    const isCurrentUser = user && entry.username.toLowerCase() === user.username.toLowerCase();
                    return (
                      <tr
                        key={entry.username}
                        className={`transition-colors ${
                          isCurrentUser
                            ? 'bg-indigo-600/20 text-indigo-200 font-bold'
                            : 'hover:bg-slate-800/40 text-slate-200'
                        }`}
                      >
                        <td className="py-3 px-4 font-extrabold">
                          {entry.rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                              🥇
                            </span>
                          ) : entry.rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40">
                              🥈
                            </span>
                          ) : entry.rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-400 border border-amber-700/40">
                              🥉
                            </span>
                          ) : (
                            `#${entry.rank}`
                          )}
                        </td>

                        <td className="py-3 px-4 flex items-center gap-2">
                          <span>{entry.username}</span>
                          {isCurrentUser && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                              YOU
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <RatingBadge rating={entry.rating} size="sm" />
                        </td>

                        <td className="py-3 px-4 text-right font-bold text-slate-300">
                          {entry.solvedCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Revamped Create Competition Round Modal */}
      {isHostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl max-w-2xl w-full border border-purple-500/40 glow-purple animate-slide-up relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsHostModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-purple-600/20 text-yellow-300 border border-purple-500/30 glow-purple">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-white text-lg">
                  Create New Competition Round
                </h3>
                <p className="text-xs text-slate-400">Configure round title, custom Codeforces problems, date, and schedule</p>
              </div>
            </div>

            {hostSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Competition round created and published to CPmunnity schedule & calendar!</span>
              </div>
            )}

            <form onSubmit={handleHostSubmit} className="space-y-4 text-xs font-sans">
              {/* 1. Title */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  1. Competition Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CPmunnity Weekly Challenge #106 (Div. 2)"
                  value={hostTitle}
                  onChange={(e) => setHostTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 2. Round Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  2. Round Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the competition round format, rules, dynamic programming & graph problem set focus..."
                  value={hostDescription}
                  onChange={(e) => setHostDescription(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 3. Amount of Questions (1-5) and Codeforces Problem Codes */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                    3. Amount of Questions & Codeforces Codes (1 to 5)
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => handleQuestionCountChange(Number(e.target.value))}
                    className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-indigo-300 font-mono font-bold text-xs focus:outline-none"
                  >
                    <option value={1}>1 Problem</option>
                    <option value={2}>2 Problems</option>
                    <option value={3}>3 Problems</option>
                    <option value={4}>4 Problems</option>
                    <option value={5}>5 Problems</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {Array.from({ length: questionCount }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] font-mono font-bold text-indigo-300 w-24 shrink-0">
                        Question {String.fromCharCode(65 + idx)}:
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Codeforces Code (e.g. ${['4A', '71A', '158A', '1A', '706B'][idx] || '4A'})`}
                        value={problemCodes[idx] || ''}
                        onChange={(e) => handleProblemCodeChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 uppercase"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Date & 5. Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    4. Date of Competition *
                  </label>
                  <input
                    type="date"
                    required
                    value={hostDate}
                    onChange={(e) => setHostDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    5. Time of Competition *
                  </label>
                  <input
                    type="time"
                    required
                    value={hostTime}
                    onChange={(e) => setHostTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Round Duration
                  </label>
                  <select
                    value={hostDuration}
                    onChange={(e) => setHostDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="60">60 Minutes (Sprint)</option>
                    <option value="90">90 Minutes (Standard)</option>
                    <option value="120">120 Minutes (Grand Prix)</option>
                    <option value="180">180 Minutes (Marathon)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg glow-purple flex items-center justify-center gap-2 mt-4"
              >
                <Send className="w-4 h-4" />
                <span>Publish Competition Round to CPmunnity Schedule</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mutual Acceptance Pending Modal */}
      {duelInviteState === 'waiting' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-purple-500/40 glow-purple text-center space-y-6 animate-slide-up">
            <div className="inline-flex p-4 rounded-full bg-purple-600/20 text-yellow-300 border border-purple-500/30 glow-purple animate-pulse">
              <Swords className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-extrabold text-white">
                1v1 Speed Duel Challenge Sent!
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Waiting for <strong className="text-purple-300">{selectedOpponent}</strong> to accept your 1v1 speed duel challenge...
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono flex items-center justify-center gap-2 text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>Status: AWAITING BOTH PARTIES ACCEPTANCE</span>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleOpponentAcceptDuel}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow glow-emerald flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate {selectedOpponent} Acceptance</span>
              </button>
              <button
                onClick={() => setDuelInviteState(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duel Mutual Acceptance Countdown Modal */}
      {duelInviteState === 'accepted' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-2xl max-w-sm w-full border border-emerald-500/40 glow-emerald text-center space-y-4 animate-bounce">
            <div className="text-5xl font-heading font-extrabold text-emerald-400 font-mono">
              {countdownNum}
            </div>
            <h3 className="text-lg font-heading font-bold text-white">
              Both Parties Accepted!
            </h3>
            <p className="text-xs text-emerald-300 font-mono">
              Starting 1v1 Speed Duel against {selectedOpponent}...
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
