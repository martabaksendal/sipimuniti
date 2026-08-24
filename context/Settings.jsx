import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Key, RotateCcw, CheckCircle2, Sparkles, Award } from 'lucide-react';

export const Settings = ({ onNavigate }) => {
  const { user, geminiApiKey, updateGeminiApiKey, resetPlacementTest } = useAuth();
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!user) return null;

  const handleSaveKey = (e) => {
    e.preventDefault();
    const cleaned = apiKeyInput.trim().replace(/^['"]|['"]$/g, '').replace(/^key=/i, '');
    updateGeminiApiKey(cleaned);
    setApiKeyInput(cleaned);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestKey = async () => {
    const cleaned = apiKeyInput.trim().replace(/^['"]|['"]$/g, '').replace(/^key=/i, '');
    if (!cleaned) {
      setTestResult({ success: false, message: 'Please enter a Gemini API Key first.' });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleaned}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Respond with OK' }] }]
          })
        }
      );

      if (response.ok) {
        setTestResult({ success: true, message: 'Connection successful! Gemini 2.0 / 1.5 AI models connected.' });
        updateGeminiApiKey(cleaned);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestResult({
          success: false,
          message: errorData.error?.message || `HTTP ${response.status}: Failed to authenticate with Gemini API.`
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err?.message || 'Network connection failed. Verify internet connection.'
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleResetPlacement = () => {
    resetPlacementTest();
    onNavigate('/onboarding/placement');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-white">
          Account & AI Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your Google Gemini API key, placement calibration status, and rank parameters
        </p>
      </div>

      {/* Gemini API Key Card */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-yellow-300 border border-purple-500/30 glow-purple">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
              Google Gemini API Key
              {geminiApiKey ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Key Needed
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Required for the Socratic CP Coach. The key is stored locally in your browser session.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Gemini API Key updated successfully!</span>
          </div>
        )}

        {testResult && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
              testResult.success
                ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/70 border-rose-500/30 text-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <RotateCcw className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveKey} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            API Key
          </label>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow glow-blue"
            >
              Save Key
            </button>
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTestingKey}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{isTestingKey ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Placement Test Recalibration */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-heading font-bold text-white">
              Placement Test Recalibration
            </h2>
            <p className="text-xs text-slate-400">
              Reset your initial rating calibration and retake the 3-problem placement test
            </p>
          </div>
        </div>

        {resetConfirm ? (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/30 space-y-3">
            <p className="text-xs text-rose-200">
              Are you sure you want to reset your rating calibration? This will restore your rating to 800 and launch the placement round.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleResetPlacement}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Yes, Retake Placement Test
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold"
          >
            Reset & Retake Placement Test
          </button>
        )}
      </div>

      {/* Codeforces Rating Tiers Overview */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <span>Competitive Rating Tiers Reference</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Newbie</span>
            <span className="font-bold text-slate-200">&lt; 1200</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-emerald-400">Pupil</span>
            <span className="font-bold text-slate-200">1200 - 1399</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-cyan-400">Specialist</span>
            <span className="font-bold text-slate-200">1400 - 1599</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-blue-400">Expert</span>
            <span className="font-bold text-slate-200">1600 - 1899</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-purple-400">Candidate Master</span>
            <span className="font-bold text-slate-200">1900 - 2099</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-orange-400">Master</span>
            <span className="font-bold text-slate-200">2100 - 2299</span>
          </div>
        </div>
      </div>

    </div>
  );
};
