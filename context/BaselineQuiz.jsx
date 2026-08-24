import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RatingBadge } from '../components/RatingBadge';
import {
  Brain,
  CheckCircle2,
  XCircle,
  Award,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Flame,
  Layers,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Target
} from 'lucide-react';

// Expanded Adaptive CP Principles Question Pool
const ALL_QUIZ_QUESTIONS = [
  // --- EASY TIER (800 - 1000) ---
  {
    id: 'dp-800',
    category: 'dp',
    categoryLabel: 'Dynamic Programming',
    difficultyRating: 800,
    difficultyLabel: 'Easy',
    question: 'What two fundamental properties must a problem have to be efficiently solved using Dynamic Programming?',
    options: [
      'Sorting monotonicity and greedy choices',
      'Optimal Substructure and Overlapping Subproblems',
      'Polynomial degree reduction and divide-and-conquer splits',
      'Single-source shortest paths and topological ordering'
    ],
    correctIndex: 1,
    explanation: 'DP applies when a problem has Optimal Substructure (optimal solution built from subproblem optimal solutions) and Overlapping Subproblems (subproblems recur repeatedly and can be memoized).'
  },
  {
    id: 'dnc-800',
    category: 'dnc',
    categoryLabel: 'Divide & Conquer',
    difficultyRating: 800,
    difficultyLabel: 'Easy',
    question: 'What is the time complexity of searching for an element in a sorted array of size N using Binary Search?',
    options: [
      'O(N)',
      'O(log N)',
      'O(N log N)',
      'O(1)'
    ],
    correctIndex: 1,
    explanation: 'Binary Search repeatedly cuts the search interval in half, leading to logarithmic time complexity O(log N).'
  },
  {
    id: 'greedy-800',
    category: 'greedy',
    categoryLabel: 'Greedy Algorithms',
    difficultyRating: 800,
    difficultyLabel: 'Easy',
    question: 'In the classic Interval Scheduling / Activity Selection problem, which sorting criterion guarantees the maximum number of non-overlapping activities?',
    options: [
      'Sort activities by shortest duration',
      'Sort activities by earliest start time',
      'Sort activities by earliest finish time',
      'Sort activities by maximum number of overlapping intervals'
    ],
    correctIndex: 2,
    explanation: 'Choosing the activity that finishes earliest leaves the largest possible remaining time window for subsequent non-overlapping activities.'
  },
  {
    id: 'graph-800',
    category: 'graphs',
    categoryLabel: 'Graph Theory',
    difficultyRating: 800,
    difficultyLabel: 'Easy',
    question: 'Which graph traversal algorithm uses a Queue (FIFO) to find the shortest path in an unweighted graph?',
    options: [
      'Depth-First Search (DFS)',
      'Breadth-First Search (BFS)',
      'Floyd-Warshall Algorithm',
      'Bellman-Ford Algorithm'
    ],
    correctIndex: 1,
    explanation: 'BFS explores vertices layer-by-layer using a Queue, guaranteeing the shortest path count in unweighted graphs.'
  },
  {
    id: 'ds-800',
    category: 'ds',
    categoryLabel: 'Data Structures',
    difficultyRating: 800,
    difficultyLabel: 'Easy',
    question: 'Which data structure operates on a Last-In, First-Out (LIFO) principle and is commonly used to process nested parentheses?',
    options: [
      'Queue',
      'Stack',
      'Priority Queue',
      'Deque'
    ],
    correctIndex: 1,
    explanation: 'A Stack follows LIFO order, pushing incoming items and popping the top most recently added element.'
  },

  // --- MEDIUM TIER (1200 - 1400) ---
  {
    id: 'dp-1200',
    category: 'dp',
    categoryLabel: 'Dynamic Programming',
    difficultyRating: 1200,
    difficultyLabel: 'Medium',
    question: 'In the 0/1 Knapsack problem with N items and weight capacity W, what is the standard DP time and space complexity?',
    options: [
      'O(N log N) time, O(1) space',
      'O(2^N) time, O(N) space',
      'O(N * W) time, O(N * W) space (reducible to O(W))',
      'O(N + W) time, O(N + W) space'
    ],
    correctIndex: 2,
    explanation: 'The state dp[i][w] evaluates max value for item i and weight w, yielding pseudo-polynomial time O(N * W).'
  },
  {
    id: 'dnc-1200',
    category: 'dnc',
    categoryLabel: 'Divide & Conquer',
    difficultyRating: 1200,
    difficultyLabel: 'Medium',
    question: 'What is the recurrence relation and overall time complexity for Merge Sort on an array of size N?',
    options: [
      'T(N) = T(N-1) + O(N) -> O(N^2)',
      'T(N) = 2T(N/2) + O(N) -> O(N log N)',
      'T(N) = T(N/2) + O(1) -> O(log N)',
      'T(N) = 4T(N/2) + O(N) -> O(N^2)'
    ],
    correctIndex: 1,
    explanation: 'Merge Sort divides into 2 equal subproblems of size N/2 and merges them in linear time O(N), yielding T(N) = 2T(N/2) + O(N) = O(N log N).'
  },
  {
    id: 'graph-1200',
    category: 'graphs',
    categoryLabel: 'Graph Theory',
    difficultyRating: 1200,
    difficultyLabel: 'Medium',
    question: 'Why does standard Dijkstra\'s algorithm fail on graphs containing negative edge weights?',
    options: [
      'It causes an infinite loop in the priority queue',
      'It assumes once a node distance is finalized, no shorter path to it exists (greedy assumption broken)',
      'It cannot process directed acyclic graphs (DAGs)',
      'It requires O(V^3) time on negative weights'
    ],
    correctIndex: 1,
    explanation: 'Dijkstra assumes distances in the priority queue only increase. Negative edges can decrease a distance after a node has been marked processed.'
  },
  {
    id: 'ds-1200',
    category: 'ds',
    categoryLabel: 'Data Structures',
    difficultyRating: 1200,
    difficultyLabel: 'Medium',
    question: 'What is the time complexity to perform both point updates and range sum queries on a Fenwick Tree (Binary Indexed Tree / BIT) or Segment Tree of size N?',
    options: [
      'O(1) update, O(N) query',
      'O(log N) update, O(log N) query',
      'O(N) update, O(1) query',
      'O(sqrt N) update, O(sqrt N) query'
    ],
    correctIndex: 1,
    explanation: 'Both Fenwick Trees (BIT) and Segment Trees perform point updates and range queries in logarithmic time O(log N).'
  },
  {
    id: 'math-1200',
    category: 'math',
    categoryLabel: 'Number Theory & Math',
    difficultyRating: 1200,
    difficultyLabel: 'Medium',
    question: 'What is the time complexity of computing all prime numbers up to N using the Sieve of Eratosthenes?',
    options: [
      'O(N^2)',
      'O(N log log N)',
      'O(N log N)',
      'O(sqrt N)'
    ],
    correctIndex: 1,
    explanation: 'The prime harmonic series sum yields O(N log log N) time complexity for the Sieve of Eratosthenes.'
  },

  // --- HARD TIER (1600 - 1800) ---
  {
    id: 'dp-1600',
    category: 'dp',
    categoryLabel: 'Dynamic Programming',
    difficultyRating: 1600,
    difficultyLabel: 'Hard',
    question: 'What is the time complexity of finding the Longest Increasing Subsequence (LIS) of an array of size N using DP + Binary Search (Patience Sorting)?',
    options: [
      'O(N^2)',
      'O(N log N)',
      'O(N)',
      'O(2^N)'
    ],
    correctIndex: 1,
    explanation: 'Using array tails + binary search (std::lower_bound), each of the N elements takes O(log N) time, achieving O(N log N) total time.'
  },
  {
    id: 'graph-1600',
    category: 'graphs',
    categoryLabel: 'Graph Theory',
    difficultyRating: 1600,
    difficultyLabel: 'Hard',
    question: 'Which algorithm finds all Strongly Connected Components (SCCs) of a directed graph in linear time O(V + E) using a single DFS pass with low-link values?',
    options: [
      'Kruskal\'s Algorithm',
      'Tarjan\'s Algorithm',
      'Floyd-Warshall Algorithm',
      'Ford-Fulkerson Algorithm'
    ],
    correctIndex: 1,
    explanation: 'Tarjan\'s SCC algorithm maintains node discovery times and low-link values in a single DFS pass to identify components in O(V + E) time.'
  },
  {
    id: 'ds-1600',
    category: 'ds',
    categoryLabel: 'Data Structures',
    difficultyRating: 1600,
    difficultyLabel: 'Hard',
    question: 'With Path Compression and Union by Rank heuristics, what is the amortized time complexity of Disjoint Set Union (DSU) operations?',
    options: [
      'O(1) strictly',
      'O(alpha(N)) — inverse Ackermann function (effectively O(1))',
      'O(log N)',
      'O(sqrt N)'
    ],
    correctIndex: 1,
    explanation: 'DSU with both heuristics runs in O(alpha(N)) per operation, where alpha is the inverse Ackermann function (<= 4 for all practical values of N).'
  },
  {
    id: 'math-1600',
    category: 'math',
    categoryLabel: 'Number Theory & Math',
    difficultyRating: 1600,
    difficultyLabel: 'Hard',
    question: 'According to Fermat\'s Little Theorem, if p is a prime and gcd(a, p) = 1, what is the modular multiplicative inverse of a modulo p?',
    options: [
      'a^(p-1) mod p',
      'a^(p-2) mod p',
      'a^p mod p',
      '(p - a) mod p'
    ],
    correctIndex: 1,
    explanation: 'Fermat\'s Little Theorem states a^(p-1) = 1 (mod p). Multiplying by a^(-1) yields a^(p-2) = a^(-1) (mod p).'
  },
  {
    id: 'strings-1600',
    category: 'strings',
    categoryLabel: 'Strings',
    difficultyRating: 1600,
    difficultyLabel: 'Hard',
    question: 'What is the primary function of the Prefix Table (Pi Table / Failure Function) in the Knuth-Morris-Pratt (KMP) string matching algorithm?',
    options: [
      'To sort the string alphabetically in linear time',
      'To store the length of the longest proper prefix of pattern[0..i] that is also a suffix of pattern[0..i]',
      'To calculate polynomial hash values of substrings',
      'To count character frequency occurrences'
    ],
    correctIndex: 1,
    explanation: 'KMP\'s failure function (pi table) precomputes the longest proper prefix matching a suffix, allowing pattern shifts without re-evaluating matched characters.'
  },

  // --- EXPERT TIER (2000+) ---
  {
    id: 'dp-2000',
    category: 'dp',
    categoryLabel: 'Dynamic Programming',
    difficultyRating: 2000,
    difficultyLabel: 'Expert',
    question: 'When optimizing DP transitions of the form dp[i] = min_{j < i} (dp[j] + m_j * x_i + c_j) where m_j is monotonic, which technique reduces state transition time from O(N^2) to O(N)?',
    options: [
      'Divide and Conquer Optimization',
      'Convex Hull Trick (CHT) / Li Chao Tree',
      'Knuth\'s Optimization',
      'Bitmask SOS DP'
    ],
    correctIndex: 1,
    explanation: 'Convex Hull Trick maintains lower envelope lines y = m*x + c in a deque or Li Chao Tree, evaluating optimum transitions in O(1) or O(log N).'
  },
  {
    id: 'graph-2000',
    category: 'graphs',
    categoryLabel: 'Graph Theory',
    difficultyRating: 2000,
    difficultyLabel: 'Expert',
    question: 'What is the time complexity of Dinic\'s Algorithm for finding Maximum Network Flow in a general graph with V vertices and E edges?',
    options: [
      'O(V * E^2)',
      'O(V^2 * E)',
      'O(E sqrt(V))',
      'O(V * E log V)'
    ],
    correctIndex: 1,
    explanation: 'Dinic\'s Algorithm uses level graphs built via BFS and blocking flows via DFS, achieving O(V^2 * E) time complexity on general networks.'
  }
];

export const BaselineQuiz = ({ onNavigate }) => {
  const { user, updateUserRating } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Adaptive State Engine
  const [adaptiveRating, setAdaptiveRating] = useState(1000);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [ratingHistory, setRatingHistory] = useState([1000]);
  const [askedQuestionIds, setAskedQuestionIds] = useState([]);
  
  const [currentQuestion, setCurrentQuestion] = useState(() => ALL_QUIZ_QUESTIONS[0]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [eloEarned, setEloEarned] = useState(0);

  // Select next question dynamically based on current adaptive rating (right = harder, wrong = easier)
  const selectNextQuestion = (nextRating, currentCategory, usedIds) => {
    let pool = ALL_QUIZ_QUESTIONS.filter(q => !usedIds.includes(q.id));
    if (currentCategory !== 'all') {
      pool = pool.filter(q => q.category === currentCategory);
    }

    if (pool.length === 0) {
      // Fallback if category exhausted
      pool = ALL_QUIZ_QUESTIONS.filter(q => !usedIds.includes(q.id));
    }

    if (pool.length === 0) {
      return null;
    }

    // Pick question closest to nextRating
    const sorted = [...pool].sort((a, b) => {
      const diffA = Math.abs(a.difficultyRating - nextRating);
      const diffB = Math.abs(b.difficultyRating - nextRating);
      return diffA - diffB;
    });

    return sorted[0];
  };

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQuestion.correctIndex;
    setLastAnswerCorrect(isCorrect);

    let ratingDelta = 0;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      // Right answer -> Harder next (+150 Elo rating jump)
      ratingDelta = 150;
    } else {
      // Wrong answer -> Easier next (-100 Elo rating adjustment)
      ratingDelta = -100;
    }

    const nextRating = Math.max(800, Math.min(2400, adaptiveRating + ratingDelta));
    setAdaptiveRating(nextRating);
    setRatingHistory(prev => [...prev, nextRating]);
  };

  const handleNextQuestion = () => {
    const newAnsweredCount = answeredCount + 1;
    setAnsweredCount(newAnsweredCount);

    const updatedUsed = [...askedQuestionIds, currentQuestion.id];
    setAskedQuestionIds(updatedUsed);

    // Stop after 6 adaptive calibration questions
    if (newAnsweredCount >= 6) {
      const bonus = Math.round((adaptiveRating - 800) * 0.15) + (correctCount * 5);
      const finalEloGain = Math.max(10, bonus);
      setEloEarned(finalEloGain);
      setQuizFinished(true);
      updateUserRating(finalEloGain);
    } else {
      const nextQ = selectNextQuestion(adaptiveRating, selectedCategory, updatedUsed);
      if (nextQ) {
        setCurrentQuestion(nextQ);
        setSelectedOption(null);
        setIsAnswered(false);
        setLastAnswerCorrect(null);
      } else {
        const bonus = Math.round((adaptiveRating - 800) * 0.15) + (correctCount * 5);
        const finalEloGain = Math.max(10, bonus);
        setEloEarned(finalEloGain);
        setQuizFinished(true);
        updateUserRating(finalEloGain);
      }
    }
  };

  const handleRestart = (category = selectedCategory) => {
    setAdaptiveRating(1000);
    setAnsweredCount(0);
    setCorrectCount(0);
    setRatingHistory([1000]);
    setAskedQuestionIds([]);
    setSelectedOption(null);
    setIsAnswered(false);
    setLastAnswerCorrect(null);
    setQuizFinished(false);
    setEloEarned(0);

    const firstQ = selectNextQuestion(1000, category, []);
    if (firstQ) {
      setCurrentQuestion(firstQ);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Brain className="w-3.5 h-3.5 text-yellow-400" />
              <span>Adaptive CP Skill Calibration System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              CP Principles Baseline Quiz
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Test your mastery with our Computerized Adaptive Testing (CAT) engine! Answering correctly increases question difficulty (Right = Harder ↑, Wrong = Easier ↓).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <RatingBadge rating={user?.rating || 800} size="lg" />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { key: 'all', label: 'All Principles' },
          { key: 'dp', label: 'Dynamic Programming' },
          { key: 'dnc', label: 'Divide & Conquer' },
          { key: 'greedy', label: 'Greedy' },
          { key: 'graphs', label: 'Graph Theory' },
          { key: 'ds', label: 'Data Structures' },
          { key: 'math', label: 'Math & Number Theory' },
          { key: 'strings', label: 'Strings' }
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => {
              setSelectedCategory(cat.key);
              handleRestart(cat.key);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.key
                ? 'bg-indigo-600 text-white shadow-lg glow-blue'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Live Adaptive Difficulty Gauge */}
      {!quizFinished && (
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Current Adaptive Calibration Rating
              </div>
              <div className="text-lg font-heading font-extrabold text-white font-mono flex items-center gap-2">
                <span>{adaptiveRating} Elo</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                  {currentQuestion.difficultyLabel} Tier ({currentQuestion.difficultyRating})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastAnswerCorrect === true && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono flex items-center gap-1 animate-bounce">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Right → Next Harder (+150)</span>
              </span>
            )}
            {lastAnswerCorrect === false && (
              <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold font-mono flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-orange-400" />
                <span>Wrong → Calibrating (-100)</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Quiz Window */}
      {!quizFinished && currentQuestion && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs font-mono pb-4 border-b border-slate-800">
            <span className="text-slate-400">
              Adaptive Step <strong className="text-indigo-400">{answeredCount + 1}</strong> of <strong className="text-slate-200">6</strong>
            </span>
            <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold uppercase text-[10px]">
              {currentQuestion.categoryLabel}
            </span>
            <span className="text-slate-400">
              Correct: <strong className="text-emerald-400">{correctCount}</strong> / {answeredCount}
            </span>
          </div>

          {/* Question Prompt */}
          <h2 className="text-lg font-heading font-extrabold text-white leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let btnClass = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-indigo-500/50';
              if (isAnswered) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 glow-emerald font-bold';
                } else if (isSelected) {
                  btnClass = 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold';
                } else {
                  btnClass = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border text-left text-xs leading-relaxed transition-all flex items-center justify-between gap-3 ${btnClass}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && (
                    isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    ) : null
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-slide-up text-xs font-sans">
              <div className="flex items-center gap-2 font-mono font-bold text-indigo-400 uppercase text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Algorithmic Rationale:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg glow-blue flex items-center gap-2"
              >
                <span>{answeredCount + 1 < 6 ? 'Next Adaptive Question' : 'Complete Adaptive Calibration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* Quiz Completion Modal View */}
      {quizFinished && (
        <div className="glass-panel p-8 rounded-2xl border border-indigo-500/30 text-center space-y-6 animate-slide-up">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl glow-purple">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-heading font-extrabold text-white">
              Adaptive Skill Calibration Complete!
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              You answered <strong className="text-emerald-400 font-mono text-sm">{correctCount} / 6</strong> adaptive questions correctly.
            </p>
          </div>

          {/* Rating Trajectory Chart Summary */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 max-w-md mx-auto space-y-3">
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
              Final Calibrated Skill Rating
            </div>
            <div className="text-4xl font-heading font-extrabold text-indigo-400 font-mono">
              {adaptiveRating} Elo
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Rating Progression:</span>
              <span className="text-emerald-400 font-bold">{ratingHistory.join(' → ')}</span>
            </div>

            <div className="pt-1 text-xs text-emerald-400 font-bold">
              +{eloEarned} Elo Bonus Added to Profile!
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleRestart()}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Adaptive Quiz</span>
            </button>
            <button
              onClick={() => onNavigate('/practice')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow glow-blue flex items-center gap-1.5"
            >
              <span>Practice IDE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

