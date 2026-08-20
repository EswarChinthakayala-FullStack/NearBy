# 🗺️ Nearby — Enterprise AI Travel Guidance & Location Intelligence Platform

An enterprise-grade, full-stack travel guidance and real-time spatial discovery platform featuring an **AI-powered Backend (FastAPI)**, a modern **Web Portal (React 19 & TailwindCSS v4)**, a native **Android Mobile Application (Kotlin & Jetpack)**, and an exhaustive **Automated QA & Security Assessment Suite**.

---

## 🏛️ System Architecture Overview

```
Nearby Platform Ecosystem
│
├── 🧠 Backend API          (Python 3.11+, FastAPI, SQLAlchemy Async, MySQL 8, Redis, Celery, Mistral AI)
├── 🌐 Web Frontend         (React 19, TypeScript, Vite, TailwindCSS v4, Framer Motion, Zustand, TanStack Query)
├── 📱 Android Mobile App   (Kotlin, MVVM, Jetpack Navigation, Hilt DI, Retrofit, Room DB, UiAutomator2)
├── 🧪 Selenium E2E Suite   (Selenium WebDriver 4.x, Page Object Model, 320 Test Cases, ExcelJS Reporter)
├── 📲 Appium Mobile E2E    (Appium UiAutomator2, WebdriverIO, 320 Mobile Test Cases, ExcelJS Reporter)
├── ⚡ Load Testing Engine  (100 Concurrent Virtual Users, 60s Continuous Run, ~142 RPS Throughput)
└── 🛡️ Security & SAST      (Static Analysis, API Inventory, CVE Audits, 320 Security Cases, CI/CD Pipeline)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v20.0.0` or higher (`v24.x` recommended) & `npm >= 10.0.0`
- **Python**: `3.11+` & `pip`
- **MySQL Server**: `8.0+`
- **Redis Server**: `7.x+` (for caching and background Celery tasks)
- **Java JDK**: `17+` & **Android Studio** (for Android app development)

---

## 1. 🧠 Backend Setup & Execution (`backend/`)

The backend is built with **FastAPI**, **SQLAlchemy (Async)**, and **MySQL 8**.

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Create & Activate Virtual Environment
```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables (`.env`)
Create or update `.env` in the `backend/` folder:
```ini
PROJECT_NAME="Nearby Tourist Guide API"
ENVIRONMENT="development"
DEBUG=True
API_V1_STR="/api/v1"

# MySQL 8 Database
MYSQL_SERVER="127.0.0.1"
MYSQL_PORT=3306
MYSQL_USER="root"
MYSQL_PASSWORD=""
MYSQL_DB="nearby_db"

# Security & Secrets
SECRET_KEY="your_super_secret_jwt_key_at_least_32_characters_long"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Initial Administrator Seed
FIRST_ADMIN_EMAIL="admin@nearbyapp.com"
FIRST_ADMIN_PASSWORD="Admin@Nearby2026!Secure"
FIRST_ADMIN_NAME="System Administrator"

# Redis & Celery Broker
REDIS_URL="redis://127.0.0.1:6379/0"
CELERY_BROKER_URL="redis://127.0.0.1:6379/1"
CELERY_RESULT_BACKEND="redis://127.0.0.1:6379/2"

# AI Integration
MISTRAL_API_KEY="your_mistral_api_key"
MISTRAL_MODEL="mistral-large-latest"
```

### Step 5: Start the Backend Server
```bash
# Option A: Using the startup launcher
python start.py

# Option B: Direct Uvicorn server with hot-reload
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- 🌐 **API Base URL**: `http://localhost:8000/api/v1`
- 📚 **Interactive Swagger API Docs**: `http://localhost:8000/docs`
- 📖 **ReDoc Documentation**: `http://localhost:8000/redoc`

### Step 6: Start Celery Background Task Worker (Optional)
```bash
celery -A celery_worker.celery_app worker --loglevel=info
```

---

## 2. 🌐 Web Frontend Setup & Execution (`web/`)

The web frontend is built using **React 19**, **TypeScript**, **Vite**, and **TailwindCSS v4**.

### Step 1: Navigate to Web Directory
```bash
cd web
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure Environment (`.env`)
Ensure `web/.env` points to the backend API:
```ini
VITE_API_BASE_URL="http://localhost:8000/api/v1"
```

### Step 4: Start the Vite Development Server
```bash
npm run dev
```

- 🌐 **Web App URL**: `http://localhost:5173`
- 🔐 **Login Page**: `http://localhost:5173/login`
- 🧭 **Explore Places**: `http://localhost:5173/places`
- 🛡️ **Admin Portal**: `http://localhost:5173/admin`

### Build for Production:
```bash
npm run build
npm run preview
```

---

## 3. 📱 Android Mobile App Setup (`frontend/`)

The native mobile app is built with **Kotlin**, **Android Jetpack**, **Hilt DI**, and **Retrofit**.

### Option A: Open in Android Studio
1. Launch **Android Studio**.
2. Select **Open an Existing Project** and navigate to `e:\Nearby\frontend`.
3. Allow Gradle to sync dependencies.
4. Select a connected physical Android device or launch an **Android Emulator** (API 30 - 35).
5. Click **Run (`Shift + F10`)**.

### Option B: Build via Gradle CLI
```bash
cd frontend

# Build Debug APK
./gradlew assembleDebug

# Output APK path:
# frontend/app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. 🧪 Automated Testing & QA Suites

The platform includes four specialized automated testing suites.

### 🏃‍♂️ Master Test Runner (Run All Suites at Once)
To execute all 4 test suites sequentially and verify reports:
```bash
node scripts/run_all_test_suites.js
```

---

### A. 🌐 Selenium Web E2E Suite (`selenium-tests/`)
Automated end-to-end testing for Web Frontend authentication, form validations, session persistence, and UI rendering (320 Test Cases).
```bash
cd selenium-tests
npm install
npm test
```
- 📄 **Generated Report**: `selenium-tests/reports/Login_E2E_Test_Report.xlsx`

---

### B. 📱 Appium Mobile Android E2E Suite (`appium-tests/`)
Mobile UIAutomator2 E2E testing for Android layouts, soft keyboard interactions, password masking, navigation, and gestures (320 Test Cases).
```bash
cd appium-tests
npm install
npm test
```
- 📄 **Generated Report**: `appium-tests/reports/Appium_Mobile_E2E_Test_Report.xlsx`

---

### C. ⚡ Baseline Concurrency & Load Testing (`load-tests/`)
High-performance asynchronous load testing simulating **100 concurrent virtual users continuously for 1 minute (60 seconds)** across API routes (~142 RPS, 8,500+ requests).
```bash
cd load-tests
npm install
npm test
```
- 📄 **Generated Report**: `load-tests/reports/Nearby_Baseline_Load_Test_Report.xlsx`

---

### D. 🛡️ Security Assessment & SAST Audit (`Vulnerability Test Results/`)
Comprehensive static code security review, API route inventory (62 endpoints), and dependency vulnerability analysis.
```bash
# Generate all Security Excel Workbooks:
node scripts/generate_security_workbooks.js
```
- 📄 **Generated Reports**:
  - `Vulnerability Test Results/Security_Assessment_Test_Cases.xlsx` (320 Security Test Cases)
  - `Vulnerability Test Results/endpoint-inventory.xlsx` (62 API Endpoints Inventory)
  - `Vulnerability Test Results/findings.xlsx` (12 Security Findings)
  - `Vulnerability Test Results/security-review.md` (Detailed SAST Technical Audit)
  - `Vulnerability Test Results/executive-summary.md` (Security Score: 64/100)

---

## ⚙️ GitHub Actions CI/CD Pipeline

The project includes an enterprise multi-stage CI/CD workflow:
👉 [`.github/workflows/enterprise-qa-and-security.yml`](file:///e:/Nearby/.github/workflows/enterprise-qa-and-security.yml)

### Pipeline Features:
1. **Parallel Test Execution**: Runs Selenium E2E, Appium E2E, Load Testing, and Security Audits in parallel jobs.
2. **Artifact Packaging**: Consolidates all generated `.xlsx` test reports into a single downloadable ZIP bundle (`Nearby-Master-QA-Security-Excel-Reports-Bundle.zip`).
3. **Step Summaries**: Publishes executive test pass rate matrices and latency graphs directly to the GitHub Actions workflow summary.

---

## 📁 Repository Directory Structure

```
Nearby/
├── .github/workflows/                 # CI/CD Workflows (enterprise-qa-and-security.yml)
├── backend/                           # FastAPI Python Backend API
│   ├── app/
│   │   ├── api/                       # API v1 Router & Endpoints (Places, Auth, Reviews, AI)
│   │   ├── core/                      # Config, Security, Database, Middleware
│   │   ├── crud/                      # Database CRUD operations
│   │   ├── models/                    # SQLAlchemy ORM Models
│   │   └── schemas/                   # Pydantic v2 Request/Response Models
│   ├── requirements.txt               # Backend Python Dependencies
│   └── start.py                       # Server Startup Launcher
├── web/                               # React 19 / TypeScript Web Frontend
│   ├── src/
│   │   ├── components/                # UI Components, Auth Forms, Places Lists
│   │   ├── hooks/                     # Custom React Hooks & Auth Stores
│   │   ├── pages/                     # Application Routes (Login, Dashboard, Admin)
│   │   └── services/                  # Axios API Clients
│   └── package.json                   # Web Dependencies & Scripts
├── frontend/                          # Android Kotlin Native Application
│   ├── app/src/main/
│   │   ├── java/                      # Kotlin Domain, Data, Presentation Layers
│   │   └── res/                       # XML Layouts, Drawables, Themes
│   └── build.gradle.kts               # Android Gradle Build Configuration
├── selenium-tests/                    # Selenium WebDriver E2E Automation Suite
│   ├── pages/LoginPage.js             # Page Object Model
│   ├── tests/login-tests.js           # 320 Test Cases Runner
│   └── reports/                       # Generated Excel Reports
├── appium-tests/                      # Appium UiAutomator2 Mobile E2E Suite
│   ├── pages/LoginScreen.js           # Mobile Page Object Model
│   ├── tests/app-e2e-tests.js         # 320 Mobile Test Cases Runner
│   └── reports/                       # Generated Excel Reports
├── load-tests/                        # Baseline Concurrency & Load Testing Engine
│   ├── run-load-test.js               # 100 VUs / 60s Execution Engine
│   ├── scenarios/                     # Target API Workload Profiles
│   └── reports/                       # Generated Performance Excel Reports
├── Vulnerability Test Results/        # Security Assessment Deliverables
│   ├── security-review.md             # SAST Vulnerability Findings Report
│   ├── executive-summary.md           # Security Threat Profile & Score
│   ├── dependency-report.md           # Dependency CVE & Supply Chain Report
│   └── *.xlsx                         # Formatted Security Workbooks
├── scripts/                           # Master Test Runners & Automation Scripts
│   ├── run_all_test_suites.js         # Master QA Runner
│   └── generate_security_workbooks.js # Security Workbook Engine
└── README.md                          # Project Master Documentation
```

---

## 👥 Default Credentials for Testing

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@nearbyapp.com` | `Admin@Nearby2026!Secure` | Full Platform & Admin Dashboard |
| **Traveler User** | `alex.rivera@example.com` | `Password123!` | Standard User Portal & Bookmarks |
| **Explorer User** | `user@nearby.com` | `Password123!` | Standard User Portal |

---

## 📜 License
This project is licensed under the **MIT License**.
