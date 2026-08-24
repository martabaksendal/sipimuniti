import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LiveAIChat } from './components/LiveAIChat';
import { AuthPage } from './pages/Login';
import { PlacementTest } from './pages/PlacementTest';
import { Dashboard } from './pages/Dashboard';
import { Practice } from './pages/Practice';
import { BaselineQuiz } from './pages/BaselineQuiz';
import { Editorials } from './pages/Editorials';
import { Competitions } from './pages/Competitions';
import { Chatwall } from './pages/Chatwall';
import { Settings } from './pages/Settings';

const AppContent = () => {
  const { user } = useAuth();
  
  // Basic Client-Side Multi-Page Router based on URL Hash
  const [currentPath, setCurrentPath] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || '/dashboard';
  });

  const [selectedPracticeProblemId, setSelectedPracticeProblemId] = useState(undefined);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setCurrentPath(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  // Auth Guard 1: Not logged in
  if (!user) {
    if (currentPath === '/register') {
      return <AuthPage onNavigate={navigate} isRegister={true} />;
    }
    return <AuthPage onNavigate={navigate} isRegister={false} />;
  }

  // Auth Guard 2: Placement test mandatory on new account
  if (!user.placementCompleted || currentPath === '/onboarding/placement') {
    return <PlacementTest onNavigate={navigate} />;
  }

  // Multi-page layout with top sticky navigation bar & global 24/7 AI chat widget
  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col font-sans relative">
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      <main className="flex-1">
        {currentPath === '/dashboard' && (
          <Dashboard
            onNavigate={navigate}
            onSelectProblem={(id) => setSelectedPracticeProblemId(id)}
          />
        )}

        {currentPath === '/practice' && (
          <Practice initialProblemId={selectedPracticeProblemId} />
        )}

        {currentPath === '/baseline' && (
          <BaselineQuiz onNavigate={navigate} />
        )}

        {currentPath === '/editorials' && (
          <Editorials onNavigate={navigate} />
        )}

        {currentPath === '/competitions' && (
          <Competitions onNavigate={navigate} />
        )}

        {currentPath === '/chatwall' && (
          <Chatwall />
        )}

        {currentPath === '/settings' && (
          <Settings onNavigate={navigate} />
        )}
      </main>

      {/* Global 24/7 Live AI Chat Floating Assistant */}
      <LiveAIChat />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
