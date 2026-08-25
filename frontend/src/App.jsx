import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider, { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InteractiveEffects from './components/InteractiveEffects';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateSnippet from './pages/CreateSnippet';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SnippetDetail from './pages/SnippetDetail';

// ── Loading screen shown while localStorage session is being restored ──
const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="text-center animate-pulse">
      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
        Initializing <span className="text-indigo-500">SnipForge</span>
      </span>
    </div>
  </div>
);

// ── Redirects unauthenticated users to /login ──
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// ── Redirects already-logged-in users away from /login and /signup ──
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell min-h-screen bg-slate-900 flex flex-col relative isolate">
          <InteractiveEffects />
          <Navbar />
          <main className="flex-1 animate-page-fade relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/snippet/:id" element={<SnippetDetail />} />

              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />

              <Route
                path="/signup"
                element={
                  <PublicOnlyRoute>
                    <Signup />
                  </PublicOnlyRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateSnippet />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all: redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
