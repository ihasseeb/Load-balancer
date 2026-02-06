import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import LogsPage from './components/LogsPage';
import ModelInsightsPage from './components/ModelInsightsPage';
import SettingsPage from './components/SettingsPage';
import AboutPage from './components/AboutPage';
import ServicesMonitor from './components/ServicesMonitor';
import Sidebar from './components/Sidebar';
import { Toaster } from './components/ui/sonner';
import { useRealMonitoring } from './hooks/useRealMonitoring';

export interface Settings {
  maxRequestsPerSecond: number;
  minServers: number;
  maxServers: number;
  rateLimit: number;
  cooldownPeriod: number;
  learningRate: number;
  decisionInterval: number;
}

const DEFAULT_SETTINGS: Settings = {
  maxRequestsPerSecond: 1000,
  minServers: 1,
  maxServers: 5,
  rateLimit: 100,
  cooldownPeriod: 60,
  learningRate: 0.01,
  decisionInterval: 5
};

function AnimatedRoutes({
  isMonitoring,
  settings,
  monitoringData,
  setSettings
}: any) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <DashboardPage isMonitoring={isMonitoring} settings={settings} />
            }
          />
          <Route
            path="/logs"
            element={
              <LogsPage
                isMonitoring={isMonitoring}
                logs={monitoringData.logs}
              />
            }
          />
          <Route path="/model" element={<ModelInsightsPage />} />
          <Route path="/services" element={<ServicesMonitor />} />
          <Route
            path="/settings"
            element={
              <SettingsPage
                settings={settings}
                onSettingsChange={setSettings}
              />
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('authToken');
    return !!token;
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('userEmail') || '';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved !== null ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // 🔥 Using Real Monitoring - Fetches data from SQLite Database
  const monitoringData = useRealMonitoring(isMonitoring, settings);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const handleLogin = (userData: any) => {
    setIsAuthenticated(true);
    setUserEmail(userData.email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} isDarkMode={isDarkMode} />;
  }

  return (
    <BrowserRouter>
      <div
        className={`flex h-screen ${
          isDarkMode ? 'bg-[#0B0C10]' : 'bg-[#F5F6FA]'
        }`}
      >
        <Sidebar isDarkMode={isDarkMode} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar */}
          <header
            className={`${
              isDarkMode ? 'bg-[#1F2937]/80' : 'bg-white/80'
            } backdrop-blur-md border-b ${
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            } px-6 py-4 sticky top-0 z-10`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1
                  className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  AI Adaptive Load Balancing
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-lg ${
                    isMonitoring
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                      : 'bg-[#3B82F6] hover:bg-blue-600 text-white shadow-blue-500/20'
                  }`}
                >
                  {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-800 text-yellow-400'
                      : 'bg-gray-200 text-gray-700'
                  } hover:opacity-80 transition-opacity`}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                  }`}
                  title={`Logged in as: ${userEmail}`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </motion.button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 bg-transparent">
            <AnimatedRoutes
              isMonitoring={isMonitoring}
              settings={settings}
              monitoringData={monitoringData}
              setSettings={setSettings}
            />
          </main>
        </div>

        <Toaster
          position="bottom-right"
          theme={isDarkMode ? 'dark' : 'light'}
        />
      </div>
    </BrowserRouter>
  );
}
