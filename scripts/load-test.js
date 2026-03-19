const http = require('http');
const { performance } = require('perf_hooks');

// Load testing configuration
const config = {
  targetUrl: 'http://localhost:3000',
  concurrentUsers: 100,
  duration: 60, // seconds
  rampUpTime: 10, // seconds
  endpoints: [
    '/',
    '/research',
    '/analytics',
    '/data-integration',
    '/personalization',
    '/api/health',
    '/api/metrics'
  ]
};

class LoadTester {
  constructor(config) {
    this.config = config;
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: [],
      startTime: null,
      endTime: null
    };
  }

  async runTest() {
    console.log('🚀 Starting load test...');
    console.log(`Target: ${this.config.targetUrl}`);
    console.log(`Concurrent users: ${this.config.concurrentUsers}`);
    console.log(`Duration: ${this.config.duration}s`);
    console.log(`Endpoints: ${this.config.endpoints.join(', ')}`);

    this.results.startTime = Date.now();

    // Start concurrent users
    const promises = [];
    for (let i = 0; i < this.config.concurrentUsers; i++) {
      // Stagger user starts over rampUpTime
      const delay = (i / this.config.concurrentUsers) * this.config.rampUpTime * 1000;
      promises.push(this.startUser(delay));
    }

    await Promise.all(promises);
    
    this.results.endTime = Date.now();
    this.generateReport();
  }

  async startUser(delay) {
    await this.sleep(delay);
    const endTime = Date.now() + (this.config.duration * 1000);
    
    while (Date.now() < endTime) {
      const endpoint = this.config.endpoints[Math.floor(Math.random() * this.config.endpoints.length)];
      await this.makeRequest(endpoint);
      await this.sleep(Math.random() * 1000 + 500); // 0.5-1.5s between requests
    }
  }

  async makeRequest(endpoint) {
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const req = http.get(`${this.config.targetUrl}${endpoint}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          this.results.totalRequests++;
          this.results.responseTimes.push(responseTime);
          
          if (res.statusCode >= 200 && res.statusCode < 400) {
            this.results.successfulRequests++;
          } else {
            this.results.failedRequests++;
            this.results.errors.push({
              endpoint,
              statusCode: res.statusCode,
              error: `HTTP ${res.statusCode}`
            });
          }
          
          resolve();
        });
      });

      req.on('error', (err) => {
        this.results.totalRequests++;
        this.results.failedRequests++;
        this.results.errors.push({
          endpoint,
          error: err.message
        });
        resolve();
      });

      req.setTimeout(10000, () => {
        req.destroy();
        this.results.totalRequests++;
        this.results.failedRequests++;
        this.results.errors.push({
          endpoint,
          error: 'Timeout'
        });
        resolve();
      });
    });
  }

  generateReport() {
    const duration = (this.results.endTime - this.results.startTime) / 1000;
    const avgResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length;
    const maxResponseTime = Math.max(...this.results.responseTimes);
    const minResponseTime = Math.min(...this.results.responseTimes);
    const p95ResponseTime = this.percentile(this.results.responseTimes, 95);
    const requestsPerSecond = this.results.totalRequests / duration;
    const errorRate = (this.results.failedRequests / this.results.totalRequests) * 100;

    console.log('\n📊 Load Test Results');
    console.log('='.repeat(50));
    console.log(`Test Duration: ${duration.toFixed(2)}s`);
    console.log(`Total Requests: ${this.results.totalRequests}`);
    console.log(`Successful Requests: ${this.results.successfulRequests}`);
    console.log(`Failed Requests: ${this.results.failedRequests}`);
    console.log(`Error Rate: ${errorRate.toFixed(2)}%`);
    console.log(`Requests/Second: ${requestsPerSecond.toFixed(2)}`);
    console.log('\n🎯 Response Times');
    console.log('='.repeat(50));
    console.log(`Average: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Min: ${minResponseTime.toFixed(2)}ms`);
    console.log(`Max: ${maxResponseTime.toFixed(2)}ms`);
    console.log(`95th Percentile: ${p95ResponseTime.toFixed(2)}ms`);

    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors');
      console.log('='.repeat(50));
      const errorCounts = {};
      this.results.errors.forEach(error => {
        const key = `${error.error} (${error.endpoint || 'N/A'})`;
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });
      Object.entries(errorCounts).forEach(([error, count]) => {
        console.log(`${error}: ${count} occurrences`);
      });
    }

    // Performance assessment
    console.log('\n✅ Performance Assessment');
    console.log('='.repeat(50));
    if (errorRate < 1 && avgResponseTime < 1000 && requestsPerSecond > 50) {
      console.log('🟢 EXCELLENT - System performs well under load');
    } else if (errorRate < 5 && avgResponseTime < 2000 && requestsPerSecond > 20) {
      console.log('🟡 GOOD - System performs adequately but has room for improvement');
    } else {
      console.log('🔴 NEEDS IMPROVEMENT - System shows performance issues under load');
    }
  }

  percentile(arr, p) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the load test if called directly
if (require.main === module) {
  const tester = new LoadTester(config);
  tester.runTest().catch(console.error);
}

module.exports = LoadTester;