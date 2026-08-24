import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Terminal } from 'lucide-react';

export const TestcaseRunner = ({
  judgeResult,
  sampleTestcases,
  isEvaluating = false,
  isSidebar = false
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (isEvaluating) {
    return (
      <div className={`p-6 bg-[#0f172a] border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-400 ${isSidebar ? 'h-full min-h-[260px]' : 'min-h-[160px]'}`}>
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono font-medium animate-pulse text-center">Evaluating code against sandbox testcases...</span>
      </div>
    );
  }

  if (!judgeResult) {
    return (
      <div className={`p-5 bg-[#0f172a] border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 ${isSidebar ? 'h-full min-h-[260px]' : 'min-h-[140px]'}`}>
        <Terminal className="w-6 h-6 text-slate-600" />
        <span className="text-xs text-slate-400 font-medium text-center">Run Tests or Submit Code to view I/O results</span>
      </div>
    );
  }

  const currentResult = judgeResult.details[selectedIdx] || judgeResult.details[0];

  const statusColors = {
    'Accepted': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    'Wrong Answer': 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    'Time Limit Exceeded': 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    'Runtime Error': 'bg-rose-500/10 border-rose-500/30 text-rose-400'
  };

  return (
    <div className={`bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col ${isSidebar ? 'h-full' : ''}`}>
      
      {/* Header Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${statusColors[judgeResult.status]}`}>
            {judgeResult.status === 'Accepted' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{judgeResult.status}</span>
          </span>

          <span className="text-xs font-mono text-slate-400">
            <strong className="text-slate-200">{judgeResult.passedTestcases}/{judgeResult.totalTestcases}</strong> Passed
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{judgeResult.executionTimeMs} ms</span>
        </div>

      </div>

      {/* Testcase Selector Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/50 px-2 overflow-x-auto shrink-0">
        {judgeResult.details.map((tc, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIdx(idx)}
            className={`px-3.5 py-2 text-xs font-mono font-semibold flex items-center gap-2 border-b-2 transition-all ${
              selectedIdx === idx
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Test {tc.testcaseIndex}</span>
            {tc.passed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
            )}
          </button>
        ))}
      </div>

      {/* Selected Test Case Details */}
      {currentResult && (
        <div className="p-4 space-y-4 text-xs font-mono overflow-y-auto max-h-[360px] flex-1">
          
          <div>
            <div className="text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span>Input:</span>
              <span className="text-slate-500 font-normal text-[9px]">Scrollable</span>
            </div>
            <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 max-h-[140px] overflow-y-auto overflow-x-auto whitespace-pre-wrap break-words">
              {currentResult.input}
            </pre>
          </div>

          <div className={`grid gap-4 ${isSidebar ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            
            <div>
              <div className="text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Expected Output:
              </div>
              <pre className="p-3 bg-slate-950 rounded-lg border border-emerald-500/30 text-emerald-300 max-h-[160px] overflow-y-auto overflow-x-auto whitespace-pre-wrap break-words">
                {currentResult.expectedOutput}
              </pre>
            </div>

            <div>
              <div className="text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Your Output:
              </div>
              <pre className={`p-3 bg-slate-950 rounded-lg border max-h-[160px] overflow-y-auto overflow-x-auto whitespace-pre-wrap break-words ${
                currentResult.passed ? 'border-emerald-500/30 text-emerald-300' : 'border-rose-500/30 text-rose-300'
              }`}>
                {currentResult.actualOutput}
              </pre>
            </div>

          </div>

          {currentResult.errorLog && (
            <div>
              <div className="text-rose-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Runtime Error Log:
              </div>
              <pre className="p-3 bg-rose-950/40 rounded-lg border border-rose-500/30 text-rose-300 max-h-[160px] overflow-y-auto overflow-x-auto text-[11px] whitespace-pre-wrap break-words">
                {currentResult.errorLog}
              </pre>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
