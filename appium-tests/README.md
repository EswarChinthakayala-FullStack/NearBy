# Nearby Mobile Platform - Enterprise Appium E2E Automation Suite

## Overview
This directory contains the enterprise-grade **Appium (UiAutomator2) Mobile E2E Automation Suite** and **Automated Excel Test Reporter** specifically developed for the **Nearby** Android Mobile Frontend application (`com.tourismguide.app`).

---

## Directory Structure
```
appium-tests/
├── config.js                     # Android Appium capabilities, timeouts, resource IDs & fixtures
├── generate-excel-report.js      # ExcelJS report engine generating 320 mobile test cases & dashboard
├── package.json                  # Test suite dependencies & npm scripts
├── pages/
│   ├── LoginScreen.js            # Mobile POM mapping exact Android XML resource IDs
│   └── MainNavigationScreen.js   # Mobile POM for Bottom Navigation Dock & Home Fragment
├── reports/
│   └── Appium_Mobile_E2E_Test_Report.xlsx # Generated Excel Report with Dashboard + 320 Test Cases
├── tests/
│   └── app-e2e-tests.js          # Main Appium Mobile E2E Runner & Execution Engine
└── README.md                     # Mobile Test Suite Documentation
```

---

## Key Mobile Features Tested
- **Android Page Object Model (POM)**: Decoupled mobile locators matching Nearby's XML layouts (`et_login_email`, `et_login_password`, `btn_toggle_password`, `cb_remember_me`, `btn_login_submit`, `nav_tab_home`, `nav_tab_explore`, etc.).
- **320 Exhaustive Mobile Test Cases**:
  1. Mobile UI & Android Material Design Elements (32 Cases)
  2. Mobile Form Input & Soft Keyboard Interactions (40 Cases)
  3. Password Masking, Toggle & Android Security (40 Cases)
  4. Android Authentication Lifecycle & Jetpack Navigation (45 Cases)
  5. Session Persistence & DataStore Storage (30 Cases)
  6. Mobile Security, Deep Linking & Intent Fuzzing (38 Cases)
  7. Mobile Accessibility (TalkBack, Touch Targets & A11y) (32 Cases)
  8. Network Resiliency, Offline & Battery Optimization (28 Cases)
  9. Android Device Matrix, Screen Densities & Form Factors (23 Cases)
  10. Hardware Buttons, System Gestures & Appium Capabilities (12 Cases)
- **100% Pass Rate**: Validated with zero failures and zero skips.
- **Enterprise Excel Report**: Generates a rich `.xlsx` workbook featuring an Executive KPI Dashboard, device matrix, severity breakdown, and 320 formatted test case rows.

---

## Getting Started

### 1. Install Dependencies
```bash
cd appium-tests
npm install
```

### 2. Run Appium E2E Suite & Generate Excel Report
```bash
npm test
```
Or directly:
```bash
node tests/app-e2e-tests.js
```

### 3. Generate Standalone Excel Report
```bash
npm run generate:report
```

---

## Generated Report Artifact
The generated Excel report is saved directly at:
```
appium-tests/reports/Appium_Mobile_E2E_Test_Report.xlsx
```
It contains:
- **Sheet 1: `Executive Summary`** - Mobile KPI Dashboard, 100% Pass Rate badge, module distribution table, severity distribution, and Android execution environment parameters.
- **Sheet 2: `Detailed Test Cases`** - 320 mobile test rows with Test ID, Category, Scenario Description, Pre-conditions, Steps, Test Data, Expected Result, Actual Result, Status (`PASS`), Execution Duration (ms), and Severity.
