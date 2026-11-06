import type {
  ConfirmedNeed, ScoredNeed, RecommendationCard, OfferKind, PackageId, Service,
} from '@/types';
import {
  RULE_VERSION, getMicroNeed, getModule, getPackage, servicesForMicroNeed,
  packageRelationsFor, PACKAGES, servicesForModule,
} from '@/data/catalog';
import type { AssessmentSignals } from './assessment';
import { coverageForPackage, coverageForServiceSet, offerFitScore } from './scoring';

export const RECOMMEND_VERSION = RULE_VERSION;

/** confirmed needs in priority order (1,2,3 ... then unranked 0 last) */
export function orderConfirmed(confirmed: ConfirmedNeed[]): ConfirmedNeed[] {
  return [...confirmed].sort((a, b) => {
    const pa = a.priority === 0 ? 99 : a.priority;
    const pb = b.priority === 0 ? 99 : b.priority;
    return pa - pb;
  });
}

/** best bookable service for a micro-need (active + verified preferred). */
function bestServiceForNeed(needId: string): Service | undefined {
  const all = servicesForMicroNeed(needId);
  const active = all.filter((s) => s.status === 'active');
  const pool = active.length ? active : all;
  return [...pool].sort((a, b) =>
    Number(b.verified) - Number(a.verified) || Number(!!b.demoPriceTry) - Number(!!a.demoPriceTry),
  )[0];
}

interface PkgFit { packageId: PackageId; coverage: ReturnType<typeof coverageForPackage>; fit: number; }

function rankPackages(confirmedIds: string[]): PkgFit[] {
  return PACKAGES.map((p) => {
    const coverage = coverageForPackage(p.id, confirmedIds);
    return { packageId: p.id, coverage, fit: offerFitScore(coverage, confirmedIds.length) };
  })
    .filter((x) => x.coverage.core.length + x.coverage.optional.length + x.coverage.chooseOne.length > 0)
    .sort((a, b) => b.fit - a.fit || b.coverage.core.length - a.coverage.core.length);
}

const PK05_START = new Set(['C02', 'C05', 'SMPL_STRESS']); // PK05 choose_one group "start"

/* ------------------------------ card builders ----------------------------- */

function singleCard(needId: string, confirmedIds: string[], tier: RecommendationCard['tier']): RecommendationCard | null {
  const svc = bestServiceForNeed(needId);
  if (!svc) return null;
  const cov = coverageForServiceSet([svc.id], confirmedIds);
  const need = getMicroNeed(needId);
  return {
    id: `single-${svc.id}`, tier, kind: 'single_service', refId: svc.id,
    titleTr: svc.nameTr, matchedMicroNeeds: cov.core, serviceIds: [svc.id], coverage: cov,
    reasonTr: `“${need?.shortTr ?? ''}” önceliğini doğrudan karşılayan tekil hizmet.`,
    fitScore: offerFitScore(cov, confirmedIds.length), ruleVersion: RULE_VERSION,
  };
}

function easyStartCard(needId: string, confirmedIds: string[], tier: RecommendationCard['tier']): RecommendationCard | null {
  const svc = bestServiceForNeed(needId);
  if (!svc || !PK05_START.has(svc.id)) return null;
  const cov = coverageForServiceSet([svc.id], confirmedIds);
  const need = getMicroNeed(needId);
  return {
    id: `easy-${svc.id}`, tier, kind: 'easy_start', refId: 'PK05',
    titleTr: `Kolay Başlangıç — ${svc.nameTr}`, matchedMicroNeeds: cov.core, serviceIds: [svc.id], coverage: cov,
    reasonTr: `Önceliğin “${need?.shortTr ?? ''}” ve tek adımla başlamak istediğin için bu başlangıç öne çıktı.`,
    fitScore: offerFitScore(cov, confirmedIds.length), ruleVersion: RULE_VERSION,
  };
}

function moduleCard(needId: string, confirmedIds: string[], tier: RecommendationCard['tier']): RecommendationCard | null {
  const need = getMicroNeed(needId);
  const moduleId = need?.moduleIds[0];
  if (!moduleId) return null;
  const mod = getModule(moduleId);
  // services in this module that serve any confirmed need
  const svcs = servicesForModule(moduleId).filter(
    (s) => s.status === 'active' && s.microNeedIds.some((m) => confirmedIds.includes(m)),
  );
  const serviceIds = [...new Set(svcs.map((s) => s.id))];
  if (serviceIds.length === 0) return null;
  const cov = coverageForServiceSet(serviceIds, confirmedIds);
  return {
    id: `module-${moduleId}`, tier, kind: 'custom_module', refId: moduleId,
    titleTr: `Kendi modülün — ${mod?.nameTr}`, matchedMicroNeeds: cov.core, serviceIds, coverage: cov,
    reasonTr: `Aynı alanda (${mod?.nameTr}) birbirini tamamlayan hizmetleri kendi programında birleştirebilirsin.`,
    fitScore: offerFitScore(cov, confirmedIds.length), ruleVersion: RULE_VERSION,
  };
}

function packageCard(pf: PkgFit, confirmedIds: string[], tier: RecommendationCard['tier']): RecommendationCard {
  const pkg = getPackage(pf.packageId)!;
  const serviceIds = [...new Set(packageRelationsFor(pf.packageId).filter((r) => r.inclusion !== 'not_included').map((r) => r.serviceId))];
  const coreN = pf.coverage.core.length;
  return {
    id: `pkg-${pf.packageId}`, tier, kind: 'package', refId: pf.packageId,
    titleTr: pkg.nameTr, matchedMicroNeeds: [...pf.coverage.core, ...pf.coverage.optional, ...pf.coverage.chooseOne],
    serviceIds, coverage: pf.coverage,
    reasonTr: `${confirmedIds.length} doğrulanmış ihtiyacının ${coreN} tanesini çekirdek kapsamda karşıladığı için.`,
    fitScore: pf.fit, ruleVersion: RULE_VERSION,
  };
}

function exploreFallback(tier: RecommendationCard['tier']): RecommendationCard {
  return {
    id: 'fallback-explore', tier, kind: 'single_service', refId: 'C01',
    titleTr: 'Uzmanla görüş / Kataloğu keşfet', matchedMicroNeeds: [], serviceIds: ['C01'],
    coverage: { core: [], optional: [], chooseOne: [], uncovered: [] },
    reasonTr: 'İhtiyacına birebir uyan bir ürün belirginleşmediği için önce bir uzmanla netleştirmeyi öneriyoruz.',
    fitScore: 0, ruleVersion: RULE_VERSION,
  };
}

/* -------------------------------- recommend ------------------------------- */

const INTENSITY: Record<OfferKind, number> = { easy_start: 1, single_service: 2, custom_module: 3, package: 4 };

/**
 * recommend — returns exactly three cards: primary + a lighter alternative
 * ("daha küçük başla") + a heavier alternative ("daha kapsamlı destek al").
 * Transparent + versioned: each cardis traceable answer -> need -> service ->
 * module -> package. Never pushes to the most expensive option.
 */
export function recommend(
  confirmed: ConfirmedNeed[],
  _scored: ScoredNeed[],
  signals: AssessmentSignals,
): RecommendationCard[] {
  const ordered = orderConfirmed(confirmed);
  const confirmedIds = ordered.map((c) => c.microNeedId);
  if (confirmedIds.length === 0) return [];
  const topNeed = confirmedIds[0];

  const distinctModules = new Set<string>();
  for (const id of confirmedIds) getMicroNeed(id)?.moduleIds.forEach((m) => distinctModules.add(m));

  const wantsContinuity = signals.commitment === 'high';
  const lowCommit = signals.commitment === 'low' || signals.budget === 'low' || signals.timeLevel <= 2;

  // build candidate options (deduped by kind, lightest representative)
  const candidates: RecommendationCard[] = [];
  const easy = easyStartCard(topNeed, confirmedIds, 'smaller');
  if (easy) candidates.push(easy);
  const single = singleCard(topNeed, confirmedIds, 'smaller');
  if (single) candidates.push(single);
  const mod = moduleCard(topNeed, confirmedIds, 'larger');
  if (mod && confirmedIds.length >= 1) candidates.push(mod);
  const pkgs = rankPackages(confirmedIds);
  if (pkgs[0]) candidates.push(packageCard(pkgs[0], confirmedIds, 'larger'));

  candidates.sort((a, b) => INTENSITY[a.kind] - INTENSITY[b.kind]);
  if (candidates.length === 0) {
    return [exploreFallback('primary'), exploreFallback('smaller'), exploreFallback('larger')];
  }

  // pick target intensity
  let targetKind: OfferKind;
  if (confirmedIds.length >= 2 && distinctModules.size >= 2 && wantsContinuity && pkgs[0]) targetKind = 'package';
  else if (confirmedIds.length >= 2 && wantsContinuity) targetKind = 'custom_module';
  else if (lowCommit || confirmedIds.length === 1) targetKind = easy ? 'easy_start' : 'single_service';
  else targetKind = 'single_service';

  // nearest available candidate to target
  const idxByTarget = nearestIndex(candidates, INTENSITY[targetKind]);
  const primary = { ...candidates[idxByTarget], tier: 'primary' as const };
  const lighter = candidates.slice(0, idxByTarget).pop();
  const heavier = candidates.slice(idxByTarget + 1)[0];

  const smaller: RecommendationCard = lighter
    ? { ...lighter, tier: 'smaller' }
    : (easy && primary.kind !== 'easy_start' ? { ...easy, tier: 'smaller' } : { ...(single ?? exploreFallback('smaller')), tier: 'smaller' });
  const larger: RecommendationCard = heavier
    ? { ...heavier, tier: 'larger' }
    : (pkgs[1] ? packageCard(pkgs[1], confirmedIds, 'larger') : mod ? { ...mod, tier: 'larger' } : exploreFallback('larger'));

  // guarantee three distinct cards
  const cards = dedupeCards([primary, smaller, larger]);
  return cards;
}

function nearestIndex(cards: RecommendationCard[], target: number): number {
  let best = 0;
  let bestDist = Infinity;
  cards.forEach((c, i) => {
    const d = Math.abs(INTENSITY[c.kind] - target);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
}

function dedupeCards(cards: RecommendationCard[]): RecommendationCard[] {
  const out: RecommendationCard[] = [];
  const seen = new Set<string>();
  for (const c of cards) {
    if (seen.has(c.id)) {
      out.push({ ...exploreFallback(c.tier) });
    } else {
      seen.add(c.id);
      out.push(c);
    }
  }
  return out;
}
