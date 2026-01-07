import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ClubLobby from './pages/ClubLobby';
import GamePage from './pages/GamePage';
import HistoryPage from './pages/HistoryPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/club/:id" element={<ClubLobby />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/history/:tableId" element={<HistoryPage />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
