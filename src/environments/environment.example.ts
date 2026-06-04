// ──────────────────────────────────────────────────────────
// INSTRUCCIONES
// ──────────────────────────────────────────────────────────
// Copia el fichero que necesites y rellena YOUR_API_KEY_HERE:
//
//   environment.dev.ts   → desarrollo apuntando al backend en Render
//   environment.prod.ts  → producción
//   environment.local.ts → backend corriendo en tu máquina (localhost:3000)
//
// Ninguno de estos ficheros se sube al repositorio.
// ──────────────────────────────────────────────────────────

// environment.dev.ts
export const environment = {
  production: false,
  apiUrl: '/api',               // proxy local → backend en Render (evita CORS)
  apiKey: 'YOUR_API_KEY_HERE',
  useLocalStorage: false,
};

// environment.prod.ts
// export const environment = {
//   production: true,
//   apiUrl: 'https://traveling-memories-backend.onrender.com',
//   apiKey: 'YOUR_API_KEY_HERE',
//   useLocalStorage: false,
// };

// environment.local.ts
// export const environment = {
//   production: false,
//   apiUrl: '/api',             // proxy → backend en localhost:3000
//   apiKey: 'YOUR_API_KEY_HERE',
//   useLocalStorage: false,
// };
