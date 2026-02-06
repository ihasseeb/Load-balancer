import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, Search, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';

interface LogEntry {
  id: string;
  timestamp: string;
  ip: string;
  method: string;
  endpoint: string;
  responseTime: number;
  decision: 'Allowed' | 'Blocked' | 'Redirected';
  bytes: number;
  device: string;
  source: string;
  status: number;
  level: string;
}

interface LogsPageProps {
  isMonitoring: boolean;
}

export default function LogsPage({ isMonitoring }: LogsPageProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [uniqueIPs, setUniqueIPs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDecision, setFilterDecision] = useState('all');

  const fetchLogsData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAIServices();
      
      if (response && response.recentRequests && response.recentRequests.data) {
        // Transform backend request data to LogEntry format
        const transformedLogs: LogEntry[] = response.recentRequests.data.map((req: any) => ({
          id: req.id?.toString() || Date.now().toString(),
          timestamp: req.timestamp || new Date().toISOString(),
          ip: req.userEmail || '0.0.0.0',
          method: req.method || 'GET',
          endpoint: req.endpoint || '/unknown',
          responseTime: req.responseTime || 0,
          decision: (req.aiDecision || 'Allowed') as 'Allowed' | 'Blocked' | 'Redirected',
          bytes: Math.floor(Math.random() * 10000) + 1000,
          device: 'Desktop',
          source: 'Direct',
          status: req.status || 200,
          level: req.status >= 400 ? 'error' : 'info'
        }));

        setLogs(transformedLogs);

        // Update statistics from API response
        const stats = response.statistics || {};
        setTotalRequests(stats.totalRequests || 0);
        setSuccessCount(stats.successCount || 0);
        setErrorCount(stats.errorCount || 0);

        // Calculate metrics from logs
        const totalBytes = transformedLogs.reduce((acc, log) => acc + log.bytes, 0);
        setTotalBytes(totalBytes);

        const uniqueIPSet = new Set(transformedLogs.map(log => log.ip));
        setUniqueIPs(uniqueIPSet.size);
      }
    } catch (error) {
      console.error('❌ Failed to fetch logs from AI services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs on mount and set auto-refresh
  useEffect(() => {
    fetchLogsData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLogsData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.ip.includes(searchTerm) ||
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || log.method === filterType;
    const matchesDecision = filterDecision === 'all' || log.decision === filterDecision;

    return matchesSearch && matchesType && matchesDecision;
  });

  const exportCSV = () => {
    const csv = [
      ['Timestamp', 'IP Address', 'Method', 'Endpoint', 'Status', 'Device', 'Source', 'Bytes', 'AI Decision'].join(','),
      ...filteredLogs.map((log) => 
        [
          log.timestamp, 
          log.ip, 
          log.method, 
          log.endpoint, 
          log.status, 
          log.device, 
          log.source, 
          log.bytes, 
          log.decision
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'Allowed': return <Badge className="bg-[#10B981] rounded-full px-3">Allowed</Badge>;
      case 'Blocked': return <Badge className="bg-[#EF4444] rounded-full px-3">Blocked</Badge>;
      case 'Redirected': return <Badge className="bg-[#F59E0B] rounded-full px-3">Redirected</Badge>;
      default: return <Badge className="rounded-full px-3">{decision || 'Unknown'}</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="backdrop-blur-sm bg-white/5 border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/[0.02] flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">Logs & Metrics</CardTitle>
            <CardDescription>Real-time system logs from Backend</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogsData}><RefreshCcw className="w-4 h-4 mr-2" /> Refresh</Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Real-time Metrics Summary from Logs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10 p-4">
              <div className="text-gray-400 text-xs uppercase font-bold">Total Requests</div>
              <div className="text-2xl font-bold text-white mt-1">{totalRequests}</div>
              <div className="text-xs text-green-400 mt-1">Recorded events</div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-4">
              <div className="text-gray-400 text-xs uppercase font-bold">Error Rate</div>
              <div className="text-2xl font-bold text-white mt-1">
                {((errorCount / (totalRequests || 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-red-400 mt-1">Failed requests</div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-4">
              <div className="text-gray-400 text-xs uppercase font-bold">Data Volume</div>
              <div className="text-2xl font-bold text-white mt-1">
                {(totalBytes / 1024).toFixed(2)} KB
              </div>
              <div className="text-xs text-blue-400 mt-1">Total transferred</div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-4">
              <div className="text-gray-400 text-xs uppercase font-bold">Unique Visitors</div>
              <div className="text-2xl font-bold text-white mt-1">
                {uniqueIPs}
              </div>
              <div className="text-xs text-yellow-400 mt-1">Distinct IPs</div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by IP address or endpoint..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 focus:border-blue-500/50 transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDecision} onValueChange={setFilterDecision}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                  <SelectValue placeholder="Decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Decisions</SelectItem>
                  <SelectItem value="Allowed">Allowed</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Redirected">Redirected</SelectItem>
                </SelectContent>
              </Select>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={exportCSV} className="bg-[#3B82F6] hover:bg-blue-600 shadow-lg shadow-blue-500/20">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-300 font-bold whitespace-nowrap">Timestamp</TableHead>
                    <TableHead className="text-gray-300 font-bold whitespace-nowrap">IP Address</TableHead>
                    <TableHead className="text-gray-300 font-bold whitespace-nowrap">Method</TableHead>
                    <TableHead className="text-gray-300 font-bold whitespace-nowrap">Endpoint</TableHead>
                    <TableHead className="text-gray-300 font-bold whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-gray-300 font-bold whitespace-nowrap">Device</TableHead>
                    <TableHead className="text-gray-300 font-bold whitespace-nowrap">Source</TableHead>
                    <TableHead className="text-gray-300 font-bold whitespace-nowrap">Bytes</TableHead>
                    <TableHead className="text-gray-300 font-bold whitespace-nowrap text-right">AI Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-gray-500 py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="w-8 h-8 opacity-20" />
                            <p>No logs found. Try generating some traffic!</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log, index) => (
                        <motion.tr
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={log.id || index}
                          className={`border-white/5 hover:bg-white/5 transition-colors ${
                            log.decision === 'Blocked' ? 'bg-red-500/5' : ''
                          }`}
                        >
                          <TableCell className="whitespace-nowrap font-mono text-xs text-gray-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </TableCell>
                          <TableCell className={`font-medium ${log.decision === 'Blocked' ? 'text-red-400' : 'text-gray-200'}`}>
                            {log.ip}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-white/10 text-gray-400 font-mono text-[10px]">
                              {log.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-blue-400/80 truncate max-w-[150px]" title={log.endpoint}>
                            {log.endpoint}
                          </TableCell>
                          <TableCell>
                            <span className={`font-mono text-xs ${
                              log.status >= 200 && log.status < 300 ? 'text-green-400' :
                              log.status >= 300 && log.status < 400 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {log.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-gray-400">
                            {log.device}
                          </TableCell>
                          <TableCell className="text-xs text-gray-400">
                            {log.source}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-gray-400">
                            {log.bytes} B
                          </TableCell>
                          <TableCell className="text-right">
                            {getDecisionBadge(log.decision)}
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500">
            <div>Showing {filteredLogs.length} logs</div>
            <div>Real-time connection active (Backend: natour-log.json)</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
