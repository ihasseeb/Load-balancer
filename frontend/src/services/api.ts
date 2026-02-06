// API Service for Backend Integration
// Use direct backend URL instead of proxy to avoid POST body issues
const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface HealthData {
  status: string;
  message?: string;
  uptime: number;
  memory: any;
  timestamp: string;
}

export interface MetricsData {
  requests: {
    total: number;
    success: number;
    failed: number;
  };
  responseTime: {
    average: number;
    min: number;
    max: number;
  };
  activeConnections: number;
  timestamp: string;
}

export interface Service {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  description: string;
  icon: string;
  status: 'running' | 'stopped' | 'timeout';
  responseTime: number | null;
  uptime: string;
  lastChecked: string;
}

export interface ServicesStatusData {
  status: string;
  summary: {
    total: number;
    running: number;
    stopped: number;
    timeout: number;
  };
  services: Service[];
  prometheus?: any;
  timestamp: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Health check
  async getHealth(): Promise<HealthData> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) throw new Error('Failed to fetch health data');
    return response.json();
  }

  // Get metrics
  async getMetrics(): Promise<MetricsData> {
    const response = await fetch(`${this.baseUrl}/metrics`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  }

  // Get detailed metrics
  async getDetailedMetrics(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/metrics/detailed`);
    if (!response.ok) throw new Error('Failed to fetch detailed metrics');
    return response.json();
  }

  // Get all services status
  async getServicesStatus(): Promise<ServicesStatusData> {
    const response = await fetch(`${this.baseUrl}/services/status`);
    if (!response.ok) throw new Error('Failed to fetch services status');
    return response.json();
  }

  // Get individual service status
  async getServiceStatus(serviceId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/services/${serviceId}`);
    if (!response.ok) throw new Error('Failed to fetch service status');
    return response.json();
  }

  // Get server status (legacy)
  async getServerStatus(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/servers/status`);
    if (!response.ok) throw new Error('Failed to fetch server status');
    return response.json();
  }
  // Start/Stop Service
  async performServiceAction(serviceId: string, action: string): Promise<any> {
    try {
      console.log('🔧 Performing action:', { serviceId, action });

      const requestBody = { action };
      console.log('📤 Request body:', requestBody);

      const response = await fetch(
        `${API_BASE_URL}/services/${serviceId}/action`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || 'Action failed');
      }

      const result = await response.json();
      console.log('✅ Success response:', result);
      return result;
    } catch (error) {
      console.error(`Error performing ${action} on ${serviceId}:`, error);
      throw error;
    }
  }

  // Get Logs from Backend
  async getLogs(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/logs`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }

  // Get AI Services Data (with logs and requests)
  async getAIServices(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-services`);
      if (!response.ok) {
        throw new Error('Failed to fetch AI services data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching AI services:', error);
      throw error;
    }
  }

  // Get System Metrics (CPU, Memory, Disk, RPS, Error Rate)
  async getSystemMetrics(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics/system`);
      if (!response.ok) {
        throw new Error('Failed to fetch system metrics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw error;
    }
  }

  // Get Statistics from Backend
  async getStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/logs/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
