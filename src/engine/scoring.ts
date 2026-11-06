import type {
  ConfirmedNeed, CoverageBreakdown, MetricKind, MetricRecord, PersonalGoal,
  ScoredNeed, ScoreResult, PlanTask,
} from '@/types';
import {
  RULE_VERSION, getService, packageRelationsFor, getMicroNeed, serviceById,
} from '@/data/catalog';
import type { PackageId } from '@/types';
import { dailyTotal } from './metrics';

export const SCORING_VERSION = RULE_VERSION;

/* --------------------------- coverage computations ------------------------ */

const serviceCovers = (serviceId: string, microNeedId: string): boolean =>
  !!serviceById.get(serviceId)?.microNeedIds.includes(microNeedId);

/** Which confirmed needs a flat set of services covers (treated as direct/core). */
export function coverageForServiceSet(serviceIds: string[], confirmedNeedIds: string[]): CoverageBreakdown {
  const core: string[] = [];
  const uncovered: string[] = [];
  for (const need of confirmedNeedIds) {
    if (serviceIds.some((sid) => serviceCovers(sid, need))) core.push(need);
    else uncovered.push(need);
  }
  return { core, optional: [], chooseOne: [], uncovered };
}

/** Package coverage respecting core / optional / choose_one inclusion. */
export function coverageForPackage(packageId: PackageId, confirmedNeedIds: string[]): CoverageBreakdown {
  const rels = packageRelationsFor(packageId);
  const core: string[] = [];
  const optional: string[] = [];
  const chooseOne: string[] = [];
  const uncovered: string[] = [];
  for (const need of confirmedNeedIds) {
    const coveringRels = rels.filter((r) => serviceCovers(r.serviceId, need) && r.inclusion !== 'not_included');
    if (coveringRels.some((r) => r.inclusion === 'core')) core.push(need);
    else if (coveringRels.some((r) => r.inclusion === 'optional')) optional.push(need);
    else if (coveringRels.some((r) => r.inclusion === 'choose_one')) chooseOne.push(need);
    else uncovered.push(need);
  }
  return { core, optional, chooseOne, uncovered };
}

/** 0..100 fit — only confirmed CORE coverage counts fully; optional/choose_one half. */
export function offerFitScore(cov: CoverageBreakdown, totalConfirmed: number): number {
  if (totalConfirmed === 0) return 0;
  const raw = cov.core.length * 1 + cov.optional.length * 0.5 + cov.chooseOne.length * 0.5;
  return Math.round((raw / totalConfirmed) * 100);
}

/* --------------------------- Need Priority Score -------------------------- */

const rankBonus = (priority: number, confirmedCount: number): number => {
  if (priority === 1) return 30;
  if (priority === 2) return 20;
  if (priority === 3) return 10;
  return 0; // confirmed but unranked
};

export function needPriorityScore(scored: ScoredNeed[], confirmed: ConfirmedNeed[]): ScoreResult {
  const scoredMap = new Map(scored.map((s) => [s.microNeedId, s.rawScore]));
  if (confirmed.length === 0) {
    return { value: null, breakdown: [], completeness: 0, updatedAt: new Date().toISOString(), ruleVersion: RULE_VERSION, note: 'Henüz doğrulanmış ihtiyaç yok.' };
  }
  const breakdown = confirmed.map((c) => {
    const raw = scoredMap.get(c.microNeedId) ?? 40;
    const value = Math.min(100, Math.round(raw * 0.7 + rankBonus(c.priority, confirmed.length)));
    return {
      labelTr: getMicroNeed(c.microNeedId)?.shortTr ?? c.microNeedId,
      value,
      weight: c.priority === 0 ? 1 : 1 / c.priority,
      source: 'self_report' as const,
    };
  });
  const wsum = breakdown.reduce((a, b) => a + b.weight, 0);
  const value = Math.round(breakdown.reduce((a, b) => a + b.value * b.weight, 0) / (wsum || 1));
  return {
    value, breakdown,
    completeness: Math.min(100, confirmed.length * 33),
    updatedAt: new Date().toISOString(), ruleVersion: RULE_VERSION,
    note: 'Öz-bildirim temelli ihtiyaç önceliği. Tıbbi risk veya teşhis değildir.',
  };
}

/* --------------------- My Wellness Progress / Routine --------------------- */

const goalLabel: Record<MetricKind, string> = {
  steps: 'Adım hedefi', water_ml: 'Su hedefi', activity_min: 'Aktivite hedefi',
  sleep_h: 'Uyku rutini', mood: 'Ruh hâli', resting_hr: 'Dinlenme nabzı',
};

/**
 * RoutineProgressScore — personal habit/engagement indicator, compared only to
 * the user's own goals. Returns null (not 0) when there's not enough data.
 * Weights come from the user's ACTIVE goals, not a fixed weighting for everyone.
 */
export function routineProgressScore(
  goals: PersonalGoal[], records: MetricRecord[], tasks: PlanTask[], day: string,
): ScoreResult {
  const breakdown: ScoreResult['breakdown'] = [];

  for (const g of goals) {
    const total = dailyTotal(records, g.kind, day);
    if (total == null) continue; // no data for this goal -> excluded, not zeroed
    const progress = Math.min(100, Math.round((total / g.target) * 100));
    breakdown.push({ labelTr: goalLabel[g.kind], value: progress, weight: 1, source: inferSource(records, g.kind, day) });
  }

  // plan-task completion as its own sub-score (only if there are tasks)
  const actionable = tasks.filter((t) => t.kind !== 'review');
  if (actionable.length > 0) {
    const done = actionable.filter((t) => t.done).length;
    breakdown.push({ labelTr: 'Plan görevleri', value: Math.round((done / actionable.length) * 100), weight: 1, source: 'catalog' });
  }

  const goalsWithData = goals.filter((g) => dailyTotal(records, g.kind, day) != null).length;
  const totalGoals = goals.length + (actionable.length > 0 ? 1 : 0);
  const completeness = totalGoals === 0 ? 0 : Math.round(((goalsWithData + (actionable.length > 0 ? 1 : 0)) / totalGoals) * 100);

  if (breakdown.length === 0) {
    return { value: null, breakdown: [], completeness: 0, updatedAt: new Date().toISOString(), ruleVersion: RULE_VERSION, note: 'Yeterli veri yok. Veri ekledikçe ilerlemen görünür.' };
  }
  const wsum = breakdown.reduce((a, b) => a + b.weight, 0);
  const value = Math.round(breakdown.reduce((a, b) => a + b.value * b.weight, 0) / (wsum || 1));
  return {
    value, breakdown, completeness,
    updatedAt: new Date().toISOString(), ruleVersion: RULE_VERSION,
    note: 'Yalnızca kendi hedeflerine göre; başkalarıyla kıyaslanmaz. Klinik iyileşme değildir.',
  };
}

function inferSource(records: MetricRecord[], kind: MetricKind, day: string) {
  const rs = records.filter((r) => r.kind === kind && r.date === day);
  if (rs.some((r) => r.source === 'wearable')) return 'wearable' as const;
  if (rs.some((r) => r.source === 'phone')) return 'phone' as const;
  return 'manual' as const;
}

/** Referenced by catalog for completeness of a given offer. */
export function fitLabel(fit: number): string {
  if (fit >= 75) return 'Yüksek uyum';
  if (fit >= 45) return 'Orta uyum';
  return 'Kısmi uyum';
}

export { getService };
