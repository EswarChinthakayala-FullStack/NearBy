/**
 * Endpoint Workload Definitions for Nearby Load Testing
 * Defines target routes, HTTP methods, payloads, and SLA weightings
 */

const config = require('../config');

const endpoints = [
  {
    id: 'EP_HEALTH',
    name: 'Health Check / Ping',
    method: 'GET',
    path: `${config.apiPrefix}/health`,
    weight: 15,
    expectedStatus: 200,
    slaMaxLatencyMs: 80
  },
  {
    id: 'EP_AUTH_LOGIN',
    name: 'User Authentication / Login',
    method: 'POST',
    path: `${config.apiPrefix}/auth/login`,
    body: {
      email: config.credentials.email,
      password: config.credentials.password
    },
    weight: 15,
    expectedStatus: 200,
    slaMaxLatencyMs: 280
  },
  {
    id: 'EP_CATEGORIES',
    name: 'Categories Hierarchy List',
    method: 'GET',
    path: `${config.apiPrefix}/categories/`,
    weight: 15,
    expectedStatus: 200,
    slaMaxLatencyMs: 120
  },
  {
    id: 'EP_PLACES_LIST',
    name: 'Explore Places (Paged)',
    method: 'GET',
    path: `${config.apiPrefix}/places/?page=1&limit=10`,
    weight: 20,
    expectedStatus: 200,
    slaMaxLatencyMs: 220
  },
  {
    id: 'EP_HOME_FEED',
    name: 'Home Dashboard Aggregation',
    method: 'GET',
    path: `${config.apiPrefix}/home/`,
    weight: 15,
    expectedStatus: 200,
    slaMaxLatencyMs: 250
  },
  {
    id: 'EP_NEARBY_RADAR',
    name: 'Nearby Spatial Radar Scan',
    method: 'GET',
    path: `${config.apiPrefix}/explore/?lat=37.7749&lng=-122.4194&radius=5000`,
    weight: 10,
    expectedStatus: 200,
    slaMaxLatencyMs: 290
  },
  {
    id: 'EP_REVIEWS_STREAM',
    name: 'Place Reviews & Ratings Feed',
    method: 'GET',
    path: `${config.apiPrefix}/places/1/reviews`,
    weight: 10,
    expectedStatus: 200,
    slaMaxLatencyMs: 190
  }
];

module.exports = {
  endpoints
};
