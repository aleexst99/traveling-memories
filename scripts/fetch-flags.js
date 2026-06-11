/**
 * fetch-flags.js
 *
 * Enriquece src/assets/countries.json con la URL de la bandera de cada país.
 * Los nombres en countries.json están en ESPAÑOL (tras ejecutar fetch-country-names-es.js).
 * CountriesNow devuelve las banderas con nombres en INGLÉS, por eso necesitamos
 * el mapa ALIASES: nombre_español → nombre_en_CountriesNow.
 *
 * Uso:
 *   node scripts/fetch-flags.js
 */

const fs   = require('fs');
const path = require('path');

const COUNTRIES_PATH = path.join(__dirname, '../src/assets/countries.json');
const FLAGS_API      = 'https://countriesnow.space/api/v0.1/countries/flag/images';

// Nombre español → nombre en CountriesNow (inglés)
const ALIASES = {
  // Nombres que CountriesNow conoce con otro nombre
  'España':                   'Spain',
  'Francia':                  'France',
  'Alemania':                 'Germany',
  'Italia':                   'Italy',
  'Portugal':                 'Portugal',
  'Países Bajos':             'Netherlands',
  'Bélgica':                  'Belgium',
  'Suiza':                    'Switzerland',
  'Austria':                  'Austria',
  'Suecia':                   'Sweden',
  'Noruega':                  'Norway',
  'Dinamarca':                'Denmark',
  'Finlandia':                'Finland',
  'Polonia':                  'Poland',
  'Hungría':                  'Hungary',
  'Rumania':                  'Romania',
  'Chequia':                  'Czech Republic',
  'Eslovaquia':               'Slovakia',
  'Eslovenia':                'Slovenia',
  'Croacia':                  'Croatia',
  'Bulgaria':                 'Bulgaria',
  'Grecia':                   'Greece',
  'Turquía':                  'Turkey',
  'Rusia':                    'Russia',
  'Ucrania':                  'Ukraine',
  'Bielorrusia':              'Belarus',
  'Reino Unido':              'United Kingdom',
  'Irlanda':                  'Ireland',
  'Islandia':                 'Iceland',
  'Luxemburgo':               'Luxembourg',
  'Mónaco':                   'Monaco',
  'Chipre':                   'Cyprus',
  'Malta':                    'Malta',
  'Lituania':                 'Lithuania',
  'Letonia':                  'Latvia',
  'Estonia':                  'Estonia',
  'Albania':                  'Albania',
  'Serbia':                   'Serbia',
  'Moldavia':                 'Republic of Moldova',
  'Macedonia del Norte':      'Macedonia',
  'Kosovo':                   'Republic of Kosovo',
  'Montenegro':               'Montenegro',
  'Bosnia y Herzegovina':     'Bosnia and Herzegovina',
  'Estados Unidos':           'United States',
  'Canadá':                   'Canada',
  'México':                   'Mexico',
  'Brasil':                   'Brazil',
  'Argentina':                'Argentina',
  'Chile':                    'Chile',
  'Colombia':                 'Colombia',
  'Perú':                     'Peru',
  'Venezuela':                'Venezuela',
  'Bolivia':                  'Bolivia (Plurinational State of)',
  'Ecuador':                  'Ecuador',
  'Paraguay':                 'Paraguay',
  'Uruguay':                  'Uruguay',
  'Panamá':                   'Panama',
  'Cuba':                     'Cuba',
  'República Dominicana':     'Dominican Republic',
  'Haití':                    'Haiti',
  'Guatemala':                'Guatemala',
  'Honduras':                 'Honduras',
  'El Salvador':              'El Salvador',
  'Nicaragua':                'Nicaragua',
  'Costa Rica':               'Costa Rica',
  'China':                    'China',
  'Japón':                    'Japan',
  'Corea del Sur':            'Republic of Korea',
  'Corea del Norte':          "Korea, Democratic People's Republic of",
  'India':                    'India',
  'Pakistán':                 'Pakistan',
  'Bangladés':                'Bangladesh',
  'Tailandia':                'Thailand',
  'Vietnam':                  'Vietnam',
  'Indonesia':                'Indonesia',
  'Filipinas':                'Philippines',
  'Malasia':                  'Malaysia',
  'Singapur':                 'Singapore',
  'Taiwán':                   'Taiwan',
  'Kazajistán':               'Kazakhstan',
  'Uzbekistán':               'Uzbekistan',
  'Afganistán':               'Afghanistan',
  'Irak':                     'Iraq',
  'Irán':                     'Iran',
  'Arabia Saudí':             'Saudi Arabia',
  'Emiratos Árabes Unidos':   'United Arab Emirates',
  'Israel':                   'Israel',
  'Palestina':                'Palestinian Territory',
  'Jordania':                 'Jordan',
  'Siria':                    'Syria',
  'Líbano':                   'Lebanon',
  'Egipto':                   'Egypt',
  'Libia':                    'Libya',
  'Marruecos':                'Morocco',
  'Argelia':                  'Algeria',
  'Túnez':                    'Tunisia',
  'Etiopía':                  'Ethiopia',
  'Kenia':                    'Kenya',
  'Tanzania':                 'United Republic of Tanzania',
  'Sudáfrica':                'South Africa',
  'Nigeria':                  'Nigeria',
  'Ghana':                    'Ghana',
  'Senegal':                  'Senegal',
  'Camerún':                  'Cameroon',
  'Costa de Marfil':          "Côte d'Ivoire",
  'Congo (Rep. Dem.)':        'Democratic Republic of the Congo',
  'Congo':                    'Congo',
  'Ruanda':                   'Rwanda',
  'Angola':                   'Angola',
  'Mozambique':               'Mozambique',
  'Zimbabwe':                 'Zimbabwe',
  'Zambia':                   'Zambia',
  'Sudán':                    'Sudan',
  'Sudán del Sur':            'Sudan',
  'Somalia':                  'Somalia',
  'Uganda':                   'Uganda',
  'Madagascar':               'Madagascar',
  'Namibia':                  'Namibia',
  'Botsuana':                 'Botswana',
  'Suazilandia':              'Swaziland',
  'Esuatini':                 'Swaziland',
  'Malaui':                   'Malawi',
  'Santo Tomé y Príncipe':    'Sao Tome and Principe',
  'Australia':                'Australia',
  'Nueva Zelanda':            'New Zealand',
  'Papúa Nueva Guinea':       'Papua New Guinea',
  'Micronesia':               'Federated States of Micronesia',
  'Ciudad del Vaticano':      'Vatican City State (Holy See)',
  // Territorios — usamos bandera del país principal
  'Samoa Americana':          'United States',
  'Islas Vírgenes del Reino Unido': 'United Kingdom',
  'Caribe Neerlandés':        'Netherlands',
  'Curazao':                  'Netherlands',
  'Guayana Francesa':         'France',
  'Tierras Australes y Antárticas Francesas': 'France',
  'San Bartolomé':            'France',
  'Santa Elena, Ascensión y Tristán de Acuña': 'United Kingdom',
  'San Martín':               'France',
  'Sint Maarten':             'Netherlands',
  'Islas Georgias del Sur y Sandwich del Sur': 'United Kingdom',
  'Islas Svalbard y Jan Mayen': 'Norway',
  'Islas Vírgenes de los Estados Unidos': 'United States',
  'Alandia':                  'Finland',
  'Islas Åland':              'Finland',
  // Más aliases necesarios tras traducción al español
  'Antigua y Barbuda':        'Antigua and Barbuda',
  'Azerbaiyán':               'Azerbaijan',
  'Bahrein':                  'Bahrain',
  'Belice':                   'Belize',
  'Benín':                    'Benin',
  'Bután':                    'Bhutan',
  'Isla Bouvet':              'Bouvet Island',
  'Camboya':                  'Cambodia',
  'Cabo Verde':               'Cape Verde',
  'Islas Caimán':             'Cayman Islands',
  'República Centroafricana': 'Central African Republic',
  'Isla de Navidad':          'Christmas Island',
  'Islas Cocos o Islas Keeling': 'Cocos (Keeling) Islands',
  'Comoras':                  'Comoros',
  'Islas Cook':               'Cook Islands',
  'Guinea Ecuatorial':        'Equatorial Guinea',
  'Islas Malvinas':           'Falkland Islands',
  'Islas Faroe':              'Faroe Islands',
  'Fiyi':                     'Fiji',
  'Polinesia Francesa':       'French Polynesia',
  'Gabón':                    'Gabon',
  'Groenlandia':              'Greenland',
  'Guadalupe':                'Guadeloupe',
  'Guinea-Bisáu':             'Guinea-Bissau',
  'Islas Heard y McDonald':   'Heard Island and McDonald Islands',
  'Isla de Man':              'Isle of Man',
  'Kirguizistán':             'Kyrgyzstan',
  'Macao':                    'Macao',
  'Maldivas':                 'Maldives',
  'Islas Marshall':           'Marshall Islands',
  'Martinica':                'Martinique',
  'Mauricio':                 'Mauritius',
  'Nueva Caledonia':          'New Caledonia',
  'Níger':                    'Niger',
  'Isla de Norfolk':          'Norfolk Island',
  'Islas Marianas del Norte': 'Northern Mariana Islands',
  'Omán':                     'Oman',
  'Catar':                    'Qatar',
  'Reunión':                  'Reunion',
  'San Cristóbal y Nieves':   'Saint Kitts and Nevis',
  'Santa Lucía':              'Saint Lucia',
  'San Martín':               'France',
  'San Pedro y Miquelón':     'France',
  'San Vicente y Granadinas': 'Saint Vincent and the Grenadines',
  'Islas Salomón':            'Solomon Islands',
  'Surinam':                  'Suriname',
  'Tayikistán':               'Tajikistan',
  'Timor Oriental':           'Timor-Leste',
  'Islas Tokelau':            'Tokelau',
  'Trinidad y Tobago':        'Trinidad and Tobago',
  'Turkmenistán':             'Turkmenistan',
  'Islas Turks y Caicos':     'Turks and Caicos Islands',
  'Islas Ultramarinas Menores de Estados Unidos': 'United States Minor Outlying Islands',
  'Wallis y Futuna':          'Wallis and Futuna',
  'Zimbabue':                 'Zimbabwe',
  'Zimbabue':                 'Zimbabwe',
  'Territorio Británico del Océano Índico': 'United Kingdom',
  'Bermudas':                 'United Kingdom',
  // Sin bandera conocida
  'Antártida':                null,
  'Islas Pitcairn':           null,
};

// Banderas de Wikimedia para países no disponibles en CountriesNow
const MANUAL_FLAGS = {
  'Macao':          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Flag_of_Macau.svg/800px-Flag_of_Macau.svg.png',
  'Reunión':        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Flag_of_R%C3%A9union.svg/800px-Flag_of_R%C3%A9union.svg.png',
  'Saint Martin':   'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_France.svg/800px-Flag_of_France.svg.png',
  'Sáhara Occidental': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg/800px-Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg.png',
  'Sahara Occidental': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg/800px-Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg.png',
  'Bolivia':              'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Bolivia.svg/800px-Flag_of_Bolivia.svg.png',
  'Congo (Rep. Dem.)':   'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/800px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png',
  'Costa de Marfil':     'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/800px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png',
  'Kosovo':              'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Flag_of_Kosovo.svg/800px-Flag_of_Kosovo.svg.png',
  'Libia':               'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Libya.svg/800px-Flag_of_Libya.svg.png',
  'Micronesia':          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Flag_of_the_Federated_States_of_Micronesia.svg/800px-Flag_of_the_Federated_States_of_Micronesia.svg.png',
  'Moldavia':            'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Moldova.svg/800px-Flag_of_Moldova.svg.png',
  'Corea del Norte':     'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Flag_of_North_Korea.svg/800px-Flag_of_North_Korea.svg.png',
  'Macedonia del Norte': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Flag_of_North_Macedonia.svg/800px-Flag_of_North_Macedonia.svg.png',
  'Palestina':           'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_Palestine.svg/800px-Flag_of_Palestine.svg.png',
  'Corea del Sur':       'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/800px-Flag_of_South_Korea.svg.png',
  'Tanzania':            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flag_of_Tanzania.svg/800px-Flag_of_Tanzania.svg.png',
  'Sáhara Occidental':   'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg/800px-Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg.png',
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
    let   flagUrl = flagMap[name]; // intento directo con nombre español

    // Alias: nombre español → nombre en CountriesNow
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
