/**
 * fetch-flags.js
 *
 * Enriquece src/assets/countries.json con la URL de la bandera de cada país
 * usando la API gratuita de CountriesNow (sin API key, sin límites).
 *
 * Uso:
 *   node scripts/fetch-flags.js
 *
 * Resultado:
 *   Sobreescribe src/assets/countries.json añadiendo el campo flag_url a
 *   cada país. Si un país no se encuentra en CountriesNow, flag_url queda
 *   como cadena vacía.
 */

const fs   = require('fs');
const path = require('path');

const COUNTRIES_PATH = path.join(__dirname, '../src/assets/countries.json');
const FLAGS_API      = 'https://countriesnow.space/api/v0.1/countries/flag/images';

async function fetchFlags() {
  console.log('Obteniendo banderas de CountriesNow...');

  const res = await fetch(FLAGS_API);
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

  const json = await res.json();
  if (json.error) throw new Error(`API error: ${json.msg}`);

  // Construimos un mapa { nombrePaís → flagUrl }
  const flagMap = {};
  for (const item of json.data) {
    flagMap[item.name] = item.flag;
  }

  console.log(`Banderas recibidas: ${Object.keys(flagMap).length}`);

  // Leemos countries.json actual
  const countries = JSON.parse(fs.readFileSync(COUNTRIES_PATH, 'utf-8'));

  let found   = 0;
  let missing = 0;

  const enriched = countries.map(country => {
    const name    = country.name.common;
    const flagUrl = flagMap[name] ?? '';

    if (flagUrl) {
      found++;
    } else {
      missing++;
      console.warn(`  ⚠ Sin bandera: ${name}`);
    }

    return { ...country, flag_url: flagUrl };
  });

  fs.writeFileSync(COUNTRIES_PATH, JSON.stringify(enriched, null, 2), 'utf-8');

  console.log(`\nListo.`);
  console.log(`  Con bandera:    ${found}`);
  console.log(`  Sin bandera:    ${missing}`);
  console.log(`  Guardado en:    src/assets/countries.json`);
}

fetchFlags().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
