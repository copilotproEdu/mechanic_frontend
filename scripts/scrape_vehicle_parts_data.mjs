import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public', 'data');

const FALLBACK_MAKES = [
  'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Volkswagen',
  'Audi', 'Lexus', 'Mazda', 'Subaru', 'Mitsubishi', 'Peugeot', 'Renault', 'Volvo', 'Land Rover', 'Jeep'
];

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

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function fetchMakes() {
  try {
    const data = await fetchJson('https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json');
    const makes = uniqueSorted((data?.Results || []).map((item) => item.Make_Name));
    return makes.length ? makes : FALLBACK_MAKES;
  } catch (error) {
    console.warn('Failed to fetch makes; using fallback list.');
    return FALLBACK_MAKES;
  }
}

async function fetchModelsForMake(make) {
  try {
    const encodedMake = encodeURIComponent(make);
    const data = await fetchJson(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodedMake}?format=json`);
    const models = uniqueSorted((data?.Results || []).map((item) => item.Model_Name));
    return models.slice(0, 80);
  } catch {
    return [];
  }
}

async function buildMakeModelYearDataset() {
  const makes = await fetchMakes();
  const topMakes = makes.slice(0, 40);
  const years = yearRange(2005);
  const results = [];

  for (const make of topMakes) {
    const models = await fetchModelsForMake(make);
    if (models.length === 0) continue;
    results.push({
      make,
      models,
      years,
    });
  }

  if (results.length === 0) {
    return FALLBACK_MAKES.map((make) => ({
      make,
      models: ['Standard', 'SE', 'Limited'],
      years,
    }));
  }

  return results;
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
