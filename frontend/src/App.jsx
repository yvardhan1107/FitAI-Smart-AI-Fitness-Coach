import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import TodayPage from './pages/TodayPage';
import { useAuth } from './store/authStore';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-neutral-400 text-sm">Preparing your session...</p>
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AuthenticatedPage = ({ children }) => (
  <ProtectedRoute>
    {children}
  </ProtectedRoute>
);

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <AuthenticatedPage>
            <DashboardPage />
          </AuthenticatedPage>
        }
      />
      <Route
        path="/profile"
        element={
          <AuthenticatedPage>
            <ProfilePage />
          </AuthenticatedPage>
        }
      />
      <Route
        path="/progress"
        element={
          <AuthenticatedPage>
            <ProgressPage />
          </AuthenticatedPage>
        }
      />
      <Route
        path="/today"
        element={
          <AuthenticatedPage>
            <TodayPage />
          </AuthenticatedPage>
        }
      />
      <Route
        path="/chat"
        element={
          <AuthenticatedPage>
            <ChatPage />
          </AuthenticatedPage>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
