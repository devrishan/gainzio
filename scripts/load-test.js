/**
 * Load Testing Script for Critical Endpoints
 * 
 * Usage:
 *   node scripts/load-test.js
 * 
 * This script uses a simple approach. For production load testing,
 * consider using tools like k6, Apache JMeter, or Artillery.
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS || '10');
const REQUESTS_PER_USER = parseInt(process.env.REQUESTS_PER_USER || '100');

const endpoints = [
  { path: '/api/tasks', method: 'GET', name: 'Tasks List' },
  { path: '/api/leaderboards?period=alltime&metric=xp', method: 'GET', name: 'Leaderboards' },
  { path: '/api/products/top-suggestions?limit=10', method: 'GET', name: 'Top Suggestions' },
  { path: '/api/health', method: 'GET', name: 'Health Check' },
];

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          status: res.statusCode,
          duration,
          size: data.length,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runLoadTest() {
  console.log(`Starting load test...`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Concurrent users: ${CONCURRENT_USERS}`);
  console.log(`Requests per user: ${REQUESTS_PER_USER}`);
  console.log(`Total requests: ${CONCURRENT_USERS * REQUESTS_PER_USER * endpoints.length}\n`);

  const results = {
    total: 0,
    success: 0,
    errors: 0,
    durations: [],
    statusCodes: {},
    endpointStats: {},
  };

  const userPromises = [];

  for (let user = 0; user < CONCURRENT_USERS; user++) {
    const userPromise = (async () => {
      for (let req = 0; req < REQUESTS_PER_USER; req++) {
        for (const endpoint of endpoints) {
          try {
            const result = await makeRequest(endpoint.path, endpoint.method);
            results.total++;
            if (result.status >= 200 && result.status < 300) {
              results.success++;
            } else {
              results.errors++;
            }
            results.durations.push(result.duration);
            results.statusCodes[result.status] = (results.statusCodes[result.status] || 0) + 1;
            
            // Track per-endpoint stats
            if (!results.endpointStats[endpoint.name]) {
              results.endpointStats[endpoint.name] = {
                total: 0,
                success: 0,
                errors: 0,
                durations: [],
              };
            }
            results.endpointStats[endpoint.name].total++;
            if (result.status >= 200 && result.status < 300) {
              results.endpointStats[endpoint.name].success++;
            } else {
              results.endpointStats[endpoint.name].errors++;
            }
            results.endpointStats[endpoint.name].durations.push(result.duration);
          } catch (error) {
            results.total++;
            results.errors++;
            if (!results.endpointStats[endpoint.name]) {
              results.endpointStats[endpoint.name] = {
                total: 0,
                success: 0,
                errors: 0,
                durations: [],
              };
            }
            results.endpointStats[endpoint.name].total++;
            results.endpointStats[endpoint.name].errors++;
            console.error(`Error: ${error.message}`);
          }
        }
      }
    })();
    userPromises.push(userPromise);
  }

  const startTime = Date.now();
  await Promise.all(userPromises);
  const totalTime = Date.now() - startTime;

  // Calculate statistics
  const sortedDurations = results.durations.sort((a, b) => a - b);
  const p50 = sortedDurations[Math.floor(sortedDurations.length * 0.5)];
  const p95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)];
  const p99 = sortedDurations[Math.floor(sortedDurations.length * 0.99)];
  const avg = results.durations.reduce((a, b) => a + b, 0) / results.durations.length;
  const min = Math.min(...results.durations);
  const max = Math.max(...results.durations);

  console.log('\n=== Load Test Results ===');
  console.log(`Total requests: ${results.total}`);
  console.log(`Successful: ${results.success}`);
  console.log(`Errors: ${results.errors}`);
  console.log(`Success rate: ${((results.success / results.total) * 100).toFixed(2)}%`);
  console.log(`Total time: ${totalTime}ms`);
  console.log(`Requests per second: ${((results.total / totalTime) * 1000).toFixed(2)}`);
  console.log('\n=== Response Time Statistics ===');
  console.log(`Average: ${avg.toFixed(2)}ms`);
  console.log(`Min: ${min}ms`);
  console.log(`Max: ${max}ms`);
  console.log(`P50: ${p50}ms`);
  console.log(`P95: ${p95}ms`);
  console.log(`P99: ${p99}ms`);
  console.log('\n=== Status Codes ===');
  Object.entries(results.statusCodes).forEach(([code, count]) => {
    console.log(`${code}: ${count}`);
  });

  console.log('\n=== Per-Endpoint Statistics ===');
  Object.entries(results.endpointStats).forEach(([name, stats]) => {
    const sortedDurations = stats.durations.sort((a, b) => a - b);
    const p95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)];
    const avg = stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length;
    console.log(`\n${name}:`);
    console.log(`  Total: ${stats.total}, Success: ${stats.success}, Errors: ${stats.errors}`);
    console.log(`  Avg: ${avg.toFixed(2)}ms, P95: ${p95}ms`);
  });
}

if (require.main === module) {
  runLoadTest().catch(console.error);
}

module.exports = { runLoadTest };

