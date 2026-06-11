/**
 * fetch-country-names-es.js
 *
 * Actualiza los nombres de países en countries.json al español
 * usando la API de RestCountries (translations.spa.common).
 * También traduce las regiones al español.
 *
 * Uso:
 *   node scripts/fetch-country-names-es.js
 *
 * Después de ejecutarlo, vuelve a ejecutar fetch-flags.js para
 * actualizar las claves del mapa de banderas.
 */

const fs   = require('fs');
const path = require('path');

const COUNTRIES_PATH = path.join(__dirname, '../src/assets/countries.json');
const API_URL = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json';

const REGION_ES = {
  'Africa':   'África',
  'Americas': 'América',
  'Asia':     'Asia',
  'Europe':   'Europa',
  'Oceania':  'Oceanía',
  'Antarctic':'Antártida',
};

// Correcciones manuales para nombres que la API da mal o muy largos
const NAME_OVERRIDES = {
  'United States':                               'Estados Unidos',
  'United Kingdom':                              'Reino Unido',
  'United Arab Emirates':                        'Emiratos Árabes Unidos',
  'Russia':                                      'Rusia',
  'South Korea':                                 'Corea del Sur',
  'North Korea':                                 'Corea del Norte',
  'DR Congo':                                    'República Democrática del Congo',
  'Republic of the Congo':                       'República del Congo',
  'Ivory Coast':                                 'Costa de Marfil',
  'Czechia':                                     'Chequia',
  'North Macedonia':                             'Macedonia del Norte',
  'Vatican City':                                'Ciudad del Vaticano',
  'São Tomé and Príncipe':                       'Santo Tomé y Príncipe',
  'Saint Helena, Ascension and Tristan da Cunha':'Santa Elena',
  'French Southern and Antarctic Lands':         'Tierras Australes Francesas',
  'South Georgia':                               'Georgia del Sur',
  'Svalbard and Jan Mayen':                      'Svalbard y Jan Mayen',
  'Pitcairn Islands':                            'Islas Pitcairn',
  'Caribbean Netherlands':                       'Países Bajos Caribeños',
  'Åland Islands':                               'Islas Åland',
  'Western Sahara':                              'Sáhara Occidental',
  'Eswatini':                                    'Esuatini',
  'Palestine':                                   'Palestina',
  'Kosovo':                                      'Kosovo',
  'Micronesia':                                  'Micronesia',
  'Bolivia':                                     'Bolivia',
  'Moldova':                                     'Moldavia',
  'Tanzania':                                    'Tanzania',
};

async function fetchNames() {
  console.log('Obteniendo nombres en español de RestCountries...');

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
  const data = await res.json();

  // Mapa ccn3 → nombre en español
  const nameMap = {};
  for (const c of data) {
    const spa = c.translations?.spa?.common;
    const ccn3 = c.ccn3;
    if (spa && ccn3) {
      nameMap[ccn3] = spa;
    }
  }

  console.log(`Traducciones recibidas: ${Object.keys(nameMap).length}`);

  const countries = JSON.parse(fs.readFileSync(COUNTRIES_PATH, 'utf-8'));

  let translated = 0;
  let manual     = 0;
  let missing    = 0;

  const updated = countries.map(country => {
    const nameEn  = country.name.common;
    const region  = REGION_ES[country.region] ?? country.region;

    // 1. Override manual
    if (nameEn in NAME_OVERRIDES) {
      manual++;
      return { ...country, name: { ...country.name, common: NAME_OVERRIDES[nameEn] }, region };
    }

    // 2. Traducción de la API por ccn3
    const nameEs = nameMap[country.ccn3];
    if (nameEs) {
      translated++;
      return { ...country, name: { ...country.name, common: nameEs }, region };
    }

    // 3. Sin traducción
    missing++;
    console.warn(`  ⚠ Sin traducción: ${nameEn}`);
    return { ...country, region };
  });

  fs.writeFileSync(COUNTRIES_PATH, JSON.stringify(updated, null, 2), 'utf-8');

  console.log(`\nListo.`);
  console.log(`  Traducidos (API):   ${translated}`);
  console.log(`  Traducidos (manual):${manual}`);
  console.log(`  Sin traducción:     ${missing}`);
  console.log(`  Guardado en:        src/assets/countries.json`);
  console.log(`\n⚠ Ejecuta ahora: node scripts/fetch-flags.js`);
}

fetchNames().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
