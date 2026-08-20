# Nearby — Enterprise AI Travel Guidance & Location Intelligence Platform

Nearby is an enterprise-grade frontend application engineered for real-time location radar, natural language AI itinerary generation, interactive GIS maps, verified travel community reviews, and automated place moderation.

---

## 🛠️ Technology Stack

- **Core Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool & HMR**: [Vite 8](https://vite.dev/) with `@vitejs/plugin-react` and `@tailwindcss/vite`
- **Styling & Theme Engine**: [TailwindCSS v4](https://tailwindcss.com/) with CSS Custom Variables & [next-themes](https://github.com/pacocoursey/next-themes)
- **UI Components**: Base UI / [shadcn/ui](https://ui.shadcn.com/) with CVA (`class-variance-authority`)
- **Icon System**: [Hugeicons React](https://hugeicons.com/) exclusively via centralized `<Icon />` wrapper
- **Animations**: [Framer Motion 12](https://www.framer.com/motion/)
- **Client Routing**: [React Router 7](https://reactrouter.com/)
- **Testing Suite**: [Vitest 4](https://vitest.dev/), [React Testing Library](https://testing-library.com/), and [MSW (Mock Service Worker)](https://mswjs.io/)
- **GIS Map Engine**: [MapLibre GL](https://maplibre.org/) with CARTO Voyager (Light) & Dark Matter (Dark) raster tile specifications

---

## 📋 Production Requirements

- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`
- **Supported Browsers**: Chrome `>= 100`, Firefox `>= 100`, Safari `>= 15`, Edge `>= 100`
- **Backend API**: Deployed FastAPI service supporting REST endpoints, CORS headers, and JWT Authentication.

---

## ⚙️ Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_APP_NAME` | Public Application Brand Name | `Nearby` |
| `VITE_APP_ENV` | Application Deployment Environment | `production` \| `development` |
| `VITE_API_BASE_URL` | Deployed FastAPI REST Backend Endpoint | `https://api.nearby.app/api/v1` |
| `VITE_ENABLE_ANALYTICS` | Enable Optional Performance & Telemetry Analytics | `true` |
| `VITE_ENABLE_PWA` | Enable Progressive Web Application Service Worker | `false` |

> [!IMPORTANT]
> Never expose secrets, database credentials, or JWT signing keys in frontend `.env` files. All variables exposed to the client MUST be prefixed with `VITE_`.

---

## ⚡ Quick Start & Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Launch Development Server
```bash
npm run dev
```
Access the application at `http://localhost:3000`.

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launch local Vite development server on port `3000` |
| `npm run build` | Execute TypeScript compilation check (`tsc -b`) and produce optimized production bundle in `dist/` |
| `npm run test` | Run complete Vitest + RTL + MSW unit and integration test suite |
| `npm run test:watch` | Run Vitest in interactive watch mode |
| `npm run test:coverage` | Generate V8 test coverage report |
| `npm run preview` | Serve production `dist/` bundle locally for preview testing |
| `npm run typecheck` | Perform strict TypeScript type checking without emitting files |
| `npm run lint` | Run ESLint static code analysis across all source files |
| `npm run lint:fix` | Automatically fix ESLint formatting and linting errors |
| `npm run clean` | Clear Vite cache directory |

---

## 🌐 Production Deployment Guides

### 1. Vercel Deployment

1. Connect repository to **Vercel Dashboard**.
2. Set Framework Preset to **Vite**.
3. Configure Build Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add Environment Variables under **Settings → Environment Variables**:
   - `VITE_API_BASE_URL` = `https://api.nearby.app/api/v1`
   - `VITE_APP_ENV` = `production`
5. Vercel automatically handles Single Page Application (SPA) routing fallbacks.

---

### 2. Netlify Deployment

1. Connect repository to **Netlify Dashboard**.
2. Configure Build & Deploy Settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Add `public/_redirects` file for SPA routing fallback:
   ```text
   /*    /index.html   200
   ```
4. Set Environment Variables in **Site Settings → Environment Variables**.

---

### 3. Enterprise Nginx Web Server Deployment

Deploy the `dist/` bundle behind an Nginx reverse proxy with SPA routing, SSL/TLS, gzip compression, and security headers:

```nginx
server {
    listen 443 ssl http2;
    server_name nearby.app www.nearby.app;

    ssl_certificate /etc/letsencrypt/live/nearby.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nearby.app/privkey.pem;

    root /var/www/nearby/dist;
    index index.html;

    # Gzip Compression Settings
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1000;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Static Assets Aggressive Caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA Client Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔒 FastAPI Backend Integration & CORS

Ensure your deployed FastAPI backend `main.py` explicitly allows the production frontend origins in `ALLOWED_ORIGINS`:

```python
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "https://nearby.app",
    "https://www.nearby.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ✅ Production QA Verification Checklist

- [x] All 15 engineering phases completed and verified.
- [x] Zero mock data or dummy endpoints in client codebase.
- [x] `npm run typecheck` passes with 0 errors.
- [x] `npm run test` passes with 100% test success.
- [x] `npm run lint` passes with 0 warnings/errors.
- [x] `npm run build` compiles clean minified bundles in `dist/`.
- [x] Route-based code splitting and manual chunking (`vendor-react`, `vendor-ui`, `vendor-maps`) active.
- [x] Eager `LandingPage` load for sub-second LCP.
- [x] Light and Dark theme modes fully verified across all components.
