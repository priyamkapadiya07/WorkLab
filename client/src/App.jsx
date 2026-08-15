import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';

import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import GithubSync from './pages/GithubSync';
import ProjectDetails from './pages/ProjectDetails';
import { LayoutDashboard, FolderKanban, GitBranch as GithubIcon, WifiOff } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Login = () => {
  const { login, user, loading } = useAuth();
  
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <div className="card w-full max-w-md text-center p-8 border border-[var(--color-border)]">
        <h1 className="text-3xl font-mono mb-2 text-white">WorkLab</h1>
        <p className="text-[var(--color-muted-foreground)] mb-8 text-sm">Personal Developer Project Vault</p>
        <button onClick={login} className="btn btn-primary w-full shadow-md font-mono text-sm tracking-wide">
          Login with GitHub
        </button>
      </div>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

// Layout with Navigation
const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-background)]">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--color-border)] bg-[var(--color-card)] md:h-screen md:sticky md:top-0 flex flex-col z-10 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)] shrink-0">
          <div className="font-serif  text-3xl tracking-wide text-white">Work<span className="text-[var(--color-accent)] font-semibold text-4xl font-sarif italic">Lab</span> </div>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto">
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-[var(--color-muted)] text-white' : 'text-[var(--color-muted-foreground)] hover:text-white hover:bg-[var(--color-muted)]/50'}`}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-[var(--color-muted)] text-white' : 'text-[var(--color-muted-foreground)] hover:text-white hover:bg-[var(--color-muted)]/50'}`}>
            <FolderKanban className="h-4 w-4" /> Projects
          </NavLink>
          <NavLink to="/github-sync" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-[var(--color-muted)] text-white' : 'text-[var(--color-muted-foreground)] hover:text-white hover:bg-[var(--color-muted)]/50'}`}>
            <GithubIcon className="h-4 w-4" /> GitHub Sync
          </NavLink>
        </nav>
        <div className="p-4 border-t md:border-t-0 border-[var(--color-border)] flex flex-row md:flex-col justify-between items-center md:items-start gap-4 md:gap-0">
          <div className="flex items-center gap-3 md:mb-4">
            {user?.avatarUrl && <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-[var(--color-border)]" />}
            <span className="text-sm font-medium text-white truncate max-w-[120px] md:max-w-none">{user?.username}</span>
          </div>
          <button onClick={logout} className="text-xs text-[var(--color-muted-foreground)] hover:text-white transition-colors md:w-full md:text-left font-mono whitespace-nowrap">
            Logout &rarr;
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto relative">
        {isOffline && (
          <div className="sticky top-0 z-50 bg-[var(--color-destructive)] text-[var(--color-on-destructive)] px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-md">
            <WifiOff className="h-4 w-4" /> You're offline. Showing cached project data.
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Navigate to="/dashboard" />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <AppLayout>
                  <Projects />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <AppLayout>
                  <ProjectDetails />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/github-sync" element={
              <ProtectedRoute>
                <AppLayout>
                  <GithubSync />
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
