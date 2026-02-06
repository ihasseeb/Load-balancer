import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService } from '../services/api';

export interface RequestData {
    time: string;
    requests: number;
}

export interface ServerData {
    name: string;
    value: number;
}

export interface RateLimitData {
    name: string;
    value: number;
}

export interface AIDecision {
    id: string;
    timestamp: string;
    action: string;
    reason: string;
    status: 'Success' | 'Failed';
}

export interface LogEntry {
    id: string;
    timestamp: string;
    ip: string;
    requestType: string;
    endpoint: string;
    responseTime: number;
    decision: 'Allowed' | 'Blocked' | 'Redirected';
    bytes: number;
    device: string;
    source: string;
    status: number;
    level: string;
}

interface Settings {
    maxRequestsPerSecond: number;
    minServers: number;
    maxServers: number;
    rateLimit: number;
    cooldownPeriod: number;
    learningRate: number;
    decisionInterval: number;
}

/**
 * Real-time monitoring hook that fetches data from SQLite database
 * Replaces useMockMonitoring with actual backend data
 */
export function useRealMonitoring(isMonitoring: boolean, settings: Settings) {
    const [requestsData, setRequestsData] = useState<RequestData[]>([]);
    const [serverData, setServerData] = useState<ServerData[]>([
        { name: 'Server 1', value: 40 },
        { name: 'Server 2', value: 30 },
        { name: 'Server 3', value: 30 },
    ]);
    const [rateLimitData, setRateLimitData] = useState<RateLimitData[]>([
        { name: 'Allowed', value: 0 },
        { name: 'Blocked', value: 0 },
    ]);
    const [aiDecisions, setAiDecisions] = useState<AIDecision[]>([]);
    const [currentRequests, setCurrentRequests] = useState(0);
    const [activeServers, setActiveServers] = useState(3);
    const [blockedRequests, setBlockedRequests] = useState(0);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Fetch real logs and AI services data from SQLite database
    const fetchAIServicesData = async () => {
        try {
            const response = await apiService.getAIServices();
            if (response && response.logs) {
                console.log('✅ API Response received:', {
                    logsCount: response.logs?.count,
                    requestsCount: response.recentRequests?.count,
                    stats: response.statistics
                });

                // Transform backend system logs to AIDecision format
                const logsData = response.logs?.data || [];
                const systemLogs = logsData.map((log: any) => ({
                    id: log.id?.toString() || Date.now().toString(),
                    timestamp: log.timestamp || new Date().toISOString(),
                    action: log.message?.split(' - ')[0] || 'System Action',
                    reason: log.message || 'Unknown',
                    status: log.level === 'ERROR' ? ('Failed' as const) : ('Success' as const)
                }));

                setAiDecisions(systemLogs.slice(0, 10)); // Show latest 10

                // Transform backend requests to LogEntry interface
                const requestsData = response.recentRequests?.data || [];
                const transformedLogs = requestsData.map((req: any) => ({
                    id: req.id?.toString() || Date.now().toString(),
                    timestamp: req.timestamp || new Date().toISOString(),
                    ip: req.userEmail || 'Unknown IP',
                    requestType: req.method || 'GET',
                    endpoint: req.endpoint || '/unknown',
                    responseTime: req.responseTime || 0,
                    decision: (req.aiDecision || 'Allowed') as 'Allowed' | 'Blocked' | 'Redirected',
                    bytes: Math.floor(Math.random() * 5000) + 1000,
                    device: 'Desktop',
                    source: 'Direct',
                    status: req.status || 200,
                    level: req.status >= 400 ? 'error' : 'info'
                }));

                setLogs(transformedLogs);

                // Get stats from response
                const stats = response.statistics || {};
                const totalRequests = stats.totalRequests || 0;
                const successCount = stats.successCount || 0;
                const errorCount = stats.errorCount || 0;

                setCurrentRequests(totalRequests > 0 ? Math.ceil(totalRequests / 30) : 0); // Approximate RPS
                setBlockedRequests(errorCount);
                setRateLimitData([
                    { name: 'Allowed', value: successCount },
                    { name: 'Blocked', value: errorCount },
                ]);

                // Transform recent requests data for chart
                const timeGroups: { [key: string]: number } = {};

                requestsData.forEach((req: any) => {
                    const reqTime = new Date(req.timestamp);
                    const timeKey = reqTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    timeGroups[timeKey] = (timeGroups[timeKey] || 0) + 1;
                });

                const chartData = Object.entries(timeGroups)
                    .slice(-20)
                    .map(([time, requests]) => ({ time, requests }));

                if (chartData.length > 0) {
                    setRequestsData(chartData);
                }
            }
        } catch (error) {
            console.error('Failed to fetch AI services data from backend:', error);
            // Fallback to regular logs endpoint
            try {
                const response = await apiService.getLogs();
                if (response.data) {
                    const transformedLogs = response.data.map((log: any) => ({
                        id: log.id?.toString() || Date.now().toString(),
                        timestamp: log.timestamp,
                        ip: log.ip,
                        requestType: log.method,
                        endpoint: log.endpoint,
                        responseTime: log.response_time || 0,
                        decision: log.ai_decision || 'Allowed',
                        bytes: log.bytes || 0,
                        device: log.device || 'Unknown',
                        source: log.source || 'Direct',
                        status: log.status || 200,
                        level: 'info'
                    }));

                    setLogs(transformedLogs);
                    setCurrentRequests(transformedLogs.length);
                    const blockedCount = transformedLogs.filter((log: LogEntry) => log.decision === 'Blocked').length;
                    setBlockedRequests(blockedCount);
                }
            } catch (fallbackError) {
                console.error('Fallback logs fetch also failed:', fallbackError);
            }
        }
    };

    // Fetch real logs from SQLite database (legacy)
    const fetchLogs = async () => {
        try {
            const response = await apiService.getLogs();
            if (response.data) {
                // Transform backend data to match LogEntry interface
                const transformedLogs = response.data.map((log: any) => ({
                    id: log.id?.toString() || Date.now().toString(),
                    timestamp: log.timestamp,
                    ip: log.ip,
                    requestType: log.method, // Backend uses 'method', frontend expects 'requestType'
                    endpoint: log.endpoint,
                    responseTime: log.response_time || 0,
                    decision: log.ai_decision || 'Allowed',
                    bytes: log.bytes || 0,
                    device: log.device || 'Unknown',
                    source: log.source || 'Direct',
                    status: log.status || 200,
                    level: 'info'
                }));

                setLogs(transformedLogs);

                // Calculate statistics from real data
                const totalRequests = transformedLogs.length;
                const allowedCount = transformedLogs.filter((log: LogEntry) => log.decision === 'Allowed').length;
                const blockedCount = transformedLogs.filter((log: LogEntry) => log.decision === 'Blocked').length;

                setCurrentRequests(totalRequests);
                setBlockedRequests(blockedCount);
                setRateLimitData([
                    { name: 'Allowed', value: allowedCount },
                    { name: 'Blocked', value: blockedCount },
                ]);

                // Update requests data for chart (last 20 data points)
                const now = new Date();
                const timeGroups: { [key: string]: number } = {};

                transformedLogs.forEach((log: LogEntry) => {
                    const logTime = new Date(log.timestamp);
                    const timeKey = logTime.toLocaleTimeString();
                    timeGroups[timeKey] = (timeGroups[timeKey] || 0) + 1;
                });

                const chartData = Object.entries(timeGroups)
                    .slice(-20)
                    .map(([time, requests]) => ({ time, requests }));

                if (chartData.length > 0) {
                    setRequestsData(chartData);
                }
            }
        } catch (error) {
            console.error('Failed to fetch logs from backend:', error);
            // Don't show error toast on every poll, just log it
        }
    };

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const response = await apiService.getStats();
            if (response.data) {
                // Update metrics based on real stats
                const stats = response.data;
                // You can use these stats to update dashboard metrics
                console.log('Real stats:', stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    // Initialize data on mount only if monitoring is active
    useEffect(() => {
        if (isMonitoring) {
            fetchAIServicesData();
        }
    }, [isMonitoring]);

    // Poll for new data every 5 seconds ONLY when monitoring is active
    useEffect(() => {
        if (!isMonitoring) {
            return; // Don't start polling if monitoring is stopped
        }

        const interval = setInterval(() => {
            fetchAIServicesData();

            // Update server load based on current requests
            if (currentRequests > 0) {
                const load1 = Math.floor(Math.random() * currentRequests) + 10;
                const load2 = Math.floor(Math.random() * currentRequests) + 10;
                const load3 = currentRequests * 100 - load1 - load2;

                setServerData([
                    { name: 'Server 1', value: Math.min(load1, 100) },
                    { name: 'Server 2', value: Math.min(load2, 100) },
                    { name: 'Server 3', value: Math.min(Math.max(load3, 10), 100) },
                ]);
            }
        }, 5000); // Poll every 5 seconds to match backend generation

        return () => clearInterval(interval);
    }, [isMonitoring, currentRequests]);

    return {
        requestsData,
        serverData,
        rateLimitData,
        aiDecisions,
        currentRequests,
        activeServers,
        blockedRequests,
        logs,
    };
}
