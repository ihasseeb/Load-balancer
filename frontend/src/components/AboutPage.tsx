import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BookOpen, Github, Code, Zap, Shield, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';

export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#3B82F6]" />
            About AI Adaptive Load Balancing
          </CardTitle>
          <CardDescription>Student Prototype - Understanding the System</CardDescription>
        </CardHeader>
      </Card>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>What is this system?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            This system uses artificial intelligence to monitor and control server load dynamically.
            It analyzes real-time metrics, logs, and requests to make autonomous decisions such as
            scaling servers up or down, blocking malicious traffic, and optimizing resource allocation.
          </p>
          <p className="text-gray-300 leading-relaxed">
            The AI model continuously learns from traffic patterns and system behavior to improve
            its decision-making over time. It can operate in two modes: Supervised Learning (trained
            on historical data) and Reinforcement Learning (learns through trial and reward).
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-[#3B82F6] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-white mb-2">Auto-Scaling</h3>
                <p className="text-gray-400">
                  Automatically scales servers based on traffic demand, optimizing costs and performance.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-[#10B981] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-white mb-2">Intelligent Rate Limiting</h3>
                <p className="text-gray-400">
                  Detects and blocks malicious traffic patterns while allowing legitimate users through.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-[#F59E0B] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-white mb-2">Real-Time Monitoring</h3>
                <p className="text-gray-400">
                  Live dashboards showing request rates, server health, and AI decisions as they happen.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-[#8B5CF6] flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-white mb-2">Adaptive Learning</h3>
                <p className="text-gray-400">
                  Machine learning models that improve over time by learning from system behavior.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Architecture */}
      <Card>
        <CardHeader>
          <CardTitle>System Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-[#1F2937] rounded-lg p-6 border border-gray-700">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                <span className="text-gray-300"><span className="text-white">Traffic Monitor</span> → Collects real-time request data</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                <span className="text-gray-300"><span className="text-white">AI Decision Engine</span> → Analyzes patterns and makes decisions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                <span className="text-gray-300"><span className="text-white">Load Balancer</span> → Distributes traffic across servers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                <span className="text-gray-300"><span className="text-white">Rate Limiter</span> → Filters and blocks malicious requests</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
                <span className="text-gray-300"><span className="text-white">Auto-Scaler</span> → Adds/removes servers dynamically</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 list-decimal list-inside text-gray-300">
            <li>
              <span className="text-white">Data Collection:</span> The system continuously monitors incoming requests,
              response times, server load, and error rates.
            </li>
            <li>
              <span className="text-white">Pattern Analysis:</span> AI models analyze the collected data to identify
              patterns, anomalies, and potential threats.
            </li>
            <li>
              <span className="text-white">Decision Making:</span> Based on the analysis, the AI decides whether to
              scale servers, throttle IPs, or redistribute load.
            </li>
            <li>
              <span className="text-white">Action Execution:</span> Decisions are executed automatically - new servers
              are spawned, requests are blocked, or traffic is redistributed.
            </li>
            <li>
              <span className="text-white">Feedback Loop:</span> The system monitors the outcomes and uses this
              feedback to improve future decisions.
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'React & TypeScript',
              'Recharts (Visualization)',
              'Tailwind CSS',
              'Machine Learning Models',
              'RESTful APIs',
              'WebSocket (Real-time)',
            ].map((tech) => (
              <div
                key={tech}
                className="px-4 py-2 rounded-lg bg-[#1F2937] border border-gray-700 text-center text-gray-300"
              >
                {tech}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle>Resources & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#1F2937] border border-gray-700">
            <div className="flex items-center gap-3">
              <Github className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white">View Source Code</p>
                <p className="text-gray-400">Explore the project on GitHub</p>
              </div>
            </div>
            <Button variant="outline">Visit</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[#1F2937] border border-gray-700">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white">Documentation</p>
                <p className="text-gray-400">Read detailed technical documentation</p>
              </div>
            </div>
            <Button variant="outline">Read</Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="border-[#3B82F6]">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-400 mb-2">AI Adaptive Load Balancing Dashboard</p>
            <p className="text-gray-500">Student Prototype | © 2025</p>
            <p className="text-gray-500 mt-4">
              This is an educational project demonstrating AI-driven infrastructure management
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
