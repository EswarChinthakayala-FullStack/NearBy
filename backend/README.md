# Local Tourism Guide & Directory Backend (`tourism-guide-backend`)

![Python Version](https://img.shields.io/badge/python-3.11%2B-blue.svg)
![Framework](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg)
![Database](https://img.shields.io/badge/MySQL-8.0%20%2F%20XAMPP-orange.svg)
![ORM](https://img.shields.io/badge/SQLAlchemy-2.0.25-red.svg)
![Task Queue](https://img.shields.io/badge/Celery-5.3.6-green.svg)
![Cache](https://img.shields.io/badge/Redis-7.0-red.svg)
![Migrations](https://img.shields.io/badge/Alembic-1.13.1-purple.svg)
![Test Status](https://img.shields.io/badge/tests-61%20passed-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

An enterprise-grade, asynchronous RESTful backend API and background processing system for the **Local Tourism Guide & Directory System**. Built with modern Python 3.11+, FastAPI, SQLAlchemy 2.0 Typed ORM, Pydantic v2, MySQL 8, Redis, Celery, and Alembic.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features & Capability Matrix](#2-features--capability-matrix)
3. [Technology Stack](#3-technology-stack)
4. [High-Level System Architecture](#4-high-level-system-architecture)
5. [Repository Directory Structure](#5-repository-directory-structure)
6. [Prerequisites & System Requirements](#6-prerequisites--system-requirements)
7. [Getting Started & Local Setup](#7-getting-started--local-setup)
   - [Clone the Repository](#71-clone-the-repository)
   - [Create Virtual Environment](#72-create-virtual-environment)
   - [Install Dependencies](#73-install-dependencies)
   - [Environment Configuration](#74-environment-configuration)
   - [MySQL Database Setup](#75-mysql-database-setup)
   - [Redis Caching Setup](#76-redis-caching-setup)
8. [Developer CLI Tool (`start.py`)](#8-developer-cli-tool-startpy)
   - [Development Server](#development-server)
   - [Production Server](#production-server)
   - [CLI Command Reference Table](#cli-command-reference-table)
9. [Interactive API Documentation](#9-interactive-api-documentation)
10. [Authentication & Security Mechanics](#10-authentication--security-mechanics)
11. [Database Migrations & Alembic Workflow](#11-database-migrations--alembic-workflow)
12. [Background Processing Pipeline (Celery)](#12-background-processing-pipeline-celery)
13. [Automated Testing Suite](#13-automated-testing-suite)
14. [Code Quality & Linting](#14-code-quality--linting)
15. [Centralized Logging & Audit Trail](#15-centralized-logging--audit-trail)
16. [Production Deployment & Containerization](#16-production-deployment--containerization)
17. [Troubleshooting Guide](#17-troubleshooting-guide)
18. [Development Workflow & Git Guidelines](#18-development-workflow--git-guidelines)
19. [License & Metadata](#19-license--metadata)

---

## 1. Project Overview

The **Local Tourism Guide Backend** provides high-performance persistence, geolocation capabilities, and multi-source data synchronization for tourist directory platforms across Android, iOS, and Web clients.

### Objectives
- **Single Source of Truth Database**: 100% compliant with relational schema standards defined in `schema.sql`.
- **Location-Aware Discovery**: Haversine formula and MySQL spatial indexing for nearby place discovery within configurable GPS radius bounds.
- **Asynchronous External Pipelines**: Automated background synchronization with OpenStreetMap (Overpass API), Wikipedia REST summaries, and Wikimedia Commons / Bing Image scraping.
- **Enterprise Security & Privacy**: Public CHAR(36) UUID resource identifiers, Bcrypt password hashing, stateful JWT refresh token rotation, and role-based access control (RBAC).

---

## 2. Features & Capability Matrix

- 🔐 **Authentication & Authorization**: Registration, login, refresh token rotation, logout, password change, user profile updates, and admin role authorization.
- 🏛️ **Tourist Place Directory**: Categorized directory listing with multi-field search (city, category, rating, status, keyword), full detail views, operating hours/timings, and cover image management.
- 📍 **Spatial Nearby Search**: Coordinate-based radius filtering returning distance-sorted results ($d \le \text{radius\_km}$).
- 🗺️ **Turn-by-Turn Routing & Directions**: OSRM/GraphHopper integration with transparent database response caching (`routing_cache`).
- ⭐ **User Reviews & Ratings**: 1–5 star rating submissions, atomic place average rating & total review counter updates, and admin moderation queue.
- 🔖 **Saved Favorites**: User bookmarking with atomic favorite counter synchronization.
- ⚡ **Background Processing**: Celery worker integration for OSM imports, Wikipedia content enrichment, multi-provider image scraping, nightly statistics recalculation, and cache maintenance.
- 🩺 **System Diagnostics**: Built-in developer CLI (`start.py doctor`) verifying database, Redis, venv, and permissions health.

---

## 3. Technology Stack

| Technology | Version / Specification | Purpose in Architecture |
| :--- | :--- | :--- |
| **Python** | `^3.11` | Core programming language runtime |
| **FastAPI** | `^0.109.0` | High-performance asynchronous web API framework |
| **SQLAlchemy** | `^2.0.25` | Modern Typed Declarative ORM & database interface |
| **MySQL** | `8.0+ / XAMPP` | Primary relational database engine |
| **Alembic** | `^1.13.1` | Relational database schema migration manager |
| **Redis** | `7.0+` | In-memory cache & Celery task message broker |
| **Celery** | `^5.3.6` | Asynchronous task queue & periodic beat scheduler |
| **Pydantic v2** | `^2.5.3` | Strongly-typed request/response validation schemas |
| **Bcrypt & Passlib** | `^1.7.4` | Password hashing & verification engine |
| **PyJWT / Python-Jose** | `^3.3.0` | Cryptographic JWT token generation & verification |
| **HTTPX** | `^0.26.0` | Asynchronous HTTP client for external service integration |
| **BeautifulSoup4** | `^4.12.3` | HTML scraping engine for Bing image acquisition |
| **Pillow** | `^10.2.0` | Image format validation and thumbnail generation |
| **Pytest & AnyIO** | `^8.0.0` | Asynchronous automated integration test suite |
| **Typer & Rich** | `^0.9.0` / `^13.7.0` | Professional developer CLI terminal interface |

---

## 4. High-Level System Architecture

```text
                        ┌─────────────────────────┐
                        │   Mobile & Web Clients  │
                        └────────────┬────────────┘
                                     │ HTTP REST (JSON / JWT)
                                     ▼
                        ┌─────────────────────────┐
                        │   FastAPI Web Server    │
                        │      (app/main.py)      │
                        └────────────┬────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Repositories    │       │ Services Layer  │       │ Shared Utils    │
│ (app/crud)      │       │ (app/services)  │       │ (app/utils)     │
└────────┬────────┘       └────────┬────────┘       └─────────────────┘
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│ MySQL 8 / XAMPP │       │ External APIs   │
│ (Tourism DB)    │       │ (OSM/Wiki/OSRM) │
└─────────────────┘       └─────────────────┘
         ▲                         ▲
         │                         │ Tasks / Job Enqueue
         └──────────┐   ┌──────────┘
                    │   │
             ┌──────┴───┴──────┐
             │ Celery Worker   │
             │ (Redis Broker)  │
             └─────────────────┘
```

---

## 5. Repository Directory Structure

```text
tourism-guide-backend/
├── alembic/                      # Alembic database migration scripts
│   ├── env.py                    # Dynamic Alembic environment runner
│   ├── script.py.mako            # Migration revision template
│   └── versions/                 # Versioned migration scripts (001_initial_schema.py)
├── app/                          # Core application package
│   ├── api/                      # REST API routing layer
│   │   ├── deps.py               # Dependency injection (Auth, DB session)
│   │   └── v1/                   # Version 1 API routers
│   │       ├── endpoints/        # Feature controllers (auth, users, places, etc.)
│   │       └── router.py         # Main V1 API router aggregator
│   ├── core/                     # Application core configuration
│   │   ├── config.py             # Pydantic Settings settings instance
│   │   ├── exceptions.py         # Centralized error exceptions & HTTP handlers
│   │   ├── logging_config.py     # Root logger with console & rotating file sinks
│   │   └── security.py           # Password hashing & JWT token management
│   ├── crud/                     # Repository layer (Database access encapsulation)
│   │   ├── base.py               # Generic CRUDBase repository implementation
│   │   ├── crud_category.py      # Category database operations
│   │   ├── crud_favorite.py      # Favorite database operations & atomic counter sync
│   │   ├── crud_image.py         # Place image database operations
│   │   ├── crud_place.py         # Place search, spatial nearby, & CRUD queries
│   │   ├── crud_review.py        # Review database operations & atomic rating updates
│   │   └── crud_user.py          # User registration, authentication, & profile CRUD
│   ├── db/                       # Database connection setup
│   │   ├── base.py               # Declarative Base metadata model registry
│   │   ├── init_db.py            # Initial database bootstrapper & category seeder
│   │   └── session.py            # Async & Sync SQLAlchemy session factories
│   ├── models/                   # SQLAlchemy 2.0 Typed ORM models (1:1 schema.sql)
│   │   ├── category.py           # Category entity model
│   │   ├── favorite.py           # Favorite bookmark entity model
│   │   ├── image.py              # PlaceImage entity model
│   │   ├── place.py              # Place entity model (decimal lat/lng & spatial)
│   │   ├── refresh_token.py      # RefreshToken revocation & session model
│   │   ├── review.py             # Review entity model
│   │   ├── sync_log.py           # OsmSyncLog, ContentSyncLog, & AdminActivityLog
│   │   ├── timing.py             # PlaceTiming operating hours model
│   │   └── user.py               # User authentication entity model
│   ├── schemas/                  # Pydantic v2 Request / Response validation schemas
│   │   ├── auth.py               # Login, Register, TokenPair schemas
│   │   ├── category.py           # Category payload schemas
│   │   ├── common.py             # Generic APIResponse[T] & PaginatedResponse[T]
│   │   ├── favorite.py           # Favorite bookmark payload schemas
│   │   ├── image.py              # Image upload & detail response schemas
│   │   ├── place.py              # Place create, update, filter, & response schemas
│   │   ├── review.py             # Review submission & detail schemas
│   │   └── user.py               # User profile & password change schemas
│   ├── scrapers/                 # Web scraper modules
│   │   ├── bing_image_scraper.py # Bing search HTML image scraper fallback
│   │   └── wikimedia_fetcher.py  # Wikimedia Commons official API image fetcher
│   ├── services/                 # External service integration & domain business logic
│   │   ├── geo_service.py        # Haversine distance & spatial coordinate validator
│   │   ├── image_scraper_service.py # Image sourcing pipeline orchestrator
│   │   ├── osm_service.py        # OpenStreetMap Overpass QL place importer
│   │   ├── routing_service.py    # OSRM turn-by-turn routing with database cache
│   │   ├── storage_service.py    # Local file upload storage manager
│   │   └── wikipedia_service.py  # Wikipedia REST API summary & history fetcher
│   ├── tasks/                    # Celery background asynchronous tasks
│   │   ├── beat_schedule.py      # Periodic cron task schedules
│   │   ├── image_tasks.py        # Image acquisition Celery task
│   │   ├── maintenance_tasks.py  # Rating refresh & cache purge tasks
│   │   ├── osm_tasks.py          # OSM bulk import Celery task
│   │   └── wikipedia_tasks.py    # Wikipedia enrichment Celery task
│   ├── utils/                    # Reusable framework-independent utilities
│   │   ├── pagination.py         # Offset limit & pagination metadata helpers
│   │   ├── response_wrapper.py   # API response envelope constructor
│   │   ├── slugify.py            # SEO-friendly unique slug generator
│   │   └── validators.py         # Domain input validators (coords, email, phone)
│   └── main.py                   # FastAPI application initialization & middleware
├── cli/                          # Developer CLI internal package
│   ├── app.py                    # Main Typer app instance
│   ├── dashboard.py              # Rich live dashboard UI panel
│   ├── dev.py                    # Development server runner
│   ├── doctor.py                 # System health diagnostics checker
│   ├── process_manager.py       # Subprocess supervisor with auto-restart
│   └── ...                       # Tooling commands (migrate, seed, test, clean, etc.)
├── docs/                         # OpenAPI documentation specs
├── logs/                         # Application log file outputs (app.log)
├── scripts/                      # Developer CLI scripts
│   ├── import_osm_places.py      # Standalone OSM importer script
│   └── seed_categories.py        # Idempotent category seeder script
├── tests/                        # Automated Pytest test suite (61 tests)
├── uploads/                      # Uploaded image files directory
├── .env.example                  # Environment settings template
├── alembic.ini                   # Alembic configuration file
├── celery_worker.py              # Celery worker process entrypoint
├── docker-compose.yml            # Production Docker compose orchestration
├── Dockerfile                    # Multi-stage production container image spec
├── gunicorn.conf.py              # Production Gunicorn server config
├── pyproject.toml                # Build & tool configuration
├── pytest.ini                    # Pytest configuration settings
├── requirements.txt              # Pinned Python package dependencies
└── start.py                      # Primary Developer CLI executable entrypoint
```

---

## 6. Prerequisites & System Requirements

Before running the application, ensure your environment meets the following dependencies:

- **Python**: Version `3.11.0` or higher.
- **Database Engine**: **MySQL 8.0+** (or XAMPP Control Panel with MySQL module active).
- **In-Memory Cache & Message Broker**: **Redis Server 7.0+** (Listening on `127.0.0.1:6379`).
- **Operating System**: Windows 10/11, Linux (Ubuntu 22.04+), or macOS.

---

## 7. Getting Started & Local Setup

### 7.1 Clone the Repository

```bash
git clone https://github.com/your-organization/tourism-guide-backend.git
cd tourism-guide-backend
```

### 7.2 Create Virtual Environment

#### Windows (PowerShell / Command Prompt)

```powershell
python -m venv venv
.\venv\Scripts\activate
```

#### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

*Verify that your prompt shows `(venv)`.*

### 7.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 7.4 Environment Configuration

Copy `.env.example` to `.env`:

```bash
# Windows PowerShell
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

#### Environment Variables Reference Table

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PROJECT_NAME` | `Nearby Tourist Guide API` | Application display title |
| `ENVIRONMENT` | `development` | Environment mode (`development`, `staging`, `production`) |
| `DEBUG` | `True` | Enable debug logs and verbose traceback outputs |
| `API_V1_STR` | `/api/v1` | Public API version 1 route prefix |
| `MYSQL_SERVER` | `127.0.0.1` | MySQL database host or IP address |
| `MYSQL_PORT` | `3306` | MySQL database TCP port |
| `MYSQL_USER` | `root` | MySQL authentication username |
| `MYSQL_PASSWORD` | `""` | MySQL authentication password |
| `MYSQL_DB` | `nearby_db` | Target MySQL database name |
| `SECRET_KEY` | `development_secret_key...` | Cryptographic secret key for signing JWT tokens |
| `ALGORITHM` | `HS256` | Cryptographic algorithm for JWT signatures |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Access token expiration lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token expiration lifetime |
| `REDIS_URL` | `redis://127.0.0.1:6379/0` | Redis caching connection URI |
| `CELERY_BROKER_URL` | `redis://127.0.0.1:6379/1` | Celery task message broker URI |
| `CELERY_RESULT_BACKEND` | `redis://127.0.0.1:6379/2` | Celery task result backend URI |
| `MEDIA_UPLOAD_DIR` | `uploads` | Local image file storage directory |
| `MAX_UPLOAD_SIZE_BYTES` | `10485760` | Maximum upload size limit ($10\text{MB}$) |

### 7.5 MySQL Database Setup

1. Open **XAMPP Control Panel** and start the **MySQL** service (or ensure local MySQL Server 8 service is running).
2. Create database `nearby_db` via phpMyAdmin or MySQL client:

```sql
CREATE DATABASE IF NOT EXISTS nearby_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Import the primary database schema definition file [schema.sql](file:///e:/Nearby/database/schema.sql):

```bash
# Using MySQL CLI
mysql -u root -p nearby_db < ../database/schema.sql
```

4. Run database migrations to ensure Alembic state is current:

```bash
python start.py migrate
```

5. Seed default categories:

```bash
python start.py seed
```

### 7.6 Redis Caching Setup

- **Windows**: Install Redis via WSL2 (`sudo apt install redis-server`) or use standalone Redis for Windows release.
- **Linux**: `sudo apt update && sudo apt install redis-server && sudo systemctl start redis-server`
- **macOS**: `brew install redis && brew services start redis`

Verify Redis status:

```bash
redis-cli ping
# Expected response: PONG
```

---

## 8. Running the Backend (Lightweight Mode)

To run the backend with zero overhead and minimal system resource consumption:

### Run Development API Server

```bash
python start.py
# or directly with uvicorn:
uvicorn app.main:app --reload
```

### Run Optional Celery Background Worker (Only when processing async jobs)

```bash
celery -A celery_worker.celery_app worker --loglevel=info
```

#### Development Options

```bash
# Bind to all network interfaces (LAN testing)
python start.py dev --external

# Use custom port
python start.py dev --port 8080

# Automatically open Swagger UI in default web browser
python start.py dev --open

# Also launch Celery Beat periodic task scheduler
python start.py dev --beat
```

### Production Server

Launch production Gunicorn / Uvicorn server without auto-reload:

```bash
python start.py prod --workers 4
```

### CLI Command Reference Table

| Command | Usage Example | Description |
| :--- | :--- | :--- |
| `dev` | `python start.py dev` | Start development servers (FastAPI + Celery Worker) |
| `prod` | `python start.py prod` | Run production WSGI HTTP server |
| `doctor` | `python start.py doctor` | Execute system health & infrastructure diagnostics |
| `migrate` | `python start.py migrate` | Apply Alembic database migrations (`upgrade head`) |
| `makemigrations` | `python start.py makemigrations -m "add index"` | Generate new Alembic migration script |
| `downgrade` | `python start.py downgrade` | Rollback database migration revision |
| `seed` | `python start.py seed` | Idempotently seed default categories |
| `import-osm` | `python start.py import-osm --region "Delhi"` | Import tourist places from OpenStreetMap |
| `test` | `python start.py test` | Run Pytest automated integration test suite |
| `lint` | `python start.py lint` | Execute static code audit & formatting verification |
| `clean` | `python start.py clean` | Remove Python `__pycache__` and build artifacts |
| `logs` | `python start.py logs -n 100` | Tail application log file (`logs/app.log`) |
| `shell` | `python start.py shell` | Open interactive Python shell pre-loaded with models |
| `config` | `python start.py config` | Inspect application configuration with masked secrets |
| `version` | `python start.py version` | Display backend component versions |

---

## 9. Interactive API Documentation

Once the development server is running, interactive API documentation is available at:

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Interface**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **OpenAPI Json Schema**: `http://127.0.0.1:8000/api/v1/openapi.json`

---

## 10. Authentication & Security Mechanics

The application implements stateful JWT authentication with refresh token rotation and database revocation tracking:

```text
Client                       Backend REST API                      Database / Security
  │                                  │                                      │
  ├─── POST /api/v1/auth/login ─────►│                                      │
  │    (email, password)             ├─── Verify password hash (Bcrypt) ───►│
  │                                  ├─── Issue Access Token (1h)           │
  │                                  ├─── Issue Refresh Token (7d) ────────►│ Persist Token Hash
  │◄── Return TokenPair + User ──────┤                                      │
  │                                  │                                      │
  ├─── Request with Bearer Token ───►│                                      │
  │    Header: Authorization         ├─── Validate JWT Claims & Exp ────────►│
  │◄── Protected Resource Payload ───┤                                      │
```

---

## 11. Database Migrations & Alembic Workflow

Alembic configuration ([alembic/env.py](file:///e:/Nearby/backend/alembic/env.py)) reads database credentials dynamically from `app.core.config.settings` and binds to `app.db.base.Base.metadata`.

### Migration Commands

```bash
# Generate new migration script after model changes
python start.py makemigrations -m "describe_schema_change"

# Apply pending migrations
python start.py migrate

# Rollback single migration step
python start.py downgrade
```

---

## 12. Background Processing Pipeline (Celery)

Background tasks run asynchronously using **Celery** backed by **Redis**:

- **OSM Bulk Imports** (`app.tasks.osm_tasks.sync_osm_places_task`): Queries Overpass QL API for candidate tourist places.
- **Wikipedia Enrichment** (`app.tasks.wikipedia_tasks.sync_wikipedia_content_task`): Fetches place descriptions and history.
- **Image Acquisition** (`app.tasks.image_tasks.scrape_place_images_task`): Sources candidate place images from Wikimedia Commons and Bing Images.
- **Nightly Reconciliation** (`app.tasks.maintenance_tasks.refresh_place_counters_task`): Recalculates average ratings and favorite counts.

---

## 13. Automated Testing Suite

Execute the full automated test suite (61 tests covering security, models, repositories, controllers, services, scrapers, background tasks, and CLI):

```bash
python start.py test
```

---

## 14. Code Quality & Linting

Run code quality and static analysis checks:

```bash
python start.py lint
```

---

## 15. Centralized Logging & Audit Trail

Application logs are written simultaneously to console output and rotating file logs at `logs/app.log`:

```bash
# Tail live log outputs
python start.py logs
```

---

## 16. Production Deployment & Containerization

### Docker & Docker Compose Deployment

Build and start full multi-container production stack (API, Celery Worker, Celery Beat, Redis, MySQL 8):

```bash
docker-compose up -d --build
```

### Health Check Endpoints

- General API Health: `GET /health`
- Database Connectivity Health: `GET /health/db`
- Redis Cache Connectivity Health: `GET /health/redis`

---

## 17. Troubleshooting Guide

| Issue / Symptom | Probable Cause | Resolution |
| :--- | :--- | :--- |
| `MySQL Connection Refused` | MySQL service is stopped or port 3306 is blocked | Start XAMPP Control Panel MySQL module. Verify credentials in `.env`. |
| `Redis Connection Failure` | Redis server not running | Start Redis (`redis-server` or `services.msc` on Windows). Run `redis-cli ping`. |
| `Port 8000 Busy` | Another process is using port 8000 | `start.py dev` automatically detects and uses the next available port (e.g. 8001). |
| `ImportError / Module Not Found` | Virtual environment not active | Activate virtualenv (`.\venv\Scripts\activate`) and run `pip install -r requirements.txt`. |
| `Alembic Revision Conflict` | Out-of-sync migration history | Run `python start.py migrate` to apply head revisions. |

---

## 18. Development Workflow & Git Guidelines

1. Pull latest changes: `git pull origin main`
2. Create feature branch: `git checkout -b feature/your-feature-name`
3. Run health diagnostics: `python start.py doctor`
4. Implement code changes & add unit tests in `tests/`
5. Run test suite: `python start.py test`
6. Verify code quality: `python start.py lint`
7. Commit changes & push branch: `git push origin feature/your-feature-name`

---

## 19. License & Metadata

Copyright © 2026 Local Tourism Guide Team. Released under the **MIT License**.
