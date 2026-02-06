// Random Data Generator Service
// Generates random API request data every 5 seconds for testing/demo purposes

const { saveRequest } = require('../config/sqlite');

class RandomDataGenerator {
  constructor(intervalSeconds = 5) {
    this.intervalSeconds = intervalSeconds;
    this.intervalId = null;
    this.isRunning = false;
  }

  // Random API endpoints
  getRandomEndpoint() {
    const endpoints = [
      '/api/v1/tours',
      '/api/v1/users',
      '/api/v1/auth/login',
      '/api/v1/auth/signup',
      '/api/v1/metrics',
      '/api/v1/logs',
      '/api/v1/health',
      '/api/v1/ai-services',
      '/api/v1/load-balance',
      '/api/v1/servers',
      '/api/v1/dashboard'
    ];
    return endpoints[Math.floor(Math.random() * endpoints.length)];
  }

  // Random HTTP methods
  getRandomMethod() {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const weights = [40, 30, 15, 10, 5]; // More GET requests
    const random = Math.random() * 100;
    let sum = 0;

    for (let i = 0; i < methods.length; i++) {
      sum += weights[i];
      if (random < sum) return methods[i];
    }
    return 'GET';
  }

  // Random status codes
  getRandomStatus() {
    const statuses = [200, 201, 204, 301, 400, 401, 403, 404, 500, 502, 503];
    const weights = [50, 10, 5, 5, 10, 5, 5, 5, 3, 1, 1]; // More 200s
    const random = Math.random() * 100;
    let sum = 0;

    for (let i = 0; i < statuses.length; i++) {
      sum += weights[i];
      if (random < sum) return statuses[i];
    }
    return 200;
  }

  // Random IP addresses
  getRandomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(
      Math.random() * 256
    )}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  // Random response time (ms)
  getRandomResponseTime() {
    return Math.floor(Math.random() * 2000) + 50; // 50-2050ms
  }

  // Random device type
  getRandomDevice() {
    const devices = ['Windows', 'MacOS', 'iOS', 'Android', 'Linux'];
    return devices[Math.floor(Math.random() * devices.length)];
  }

  // Random source
  getRandomSource() {
    const sources = [
      'Direct',
      'Google',
      'Facebook',
      'Twitter',
      'LinkedIn',
      'GitHub'
    ];
    return sources[Math.floor(Math.random() * sources.length)];
  }

  // Random bytes
  getRandomBytes() {
    return Math.floor(Math.random() * 50000) + 500; // 500-50500 bytes
  }

  // Random AI decision
  getRandomAIDecision() {
    const decisions = ['Allowed', 'Blocked', 'Redirected', 'Throttled'];
    const weights = [70, 15, 10, 5];
    const random = Math.random() * 100;
    let sum = 0;

    for (let i = 0; i < decisions.length; i++) {
      sum += weights[i];
      if (random < sum) return decisions[i];
    }
    return 'Allowed';
  }

  // Generate a single random request
  generateRandomRequest() {
    const status = this.getRandomStatus();

    return {
      timestamp: new Date().toISOString(),
      ip: this.getRandomIP(),
      method: this.getRandomMethod(),
      endpoint: this.getRandomEndpoint(),
      status: status,
      device: this.getRandomDevice(),
      source: this.getRandomSource(),
      bytes: this.getRandomBytes(),
      ai_decision: this.getRandomAIDecision(),
      response_time: this.getRandomResponseTime(),
      user_agent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      user_email:
        Math.random() > 0.7
          ? `user${Math.floor(Math.random() * 100)}@example.com`
          : null,
      user_id: Math.random() > 0.7 ? Math.floor(Math.random() * 1000) : null
    };
  }

  // Generate and save a random request
  generateAndSaveRequest() {
    try {
      const requestData = this.generateRandomRequest();

      const result = saveRequest(requestData);

      console.log(
        `[DataGen] 📊 ${requestData.method} ${requestData.endpoint} | Status: ${
          requestData.status
        } | Response: ${requestData.response_time}ms`
      );

      return result;
    } catch (error) {
      console.error('[DataGen] Error generating data:', error.message);
    }
  }

  // Start automatic data generation
  start() {
    if (this.isRunning) {
      console.log('[DataGen] Data generator already running');
      return;
    }

    this.isRunning = true;
    console.log(
      `[DataGen] ✅ Starting random data generation (every ${
        this.intervalSeconds
      }s, offset +3s to avoid DB locks)`
    );

    // Start at +3s offset to stagger writes and avoid database locks
    setTimeout(() => {
      this.generateAndSaveRequest();
      this.intervalId = setInterval(() => {
        this.generateAndSaveRequest();
      }, this.intervalSeconds * 1000);
    }, 3000);
  }

  // Stop data generation
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('[DataGen] ⏹️ Data generator stopped');
    }
  }
}

// Export singleton instance
const randomDataGenerator = new RandomDataGenerator(5); // 5 seconds interval

module.exports = randomDataGenerator;
