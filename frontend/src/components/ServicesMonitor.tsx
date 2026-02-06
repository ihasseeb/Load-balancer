import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService, Service, ServicesStatusData } from '../services/api';
import './ServicesMonitor.css';

export default function ServicesMonitor() {
  const [servicesData, setServicesData] = useState<ServicesStatusData | null>(
    null
  );
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchServicesStatus = async () => {
    try {
      console.log('🔄 Fetching services status...');

      // Use relative API path with Vite proxy
      const apiUrl = '/api/v1/services/status';
      console.log('📍 Requesting:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ServicesStatusData = await response.json();
      console.log('✅ Services data received:', data);

      setServicesData(data);
      setServices(data.services || []);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to fetch services status';
      console.error('❌ Error fetching services:', errorMsg);
      setError(errorMsg);

      // Show toast only once per session
      if (!sessionStorage.getItem('servicesFetchErrorShown')) {
        toast.error('Failed to fetch services: ' + errorMsg);
        sessionStorage.setItem('servicesFetchErrorShown', 'true');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchServicesStatus();

    // Auto-refresh every 5 seconds for real-time monitoring
    if (autoRefresh) {
      const interval = setInterval(fetchServicesStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleServiceAction = async (serviceId: string, action: string) => {
    try {
      toast.message(
        `${action === 'start' ? 'Starting' : 'Stopping'} ${serviceId}...`,
        {
          description: 'Please wait while we communicate with the backend.'
        }
      );

      await apiService.performServiceAction(serviceId, action);

      // Refresh quickly a few times to catch status change
      setTimeout(fetchServicesStatus, 1000);
      setTimeout(fetchServicesStatus, 3000);
      setTimeout(fetchServicesStatus, 5000); // Final check

      toast.success(`Command sent: ${action} ${serviceId}`);
    } catch (err) {
      console.error('Action failed:', err);
      toast.error(
        `Classic Error: ${err.message || 'Failed to perform action'}`
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'status-running';
      case 'stopped':
        return 'status-stopped';
      case 'timeout':
        return 'status-timeout';
      default:
        return 'status-unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return '✅';
      case 'stopped':
        return '❌';
      case 'timeout':
        return '⏱️';
      default:
        return '❓';
    }
  };

  const getServiceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      application: 'type-application',
      monitoring: 'type-monitoring',
      logging: 'type-logging',
      visualization: 'type-visualization',
      cache: 'type-cache',
      proxy: 'type-proxy',
      api: 'type-api'
    };
    return colors[type] || 'type-default';
  };

  if (loading) {
    return (
      <div className="services-monitor">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading services status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-monitor">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchServicesStatus} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="services-monitor">
      <div className="monitor-header">
        <div className="header-content">
          <h1>🔍 Services Monitor</h1>
          <p className="subtitle">Real-time monitoring of all services</p>
        </div>
        <div className="last-update">
          <span className="update-indicator">🔄</span>
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary Cards */}
      {servicesData && (
        <div className="summary-grid">
          <div className="summary-card total">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>{servicesData.summary.total}</h3>
              <p>Total Services</p>
            </div>
          </div>

          <div className="summary-card running">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h3>{servicesData.summary.running}</h3>
              <p>Running</p>
            </div>
          </div>

          <div className="summary-card stopped">
            <div className="card-icon">❌</div>
            <div className="card-content">
              <h3>{servicesData.summary.stopped}</h3>
              <p>Stopped</p>
            </div>
          </div>

          <div className="summary-card timeout">
            <div className="card-icon">⏱️</div>
            <div className="card-content">
              <h3>{servicesData.summary.timeout}</h3>
              <p>Timeout</p>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {services && services.length > 0 ? (
        <div className="services-grid">
          {services.map((service: Service) => (
            <div
              key={service.id}
              className={`service-card ${getStatusColor(service.status)}`}
            >
              <div className="service-header">
                <div className="service-icon">{service.icon}</div>
                <div className="service-title">
                  <h3>{service.name}</h3>
                  <span
                    className={`service-type ${getServiceTypeColor(
                      service.type
                    )}`}
                  >
                    {service.type}
                  </span>
                </div>
                <div
                  className={`status-badge ${getStatusColor(service.status)}`}
                >
                  <span className="status-icon">
                    {getStatusIcon(service.status)}
                  </span>
                  <span className="status-text">{service.status}</span>
                </div>
              </div>

              <p className="service-description">{service.description}</p>

              <div className="service-details">
                <div className="detail-row">
                  <span className="detail-label">Endpoint:</span>
                  <span className="detail-value">
                    {service.host}:{service.port}
                  </span>
                </div>

                {service.responseTime !== null && (
                  <div className="detail-row">
                    <span className="detail-label">Response Time:</span>
                    <span className="detail-value response-time">
                      {service.responseTime}ms
                    </span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="detail-label">Uptime:</span>
                  <span className="detail-value">{service.uptime}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Last Checked:</span>
                  <span className="detail-value">
                    {new Date(service.lastChecked).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="service-actions">
                <button
                  className="action-button view"
                  onClick={() =>
                    window.open(
                      `http://${service.host}:${service.port}`,
                      '_blank'
                    )
                  }
                  disabled={service.status !== 'running'}
                  title="Open Service"
                >
                  🔗
                </button>

                {service.status === 'running' ? (
                  <button
                    className="action-button stop"
                    onClick={() => handleServiceAction(service.id, 'stop')}
                    title="Stop Service"
                    style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                  >
                    🛑 Stop
                  </button>
                ) : (
                  <button
                    className="action-button start"
                    onClick={() => handleServiceAction(service.id, 'start')}
                    title="Start Service"
                    style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}
                  >
                    ▶️ Start
                  </button>
                )}

                <button
                  className="action-button refresh"
                  onClick={fetchServicesStatus}
                  title="Refresh Status"
                >
                  🔄
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="error-container">
          <p>No services data available</p>
          <button onClick={fetchServicesStatus} className="retry-button">
            Load Services
          </button>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="auto-refresh-indicator">
        <div className="pulse-dot" />
        <span>Auto-refreshing every 5 seconds</span>
      </div>
    </div>
  );
}
