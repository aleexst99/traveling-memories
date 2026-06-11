/**
 * set-env.js
 *
 * Genera los ficheros de entorno necesarios para el build de producción:
 *   - environment.ts      → base requerida por Angular para resolver imports
 *   - environment.prod.ts → valores reales inyectados por el fileReplacement
 *
 * Variables requeridas en Vercel:
 *   API_URL                  → URL base del backend (sin trailing slash)
 *   API_KEY                  → X-API-KEY para el backend
 *   CLOUDINARY_CLOUD_NAME    → Cloud name de Cloudinary
 *   CLOUDINARY_UPLOAD_PRESET → Upload preset unsigned de Cloudinary
 */

const fs   = require('fs');
const path = require('path');

const envDir = path.join(__dirname, '..', 'src', 'environments');

const required = ['API_URL', 'API_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_UPLOAD_PRESET', 'GEODB_API_KEY'];
const missing  = required.filter(k => !process.env[k]);

if (missing.length) {
  console.error(`\n❌ Variables de entorno que faltan: ${missing.join(', ')}\n`);
  process.exit(1);
}

const prodContent = `// Auto-generado por scripts/set-env.js — no editar manualmente
export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL}',
  apiKey: '${process.env.API_KEY}',
  cloudinaryCloudName: '${process.env.CLOUDINARY_CLOUD_NAME}',
  cloudinaryUploadPreset: '${process.env.CLOUDINARY_UPLOAD_PRESET}',
  geoDbApiKey: '${process.env.GEODB_API_KEY}',
};
`;

// environment.ts debe existir para que Angular resuelva los imports @environments/environment
// Angular lo sustituirá por environment.prod.ts en el build de producción
const baseContent = `// Fichero base — sustituido por environment.prod.ts en producción
export const environment = {
  production: false,
  apiUrl: '/api',
  apiKey: '',
  cloudinaryCloudName: '',
  cloudinaryUploadPreset: '',
  geoDbApiKey: '',
};
`;

fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), prodContent, 'utf8');
fs.writeFileSync(path.join(envDir, 'environment.ts'),      baseContent, 'utf8');

console.log('✅ environment.ts y environment.prod.ts generados correctamente');
