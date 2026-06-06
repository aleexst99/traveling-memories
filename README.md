# ✈️ Traveling Memories

Aplicación web para registrar y compartir recuerdos de viaje. Cada usuario puede añadir los países que ha visitado, crear entradas por cada visita y visualizar todos los destinos en un globo 3D interactivo.

---

## 📋 Índice

- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación y arranque](#instalación-y-arranque)
- [Variables de entorno](#variables-de-entorno)
- [Comandos disponibles](#comandos-disponibles)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Flujo de datos](#flujo-de-datos)
- [Autenticación](#autenticación)
- [Tests](#tests)
- [CI/CD](#cicd)
- [Ramas y flujo de trabajo](#ramas-y-flujo-de-trabajo)
- [Backend](#backend)

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 19 (standalone components) |
| Lenguaje | TypeScript |
| Estilos | SCSS + Tailwind CSS |
| Mapa 3D | Three.js + OrbitControls |
| Mapa 2D | Leaflet |
| HTTP | Angular HttpClient + interceptor |
| Tests | Jasmine + Karma |
| CI/CD | GitHub Actions |

---

## Arquitectura

```
src/app/
├── core/                        # Servicios globales
│   ├── api.service.ts           # Todas las llamadas al backend
│   ├── auth.service.ts          # Autenticación
│   ├── trip-store.service.ts    # Estado en memoria (viajes y entradas)
│   ├── toast.service.ts         # Notificaciones globales
│   ├── api-key.interceptor.ts   # Inyecta X-API-KEY en cada request
│   └── models/api.models.ts     # Interfaces exactas del backend
│
├── shared/
│   └── toast/                   # Componente de notificaciones
│
└── features/
    ├── landing/                 # Página principal + navbar + lista usuarios
    ├── login/                   # Formulario de acceso privado
    ├── mapa-global/             # Globo 3D con todos los viajes
    └── usuario-perfil/          # Perfil, mapa, carrusel de viajes
        ├── perfil-header/
        ├── perfil-mapa/
        ├── perfil-viajes/       # Cards + carrusel
        ├── viaje-form/          # Modal para crear viaje
        └── viajes/
            ├── viaje-detalle/   # Pantalla de un viaje con sus entradas
            └── viaje-entrada/   # Formulario de entrada
```

---

## Instalación y arranque

### Requisitos

- Node.js 20+
- npm 9+

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/aleexst99/traveling-memories.git
cd traveling-memories/traveling-memories

# 2. Instalar dependencias
npm install

# 3. Crear los ficheros de entorno (ver sección siguiente)
cp src/environments/environment.example.ts src/environments/environment.ts
cp proxy.conf.example.json proxy.conf.json
# → Edita ambos ficheros con tu API key

# 4. Arrancar
npm start
```

La app estará disponible en `http://localhost:4200`.

---

## Variables de entorno

Los ficheros de entorno **no están en el repositorio** (contienen la API key). Usa el fichero de ejemplo como plantilla:

```
src/environments/
  environment.example.ts   ← plantilla (en el repo)
  environment.ts           ← desarrollo, NO subir al repo
  environment.dev.ts       ← apunta al backend en Render
  environment.prod.ts      ← producción
  environment.local.ts     ← backend corriendo en local (localhost:3000)
```

```ts
// environment.ts (ejemplo)
export const environment = {
  production: false,
  apiUrl: '/api',           // proxy local → evita CORS en desarrollo
  apiKey: 'TU_API_KEY',
  useLocalStorage: false,
};
```

### Proxy (desarrollo)

El fichero `proxy.conf.json` redirige las llamadas a través del servidor de desarrollo de Angular para evitar errores de CORS:

```
Navegador → localhost:4200/api/* → proxy → backend en Render
```

```bash
cp proxy.conf.example.json proxy.conf.json
# → Edita con tu API key
```

> En producción el proxy no es necesario — el backend debe tener configurado `CORSMiddleware`.

---

## Comandos disponibles

```bash
# Desarrollo
npm start                                        # ng serve con proxy

# Build
npm run build                                    # producción
npm run build -- --configuration development     # desarrollo

# Tests
npm test                                         # modo watch
npm test -- --watch=false --browsers=ChromeHeadless --no-progress  # CI

# Generar componente
ng generate component features/nombre
```

---

## Estructura de carpetas

```
traveling-memories/
├── .github/workflows/           # Pipelines CI/CD
│   ├── ci-dev.yml               # Tests + build en push a dev
│   └── ci-main.yml              # Tests + build + deploy en push a main
├── src/
│   ├── app/
│   ├── assets/
│   │   ├── earth.png            # Textura del globo 3D
│   │   ├── icons/               # Iconos para marcadores del mapa
│   │   └── textures/
│   └── environments/
├── proxy.conf.json              # Proxy dev (NO en el repo)
├── proxy.conf.example.json      # Plantilla del proxy
└── angular.json
```

---

## Flujo de datos

```
Usuario crea viaje
      ↓
ViajeFormComponent
      ↓
ApiService.createTrip()  →  POST /trips  →  Backend
      ↓
TripStoreService.addOrUpdateTrip()   ← guarda en memoria la sesión
      ↓
Router navega a /user/:id/viaje/:viajeId
      ↓
ViajeDetalleComponent carga desde TripStoreService
```

> **Nota:** El backend aún no expone `GET /trips?user_id=X` ni `GET /trip-entries?trip_id=X`. Cuando los exponga, `TripStoreService` se actualizará para llamar a la API en lugar de mantener estado en memoria.

---

## Autenticación

El acceso para añadir y editar viajes está restringido a los dos usuarios del proyecto. El login actual es temporal (hardcodeado) hasta que el backend implemente un endpoint de autenticación.

| Usuario | Contraseña |
|---------|-----------|
| alejandro | alex2024 |
| arturo | artu2024 |

> En producción se sustituirá `AuthService.login()` por una llamada a `POST /auth/login`.

---

## Tests

**70 tests, 70 pasando.**

```bash
# Correr todos los tests
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  npm test -- --watch=false --browsers=ChromeHeadless --no-progress
```

### Cobertura

| Servicio | Tests | Qué cubre |
|----------|-------|-----------|
| `AuthService` | 11 | login, logout, persistencia, canEditUser |
| `TripStoreService` | 13 | CRUD viajes y entradas, filtros, casos borde |
| `ToastService` | 10 | tipos, auto-cierre, timing exacto |
| `ApiService` | 9 | mappers, HTTP mock (sin llamadas reales) |
| Componentes | 27 | creación, inputs requeridos, renders |

---

## CI/CD

### Pipeline `dev` (`ci-dev.yml`)

Se dispara en cada **push o PR a `dev`**:

```
Checkout → Node 20 → npm ci → crear env desde secrets → tests → build staging → artifact
```

### Pipeline `main` (`ci-main.yml`)

Se dispara en cada **push o PR a `main`**:

```
Checkout → Node 20 → npm ci → crear env desde secrets → tests → build producción → artifact
```

> El deploy está preparado pero comentado. Al elegir plataforma (Netlify/Vercel/Firebase), se descomenta el bloque correspondiente.

### Secrets necesarios en GitHub

| Secret | Descripción |
|--------|-------------|
| `API_KEY` | Clave de la API del backend |
| `STAGING_API_URL` | URL del backend de staging |
| `PROD_API_URL` | URL del backend de producción |

Se configuran en: **GitHub → Settings → Secrets and variables → Actions**

---

## Ramas y flujo de trabajo

```
main          ← producción estable
  └── dev     ← integración de features
        ├── feature/nombre-feature
        ├── fix/nombre-fix
        └── feature/tests / feature/ci-cd / ...
```

**Flujo estándar:**
1. Crear rama desde `dev`: `git checkout -b feature/mi-feature`
2. Desarrollar y commitear
3. Push y PR hacia `dev`
4. Cuando `dev` está estable → PR de `dev` → `main`

---

## Backend

- **URL:** `https://traveling-memories-backend.onrender.com`
- **Docs:** `https://traveling-memories-backend.onrender.com/docs`
- **Autenticación:** header `X-API-KEY`

### Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/users` | Lista de usuarios |
| GET | `/users/{id}` | Usuario por ID |
| POST | `/trips` | Crear viaje |
| GET | `/trips/{id}` | Viaje por ID |
| POST | `/trip-entries` | Crear entrada de viaje |

### Endpoints pendientes

| Método | Ruta | Necesario para |
|--------|------|----------------|
| GET | `/trips?user_id=X` | Cargar viajes del perfil |
| GET | `/trip-entries?trip_id=X` | Cargar entradas del viaje |
| PUT | `/trips/{id}` | Editar viaje |
| DELETE | `/trips/{id}` | Eliminar viaje |
| DELETE | `/trip-entries/{id}` | Eliminar entrada |
