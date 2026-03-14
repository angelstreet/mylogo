import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import More from '@/pages/More';

const clerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const authDisabled = import.meta.env.VITE_AUTH_DISABLED === 'true';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/more" element={<More />} />
      {/* Add your routes here */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Clerk-authenticated app (cloud mode).
 * Only rendered when VITE_CLERK_PUBLISHABLE_KEY is set.
 */
function ClerkApp() {
  // Dynamic import to avoid bundling Clerk when not used
  const { useUser, useClerk, SignIn } = require('@clerk/clerk-react');
  const { dark } = require('@clerk/themes');
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-3xl font-bold mb-2 text-accent">App</h1>
          <p className="text-text-secondary text-sm mb-8">Sign in to continue</p>
          <SignIn
            routing="hash"
            appearance={{
              baseTheme: dark,
              variables: {
                colorBackground: '#0a0b14',
                colorText: '#e4e4e7',
                colorTextSecondary: '#a1a1aa',
                colorPrimary: 'var(--color-accent, #7c5cff)',
                colorInputBackground: '#12131f',
                colorInputText: '#e4e4e7',
                borderRadius: '0.5rem',
              },
              elements: {
                rootBox: 'w-full',
                card: 'bg-bg-elevated border border-border shadow-none',
                formButtonPrimary: 'bg-accent hover:bg-accent-hover',
              },
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Layout onLogout={() => signOut()}>
      <AppRoutes />
    </Layout>
  );
}

/**
 * Local-auth app (no Clerk).
 * Simple localStorage-based authentication.
 * Set VITE_AUTH_DISABLED=true to auto-login (dev mode).
 */
function LegacyApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('app_auth') === 'true'
  );

  // Auto-login when auth is disabled (local dev)
  useEffect(() => {
    if (authDisabled && !isAuthenticated) {
      localStorage.setItem('app_auth', 'true');
      setIsAuthenticated(true);
    }
  }, [authDisabled, isAuthenticated]);

  const login = () => {
    localStorage.setItem('app_auth', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('app_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <Layout onLogout={logout}>
      <AppRoutes />
    </Layout>
  );
}

export default function App() {
  if (clerkEnabled) {
    return <ClerkApp />;
  }
  return <LegacyApp />;
}
