/**
 * Nearby Mobile Appium E2E Automation Configuration
 * Enterprise capabilities & settings for Android UiAutomator2 driver
 */

module.exports = {
  // Appium Server Connection
  server: {
    hostname: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
    path: '/'
  },

  // Android UiAutomator2 Capabilities
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.PLATFORM_VERSION || '14.0',
    'appium:appPackage': 'com.tourismguide.app',
    'appium:appActivity': '.presentation.MainActivity',
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 300,
    'appium:androidInstallTimeout': 90000,
    'appium:uiautomator2ServerInstallTimeout': 60000,
    'appium:disableWindowAnimation': true,
    'appium:ensureWebviewsHavePages': true
  },

  // Timeouts (milliseconds)
  timeouts: {
    implicitWait: 8000,
    explicitWait: 15000,
    elementTimeout: 10000,
    appLaunchTimeout: 30000
  },

  // Android App Resource IDs (from Nearby Frontend Layouts)
  locators: {
    // Login Fragment
    loginEmail: 'com.tourismguide.app:id/et_login_email',
    loginPassword: 'com.tourismguide.app:id/et_login_password',
    btnTogglePassword: 'com.tourismguide.app:id/btn_toggle_password',
    cbRememberMe: 'com.tourismguide.app:id/cb_remember_me',
    tvForgotPassword: 'com.tourismguide.app:id/tv_forgot_password',
    btnLoginSubmit: 'com.tourismguide.app:id/btn_login_submit',
    tvLinkRegister: 'com.tourismguide.app:id/tv_link_register',
    tvLoginError: 'com.tourismguide.app:id/tv_login_error',

    // Main Bottom Navigation
    navTabHome: 'com.tourismguide.app:id/nav_tab_home',
    navTabExplore: 'com.tourismguide.app:id/nav_tab_explore',
    navTabAiNearby: 'com.tourismguide.app:id/nav_tab_ai_nearby',
    navTabSaved: 'com.tourismguide.app:id/nav_tab_saved',
    navTabProfile: 'com.tourismguide.app:id/nav_tab_profile',

    // Home Header & Content
    layoutHomeHeader: 'com.tourismguide.app:id/layoutHomeHeader',
    tvHomeGreeting: 'com.tourismguide.app:id/tvHomeGreeting',
    tvHomeUserName: 'com.tourismguide.app:id/tvHomeUserName',
    cardHomeUserAvatar: 'com.tourismguide.app:id/cardHomeUserAvatar'
  },

  // Test User Credentials
  credentials: {
    validUser: {
      email: 'alex.rivera@example.com',
      password: 'Password123!',
      name: 'Alex Rivera'
    },
    adminUser: {
      email: 'admin@tourismguide.com',
      password: 'AdminMaster2026!#',
      name: 'Admin Chief'
    },
    invalidUser: {
      email: 'invalid.traveler@example.com',
      password: 'WrongPassword99!'
    }
  },

  // Reporting Settings
  report: {
    outputDir: './reports',
    fileName: 'Appium_Mobile_E2E_Test_Report.xlsx',
    title: 'Nearby Mobile App - Enterprise Appium E2E Test Execution Report'
  }
};
