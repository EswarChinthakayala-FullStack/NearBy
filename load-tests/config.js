/**
 * Nearby Baseline / Load Testing Configuration
 * Enterprise parameters for 100 concurrent virtual users over 60 seconds
 */

module.exports = {
  // Target API Host
  baseUrl: process.env.BASE_URL || 'http://localhost:8000',
  apiPrefix: '/api/v1',

  // Load Test Workload Parameters
  virtualUsers: parseInt(process.env.USERS, 10) || 100,
  durationSeconds: parseInt(process.env.DURATION, 10) || 60,
  rampUpSeconds: 5,

  // Performance SLA Thresholds
  sla: {
    targetRps: 120,
    maxAverageLatencyMs: 300,
    minLatencyMs: 40,
    maxLatencyMs: 1500,
    p95LatencyMs: 450,
    p99LatencyMs: 700,
    maxErrorRatePercent: 0.0
  },

  // Test User Credentials
  credentials: {
    email: 'user@nearby.com',
    password: 'Password123!'
  },

  // Reporting Settings
  report: {
    outputDir: './reports',
    fileName: 'Nearby_Baseline_Load_Test_Report.xlsx',
    title: 'Nearby API Platform - Baseline & Concurrency Load Test Report'
  }
};
