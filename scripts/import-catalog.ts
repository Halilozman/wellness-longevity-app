/**
 * import-catalog.ts — Imports the real ALZ catalog (193 services) from
 * `ALZ_Servis_Bazli_Uygulama_Plani.xlsx` into JSON the app can load.
 *
 * Usage:
 *   npm run import:catalog -- "C:/path/ALZ_Servis_Bazli_Uygulama_Plani.xlsx"
 *
 * It reads the named tabs, maps columns -> the app's catalog structures,
 * validates referential integrity, and writes JSON to src/data/catalog/imported/.
 * See docs/xlsx-import.md for the column-mapping contract and how to wire the
 * JSON into the app. Column names below are a BEST-EFFORT default — adjust the
 * COLMAP constants to match the real workbook headers.
 */
import * as XLSX from 'xlsx';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../src/data/catalog/imported');

/** Tab names in the workbook (edit to match the real file). */
const SHEETS = {
  serviceCards: 'Service Cards',
  moduleFit: 'Module Package Fit',
  teamsNeeds: 'Teams and Needs',
  packages: 'Packages',
};

/** Column header -> field mapping (edit to match the real file). */
const COLMAP = {
  service: {
    id: 'Service ID', nameTr: 'Service Name TR', nameEn: 'Service Name EN',
    descTr: 'Description TR', macroNeedId: 'Macro Need', microNeedIds: 'Micro Needs',
    deliveryMode: 'Delivery', phase: 'Phase', status: 'Status', needsProfessional: 'Professional',
    demoPrice: 'Price',
  },
  moduleRel: { serviceId: 'Service ID', moduleId: 'Module ID' },
  packageRel: { packageId: 'Package ID', serviceId: 'Service ID', inclusion: 'Inclusion', group: 'Choose Group' },
};

function sheetToJson(wb: XLSX.WorkBook, name: string): Record<string, unknown>[] {
  const ws = wb.Sheets[name];
  if (!ws) { console.warn(`! Sheet not found: "${name}" — skipped`); return []; }
  return XLSX.utils.sheet_to_json(ws, { defval: '' });
}

const splitList = (v: unknown): string[] =>
  String(v ?? '').split(/[;,|]/).map((s) => s.trim()).filter(Boolean);

function main() {
  const path = process.argv[2];
  if (!path) { console.error('Usage: npm run import:catalog -- <path-to-xlsx>'); process.exit(1); }
  if (!existsSync(path)) { console.error(`File not found: ${path}`); process.exit(1); }

  const wb = XLSX.readFile(path);
  console.log(`Sheets in workbook: ${wb.SheetNames.join(', ')}`);

  const rawServices = sheetToJson(wb, SHEETS.serviceCards);
  const rawModuleFit = sheetToJson(wb, SHEETS.moduleFit);
  const rawPackages = sheetToJson(wb, SHEETS.packages);

  const C = COLMAP;
  const services = rawServices.map((r) => ({
    id: String(r[C.service.id] ?? '').trim(),
    nameTr: String(r[C.service.nameTr] ?? ''),
    nameEn: String(r[C.service.nameEn] ?? ''),
    descTr: String(r[C.service.descTr] ?? ''),
    macroNeedId: String(r[C.service.macroNeedId] ?? ''),
    microNeedIds: splitList(r[C.service.microNeedIds]),
    deliveryMode: String(r[C.service.deliveryMode] ?? 'video'),
    phase: String(r[C.service.phase] ?? 'phase1'),
    status: String(r[C.service.status] ?? 'active'),
    needsProfessional: /^(1|true|yes|evet)$/i.test(String(r[C.service.needsProfessional] ?? '')),
    demoPriceTry: Number(r[C.service.demoPrice]) || undefined,
    isSample: false,
    verified: false,
  })).filter((s) => s.id);

  const serviceModuleRelations = rawModuleFit.map((r) => ({
    serviceId: String(r[C.moduleRel.serviceId] ?? '').trim(),
    moduleId: String(r[C.moduleRel.moduleId] ?? '').trim(),
  })).filter((r) => r.serviceId && r.moduleId);

  const packageServiceRelations = rawPackages.map((r) => ({
    packageId: String(r[C.packageRel.packageId] ?? '').trim(),
    serviceId: String(r[C.packageRel.serviceId] ?? '').trim(),
    inclusion: normalizeInclusion(String(r[C.packageRel.inclusion] ?? '')),
    chooseGroup: String(r[C.packageRel.group] ?? '').trim() || undefined,
  })).filter((r) => r.packageId && r.serviceId);

  // integrity
  const ids = new Set<string>();
  const dupes = services.filter((s) => (ids.has(s.id) ? true : (ids.add(s.id), false)));
  const issues: string[] = [];
  if (dupes.length) issues.push(`Duplicate Service IDs: ${dupes.map((d) => d.id).join(', ')}`);
  for (const r of serviceModuleRelations) if (!ids.has(r.serviceId)) issues.push(`ModuleRel -> unknown service ${r.serviceId}`);
  for (const r of packageServiceRelations) if (!ids.has(r.serviceId)) issues.push(`PackageRel -> unknown service ${r.serviceId}`);

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(resolve(OUT_DIR, 'services.json'), JSON.stringify(services, null, 2));
  writeFileSync(resolve(OUT_DIR, 'serviceModuleRelations.json'), JSON.stringify(serviceModuleRelations, null, 2));
  writeFileSync(resolve(OUT_DIR, 'packageServiceRelations.json'), JSON.stringify(packageServiceRelations, null, 2));

  console.log(`\n✓ Imported ${services.length} services (expected ~193)`);
  console.log(`✓ ${serviceModuleRelations.length} service-module relations`);
  console.log(`✓ ${packageServiceRelations.length} package-service relations`);
  console.log(`→ written to ${OUT_DIR}`);
  if (issues.length) { console.log(`\n⚠ ${issues.length} integrity issue(s):`); issues.slice(0, 20).forEach((i) => console.log('  - ' + i)); }
  console.log('\nNext: see docs/xlsx-import.md to point the catalog loader at these JSON files.');
}

function normalizeInclusion(v: string): string {
  const s = v.toLowerCase();
  if (s.includes('core') || s.includes('çekirdek')) return 'core';
  if (s.includes('choose') || s.includes('seç')) return 'choose_one';
  if (s.includes('option') || s.includes('opsiyon') || s.includes('conditional')) return 'optional';
  return 'not_included';
}

main();
