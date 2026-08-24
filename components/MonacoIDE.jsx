import React from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, RotateCcw, Sparkles, Code } from 'lucide-react';

const TEMPLATES = {
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

using namespace std;

void solve() {
    // Write your solution logic here
    
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    solve();
    return 0;
}`,
  python: `import sys

def solve():
    # Read standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    # Write your solution logic here
    

if __name__ == "__main__":
    solve()`,
  java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution logic here
        
    }
}`
};

export const MonacoIDE = ({
  code,
  language,
  onChange,
  onLanguageChange,
  onRunTests,
  onSubmit,
  onAskCoach,
  isEvaluating = false
}) => {
  const handleReset = () => {
    onChange(TEMPLATES[language]);
  };

  const monacoLanguageMap = {
    cpp: 'cpp',
    python: 'python',
    java: 'java'
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1322] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0f172a] border-b border-slate-800">
        
        {/* Language selector */}
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Language:</span>
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value;
              onLanguageChange(newLang);
              if (!code || code.trim() === '' || Object.values(TEMPLATES).includes(code)) {
                onChange(TEMPLATES[newLang]);
              }
            }}
            className="bg-slate-900 text-slate-200 border border-slate-700 text-xs font-mono font-medium rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
          >
            <option value="cpp">C++ (GCC 13)</option>
            <option value="python">Python (3.11)</option>
            <option value="java">Java (OpenJDK 17)</option>
          </select>

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors ml-1"
            title="Reset code template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={onAskCoach}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md hover:shadow-purple-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Socratic Coach</span>
          </button>

          <button
            onClick={onRunTests}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Run Tests</span>
          </button>

          <button
            onClick={onSubmit}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
          >
            {isEvaluating ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isEvaluating ? 'Evaluating...' : 'Submit Code'}</span>
          </button>

        </div>

      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 min-h-[360px] relative">
        <Editor
          height="100%"
          language={monacoLanguageMap[language]}
          theme="vs-dark"
          value={code || TEMPLATES[language]}
          onChange={(val) => onChange(val || '')}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            lineNumbersMinChars: 3,
          }}
        />
      </div>

    </div>
  );
};
