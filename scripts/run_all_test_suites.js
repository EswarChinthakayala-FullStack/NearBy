/**
 * Master Enterprise QA & Security Test Execution Engine
 * Executes all 4 test suites locally and validates that zero errors occur:
 * 1. Selenium Web Frontend E2E Suite (320 Test Cases)
 * 2. Appium Mobile Android E2E Suite (320 Test Cases)
 * 3. Baseline Concurrency & Load Testing (100 VUs / 60s / 8,500+ Requests)
 * 4. Application Security, SAST & Vulnerability Assessment (320 Test Cases)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');

const suites = [
  {
    name: '1. Selenium Web Frontend E2E Test Suite',
    cwd: path.join(rootDir, 'selenium-tests'),
    cmd: 'node tests/login-tests.js',
    expectedReport: path.join(rootDir, 'selenium-tests', 'reports', 'Login_E2E_Test_Report.xlsx')
  },
  {
    name: '2. Appium Mobile Android E2E Test Suite',
    cwd: path.join(rootDir, 'appium-tests'),
    cmd: 'node tests/app-e2e-tests.js',
    expectedReport: path.join(rootDir, 'appium-tests', 'reports', 'Appium_Mobile_E2E_Test_Report.xlsx')
  },
  {
    name: '3. Baseline Concurrency & Load Testing Suite',
    cwd: path.join(rootDir, 'load-tests'),
    cmd: 'node run-load-test.js',
    expectedReport: path.join(rootDir, 'load-tests', 'reports', 'Nearby_Baseline_Load_Test_Report.xlsx')
  },
  {
    name: '4. Application Security Assessment & SAST Audit',
    cwd: rootDir,
    cmd: 'node scripts/generate_security_workbooks.js',
    expectedReport: path.join(rootDir, 'Vulnerability Test Results', 'Security_Assessment_Test_Cases.xlsx')
  }
];

console.log('\n\x1b[1m\x1b[36m====================================================================================\x1b[0m');
console.log('\x1b[1m\x1b[32m       NEARBY PLATFORM - MASTER ENTERPRISE QA & SECURITY TEST RUNNER               \x1b[0m');
console.log('\x1b[1m\x1b[36m====================================================================================\x1b[0m\n');

let allPassed = true;
const results = [];

suites.forEach((s, idx) => {
  console.log(`\x1b[1m\x1b[33m▶ [${idx + 1}/4] RUNNING: ${s.name}...\x1b[0m`);
  const startTime = Date.now();

  try {
    const stdout = execSync(s.cmd, {
      cwd: s.cwd,
      stdio: 'pipe',
      encoding: 'utf8',
      env: { ...process.env, HEADLESS: 'true' }
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const reportExists = fs.existsSync(s.expectedReport);
    const reportSize = reportExists ? fs.statSync(s.expectedReport).size : 0;

    if (reportExists && reportSize > 1000) {
      console.log(`\x1b[32m  ✓ SUCCESS: ${s.name} completed with 0 errors in ${elapsed}s\x1b[0m`);
      console.log(`  📄 Verified Report: ${s.expectedReport} (${(reportSize / 1024).toFixed(1)} KB)\n`);
      results.push({ name: s.name, status: 'PASS', time: elapsed, report: s.expectedReport, size: reportSize });
    } else {
      console.log(`\x1b[31m  ✗ FAILED: Report file missing or corrupted at ${s.expectedReport}\x1b[0m\n`);
      allPassed = false;
      results.push({ name: s.name, status: 'FAIL', time: elapsed, report: 'Missing', size: 0 });
    }
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`\x1b[31m  ✗ ERROR in ${s.name}:\x1b[0m\n`, err.stderr || err.stdout || err.message);
    allPassed = false;
    results.push({ name: s.name, status: 'ERROR', time: elapsed, report: 'Error', size: 0 });
  }
});

console.log('\x1b[1m\x1b[36m====================================================================================\x1b[0m');
console.log('\x1b[1m\x1b[32m                        MASTER TEST RUN SUMMARY                             \x1b[0m');
console.log('\x1b[1m\x1b[36m====================================================================================\x1b[0m');

results.forEach(r => {
  const statusColor = r.status === 'PASS' ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
  console.log(`  ${statusColor} \x1b[1m${r.name}\x1b[0m (${r.time}s)`);
});

console.log('\x1b[1m\x1b[36m====================================================================================\x1b[0m');

if (allPassed) {
  console.log('\x1b[1m\x1b[32m✓ ALL 4 ENTERPRISE TEST SUITES PASSED CLEANLY WITH ZERO ERRORS!\x1b[0m');
  console.log('\x1b[1m\x1b[32m✓ ALL EXCEL REPORTS SUCCESSFULLY GENERATED AND READY FOR GITHUB ARTIFACTS.\x1b[0m\n');
  process.exit(0);
} else {
  console.log('\x1b[1m\x1b[31m✗ ONE OR MORE TEST SUITES ENCOUNTERED ERRORS. PLEASE REVIEW LOGS ABOVE.\x1b[0m\n');
  process.exit(1);
}
