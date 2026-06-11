// Copia este fichero como environment.ts (desarrollo) o environment.local.ts
// y rellena los valores reales. NUNCA subas ficheros con credenciales reales.
//
// Para producción (Vercel) los valores se inyectan como variables de entorno:
//   API_URL                  → URL base del backend
//   API_KEY                  → X-API-KEY para el backend
//   CLOUDINARY_CLOUD_NAME    → Cloud name de Cloudinary
//   CLOUDINARY_UPLOAD_PRESET → Upload preset unsigned de Cloudinary

export const environment = {
  production: false,
  apiUrl: '/api',
  apiKey: 'YOUR_API_KEY_HERE',
  cloudinaryCloudName: 'YOUR_CLOUD_NAME',
  cloudinaryUploadPreset: 'YOUR_UPLOAD_PRESET',
  geoDbApiKey: 'YOUR_RAPIDAPI_KEY_HERE',  // GeoDB Cities — rapidapi.com
};
