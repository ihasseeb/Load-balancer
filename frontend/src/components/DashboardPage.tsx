import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from './ui/card';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Activity, Server, Shield, Brain } from 'lucide-react';
import { Badge } from './ui/badge';
import { Settings } from '../App';
import { useRealMonitoring } from '../hooks/useRealMonitoring';
import { motion } from 'framer-motion';

interface DashboardPageProps {
  isMonitoring: boolean;
  settings: Settings;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage({
  isMonitoring,
  settings
}: DashboardPageProps) {
  // Fetch real monitoring data directly from backend API
  const data = useRealMonitoring(isMonitoring, settings);

  const {
    requestsData,
    serverData,
    rateLimitData,
    aiDecisions,
    currentRequests,
    activeServers,
    blockedRequests
  } = data;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] border-0 text-white shadow-xl shadow-blue-500/20 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Activity className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2 relative z-10">
              <CardDescription className="text-blue-100 font-medium">
                Current Requests/s
              </CardDescription>
              <CardTitle className="flex items-center gap-2 text-3xl font-bold">
                <Activity className="w-6 h-6" />
                {currentRequests}
              </CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-[#10B981] to-[#059669] border-0 text-white shadow-xl shadow-green-500/20 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Server className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2 relative z-10">
              <CardDescription className="text-green-100 font-medium">
                Active Servers
              </CardDescription>
              <CardTitle className="flex items-center gap-2 text-3xl font-bold">
                <Server className="w-6 h-6" />
                {activeServers}
              </CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-[#EF4444] to-[#DC2626] border-0 text-white shadow-xl shadow-red-500/20 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Shield className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2 relative z-10">
              <CardDescription className="text-red-100 font-medium">
                Blocked Requests
              </CardDescription>
              <CardTitle className="flex items-center gap-2 text-3xl font-bold">
                <Shield className="w-6 h-6" />
                {blockedRequests}
              </CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests Over Time */}
        <motion.div variants={item}>
          <Card className="backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Requests Over Time
              </CardTitle>
              <CardDescription>
                Live request monitoring (updates every 2s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={requestsData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: '#F3F4F6', fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={false}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Server Load Distribution */}
        <motion.div variants={item}>
          <Card className="backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Server Load Distribution
              </CardTitle>
              <CardDescription>
                Request distribution across servers
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serverData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={8}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    stroke="none"
                  >
                    {serverData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '12px'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rate Limiting Status */}
        <motion.div variants={item}>
          <Card className="backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Rate Limiting Status
              </CardTitle>
              <CardDescription>Allowed vs blocked requests</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rateLimitData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '12px'
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#3B82F6"
                    radius={[6, 6, 0, 0]}
                    barSize={60}
                  >
                    {rateLimitData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.name === 'Allowed' ? '#10B981' : '#EF4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Decision Log */}
        <motion.div variants={item}>
          <Card className="backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Decision Log
              </CardTitle>
              <CardDescription>Recent autonomous decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {aiDecisions.map(decision => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={decision.id}
                    className="flex items-start justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">
                          {decision.action}
                        </span>
                        <Badge
                          variant={
                            decision.status === 'Success'
                              ? 'default'
                              : 'destructive'
                          }
                          className="rounded-full px-2 py-0"
                        >
                          {decision.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {decision.reason}
                      </p>
                      <p className="text-[10px] font-mono text-gray-500 mt-2 uppercase tracking-wider">
                        {decision.timestamp}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {!isMonitoring && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          variants={item}
        >
          <Card className="border-dashed border-2 border-white/10 bg-transparent">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">
                  Monitoring is paused
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  The AI engine is currently on standby. Click "Start
                  Monitoring" to begin autonomous traffic management.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
