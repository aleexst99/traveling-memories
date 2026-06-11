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
| Imágenes | Cloudinary (upload + transformaciones) |
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
# Edita ambos ficheros con tu API key y configuración de Cloudinary
npm start
```

La app estará disponible en `http://localhost:4200`.

---

## Variables de entorno

Los ficheros de entorno no están en el repositorio. Usa `environment.example.ts` como plantilla:

```ts
export const environment = {
  production: false,
  apiUrl: '/api',                    // proxy local → evita CORS en desarrollo
  apiKey: 'TU_API_KEY',
  cloudinaryCloudName: 'TU_CLOUD',
  cloudinaryUploadPreset: 'TU_PRESET',
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
│   ├── services/
│   │   ├── api.service.ts           # Todas las llamadas al backend
│   │   ├── auth.service.ts          # Autenticación (temporal, hardcodeada)
│   │   ├── cloudinary.service.ts    # Upload y transformación de imágenes
│   │   ├── theme.service.ts         # Modo oscuro/claro global
│   │   └── toast.service.ts         # Notificaciones globales
│   ├── interceptors/
│   │   └── api-key.interceptor.ts   # Inyecta X-API-KEY en cada request
│   └── models/
│       ├── api.models.ts            # Interfaces exactas del backend
│       ├── viajes.model.ts          # Modelos del dominio
│       └── user.model.ts
├── shared/
│   ├── toast/
│   └── back-button/
└── features/
    ├── landing/                     # Página principal + lista usuarios
    ├── login/                       # Formulario de acceso
    ├── mapa-global/                 # Globo 3D con todos los viajes
    └── usuario-perfil/
        ├── perfil-header/           # Avatar, bio, toggle tema
        ├── perfil-mapa/             # Mapa 2D Leaflet del perfil
        ├── perfil-viajes/           # Carrusel de viajes
        ├── viaje-form/              # Modal crear viaje
        └── viajes/
            ├── viaje-detalle/       # Detalle del viaje + entradas
            └── viaje-entrada/       # Formulario de entrada
```

---

## Flujo de datos

Todos los datos se leen directamente de la API en cada carga — no hay estado en memoria entre rutas.

```
Perfil carga
  → forkJoin(getUser, getTripsByUser)
  → forkJoin(getEntriesByTrip × N)    ← enriquece cada viaje con su conteo
  → señal user actualizada → componentes re-renderizan

Viaje detalle carga
  → forkJoin(getTrip, getEntriesByTrip)
  → señales viaje + entradas actualizadas
```

---

## Autenticación

El acceso para crear y editar viajes está restringido a los usuarios del proyecto. El login actual es temporal (hardcodeado en `AuthService`) hasta que se integre `POST /auth/login`.

---

## Modo oscuro

El `ThemeService` aplica la clase `dark` o `light` en `<html>` y persiste la preferencia en `localStorage`. Todos los componentes usan CSS variables (`--bg-page`, `--color-text`, etc.) definidas en `styles.css`. El toggle está en el header del perfil.

---

## Tests

**82 tests, todos pasando.**

| Servicio / Componente | Tests | Qué cubre |
|-----------------------|-------|-----------|
| `AuthService` | 11 | login, logout, persistencia, canEditUser |
| `CloudinaryService` | 6 | avatarUrl, transformaciones, fallback, URLs externas |
| `ToastService` | 10 | tipos, auto-cierre, timing |
| `ApiService` | 9 | mappers, HTTP mock |
| Componentes | 46 | creación, inputs, renders |

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
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary |
| `CLOUDINARY_UPLOAD_PRESET` | Upload preset de Cloudinary |

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
- Autenticación real mediante `POST /auth/login` y `POST /auth/register`
- Internacionalización (i18n) ES/EN
- Keep-alive del backend (cron en GitHub Actions para evitar que Render se duerma)

**Mejoras de experiencia**
- Galería de fotos por viaje o entrada
- Estadísticas del perfil: países visitados, kilómetros recorridos, tiempo total
- Búsqueda y filtrado de viajes por fecha, país o etiqueta
- Vista de línea de tiempo de todos los viajes

**Social**
- Perfiles públicos compartibles por URL
- Valoraciones o comentarios entre usuarios

**Técnico**
- PWA con soporte offline

---

## Backend

- **URL:** `https://traveling-memories-backend.onrender.com`
- **Docs:** `https://traveling-memories-backend.onrender.com/docs`
- **Autenticación:** header `X-API-KEY`

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registro de usuario |
| POST | `/auth/login` | Login |
| GET | `/users` | Lista de usuarios |
| GET | `/users/{id}` | Usuario por ID |
| PUT | `/users/{id}` | Actualizar usuario |
| DELETE | `/users/{id}` | Eliminar usuario |
| POST | `/trips` | Crear viaje |
| GET | `/trips/user/{user_id}` | Viajes de un usuario |
| GET | `/trips/{id}` | Viaje por ID |
| PUT | `/trips/{id}` | Editar viaje |
| DELETE | `/trips/{id}` | Eliminar viaje |
| GET | `/trip-entries/trip/{trip_id}` | Entradas de un viaje |
| POST | `/trip-entries` | Crear entrada |
| GET | `/trip-entries/{id}` | Entrada por ID |
| PUT | `/trip-entries/{id}` | Editar entrada |
| DELETE | `/trip-entries/{id}` | Eliminar entrada |
| GET | `/countries` | Lista de países |
| GET | `/cities` | Lista de ciudades |
