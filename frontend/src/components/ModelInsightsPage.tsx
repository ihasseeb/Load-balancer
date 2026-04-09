import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, Shield, TrendingUp, Cpu, Server, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useAiModelInsights } from '../hooks/useAiModelInsights';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ModelInsightsPage() {
  const { aiInsights, isLoading, error } = useAiModelInsights();

  if (isLoading && aiInsights.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Prepare data for the confidence chart
  const chartData = [...aiInsights].reverse().map(insight => ({
    timestamp: new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    confidence: (insight.decisions.confidence * 100).toFixed(1),
    cpu: insight.metrics.cpu,
    memory: insight.metrics.memory,
    predicted: insight.forecast.predictedLoad.toFixed(2)
  }));

  const latest = aiInsights[0] || null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header Card */}
      <motion.div variants={item}>
        <Card className="backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Brain className="w-32 h-32" />
          </div>
          <CardHeader className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <Brain className="w-8 h-8 text-purple-400" />
                  AI Model Insights
                </CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  Ensemble AI Analysis: XGBoost, Random Forest, LSTM & Isolation Forest
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10 px-4 py-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2"></span>
                LIVE ANALYSIS
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* XGBoost Status */}
        <motion.div variants={item}>
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-400 flex items-center gap-2">
                <Server className="w-4 h-4" /> PRIMARY (XGBoost)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{latest?.decisions.primary || 'N/A'}</div>
              <p className="text-xs text-gray-500 mt-1">Confidence: {(latest?.decisions.confidence * 100).toFixed(2)}%</p>
              <Progress value={(latest?.decisions.confidence * 100)} className="h-1 mt-3 bg-blue-900/20" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Random Forest Comparison */}
        <motion.div variants={item}>
          <Card className="bg-indigo-500/5 border-indigo-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-400 flex items-center gap-2">
                <Brain className="w-4 h-4" /> CHECKER (RF)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{latest?.decisions.secondary || 'N/A'}</div>
              <p className="text-xs text-gray-500 mt-1">Cross-validation check</p>
              <div className="flex items-center gap-2 mt-3">
                {latest?.decisions.primary === latest?.decisions.secondary ? (
                  <Badge className="bg-green-500/20 text-green-400 border-none text-[10px]">CONSENSUS</Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-none text-[10px]">DIVERGENT</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security / Anomaly */}
        <motion.div variants={item}>
          <Card className={`bg-opacity-5 ${latest?.security.isAnomaly ? 'bg-red-500 border-red-500/20' : 'bg-green-500 border-green-500/20'}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${latest?.security.isAnomaly ? 'text-red-400' : 'text-green-400'}`}>
                <Shield className="w-4 h-4" /> SECURITY (ISO-F)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {latest?.security.isAnomaly ? 'ANOMALY' : 'SAFE'}
              </div>
              <p className="text-xs text-gray-500 mt-1">Threat Level: {latest?.security.threatLevel}</p>
              <div className="mt-3">
                {latest?.security.isAnomaly ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Prediction / LSTM */}
        <motion.div variants={item}>
          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> FORECAST (LSTM)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{latest?.forecast.predictedLoad.toFixed(2)} RPS</div>
              <p className="text-xs text-purple-400/70 mt-1">Action: {latest?.forecast.action}</p>
              <div className="mt-3 h-1 w-full bg-purple-900/20 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '65%' }}></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confidence Chart */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Model Performance & Forecast</CardTitle>
              <CardDescription>Real-time confidence scores and predicted load trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Legend />
                    <Area type="monotone" dataKey="confidence" name="Model Confidence (%)" stroke="#3B82F6" fillOpacity={1} fill="url(#colorConf)" strokeWidth={2} />
                    <Area type="monotone" dataKey="predicted" name="Predicted Load (RPS)" stroke="#A855F7" fillOpacity={1} fill="url(#colorPred)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Input Metrics */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="h-full backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Cpu className="w-5 h-5 text-gray-400" />
                Live Engine Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">CPU Load</span>
                    <span className="text-white font-mono">{latest?.metrics.cpu}%</span>
                  </div>
                  <Progress value={latest?.metrics.cpu} className="h-2 bg-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Memory Usage</span>
                    <span className="text-white font-mono">{latest?.metrics.memory}%</span>
                  </div>
                  <Progress value={latest?.metrics.memory} className="h-2 bg-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Incoming RPS</span>
                    <span className="text-white font-mono">{latest?.metrics.requests} Req/s</span>
                  </div>
                  <Progress value={Math.min(100, (latest?.metrics.requests || 0) * 10)} className="h-2 bg-white/10" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 mt-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-purple-400 mb-2">Algorithm Version</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">v3.2.0 (Ensemble)</span>
                  <Badge variant="outline" className="text-[10px] border-purple-500/30">LATEST</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
