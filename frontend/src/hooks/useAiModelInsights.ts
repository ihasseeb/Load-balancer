import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export interface AiInsight {
    id: number;
    timestamp: string;
    metrics: {
        cpu: number;
        memory: number;
        requests: number;
    };
    decisions: {
        primary: string;
        secondary: string;
        algorithm: string;
        confidence: number;
    };
    security: {
        isAnomaly: boolean;
        threatLevel: string;
    };
    forecast: {
        predictedLoad: number;
        action: string;
    };
}

export function useAiModelInsights() {
    const [aiInsights, setAiInsights] = useState<AiInsight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = async () => {
        try {
            const data = await apiService.getAIServices();
            if (data && data.aiInsights) {
                setAiInsights(data.aiInsights);
            }
            setIsLoading(false);
        } catch (err: any) {
            console.error('Error fetching AI insights:', err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
        const interval = setInterval(fetchInsights, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return {
        aiInsights,
        isLoading,
        error,
        refresh: fetchInsights
    };
}
