import { useState, useEffect } from 'react';

export type ModelType = 'supervised' | 'reinforcement';

export interface ModelMetric {
    timestamp: string;
    accuracy?: number;
    precision?: number;
    reward?: number;
    efficiency?: number;
}

export function useMockModelInsights(modelType: ModelType) {
    const [metricsData, setMetricsData] = useState<ModelMetric[]>([]);
    const [lastRetrain, setLastRetrain] = useState(new Date());
    const [nextRetrainIn, setNextRetrainIn] = useState(3600);
    const [trainingProgress, setTrainingProgress] = useState(0);
    const [isTraining, setIsTraining] = useState(false);

    useEffect(() => {
        // Generate initial metrics
        const now = new Date();
        const initialData = Array.from({ length: 20 }, (_, i) => {
            const base = modelType === 'supervised'
                ? {
                    timestamp: new Date(now.getTime() - (19 - i) * 300000).toLocaleTimeString(),
                    accuracy: 0.85 + Math.random() * 0.1,
                    precision: 0.8 + Math.random() * 0.15,
                }
                : {
                    timestamp: new Date(now.getTime() - (19 - i) * 300000).toLocaleTimeString(),
                    reward: 0.7 + Math.random() * 0.25,
                    efficiency: 0.75 + Math.random() * 0.2,
                };
            return base;
        });
        setMetricsData(initialData);

        // Update metrics periodically
        const interval = setInterval(() => {
            const newTime = new Date().toLocaleTimeString();
            const newMetric = modelType === 'supervised'
                ? {
                    timestamp: newTime,
                    accuracy: 0.85 + Math.random() * 0.1,
                    precision: 0.8 + Math.random() * 0.15,
                }
                : {
                    timestamp: newTime,
                    reward: 0.7 + Math.random() * 0.25,
                    efficiency: 0.75 + Math.random() * 0.2,
                };

            setMetricsData((prev) => [...prev.slice(1), newMetric]);
        }, 5000);

        // Countdown timer for next retrain
        const timerInterval = setInterval(() => {
            setNextRetrainIn((prev) => {
                if (prev <= 0) {
                    setIsTraining(true);
                    return 3600;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timerInterval);
        };
    }, [modelType]);

    useEffect(() => {
        if (isTraining) {
            const progressInterval = setInterval(() => {
                setTrainingProgress((prev) => {
                    if (prev >= 100) {
                        setIsTraining(false);
                        setLastRetrain(new Date());
                        return 0;
                    }
                    return prev + 2;
                });
            }, 100);

            return () => clearInterval(progressInterval);
        }
    }, [isTraining]);

    return {
        metricsData,
        lastRetrain,
        nextRetrainIn,
        trainingProgress,
        isTraining,
    };
}
