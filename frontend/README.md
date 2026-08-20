# Nearby — Enterprise Android Application (2026 Edition)

Welcome to the **Nearby** Android application codebase. This project is built using modern, production-grade Android technologies adhering strictly to **Clean Architecture**, **MVVM**, **ViewBinding**, **Hilt**, and **KSP**.

---

## 🏛️ Architecture Overview

The application follows Clean Architecture principles separated into distinct layers:

```
Clean Architecture
       ↓
  Presentation (XML + ViewBinding + Fragments)
       ↓
   Domain Layer (Models, Repositories, Use Cases)
       ↓
     Data Layer (Remote + Local Data Sources)
       ↓
   Network & Database (Retrofit, Room, Jetpack DataStore)
```

---

## 🛠️ Technology Stack (2026 Enterprise Edition)

| Component | Technology | Description |
|---|---|---|
| **Language** | Kotlin 2.1.10 | Modern Kotlin features, coroutines, sealed interfaces, data objects |
| **Build System** | Gradle + Kotlin DSL | Managed via `gradle/libs.versions.toml` version catalog |
| **Compiler Processor** | KSP | Zero KAPT overhead, compile-time code generation |
| **Dependency Injection** | Hilt 2.55 | Enterprise DI with constructor and assisted injection |
| **UI Framework** | ViewBinding + XML Views | Enterprise XML layout design system (Jetpack Compose disabled) |
| **Networking** | Retrofit 2.11 + OkHttp 5 | HTTP/2 & HTTP/3 ready, connection pooling, token refresh authenticator |
| **Serialization** | Kotlinx Serialization 1.8 | Zero-reflection, compile-time JSON DTO parsing |
| **Local Database** | Room 2.6.1 | TypeConverters, Paging 3 integration |
| **Local Storage** | Jetpack DataStore | Encrypted session & token storage |
| **Image Loading** | Coil 3.1.0 | SVG, GIF, Video, Memory & Disk Caching |
| **Maps** | MapLibre Native 11.5.0 | High-performance vector tiles & GeoJSON support |
| **Logging** | Timber 5.0.1 | Disabled in production builds |
| **Security** | Root & Emulator Detection | Screenshot window protection & encrypted token storage |

---

## 📁 Package Hierarchy (`com.example.nearby`)

- `core/` — Foundational core abstractions
- `common/` — Logger, ConnectivityObserver, standard utilities
- `data/` — Remote/Local Data Sources, Repositories, Mappers, DTOs
- `domain/` — Domain Models, Repository Contracts, Use Cases
- `presentation/` — Views, Fragments, ViewBinding layouts
- `designsystem/` — Custom XML design system tokens and components
- `navigation/` — Navigation graph routing
- `database/` — Room Database, DAOs, Entities
- `network/` — Retrofit interfaces, OkHttp interceptors, DTOs matching FastAPI backend contracts
- `security/` — Encrypted DataStore, Root Detection, Emulator Detection, Window Security
- `workers/` — WorkManager background tasks
- `di/` — Hilt Modules (`AppModule`, `NetworkModule`, `DatabaseModule`, `DispatcherModule`, `SecurityModule`)
- `testing/` — Hilt test runner and test utilities

---

## ⚙️ Build Variants

This application configures 4 distinct build variants:

1. **`debug`**: Target local environment (`http://10.0.2.2:8000/api/v1/`), detailed OkHttp logging enabled, Chucker inspector active.
2. **`qa`**: Target QA environment (`https://qa-api.nearby.app/api/v1/`), logging enabled, Crashlytics enabled.
3. **`staging`**: Target Staging environment (`https://staging-api.nearby.app/api/v1/`), R8 minification enabled.
4. **`release`**: Target Production environment (`https://api.nearby.app/api/v1/`), R8 resource shrinking enabled, logging disabled.

---

## 🚦 Build & Verification Commands

```bash
# Build Debug APK
./gradlew assembleDebug

# Run Unit Tests
./gradlew testDebugUnitTest

# Run Android Lint
./gradlew lintDebug

# Run Static Analysis (Detekt)
./gradlew detekt
```
