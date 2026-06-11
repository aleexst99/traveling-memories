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
  'Pitcairn Islands':                             null,
};

// Banderas obtenidas de Wikimedia para países no disponibles en CountriesNow
const MANUAL_FLAGS = {
  'Bolivia':        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Bolivia.svg/800px-Flag_of_Bolivia.svg.png',
  'DR Congo':       'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/800px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png',
  'Ivory Coast':    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/800px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png',
  'Kosovo':         'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Flag_of_Kosovo.svg/800px-Flag_of_Kosovo.svg.png',
  'Libya':          'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Libya.svg/800px-Flag_of_Libya.svg.png',
  'Micronesia':     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Flag_of_the_Federated_States_of_Micronesia.svg/800px-Flag_of_the_Federated_States_of_Micronesia.svg.png',
  'Moldova':        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Moldova.svg/800px-Flag_of_Moldova.svg.png',
  'North Korea':    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Flag_of_North_Korea.svg/800px-Flag_of_North_Korea.svg.png',
  'North Macedonia':'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Flag_of_North_Macedonia.svg/800px-Flag_of_North_Macedonia.svg.png',
  'Palestine':      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_Palestine.svg/800px-Flag_of_Palestine.svg.png',
  'South Korea':    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/800px-Flag_of_South_Korea.svg.png',
  'Tanzania':       'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flag_of_Tanzania.svg/800px-Flag_of_Tanzania.svg.png',
  'Western Sahara': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg/800px-Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg.png',
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

    // Fallback con URL manual de Wikimedia
    if (!flagUrl && name in MANUAL_FLAGS) {
      flagUrl = MANUAL_FLAGS[name] ?? '';
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
