import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SessionRoomPage from './pages/SessionRoomPage';
import JoinPage from './pages/JoinPage';
import SessionEndedPage from './pages/SessionEndedPage';
import NotFoundPage from './pages/NotFoundPage';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

function AuthLayout({ children }) {
  return (
    <div className="flex h-screen bg-fl-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join/:token" element={<JoinPage />} />
        <Route path="/session-ended" element={<SessionEndedPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AuthLayout>
                <DashboardPage />
              </AuthLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/session/:sessionId"
          element={
            <PrivateRoute>
              <SessionRoomPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
