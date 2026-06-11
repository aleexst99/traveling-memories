/**
 * fetch-flags.js
 *
 * Enriquece src/assets/countries.json con la URL de la bandera de cada país
 * usando la API gratuita de CountriesNow (sin API key, sin límites).
 *
 * Uso:
 *   node scripts/fetch-flags.js
 */

const fs   = require('fs');
const path = require('path');

const COUNTRIES_PATH = path.join(__dirname, '../src/assets/countries.json');
const FLAGS_API      = 'https://countriesnow.space/api/v0.1/countries/flag/images';

// Nombres que difieren entre nuestro countries.json y CountriesNow
const ALIASES = {
  'Bolivia':                                      'Bolivia (Plurinational State of)',
  'Czechia':                                      'Czech Republic',
  'DR Congo':                                     'Democratic Republic of the Congo',
  'Eswatini':                                     'Swaziland',
  'Ivory Coast':                                  "Côte d'Ivoire",
  'Kosovo':                                       'Republic of Kosovo',
  'Micronesia':                                   'Federated States of Micronesia',
  'Moldova':                                      'Republic of Moldova',
  'North Korea':                                  "Korea, Democratic People's Republic of",
  'North Macedonia':                              'Macedonia',
  'Palestine':                                    'Palestinian Territory',
  'Republic of the Congo':                        'Congo',
  'South Korea':                                  'Republic of Korea',
  'South Sudan':                                  'Sudan',
  'Tanzania':                                     'United Republic of Tanzania',
  'Vatican City':                                 'Vatican City State (Holy See)',
  'São Tomé and Príncipe':                        'Sao Tome and Principe',
  // Territorios sin bandera propia — usamos la del país al que pertenecen
  'American Samoa':                               'United States',
  'British Virgin Islands':                       'United Kingdom',
  'Caribbean Netherlands':                        'Netherlands',
  'Curaçao':                                      'Netherlands',
  'French Guiana':                                'France',
  'French Southern and Antarctic Lands':          'France',
  'Saint Barthélemy':                             'France',
  'Saint Helena, Ascension and Tristan da Cunha': 'United Kingdom',
  'Saint Martin':                                 'France',
  'Sint Maarten':                                 'Netherlands',
  'South Georgia':                                'United Kingdom',
  'Svalbard and Jan Mayen':                       'Norway',
  'United States Virgin Islands':                 'United States',
  'Åland Islands':                                'Finland',
  // Sin bandera conocida
  'Antarctica':                                   null,
  'Libya':                                        null,
  'Pitcairn Islands':                             null,
  'Western Sahara':                               null,
};

async function fetchFlags() {
  console.log('Obteniendo banderas de CountriesNow...');

  const res = await fetch(FLAGS_API);
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

  const json = await res.json();
  if (json.error) throw new Error(`API error: ${json.msg}`);

  const flagMap = {};
  for (const item of json.data) {
    flagMap[item.name] = item.flag;
  }

  console.log(`Banderas recibidas: ${Object.keys(flagMap).length}`);

  const countries = JSON.parse(fs.readFileSync(COUNTRIES_PATH, 'utf-8'));

  let found   = 0;
  let missing = 0;

  const enriched = countries.map(country => {
    const name    = country.name.common;
    let   flagUrl = flagMap[name];

    if (!flagUrl && name in ALIASES) {
      const alias = ALIASES[name];
      flagUrl = alias ? (flagMap[alias] ?? '') : '';
    }

    flagUrl = flagUrl ?? '';

    if (flagUrl) found++;
    else {
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
