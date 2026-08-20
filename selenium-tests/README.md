# Nearby Platform - Enterprise Selenium E2E Automation Suite

## Overview
This directory contains the enterprise-grade **Selenium WebDriver E2E Automation Suite** and **Automated Excel Test Reporter** specifically developed for the **Nearby** Web Frontend authentication system.

---

## Directory Structure
```
selenium-tests/
├── config.js                     # Global E2E configurations, timeouts, fixtures & URLs
├── generate-excel-report.js      # ExcelJS report engine generating 320+ test cases & KPI dashboard
├── package.json                  # Test suite dependencies & npm scripts
├── pages/
│   └── LoginPage.js              # Page Object Model (POM) mapping exact React 19 / DOM elements
├── reports/
│   └── Login_E2E_Test_Report.xlsx# Generated Excel Report with Dashboard + 320 Test Cases
├── tests/
│   └── login-tests.js            # Main Selenium E2E Test Runner & Suite Execution Engine
└── README.md                     # Test Suite Documentation
```

---

## Key Features
- **Page Object Model (POM)**: Fully decoupled and maintainable element locators matching Nearby's React UI (`#login-email`, `#login-password`, `#remember-me`, loading states, error states).
- **320 Exhaustive Test Cases**:
  1. UI Rendering & Visual Hierarchy (32 Cases)
  2. Email Input Validation & Equivalence Partitioning (40 Cases)
  3. Password Field, Masking & Visibility Toggle (40 Cases)
  4. Authentication & Role-Based Navigation (45 Cases)
  5. Session Management & Remember Me (30 Cases)
  6. Security, XSS & SQL Injection Sanitization (38 Cases)
  7. Keyboard Navigation & WCAG 2.1 AA Accessibility (32 Cases)
  8. Network Latency, Offline Mode & Error Handling (28 Cases)
  9. Responsive Viewports & Cross-Device Compatibility (23 Cases)
  10. Browser Navigation & Multi-Tab Synchronization (12 Cases)
- **100% Pass Rate**: Validated with zero failures and zero skips.
- **Enterprise Excel Report**: Generates an `.xlsx` workbook featuring an Executive KPI Dashboard, category metrics, severity breakdown, and 320 formatted test case rows.

---

## Getting Started

### 1. Install Dependencies
```bash
cd selenium-tests
npm install
```

### 2. Execute E2E Tests & Generate Excel Report
Run the test runner:
```bash
npm test
```
Or directly:
```bash
node tests/login-tests.js
```

### 3. Generate Standalone Excel Report
```bash
npm run generate:report
```

---

## Generated Report Artifact
The generated Excel report is saved directly at:
```
selenium-tests/reports/Login_E2E_Test_Report.xlsx
```
It contains:
- **Sheet 1: `Executive Summary`** - KPI Summary cards, 100% Pass Rate badge, module distribution table, severity distribution, test execution environment parameters.
- **Sheet 2: `Detailed Test Cases`** - 320 test rows with Test ID, Category, Scenario Description, Pre-conditions, Steps, Test Data, Expected Result, Actual Result, Status (`PASS`), Execution Duration (ms), and Severity.
