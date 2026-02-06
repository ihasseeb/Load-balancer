import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ScrollText, Brain, Settings, BookOpen, Activity, Server } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isDarkMode: boolean;
}

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/logs', label: 'Logs & Metrics', icon: ScrollText },
  { path: '/model', label: 'Model Insights', icon: Brain },
  { path: '/services', label: 'Services Monitor', icon: Server },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/about', label: 'About', icon: BookOpen },
];

export default function Sidebar({ isDarkMode }: SidebarProps) {
  return (
    <aside className={`w-64 ${isDarkMode ? 'bg-[#1F2937]/80' : 'bg-white/80'} backdrop-blur-xl border-r ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} flex flex-col z-20`}>
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-tr from-[#3B82F6] to-[#2563EB] p-2 rounded-xl shadow-lg shadow-blue-500/20"
          >
            <Activity className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className={`font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Load Balance</h2>
            <p className={`text-[10px] font-medium uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>System Core v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                      ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/25'
                      : isDarkMode
                        ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="relative z-10"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <span className="relative z-10 font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800/50">
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'} border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>System Status</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
            <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

