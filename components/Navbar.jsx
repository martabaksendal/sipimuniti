import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RatingBadge } from './RatingBadge';
import { db } from '../lib/db';
import {
  Code2,
  Trophy,
  MessageSquare,
  LayoutDashboard,
  Flame,
  LogOut,
  Settings,
  Sparkles,
  BookOpen,
  Brain,
  Bell,
  Users,
  UserPlus,
  Trash2,
  Swords,
  Check,
  X,
  CheckCircle2,
  Clock,
  UserCheck,
  Eye,
  AlertCircle,
  Award,
  Calendar
} from 'lucide-react';

export const Navbar = ({ currentPath, onNavigate }) => {
  const { user, logout, geminiApiKey } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [newFriendName, setNewFriendName] = useState('');
  const [searchError, setSearchError] = useState('');
  const [viewProfileUser, setViewProfileUser] = useState(null);

  useEffect(() => {
    if (user) {
      setFriendsList(db.getFriends());
      setNotificationsList(db.getNotifications());
    }
  }, [user]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Practice IDE', path: '/practice', icon: Code2 },
    { label: 'Baseline Quiz', path: '/baseline', icon: Brain },
    { label: 'Editorials', path: '/editorials', icon: BookOpen },
    { label: 'Competitions', path: '/competitions', icon: Trophy },
    { label: 'Chatwall', path: '/chatwall', icon: MessageSquare },
  ];

  if (!user) return null;

  const unreadNotifCount = notificationsList.filter(n => !n.read).length;

  const handleOpenNotif = () => {
    setIsNotifOpen(!isNotifOpen);
    setIsFriendsOpen(false);
    if (!isNotifOpen) {
      const updated = db.markNotificationsRead();
      setNotificationsList(updated);
    }
  };

  const handleAddFriendSubmit = (e) => {
    e.preventDefault();
    const name = newFriendName.trim();
    if (!name) return;

    setSearchError('');
    const foundUser = db.getUserByUsername(name);

    if (!foundUser) {
      setSearchError(`User "${name}" not found. No registered account exists with this handle.`);
      return;
    }

    const updated = db.addFriend({
      username: foundUser.username,
      rating: foundUser.rating,
      rankTier: foundUser.rankTier || 'Specialist',
      status: 'online',
      solvedCount: foundUser.solvedProblems?.length || 0,
      streak: foundUser.streak || 1
    });

    setFriendsList(updated);
    setNewFriendName('');
    setViewProfileUser(foundUser);
  };

  const handleCheckProfile = (username) => {
    const foundUser = db.getUserByUsername(username);
    if (foundUser) {
      setViewProfileUser(foundUser);
    } else {
      setViewProfileUser({
        username,
        rating: 1980,
        maxRating: 2100,
        rankTier: 'Candidate Master',
        streak: 14,
        solvedProblems: ['cf_4A', 'cf_1A', 'cf_706B', 'cf_455A'],
        createdAt: '2025-01-15T00:00:00.000Z'
      });
    }
  };

  const handleRemoveFriend = (name) => {
    const updated = db.removeFriend(name);
    setFriendsList(updated);
  };

  const handleAcceptDuelNotif = (notif) => {
    db.updateNotificationStatus(notif.id, 'accepted');
    setIsNotifOpen(false);
    onNavigate('/competitions');
  };

  const handleDeclineDuelNotif = (notif) => {
    const updated = db.updateNotificationStatus(notif.id, 'declined');
    setNotificationsList(updated);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-lg group-hover:scale-105 transition-transform duration-200 glow-blue">
                <Code2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-heading font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-300">
                  CPmunnity
                </span>
                <span className="text-[10px] font-mono font-semibold tracking-wider text-indigo-400 uppercase -mt-1">
                  Socratic CP Platform
                </span>
              </div>
            </button>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => onNavigate(item.path)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handleOpenNotif}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
                title="Notifications & Duel Invites"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl border border-indigo-500/30 shadow-2xl p-4 z-50 animate-slide-up bg-[#0f172a] text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="font-heading font-bold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-400" />
                      <span>Notifications & Invites</span>
                    </div>
                    <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="py-2 space-y-2.5 max-h-72 overflow-y-auto">
                    {notificationsList.map(n => (
                      <div key={n.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        {n.type === 'DUEL_INVITE' ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                                <Swords className="w-3.5 h-3.5 text-yellow-300" />
                                <span>1v1 Speed Duel Challenge</span>
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                            </div>
                            <p className="text-slate-300 text-[11px]">
                              <strong className="text-white">{n.fromUser}</strong> ({n.fromRating} Elo) challenged you to a 1v1 Speed Duel!
                            </p>
                            
                            {n.status === 'accepted' ? (
                              <div className="p-2 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Challenge Accepted! Starting duel...</span>
                              </div>
                            ) : n.status === 'declined' ? (
                              <div className="text-[10px] text-slate-500 italic">Challenge Declined</div>
                            ) : (
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => handleAcceptDuelNotif(n)}
                                  className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow glow-blue flex items-center justify-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept Duel</span>
                                </button>
                                <button
                                  onClick={() => handleDeclineDuelNotif(n)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px]"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div>
                            <div className="font-semibold text-slate-200 text-[11px]">{n.title}</div>
                            <div className="text-[10px] text-slate-500 mt-1 font-mono">{n.timestamp}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Friends */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsFriendsOpen(!isFriendsOpen);
                  setIsNotifOpen(false);
                  setSearchError('');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-xs font-semibold"
                title="Friends List & Search Profiles"
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">{friendsList.length} Friends</span>
              </button>

              {isFriendsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl border border-purple-500/30 shadow-2xl p-4 z-50 animate-slide-up bg-[#0f172a] text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="font-heading font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>Friends ({friendsList.length})</span>
                    </div>
                    <button onClick={() => setIsFriendsOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddFriendSubmit} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search handle (e.g. tourist_bot)..."
                        value={newFriendName}
                        onChange={(e) => {
                          setNewFriendName(e.target.value);
                          setSearchError('');
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {searchError && (
                      <div className="p-2 rounded bg-rose-950/80 border border-rose-500/40 text-rose-200 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{searchError}</span>
                      </div>
                    )}
                  </form>

                  <div className="py-1 space-y-2 max-h-64 overflow-y-auto">
                    {friendsList.map(friend => (
                      <div key={friend.username} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                              <span>{friend.username}</span>
                              <RatingBadge rating={friend.rating} size="sm" />
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{friend.rankTier}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCheckProfile(friend.username)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Check Stats & Profile"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          </button>

                          <button
                            onClick={() => {
                              setIsFriendsOpen(false);
                              onNavigate('/competitions');
                            }}
                            className="px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold flex items-center gap-1"
                            title="Challenge 1v1 Speed Duel"
                          >
                            <Swords className="w-3 h-3 text-yellow-300" />
                            <span>1v1</span>
                          </button>

                          <button
                            onClick={() => handleRemoveFriend(friend.username)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            title="Remove Friend"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Streak */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold"
              title={`${user.streak} Day Coding Streak`}
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span className="font-mono text-sm">{user.streak}d</span>
            </div>

            <RatingBadge rating={user.rating} size="md" />

            <button
              onClick={() => onNavigate('/settings')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                geminiApiKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 animate-bounce'
              }`}
              title={geminiApiKey ? 'Gemini AI Coach Active' : 'Gemini Key Required for AI Coach'}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {geminiApiKey ? 'AI Ready' : 'Add Key'}
              </span>
            </button>

            <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
              <button
                onClick={() => onNavigate('/settings')}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Profile Modal */}
      {viewProfileUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl max-w-md w-full border border-indigo-500/40 glow-purple animate-slide-up relative space-y-6 bg-[#0f172a]">
            <button
              onClick={() => setViewProfileUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-heading font-extrabold text-2xl shadow-lg glow-purple">
                {viewProfileUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
                  <span>{viewProfileUser.username}</span>
                  <RatingBadge rating={viewProfileUser.rating} size="sm" />
                </h3>
                <p className="text-xs text-indigo-300 font-mono">
                  {viewProfileUser.rankTier || 'Specialist'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Elo Rating</div>
                <div className="text-lg font-bold text-indigo-400">{viewProfileUser.rating} Elo</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Max Rating</div>
                <div className="text-lg font-bold text-emerald-400">{viewProfileUser.maxRating || viewProfileUser.rating} Elo</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Practice Done</div>
                <div className="text-lg font-bold text-purple-400">
                  {viewProfileUser.solvedProblems?.length || 0} Solved
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Coding Streak</div>
                <div className="text-lg font-bold text-orange-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-orange-400" />
                  <span>{viewProfileUser.streak || 1}d</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Recent Solved Problems ({viewProfileUser.solvedProblems?.length || 0})</span>
                <Award className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {viewProfileUser.solvedProblems && viewProfileUser.solvedProblems.length > 0 ? (
                  viewProfileUser.solvedProblems.map((pId) => (
                    <span key={pId} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-300">
                      ✓ {pId.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500 italic">No practice problems recorded yet</span>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setViewProfileUser(null);
                  setIsFriendsOpen(false);
                  onNavigate('/competitions');
                }}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg glow-blue flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4 text-yellow-300" />
                <span>Challenge 1v1 Speed Duel</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
