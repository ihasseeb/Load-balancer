import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Brain, Clock, Zap } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useMockModelInsights, ModelType } from '../hooks/useMockModelInsights';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function ModelInsightsPage() {
  const [modelType, setModelType] = useState<ModelType>('supervised');
  const {
    metricsData,
    lastRetrain,
    nextRetrainIn,
    trainingProgress,
    isTraining,
  } = useMockModelInsights(modelType);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const toggleModelType = () => {
    setModelType((prev) => (prev === 'supervised' ? 'reinforcement' : 'supervised'));
  };


  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
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
                  Model Insights
                </CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  Deep dive into the AI engine's performance and learning metrics
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4 bg-white/5 p-3 rounded-2xl border border-white/10">
                <Label htmlFor="model-type" className={`text-sm font-bold ${modelType === 'supervised' ? 'text-blue-400' : 'text-gray-500'}`}>Supervised</Label>
                <Switch
                  id="model-type"
                  checked={modelType === 'reinforcement'}
                  onCheckedChange={toggleModelType}
                />
                <Label htmlFor="model-type" className={`text-sm font-bold ${modelType === 'reinforcement' ? 'text-purple-400' : 'text-gray-500'}`}>Reinforcement</Label>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training Status */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="h-full backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Training Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Next Scheduled Retrain</span>
                  <span className="text-white font-mono">{formatTime(nextRetrainIn)}</span>
                </div>
                <Progress value={(3600 - nextRetrainIn) / 36} className="h-2 bg-white/10" />
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Current Progress</span>
                  <Badge variant={isTraining ? 'default' : 'secondary'} className="rounded-full">
                    {isTraining ? 'In Progress' : 'Idle'}
                  </Badge>
                </div>
                <Progress value={trainingProgress} className="h-3 bg-white/10" />
                <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest font-bold">
                  {isTraining ? `Optimizing weights... ${trainingProgress}%` : 'Waiting for next cycle'}
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Last retrained: {lastRetrain.toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Performance Metrics</CardTitle>
              <CardDescription>
                {modelType === 'supervised'
                  ? 'Accuracy and Precision over time'
                  : 'Cumulative Reward and Efficiency'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metricsData}>
                  <defs>
                    <linearGradient id="colorMetric1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={modelType === 'supervised' ? '#3B82F6' : '#8B5CF6'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={modelType === 'supervised' ? '#3B82F6' : '#8B5CF6'} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMetric2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={modelType === 'supervised' ? '#10B981' : '#F59E0B'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={modelType === 'supervised' ? '#10B981' : '#F59E0B'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '12px' }}
                  />
                  <Legend />
                  {modelType === 'supervised' ? (
                    <>
                      <Area
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorMetric1)"
                      />
                      <Area
                        type="monotone"
                        dataKey="precision"
                        stroke="#10B981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorMetric2)"
                      />
                    </>
                  ) : (
                    <>
                      <Area
                        type="monotone"
                        dataKey="reward"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorMetric1)"
                      />
                      <Area
                        type="monotone"
                        dataKey="efficiency"
                        stroke="#F59E0B"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorMetric2)"
                      />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Model Architecture Info */}
      <motion.div variants={item}>
        <Card className="backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Model Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Input Layers', value: '128 Nodes' },
                { label: 'Hidden Layers', value: '4 Layers' },
                { label: 'Optimizer', value: 'AdamW' },
                { label: 'Loss Function', value: 'MSE / Cross-Entropy' },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
