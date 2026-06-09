/**
 * set-env.js
 *
 * Genera src/environments/environment.prod.ts a partir de las variables
 * de entorno de Vercel (o cualquier CI/CD). Se ejecuta antes de ng build.
 *
 * Variables requeridas en Vercel:
 *   API_URL                  → URL base del backend (sin trailing slash)
 *   API_KEY                  → X-API-KEY para el backend
 *   CLOUDINARY_CLOUD_NAME    → Cloud name de Cloudinary
 *   CLOUDINARY_UPLOAD_PRESET → Upload preset unsigned de Cloudinary
 */

const fs   = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

const missing = [];
const required = ['API_URL', 'API_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_UPLOAD_PRESET'];
required.forEach(k => { if (!process.env[k]) missing.push(k); });

if (missing.length) {
  console.error(`\n❌ Variables de entorno que faltan: ${missing.join(', ')}\n`);
  process.exit(1);
}

const content = `// Auto-generado por scripts/set-env.js — no editar manualmente
export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL}',
  apiKey: '${process.env.API_KEY}',
  cloudinaryCloudName: '${process.env.CLOUDINARY_CLOUD_NAME}',
  cloudinaryUploadPreset: '${process.env.CLOUDINARY_UPLOAD_PRESET}',
};
`;

fs.writeFileSync(target, content, 'utf8');
console.log('✅ environment.prod.ts generado correctamente');
