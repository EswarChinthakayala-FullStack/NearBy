# System Architecture & Technical Specifications

## Architectural Overview

The **Local Tourism Guide Backend** is an enterprise-grade RESTful API service built with Python 3.11+, FastAPI, SQLAlchemy 2.x Async, MySQL 8, Redis, and Celery.

The system strictly enforces **Separation of Concerns** using a layered architecture:

```text
                  Client Application
             Android | Web | Admin Dashboard
                            │
               HTTPS + JWT Bearer Auth
                            │
                            ▼
                   FastAPI API Gateway
               app/main.py | app/api/v1/
                            │
                            ▼
                 Dependency Injection Layer
                      app/api/deps.py
                            │
                            ▼
                  Business Service Layer
                       app/services/
                            │
                            ▼
                 Repository (CRUD Layer)
                   app/repositories/
                            │
                            ▼
              SQLAlchemy 2.x ORM Domain Models
                       app/models/
                            │
                            ▼
                      MySQL 8 Database
```

---

## Component Boundaries & Responsibilities

### 1. API Layer (`app/api/v1/`)
- Handles HTTP requests, parameter validation, response envelope formatting.
- Contains no business logic or database queries.

### 2. Dependency Layer (`app/api/deps.py`)
- Provides DB sessions (`get_db`), user authentication (`get_current_user`), and admin role authorization (`get_current_admin`).

### 3. Business Service Layer (`app/services/`)
- Encapsulates domain logic, validation rules, external integrations, and Celery task dispatches.

### 4. Repository Layer (`app/repositories/`)
- Handles data persistence and retrieval queries using SQLAlchemy 2.x `select`, `insert`, `update`, `delete` async statements.

### 5. Domain Models (`app/models/`)
- Defines MySQL table schemas, column data types, foreign keys, spatial point fields, and relationships.

---

## Security & Observability

- **Authentication**: JWT access and refresh tokens signed with `HS256`. Password hashing via `bcrypt`.
- **Correlation ID**: Every HTTP request receives an `X-Correlation-ID` header injected by `CorrelationIdMiddleware` for end-to-end log tracing.
- **Timing Middleware**: Processing latency is tracked and returned in `X-Process-Time-MS`.
