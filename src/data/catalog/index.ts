import { MACRO_NEEDS } from './macroNeeds';
import { MODULES } from './modules';
import { MICRO_NEEDS } from './microNeeds';
import { SERVICES, SERVICE_MODULE_RELATIONS } from './services';
import { PACKAGES, PACKAGE_SERVICE_RELATIONS } from './packages';
import { QUESTIONS } from './questions';
import { DIGITAL_ACTIVITIES } from './digitalActivities';
import { GYM_PARTNERS, WEEKLY_MISSIONS, REWARD_CATALOGUE } from './fitness';
import { RECIPES, COMMUNITY_CHALLENGES } from './content';
import type {
  MacroNeed, Module, MicroNeed, Service, Package, ModuleId, PackageId,
} from '@/types';

export const CATALOG_VERSION = '2026.11-demo';
export const RULE_VERSION = 'rules-v1.0.0';

// re-export the raw catalog arrays so engine + UI can import them by name
export { MACRO_NEEDS } from './macroNeeds';
export { MODULES } from './modules';
export { MICRO_NEEDS } from './microNeeds';
export { SERVICES, SERVICE_MODULE_RELATIONS } from './services';
export { PACKAGES, PACKAGE_SERVICE_RELATIONS } from './packages';
export { QUESTIONS } from './questions';
export { DIGITAL_ACTIVITIES } from './digitalActivities';
export { GYM_PARTNERS, WEEKLY_MISSIONS, REWARD_CATALOGUE } from './fitness';
export { RECIPES, COMMUNITY_CHALLENGES } from './content';

export const catalog = {
  macroNeeds: MACRO_NEEDS,
  modules: MODULES,
  microNeeds: MICRO_NEEDS,
  services: SERVICES,
  serviceModuleRelations: SERVICE_MODULE_RELATIONS,
  packages: PACKAGES,
  packageServiceRelations: PACKAGE_SERVICE_RELATIONS,
  questions: QUESTIONS,
  digitalActivities: DIGITAL_ACTIVITIES,
  gymPartners: GYM_PARTNERS,
  weeklyMissions: WEEKLY_MISSIONS,
  rewardCatalogue: REWARD_CATALOGUE,
  recipes: RECIPES,
  communityChallenges: COMMUNITY_CHALLENGES,
};

/* -------------------------------- lookups --------------------------------- */
const byId = <T extends { id: string }>(arr: T[]) => {
  const m = new Map<string, T>();
  for (const x of arr) m.set(x.id, x);
  return m;
};

export const macroNeedById = byId(MACRO_NEEDS);
export const moduleById = byId(MODULES);
export const microNeedById = byId(MICRO_NEEDS);
export const serviceById = byId(SERVICES);
export const packageById = byId(PACKAGES);

export const getMacroNeed = (id: string): MacroNeed | undefined => macroNeedById.get(id);
export const getModule = (id: string): Module | undefined => moduleById.get(id);
export const getMicroNeed = (id: string): MicroNeed | undefined => microNeedById.get(id);
export const getService = (id: string): Service | undefined => serviceById.get(id);
export const getPackage = (id: string): Package | undefined => packageById.get(id);

export const servicesForModule = (moduleId: ModuleId): Service[] =>
  SERVICE_MODULE_RELATIONS.filter((r) => r.moduleId === moduleId)
    .map((r) => serviceById.get(r.serviceId))
    .filter((s): s is Service => !!s);

export const servicesForMicroNeed = (microNeedId: string): Service[] =>
  SERVICES.filter((s) => s.microNeedIds.includes(microNeedId));

export const modulesForService = (serviceId: string): ModuleId[] =>
  SERVICE_MODULE_RELATIONS.filter((r) => r.serviceId === serviceId).map((r) => r.moduleId);

export const packageRelationsFor = (packageId: PackageId) =>
  PACKAGE_SERVICE_RELATIONS.filter((r) => r.packageId === packageId);

export const packagesContainingService = (serviceId: string) =>
  PACKAGE_SERVICE_RELATIONS.filter((r) => r.serviceId === serviceId);

/* ---------------------------- integrity checker --------------------------- */
export interface CatalogIssue {
  level: 'error' | 'warn';
  message: string;
}

/**
 * Referential-integrity validation — the thing that actually matters when the
 * 193-service xlsx is imported. Catches dangling ids, duplicate service ids,
 * micro-needs with no serviceable path, etc.
 */
export function validateCatalog(): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const err = (m: string) => issues.push({ level: 'error', message: m });
  const warn = (m: string) => issues.push({ level: 'warn', message: m });

  // duplicate service ids
  const seen = new Set<string>();
  for (const s of SERVICES) {
    if (seen.has(s.id)) err(`Duplicate Service ID: ${s.id}`);
    seen.add(s.id);
    if (!macroNeedById.has(s.macroNeedId)) err(`Service ${s.id} -> unknown macro need ${s.macroNeedId}`);
    for (const mn of s.microNeedIds) if (!microNeedById.has(mn)) err(`Service ${s.id} -> unknown micro-need ${mn}`);
  }
  // module count fixed at 24
  if (MODULES.length !== 24) err(`Expected 24 modules, found ${MODULES.length}`);
  if (PACKAGES.length !== 9) err(`Expected 9 packages, found ${PACKAGES.length}`);

  // service-module relations
  for (const r of SERVICE_MODULE_RELATIONS) {
    if (!serviceById.has(r.serviceId)) err(`ServiceModuleRelation -> unknown service ${r.serviceId}`);
    if (!moduleById.has(r.moduleId)) err(`ServiceModuleRelation -> unknown module ${r.moduleId}`);
  }
  // package-service relations
  for (const r of PACKAGE_SERVICE_RELATIONS) {
    if (!packageById.has(r.packageId)) err(`PackageServiceRelation -> unknown package ${r.packageId}`);
    if (!serviceById.has(r.serviceId)) err(`PackageServiceRelation -> unknown service ${r.serviceId}`);
  }
  // micro-needs reachable by a service
  for (const mn of MICRO_NEEDS) {
    if (servicesForMicroNeed(mn.id).length === 0) warn(`Micro-need ${mn.id} has no serviceable path yet`);
    if (!macroNeedById.has(mn.macroNeedId)) err(`Micro-need ${mn.id} -> unknown macro need`);
    for (const m of mn.moduleIds) if (!moduleById.has(m)) err(`Micro-need ${mn.id} -> unknown module ${m}`);
  }
  // questions reference real micro-needs
  for (const q of QUESTIONS) {
    for (const o of q.options ?? []) {
      for (const nw of o.needWeights ?? []) {
        if (!microNeedById.has(nw.microNeedId)) err(`Question ${q.id} option ${o.id} -> unknown micro-need ${nw.microNeedId}`);
      }
    }
  }
  return issues;
}
