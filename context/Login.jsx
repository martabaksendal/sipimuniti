import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Code2, ArrowRight, Lock, User, AlertCircle } from 'lucide-react';

export const AuthPage = ({ onNavigate, isRegister = false }) => {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const res = await register(username.trim(), password);
        if (res.success) {
          // New accounts immediately trigger mandatory placement test flow!
          onNavigate('/onboarding/placement');
        } else {
          setError(res.message || 'Registration failed.');
        }
      } else {
        const res = await login(username.trim(), password);
        if (res.success) {
          onNavigate('/dashboard');
        } else {
          setError(res.message || 'Login failed.');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl mb-4 glow-blue">
            <Code2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-white tracking-tight">
            CPmunnity
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Competitive Programming • Socratic AI Tutor • Live Leaderboards
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-slate-800 relative">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-xl font-heading font-bold text-slate-100">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              No-Email Auth
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. tourist_algo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 glow-blue"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Register & Start Placement Test' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          {/* Toggle Login / Register */}
          <div className="mt-6 text-center text-xs text-slate-400 pt-4 border-t border-slate-800">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => onNavigate('/login')}
                  className="text-indigo-400 font-semibold hover:underline"
                >
                  Sign In here
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => onNavigate('/register')}
                  className="text-indigo-400 font-semibold hover:underline"
                >
                  Create one now
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
