import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SelfieProvider } from './contexts/SelfieContext';
import { Header } from './components/Header';
import { SignInPage } from './components/SignInPage';
import { Dashboard } from './components/Dashboard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SignInPage />;
  }

  return (
    <SelfieProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Dashboard />
        </main>
      </div>
    </SelfieProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;