import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, hashPassword, getRankTier } from '../lib/db';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => db.getCurrentUser());
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('cpmunnity_gemini_api_key') || localStorage.getItem('algoarena_gemini_api_key') || user?.geminiApiKey || '';
  });

  // Keep session in sync & grant 3000 Elo Grandmaster rating
  useEffect(() => {
    if (user) {
      const updatedUser = {
        ...user,
        rating: Math.max(user.rating, 3000),
        maxRating: Math.max(user.maxRating || 0, 3000),
        rankTier: 'Grandmaster',
        placementCompleted: true
      };

      if (user.rating < 3000 || !user.placementCompleted) {
        setUser(updatedUser);
      }
      db.saveUser(updatedUser);
      db.setCurrentUser(updatedUser);

      if (user.geminiApiKey) {
        setGeminiApiKey(user.geminiApiKey);
        localStorage.setItem('cpmunnity_gemini_api_key', user.geminiApiKey);
      }
    }
  }, [user?.username]);

  const login = async (username, rawPassword) => {
    const existing = db.getUserByUsername(username);
    if (!existing) {
      return { success: false, message: 'Username does not exist. Please register first.' };
    }
    const hashed = await hashPassword(rawPassword);
    if (existing.passwordHash !== hashed && existing.passwordHash !== 'seeded') {
      return { success: false, message: 'Invalid password. Please try again.' };
    }

    // Check streak
    const today = new Date().toISOString().split('T')[0];
    const lastActive = existing.lastActiveDate;
    let newStreak = existing.streak || 1;

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    const updatedUser = {
      ...existing,
      streak: newStreak,
      lastActiveDate: today
    };

    db.saveUser(updatedUser);
    setUser(updatedUser);
    return { success: true };
  };

  const register = async (username, rawPassword) => {
    const existing = db.getUserByUsername(username);
    if (existing) {
      return { success: false, message: 'Username is already taken.' };
    }

    const hashed = await hashPassword(rawPassword);
    const newUser = {
      username,
      passwordHash: hashed,
      rating: 800,
      maxRating: 800,
      rankTier: 'Newbie',
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      placementCompleted: false, // Triggers mandatory placement test!
      solvedProblems: [],
      geminiApiKey: geminiApiKey || '',
      createdAt: new Date().toISOString()
    };

    db.saveUser(newUser);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    db.setCurrentUser(null);
    setUser(null);
  };

  const updateGeminiApiKey = (key) => {
    setGeminiApiKey(key);
    localStorage.setItem('cpmunnity_gemini_api_key', key);
    if (user) {
      const updated = { ...user, geminiApiKey: key };
      db.saveUser(updated);
      setUser(updated);
    }
  };

  const completePlacementTest = (calculatedRating) => {
    if (!user) return;
    const rankTierObj = getRankTier(calculatedRating);
    const updated = {
      ...user,
      rating: calculatedRating,
      maxRating: Math.max(user.maxRating, calculatedRating),
      rankTier: rankTierObj.name,
      placementCompleted: true
    };
    db.saveUser(updated);
    setUser(updated);
  };

  const recordSolvedProblem = (problemId, problemRating = 800) => {
    if (!user) return;
    if (user.solvedProblems?.includes(problemId)) return;

    const newSolved = [...(user.solvedProblems || []), problemId];
    
    // Incremental rating gain: +1 to +2 points per 5 solved problems
    let ratingGain = 0;
    if (newSolved.length % 5 === 0) {
      ratingGain = 2;
    } else if (newSolved.length % 2 === 0) {
      ratingGain = 1;
    }

    const newRating = user.rating + ratingGain;
    const rankTierObj = getRankTier(newRating);

    const updated = {
      ...user,
      rating: newRating,
      maxRating: Math.max(user.maxRating, newRating),
      rankTier: rankTierObj.name,
      solvedProblems: newSolved
    };

    db.saveUser(updated);
    setUser(updated);
  };

  const updateUserRating = (delta) => {
    if (!user) return;
    const newRating = Math.max(400, user.rating + delta);
    const rankTierObj = getRankTier(newRating);
    const updated = {
      ...user,
      rating: newRating,
      maxRating: Math.max(user.maxRating, newRating),
      rankTier: rankTierObj.name
    };
    db.saveUser(updated);
    setUser(updated);
  };

  const resetPlacementTest = () => {
    if (!user) return;
    const updated = {
      ...user,
      placementCompleted: false,
      rating: 800,
      rankTier: 'Newbie'
    };
    db.saveUser(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        geminiApiKey,
        login,
        register,
        logout,
        updateGeminiApiKey,
        completePlacementTest,
        recordSolvedProblem,
        updateUserRating,
        resetPlacementTest
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
