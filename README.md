# Traveling Memories

[![CI — Main](https://github.com/aleexst99/traveling-memories/actions/workflows/ci-main.yml/badge.svg)](https://github.com/aleexst99/traveling-memories/actions/workflows/ci-main.yml)
[![CI — Dev](https://github.com/aleexst99/traveling-memories/actions/workflows/ci-dev.yml/badge.svg)](https://github.com/aleexst99/traveling-memories/actions/workflows/ci-dev.yml)

A web app for logging travel memories. Users can add visited countries, write journal entries per trip, and explore destinations on an interactive 3D globe.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 19 (standalone components) |
| Language | TypeScript |
| Styles | SCSS + Tailwind CSS |
| Animations | GSAP |
| Images | Cloudinary (upload + transformations) |
| 3D Map | Three.js + three-globe + OrbitControls |
| 2D Map | Leaflet + leaflet.markercluster |
| Icons | Font Awesome |
| HTTP | Angular HttpClient + interceptor |
| Tests | Jasmine + Karma |
| CI/CD | GitHub Actions |
| Deploy | Vercel |

---

## Installation

**Requirements:** Node.js 20+, npm 9+

```bash
git clone https://github.com/aleexst99/traveling-memories.git
cd traveling-memories/traveling-memories
npm install
cp src/environments/environment.example.ts src/environments/environment.ts
cp proxy.conf.example.json proxy.conf.json
# Fill in both files with your API key and Cloudinary config
npm start
```

App will be available at `http://localhost:4200`.

---

## Environment variables

Environment files are not included in the repository. Use `environment.example.ts` as a template:

```ts
export const environment = {
  production: false,
  apiUrl: '/api',                    // local proxy → avoids CORS in development
  apiKey: 'YOUR_API_KEY',
  cloudinaryCloudName: 'YOUR_CLOUD',
  cloudinaryUploadPreset: 'YOUR_PRESET',
  geoDbApiKey: 'YOUR_RAPIDAPI_KEY',  // GeoDB Cities — rapidapi.com (free Basic plan)
};
```

`proxy.conf.json` redirects `localhost:4200/api/*` to the backend to avoid CORS in development. In production, CORS is handled directly by the backend.

---

## Commands

```bash
npm start                                                                    # dev server with proxy
npm run build                                                                # production build
npm run build -- --configuration development                                 # development build
npm test -- --watch=false --browsers=ChromeHeadless --no-progress            # tests in CI
```

---

## Architecture

```
src/app/
├── core/
│   ├── services/
│   │   ├── api.service.ts           # All backend calls + response mappers
│   │   ├── auth.service.ts          # Auth state (temporary hardcoded login)
│   │   ├── cloudinary.service.ts    # Image upload and transformation
│   │   ├── geodb.service.ts         # City autocomplete via GeoDB RapidAPI
│   │   ├── theme.service.ts         # Global dark/light mode
│   │   └── toast.service.ts         # Global notifications
│   ├── interceptors/
│   │   └── api-key.interceptor.ts   # Injects X-API-KEY on every request
│   └── models/
│       ├── api.models.ts            # Exact backend interfaces
│       ├── viajes.model.ts          # Domain models (Trip, Entry, Country)
│       └── user.model.ts
├── shared/
│   ├── toast/                       # Toast notification component
│   └── back-button/                 # Reusable back navigation button
└── features/
    ├── landing/                     # Home page, user list, description, roadmap
    ├── login/                       # Login form with GSAP Yeti animation
    ├── register/                    # Registration form (route disabled)
    ├── not-found/                   # 404 page
    ├── mapa-global/                 # 3D globe with all trips across users
    └── usuario-perfil/
        ├── perfil-header/           # Avatar, bio, edit profile, theme toggle
        ├── perfil-mapa/             # 2D Leaflet map with trip markers
        ├── perfil-viajes/           # Trip carousel (card list)
        │   ├── viaje-card/          # Individual trip card
        │   └── viajes-lista/        # Trip list container
        ├── viaje-form/              # Modal to create a new trip
        └── viajes/
            ├── viaje-detalle/       # Trip detail + entry list + edit/delete
            └── viaje-entrada/       # Create / edit trip entry form
```

### TypeScript path aliases

```ts
@core/*       → src/app/core/*
@features/*   → src/app/features/*
@shared/*     → src/app/shared/*
@environments/* → src/environments/*
```

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `LandingComponent` | Home — user list and project overview |
| `/login` | `LoginComponent` | Login with GSAP Yeti animation |
| `/user/:id` | `UsuarioPerfilComponent` | User profile — map, trips, edit |
| `/user/:id/viaje/:viajeId` | `ViajeDetalleComponent` | Trip detail and entries |
| `/user/:id/viajes/:viajeId/entradas` | `ViajeEntradaComponent` | Add entry to a trip |
| `/mapa-global` | `MapaGlobalComponent` | 3D globe with all trips |
| `/**` | `NotFoundComponent` | 404 |

All routes except `/` and `/mapa-global` are lazy-loaded.

---

## Features

### Trips
- Create a trip by selecting a country (autocomplete from backend `/countries`)
- Attach a cover photo via Cloudinary upload
- Mark trips as **visited** or **wishlist**
- Edit or delete any trip
- Convert a wishlist trip to visited

### Journal entries
- Add, edit and delete entries per trip
- Each entry has a title, date, description and optional photo

### User profile
- Edit display name, bio and avatar photo
- 2D Leaflet map showing all trips as pin markers (green = visited, purple = wishlist)
- Markers include country flag and popup with trip info

### 3D globe
- Interactive globe (Three.js + three-globe) showing every trip across all users
- Orbit, zoom and click interactions

### Login animation
- GSAP-powered Yeti SVG that follows the cursor, blinks and reacts to password field focus

---

## Data flow

All data is fetched fresh from the API on each navigation — no shared in-memory state between routes.

```
Profile load
  → forkJoin(getUser, getTripsByUser)
  → forkJoin(getEntriesByTrip × N)    ← enriches each trip with entry count
  → user signal updated → components re-render

Trip detail load
  → forkJoin(getTrip, getEntriesByTrip)
  → trip + entries signals updated
```

---

## Authentication

Access to create and edit trips is restricted to project users. The current login is temporary (hardcoded in `AuthService`) until `POST /auth/login` is fully integrated.

---

## Dark mode

`ThemeService` applies the `dark` or `light` class to `<html>` and persists the preference in `localStorage`. All components use CSS variables (`--bg-page`, `--color-text`, etc.) defined in `styles.css`. The toggle is in the navbar, accessible from any page.

---

## Images

Images are uploaded to **Cloudinary** using unsigned upload. Restrictions enforced in the frontend:
- Allowed formats: JPEG and PNG
- Maximum size: 5 MB per image

`CloudinaryService.validate(file)` centralises validation before any upload.

---

## City autocomplete

`GeoDbService` queries the [GeoDB Cities RapidAPI](https://rapidapi.com/wirefreethought/api/geodb-cities) to provide city suggestions in forms. Requires a free `GEODB_API_KEY`. Falls back to an empty list on quota or network errors.

---

## Tests

**92 tests, all passing.**

| Service / Component | Tests | Covers |
|---------------------|-------|--------|
| `AuthService` | 11 | login, logout, persistence, canEditUser |
| `CloudinaryService` | 11 | avatarUrl, validate (type, size), fallback |
| `ToastService` | 10 | types, auto-close, timing |
| `ApiService` | 21 | mappers, HTTP mocks for all endpoints |
| Components | 39 | creation, inputs, renders |

---

## CI/CD

Two pipelines in `.github/workflows/`:

- **`ci-dev.yml`** — triggers on push/PR to `dev`: tests + staging build
- **`ci-main.yml`** — triggers on push/PR to `main`: tests + production build

Both pipelines generate `environment.ts` dynamically from GitHub Actions secrets via `scripts/set-env.js`.

Required secrets:

| Secret | Description |
|--------|-------------|
| `API_KEY` | Backend API key |
| `STAGING_API_URL` | Staging backend URL |
| `PROD_API_URL` | Production backend URL |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset |
| `GEODB_API_KEY` | X-RapidAPI-Key for GeoDB Cities |

---

## Deploy

The app is configured for **Vercel** via `vercel.json`:

```json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist/travel-blog/browser",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

The `rewrites` rule ensures Angular's client-side routing works on direct URL access.

---

## Branch strategy

```
main  ← stable production
  └── dev  ← integration
        ├── feature/...
        └── fix/...
```

Flow: branch from `dev` → PR to `dev` → once `dev` is stable → PR to `main`.

---

## Scripts

Utility scripts in `scripts/`:

| Script | Purpose |
|--------|---------|
| `set-env.js` | Generates `environment.ts` from env vars (used in CI) |
| `fetch-flags.js` | Fetches country flag URLs and writes to `assets/countries.json` |
| `fetch-country-names-es.js` | Fetches country names in Spanish for the local asset |
| `seed_countries_es.sql` | SQL seed file for populating the backend countries table |

---

## Backend

- **URL:** `https://traveling-memories-backend.onrender.com`
- **Docs:** `https://traveling-memories-backend.onrender.com/docs`
- **Auth:** `X-API-KEY` header on every request

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login |
| GET | `/users` | List all users |
| GET | `/users/{id}` | Get user by ID |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |
| POST | `/trips` | Create a trip |
| GET | `/trips/user/{user_id}` | Get trips by user |
| GET | `/trips/{id}` | Get trip by ID |
| PUT | `/trips/{id}` | Update trip |
| DELETE | `/trips/{id}` | Delete trip |
| GET | `/trip-entries/trip/{trip_id}` | Get entries for a trip |
| POST | `/trip-entries` | Create an entry |
| GET | `/trip-entries/{id}` | Get entry by ID |
| PUT | `/trip-entries/{id}` | Update entry |
| DELETE | `/trip-entries/{id}` | Delete entry |
| GET | `/countries` | List countries (with lat/lng and region) |
| GET | `/countries/{id}` | Get country by ID |
| GET | `/cities` | List cities |

---

## Roadmap

**In progress**
- Interactive routes — city-to-city path drawn on the 3D globe
- Travel companions — link real users to each trip
- Export to PDF — full travel diary with photos and entries

**Planned**
- Real authentication via `POST /auth/login`
- Chronological timeline of all trips
- Destination recommendations based on visited countries
- Offline support / PWA
- Internationalisation (i18n) EN/ES
- Backend keep-alive cron (GitHub Actions)
