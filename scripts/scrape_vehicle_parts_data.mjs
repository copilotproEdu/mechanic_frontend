import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public', 'data');

const PRIORITY_MAKES = [
  'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Volkswagen',
  'Audi', 'Lexus', 'Mazda', 'Subaru', 'Mitsubishi', 'Peugeot', 'Renault', 'Volvo', 'Land Rover', 'Jeep',
  'Suzuki', 'Isuzu', 'Acura', 'Infiniti', 'Porsche', 'Jaguar', 'MINI', 'Fiat', 'Skoda', 'SEAT'
];

const FALLBACK_MAKE_MODELS = {
  Toyota: ['Corolla', 'Camry', 'RAV4', 'Highlander', 'Land Cruiser', 'Yaris', 'Prius', 'Hilux', 'Tacoma', 'Tundra'],
  Honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'City', 'Fit', 'Ridgeline', 'Odyssey'],
  Nissan: ['Altima', 'Sentra', 'Maxima', 'X-Trail', 'Rogue', 'Pathfinder', 'Frontier', 'Patrol', 'Navara'],
  Hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona', 'Accent', 'Palisade'],
  Kia: ['Rio', 'Cerato', 'Optima', 'Sorento', 'Sportage', 'Seltos', 'Picanto'],
  Ford: ['Focus', 'Fiesta', 'Fusion', 'Escape', 'Explorer', 'Ranger', 'F-150', 'Mustang'],
  Chevrolet: ['Spark', 'Malibu', 'Cruze', 'Equinox', 'Tahoe', 'Silverado'],
  BMW: ['1 Series', '3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS'],
  Volkswagen: ['Polo', 'Golf', 'Jetta', 'Passat', 'Tiguan', 'Touareg', 'Amarok'],
  Audi: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
  Lexus: ['IS', 'ES', 'GS', 'RX', 'NX', 'LX'],
  Mazda: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-9', 'BT-50'],
  Subaru: ['Impreza', 'Legacy', 'Forester', 'Outback', 'XV', 'WRX'],
  Mitsubishi: ['Lancer', 'Outlander', 'ASX', 'Pajero', 'Triton'],
  Peugeot: ['208', '308', '3008', '5008', 'Partner'],
  Renault: ['Clio', 'Megane', 'Kadjar', 'Koleos', 'Duster'],
  Volvo: ['S60', 'S90', 'XC40', 'XC60', 'XC90'],
  'Land Rover': ['Defender', 'Discovery', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque'],
  Jeep: ['Wrangler', 'Cherokee', 'Grand Cherokee', 'Compass', 'Renegade'],
  Suzuki: ['Swift', 'Baleno', 'Vitara', 'Jimny', 'Ertiga'],
  Isuzu: ['D-Max', 'MU-X'],
  Acura: ['ILX', 'TLX', 'RDX', 'MDX'],
  Infiniti: ['Q50', 'Q60', 'QX50', 'QX60', 'QX80'],
  Porsche: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  Jaguar: ['XE', 'XF', 'F-Pace', 'E-Pace', 'I-Pace'],
  MINI: ['Cooper', 'Countryman', 'Clubman'],
  Fiat: ['500', 'Panda', 'Tipo'],
  Skoda: ['Fabia', 'Octavia', 'Superb', 'Kodiaq'],
  SEAT: ['Ibiza', 'Leon', 'Ateca', 'Arona'],
};

const FALLBACK_PARTS = [
  'Oil Filter', 'Air Filter', 'Fuel Filter', 'Cabin Air Filter', 'Spark Plug', 'Ignition Coil',
  'Brake Pad', 'Brake Disc', 'Brake Caliper', 'Brake Fluid', 'Timing Belt', 'Serpentine Belt',
  'Water Pump', 'Radiator', 'Coolant', 'Thermostat', 'Fuel Pump', 'Fuel Injector', 'Alternator',
  'Starter Motor', 'Battery', 'Headlight Bulb', 'Tail Light Bulb', 'Shock Absorber', 'Strut',
  'Control Arm', 'Tie Rod End', 'Ball Joint', 'Wheel Bearing', 'CV Joint', 'Clutch Plate',
  'Clutch Release Bearing', 'Transmission Oil', 'Engine Oil', 'Power Steering Fluid', 'AC Compressor',
  'Condenser', 'Evaporator', 'Mass Air Flow Sensor', 'Oxygen Sensor', 'Catalytic Converter',
  'Muffler', 'Wiper Blade', 'Window Regulator', 'Door Handle', 'Side Mirror', 'Wheel Hub',
  'Engine Mount', 'Gearbox Mount', 'Suspension Bush', 'Stabilizer Link', 'Rack End', 'Steering Rack',
  'Throttle Body', 'EGR Valve', 'Glow Plug', 'Piston Ring', 'Cylinder Head Gasket', 'Oil Pump'
];

function uniqueSorted(items) {
  return Array.from(new Set(items.filter(Boolean).map((item) => String(item).trim()))).sort((a, b) => a.localeCompare(b));
}

function yearRange(start = 2005, end = new Date().getFullYear()) {
  const years = [];
  for (let year = start; year <= end; year += 1) years.push(String(year));
  return years;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

function titleize(value) {
  return String(value)
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => {
      if (/^[0-9a-z]{1,3}$/i.test(part)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(' ')
    .trim();
}

function parseXmlLocs(xmlText) {
  const locations = [];
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match = locRegex.exec(xmlText);
  while (match) {
    locations.push(match[1]);
    match = locRegex.exec(xmlText);
  }
  return locations;
}

async function fetchEdmundsSitemapUrls() {
  const indexCandidates = [
    'https://www.edmunds.com/sitemap.xml',
    'https://www.edmunds.com/sitemap_index.xml',
    'https://www.edmunds.com/sitemaps/sitemap_index.xml',
  ];

  let sitemapUrls = [];
  for (const indexUrl of indexCandidates) {
    try {
      const xml = await fetchText(indexUrl);
      const locs = parseXmlLocs(xml);
      if (locs.length > 0) {
        sitemapUrls = locs;
        break;
      }
    } catch {
      // try next candidate
    }
  }

  if (sitemapUrls.length === 0) {
    return [];
  }

  const relevantSitemaps = sitemapUrls.filter((url) => {
    const lower = url.toLowerCase();
    return lower.includes('make') || lower.includes('model') || lower.includes('car') || lower.includes('vehicle');
  });

  const selected = (relevantSitemaps.length ? relevantSitemaps : sitemapUrls).slice(0, 20);
  const pageUrls = [];

  for (const sitemapUrl of selected) {
    try {
      const xml = await fetchText(sitemapUrl);
      pageUrls.push(...parseXmlLocs(xml));
    } catch {
      // ignore bad sitemap
    }
  }

  return uniqueSorted(pageUrls.filter((url) => url.includes('edmunds.com')));
}

function extractMakeModelYearFromUrl(url) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length < 2) return null;

    const noise = new Set([
      'car-reviews', 'new-cars', 'used-cars', 'inventory', 'research-cars',
      'sell-car', 'buy-car', 'dealerships', 'appraisal', 'best-cars'
    ]);

    const clean = segments.filter((s) => !noise.has(s.toLowerCase()));
    if (clean.length < 2) return null;

    const rawMake = clean[0];
    const rawModel = clean[1];
    const yearSegment = clean.find((s) => /^20\d{2}$/.test(s));

    if (!rawMake || !rawModel) return null;

    const make = titleize(rawMake);
    const model = titleize(rawModel);

    if (!make || !model || make.length < 2 || model.length < 1) return null;

    return {
      make,
      model,
      year: yearSegment || null,
    };
  } catch {
    return null;
  }
}

async function buildMakeModelYearDataset() {
  const urls = await fetchEdmundsSitemapUrls();
  const map = new Map();

  for (const url of urls) {
    const parsed = extractMakeModelYearFromUrl(url);
    if (!parsed) continue;
    const { make, model, year } = parsed;

    if (!map.has(make)) {
      map.set(make, { models: new Set(), years: new Set(yearRange(2005)) });
    }

    map.get(make).models.add(model);
    if (year) map.get(make).years.add(year);
  }

  const entries = Array.from(map.entries()).map(([make, payload]) => ({
    make,
    models: uniqueSorted(Array.from(payload.models)),
    years: uniqueSorted(Array.from(payload.years)),
  }));

  const normalizedMap = new Map(entries.map((entry) => [entry.make.toLowerCase().replace(/[^a-z0-9]/g, ''), entry]));
  const prioritized = [];
  for (const preferredMake of PRIORITY_MAKES) {
    const hit = normalizedMap.get(preferredMake.toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (hit) prioritized.push(hit);
  }

  const prioritizedSet = new Set(prioritized.map((x) => x.make));
  const remainder = entries.filter((entry) => !prioritizedSet.has(entry.make));
  const results = [...prioritized, ...remainder];

  if (results.length === 0) {
    console.warn('Edmunds sitemap parse returned no entries; falling back to curated make/model catalog.');
    return Object.entries(FALLBACK_MAKE_MODELS).map(([make, models]) => ({
      make,
      models: uniqueSorted(models),
      years: yearRange(2005),
    }));
  }

  return results.slice(0, 250);
}

function buildPartsDataset() {
  return uniqueSorted(FALLBACK_PARTS);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const [makeModelYears, parts] = await Promise.all([
    buildMakeModelYearDataset(),
    Promise.resolve(buildPartsDataset()),
  ]);

  const makesPath = path.join(OUTPUT_DIR, 'makes_models.json');
  const partsPath = path.join(OUTPUT_DIR, 'parts.json');

  await writeFile(makesPath, `${JSON.stringify(makeModelYears, null, 2)}\n`, 'utf8');
  await writeFile(partsPath, `${JSON.stringify(parts, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${makeModelYears.length} make entries to ${makesPath}`);
  console.log(`Wrote ${parts.length} parts to ${partsPath}`);
}

main().catch((error) => {
  console.error('Data scrape failed:', error.message);
  process.exit(1);
});
