import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMockMonitoring } from './useMockMonitoring';

const mockSettings = {
    maxRequestsPerSecond: 1000,
    minServers: 1,
    maxServers: 5,
    rateLimit: 100,
    cooldownPeriod: 60,
    learningRate: 0.01,
    decisionInterval: 5,
};

describe('useMockMonitoring', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('should initialize with default data', () => {
        const { result } = renderHook(() => useMockMonitoring(false, mockSettings));

        expect(result.current.requestsData).toHaveLength(20);
        expect(result.current.activeServers).toBe(3);
        expect(result.current.serverData).toHaveLength(3);
    });

    it('should update data when monitoring is active', () => {
        const { result } = renderHook(() => useMockMonitoring(true, mockSettings));

        const initialRequests = result.current.currentRequests;

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(result.current.currentRequests).not.toBe(initialRequests);
    });

    it('should not update data when monitoring is inactive', () => {
        const { result } = renderHook(() => useMockMonitoring(false, mockSettings));

        const initialRequests = result.current.currentRequests;

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(result.current.currentRequests).toBe(initialRequests);
    });
});
