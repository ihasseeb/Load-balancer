import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Activity, Shield, TrendingUp, TrendingDown } from 'lucide-react';

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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const generateRandomIP = () => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const requestTypes = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const endpoints = ['/api/v1/tours', '/api/v1/users', '/api/v1/bookings', '/api/v1/reviews', '/api/v1/auth'];
const decisions: Array<'Allowed' | 'Blocked' | 'Redirected'> = ['Allowed', 'Allowed', 'Allowed', 'Allowed', 'Blocked', 'Redirected'];
const devices = ['Android', 'iOS', 'Windows', 'MacOS', 'Linux', 'Unknown'];
const sources = ['Direct', 'Google', 'Facebook', 'Twitter', 'Referral'];

const generateLog = (): LogEntry => {
    const decision = decisions[Math.floor(Math.random() * decisions.length)];
    const status = decision === 'Allowed' ? 200 : (decision === 'Redirected' ? 302 : 403);

    return {
        id: Date.now().toString() + Math.random(),
        timestamp: new Date().toISOString(),
        ip: generateRandomIP(),
        requestType: requestTypes[Math.floor(Math.random() * requestTypes.length)],
        endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
        responseTime: Math.floor(Math.random() * 500) + 50,
        decision: decision,
        bytes: Math.floor(Math.random() * 50000) + 500,
        device: devices[Math.floor(Math.random() * devices.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        status: status,
        level: 'info'
    };
};

export function useMockMonitoring(isMonitoring: boolean, settings: Settings) {
    const [requestsData, setRequestsData] = useState<RequestData[]>([]);
    const [serverData, setServerData] = useState<ServerData[]>([
        { name: 'Server 1', value: 40 },
        { name: 'Server 2', value: 30 },
        { name: 'Server 3', value: 30 },
    ]);
    const [rateLimitData, setRateLimitData] = useState<RateLimitData[]>([
        { name: 'Allowed', value: 850 },
        { name: 'Blocked', value: 150 },
    ]);
    const [aiDecisions, setAiDecisions] = useState<AIDecision[]>([
        {
            id: '1',
            timestamp: new Date().toLocaleTimeString(),
            action: 'Scale Up',
            reason: 'High CPU usage detected',
            status: 'Success',
        },
    ]);
    const [currentRequests, setCurrentRequests] = useState(450);
    const [activeServers, setActiveServers] = useState(3);
    const [blockedRequests, setBlockedRequests] = useState(150);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        // Initialize data
        const now = new Date();
        const initialRequests = Array.from({ length: 20 }, (_, i) => ({
            time: new Date(now.getTime() - (19 - i) * 2000).toLocaleTimeString(),
            requests: Math.floor(Math.random() * 200) + 300,
        }));
        setRequestsData(initialRequests);

        const initialLogs = Array.from({ length: 20 }, () => generateLog());
        setLogs(initialLogs);
    }, []);

    useEffect(() => {
        if (!isMonitoring) return;

        const interval = setInterval(() => {
            const newTime = new Date().toLocaleTimeString();
            const newRequests = Math.floor(Math.random() * 300) + 200;

            setRequestsData((prev) => [...prev.slice(1), { time: newTime, requests: newRequests }]);
            setCurrentRequests(newRequests);

            // Random AI decisions
            if (Math.random() > 0.7) {
                const actions = [
                    { action: 'Scale Up', reason: 'High traffic detected', icon: TrendingUp },
                    { action: 'Scale Down', reason: 'Low traffic, optimizing costs', icon: TrendingDown },
                    { action: 'Throttle IP', reason: `Suspicious activity from ${generateRandomIP()}`, icon: Shield },
                    { action: 'Load Balance', reason: 'Redistributing load', icon: Activity },
                ];

                const decision = actions[Math.floor(Math.random() * actions.length)];
                const newDecision: AIDecision = {
                    id: Date.now().toString(),
                    timestamp: new Date().toLocaleTimeString(),
                    action: decision.action,
                    reason: decision.reason,
                    status: Math.random() > 0.1 ? 'Success' : 'Failed',
                };

                setAiDecisions((prev) => [newDecision, ...prev.slice(0, 9)]);

                if (newDecision.status === 'Success') {
                    toast.success(`AI Decision: ${decision.action}`, {
                        description: decision.reason,
                    });
                }

                // Update servers based on scaling
                if (decision.action === 'Scale Up' && activeServers < settings.maxServers) {
                    setActiveServers((prev) => prev + 1);
                    setServerData((prev) => [...prev, { name: `Server ${prev.length + 1}`, value: 20 }]);
                } else if (decision.action === 'Scale Down' && activeServers > settings.minServers) {
                    setActiveServers((prev) => prev - 1);
                    setServerData((prev) => prev.slice(0, -1));
                }
            }

            // Update rate limit data
            const allowed = Math.floor(Math.random() * 200) + 700;
            const blocked = 1000 - allowed;
            setRateLimitData([
                { name: 'Allowed', value: allowed },
                { name: 'Blocked', value: blocked },
            ]);
            setBlockedRequests(blocked);

            // Add new log
            setLogs((prev) => [generateLog(), ...prev.slice(0, 99)]);

            // Redistribute server loads
            if (Math.random() > 0.6) {
                setServerData((prev) =>
                    prev.map((server) => ({
                        ...server,
                        value: Math.floor(Math.random() * 40) + 20,
                    }))
                );
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [isMonitoring, activeServers, settings]);

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
