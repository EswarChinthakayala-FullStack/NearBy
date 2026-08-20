/**
 * Nearby E2E Test Suite Configuration
 * Enterprise Configuration for Selenium WebDriver & Test Environment
 */

module.exports = {
  // Application Target URLs
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  loginPath: '/login',
  dashboardPath: '/user/dashboard',
  adminPath: '/admin',
  forgotPasswordPath: '/forgot-password',
  registerPath: '/register',

  // Selenium WebDriver Execution Settings
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true' || true,
  implicitWaitMs: 8000,
  pageLoadTimeoutMs: 20000,
  scriptTimeoutMs: 15000,

  // Viewport Profiles
  viewports: {
    desktop: { width: 1920, height: 1080 },
    laptop: { width: 1366, height: 768 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 390, height: 844 }
  },

  // Test Data & Fixtures
  credentials: {
    validUser: {
      email: 'user@nearby.com',
      password: 'Password123!',
      fullName: 'Alex Morgan',
      role: 'user'
    },
    validAdmin: {
      email: 'admin@nearby.com',
      password: 'AdminMaster2026!#',
      fullName: 'Chief Administrator',
      role: 'admin'
    },
    invalidUsers: {
      unregistered: { email: 'unknown.explorer@example.com', password: 'Password123!' },
      wrongPassword: { email: 'user@nearby.com', password: 'WrongSecretPassword99!' },
      emptyPassword: { email: 'user@nearby.com', password: '' },
      emptyEmail: { email: '', password: 'Password123!' },
      malformedEmail: { email: 'user-not-an-email', password: 'Password123!' }
    }
  },

  // Reporting Settings
  report: {
    outputDir: './reports',
    fileName: 'Login_E2E_Test_Report.xlsx',
    title: 'Nearby Web Frontend - Enterprise Selenium E2E Test Execution Report'
  }
};
