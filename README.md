# Traveling Memories

[![CI — Main](https://github.com/aleexst99/traveling-memories/actions/workflows/ci-main.yml/badge.svg)](https://github.com/aleexst99/traveling-memories/actions/workflows/ci-main.yml)
[![CI — Dev](https://github.com/aleexst99/traveling-memories/actions/workflows/ci-dev.yml/badge.svg)](https://github.com/aleexst99/traveling-memories/actions/workflows/ci-dev.yml)

Aplicación web para registrar recuerdos de viaje. Los usuarios pueden añadir países visitados, crear entradas por visita y explorar destinos en un globo 3D interactivo.

---

## Stack

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

## Instalación

**Requisitos:** Node.js 20+, npm 9+

```bash
git clone https://github.com/aleexst99/traveling-memories.git
cd traveling-memories/traveling-memories
npm install
cp src/environments/environment.example.ts src/environments/environment.ts
cp proxy.conf.example.json proxy.conf.json
# Edita ambos ficheros con tu API key
npm start
```

La app estará disponible en `http://localhost:4200`.

---

## Variables de entorno

Los ficheros de entorno no están en el repositorio. Usa `environment.example.ts` como plantilla:

```ts
export const environment = {
  production: false,
  apiUrl: '/api',       // proxy local → evita CORS en desarrollo
  apiKey: 'TU_API_KEY',
  useLocalStorage: false,
};
```

El fichero `proxy.conf.json` redirige `localhost:4200/api/*` al backend para evitar CORS en desarrollo. En producción el backend gestiona CORS directamente.

---

## Comandos

```bash
npm start                                                                    # servidor de desarrollo con proxy
npm run build                                                                # build de producción
npm run build -- --configuration development                                 # build de desarrollo
npm test -- --watch=false --browsers=ChromeHeadless --no-progress            # tests en CI
```

---

## Arquitectura

```
src/app/
├── core/
│   ├── api.service.ts           # Todas las llamadas al backend
│   ├── auth.service.ts          # Autenticación
│   ├── trip-store.service.ts    # Estado en memoria (viajes y entradas)
│   ├── toast.service.ts         # Notificaciones globales
│   ├── api-key.interceptor.ts   # Inyecta X-API-KEY en cada request
│   └── models/api.models.ts     # Interfaces del backend
├── shared/
│   └── toast/
└── features/
    ├── landing/                 # Página principal + lista usuarios
    ├── login/                   # Formulario de acceso
    ├── mapa-global/             # Globo 3D con todos los viajes
    └── usuario-perfil/
        ├── perfil-header/
        ├── perfil-mapa/
        ├── perfil-viajes/
        ├── viaje-form/          # Modal crear viaje
        └── viajes/
            ├── viaje-detalle/
            └── viaje-entrada/
```

---

## Flujo de datos

```
ViajeFormComponent
  → ApiService.createTrip()  →  POST /trips  →  Backend
  → TripStoreService.addOrUpdateTrip()        ← estado en sesión
  → Router navega a /user/:id/viaje/:viajeId
  → ViajeDetalleComponent carga desde TripStoreService
```

> `TripStoreService` mantiene estado en memoria porque el backend aún no expone `GET /trips?user_id` ni `GET /trip-entries?trip_id`. Cuando estén disponibles, se sustituirá por llamadas directas a la API.

---

## Autenticación

El acceso para crear y editar viajes está restringido a los usuarios del proyecto. El login actual es temporal (hardcodeado en `AuthService`) hasta que el backend implemente `POST /auth/login`.

---

## Tests

70 tests, todos pasando.

| Servicio | Tests | Qué cubre |
|----------|-------|-----------|
| `AuthService` | 11 | login, logout, persistencia, canEditUser |
| `TripStoreService` | 13 | CRUD viajes y entradas, filtros, casos borde |
| `ToastService` | 10 | tipos, auto-cierre, timing |
| `ApiService` | 9 | mappers, HTTP mock |
| Componentes | 27 | creación, inputs, renders |

---

## CI/CD

Dos pipelines en `.github/workflows/`:

- **`ci-dev.yml`** — se dispara en push/PR a `dev`: tests + build staging
- **`ci-main.yml`** — se dispara en push/PR a `main`: tests + build producción

Secrets necesarios en GitHub Actions:

| Secret | Descripción |
|--------|-------------|
| `API_KEY` | Clave de la API del backend |
| `STAGING_API_URL` | URL del backend de staging |
| `PROD_API_URL` | URL del backend de producción |

El bloque de deploy está preparado pero comentado. Se descomenta al elegir plataforma (Vercel/Netlify/Firebase).

---

## Ramas

```
main  ← producción estable
  └── dev  ← integración
        ├── feature/...
        └── fix/...
```

Flujo: rama desde `dev` → PR a `dev` → cuando `dev` está estable → PR a `main`.

---

## Futuras implementaciones

**Funcionalidad pendiente**
- Autenticación real mediante `POST /auth/login` en el backend
- Cargar viajes y entradas desde la API, eliminando el estado en memoria
- Editar y eliminar viajes y entradas

**Mejoras de experiencia**
- Galería de fotos por viaje o entrada
- Estadísticas del perfil: países visitados, kilómetros recorridos, tiempo total
- Búsqueda y filtrado de viajes por fecha, país o etiqueta
- Vista de línea de tiempo de todos los viajes

**Social**
- Perfiles públicos compartibles por URL
- Explorar viajes de otros usuarios desde el globo 3D
- Valoraciones o comentarios entre usuarios

**Técnico**
- PWA con soporte offline
- Modo oscuro
- Internacionalización (i18n)

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
| POST | `/trip-entries` | Crear entrada |

### Endpoints pendientes

| Método | Ruta | Necesario para |
|--------|------|----------------|
| GET | `/trips?user_id=X` | Cargar viajes del perfil |
| GET | `/trip-entries?trip_id=X` | Cargar entradas del viaje |
| PUT | `/trips/{id}` | Editar viaje |
| DELETE | `/trips/{id}` | Eliminar viaje |
| DELETE | `/trip-entries/{id}` | Eliminar entrada |
