import type { AnswerValue, Question, ScoredNeed } from '@/types';
import { QUESTIONS, RULE_VERSION } from '@/data/catalog';

export { RULE_VERSION };

/** Derived, non-need preference signals that shape the OFFER (not the needs). */
export interface AssessmentSignals {
  commitment: 'low' | 'neutral' | 'high';
  supportPref: 'essential' | 'guided' | 'premium' | 'unset';
  timeLevel: number; // 1..5
  budget: 'low' | 'mid' | 'flex' | 'unset';
  numAreas: number;
}

/**
 * Which questions should be visible given the selected areas and prior answers.
 * - welcome: always (it's the first screen)
 * - general core: always
 * - area core: only if that area was selected in the welcome multi-select
 * - followup: only if a prior answer picked one of showIfAnyOption
 */
export function visibleQuestions(selectedAreas: string[], answers: Record<string, AnswerValue>): Question[] {
  const chosenOptionIds = collectChosenOptionIds(answers);
  return QUESTIONS.filter((q) => {
    if (q.kind === 'welcome') return true;
    if (q.kind === 'followup') {
      if (q.area !== 'general' && !selectedAreas.includes(q.area)) return false;
      return (q.showIfAnyOption ?? []).some((id) => chosenOptionIds.has(id));
    }
    // core
    if (q.area === 'general') return true;
    return selectedAreas.includes(q.area);
  });
}

function collectChosenOptionIds(answers: Record<string, AnswerValue>): Set<string> {
  const set = new Set<string>();
  for (const v of Object.values(answers)) {
    if (typeof v === 'string') set.add(v);
    else if (Array.isArray(v)) v.forEach((x) => set.add(x));
  }
  return set;
}

export function selectedAreasFromAnswers(answers: Record<string, AnswerValue>): string[] {
  const welcome = answers['Q_WELCOME'];
  const chosen = Array.isArray(welcome) ? welcome : welcome ? [welcome as string] : [];
  const q = QUESTIONS.find((x) => x.id === 'Q_WELCOME');
  const areas = new Set<string>();
  for (const optId of chosen) {
    const opt = q?.options?.find((o) => o.id === optId);
    (opt?.opensAreas ?? []).forEach((a) => areas.add(a));
  }
  return [...areas];
}

/** True if a safety-stop option was selected anywhere. */
export function detectSafetyStop(answers: Record<string, AnswerValue>): boolean {
  const chosen = collectChosenOptionIds(answers);
  for (const q of QUESTIONS) {
    for (const o of q.options ?? []) {
      if (o.safetyStop && chosen.has(o.id)) return true;
    }
  }
  return false;
}

/**
 * mapAnswersToNeeds — deterministic, versioned.
 * Accumulates option needWeights into a per-micro-need weight sum, then scales
 * to a 0..100 self-report discovery score (NOT a clinical/risk score).
 */
export function mapAnswersToNeeds(answers: Record<string, AnswerValue>): ScoredNeed[] {
  const chosen = collectChosenOptionIds(answers);
  const weights = new Map<string, number>();
  for (const q of QUESTIONS) {
    for (const o of q.options ?? []) {
      if (!chosen.has(o.id)) continue;
      for (const nw of o.needWeights ?? []) {
        weights.set(nw.microNeedId, (weights.get(nw.microNeedId) ?? 0) + nw.weight);
      }
    }
  }
  const SCALE = 22; // weight 3 -> 66, weight 4 -> 88, weight 5+ -> 100
  return [...weights.entries()]
    .map(([microNeedId, w]) => ({ microNeedId, rawScore: Math.min(100, Math.round(w * SCALE)) }))
    .sort((a, b) => b.rawScore - a.rawScore);
}

export function deriveSignals(answers: Record<string, AnswerValue>, numAreas: number): AssessmentSignals {
  const commitRaw = answers['Q_COMMIT'];
  const commitment = commitRaw === 'c_single' ? 'low' : commitRaw === 'c_continuity' ? 'high' : 'neutral';
  const supRaw = answers['Q_SUPPORT'];
  const supportPref =
    supRaw === 'sup_digital' ? 'essential' : supRaw === 'sup_guided' ? 'guided' : supRaw === 'sup_premium' ? 'premium' : 'unset';
  const timeLevel = typeof answers['Q_TIME'] === 'number' ? (answers['Q_TIME'] as number) : 3;
  const budRaw = answers['Q_BUDGET'];
  const budget = budRaw === 'bud_low' ? 'low' : budRaw === 'bud_mid' ? 'mid' : budRaw === 'bud_flex' ? 'flex' : 'unset';
  return { commitment, supportPref, timeLevel, budget, numAreas };
}
