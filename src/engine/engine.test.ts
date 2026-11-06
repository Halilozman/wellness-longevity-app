import { describe, it, expect } from 'vitest';
import type { AnswerValue, ConfirmedNeed, MetricRecord, PersonalGoal, PointsLedgerEntry } from '@/types';
import { validateCatalog } from '@/data/catalog';
import {
  mapAnswersToNeeds, visibleQuestions, selectedAreasFromAnswers, detectSafetyStop, deriveSignals,
  recommend, evaluateEligibility, dailyTotal, routineProgressScore, needPriorityScore,
  coverageForPackage, earnAndApprove, reverse, balances, redeem, today,
} from '@/engine';

const sig = (a: Record<string, AnswerValue>, n: number) => deriveSignals(a, n);

describe('catalog integrity', () => {
  it('has no referential-integrity errors', () => {
    const errors = validateCatalog().filter((i) => i.level === 'error');
    expect(errors).toEqual([]);
  });
});

describe('assessment', () => {
  it('shows only questions for selected areas', () => {
    const a: Record<string, AnswerValue> = { Q_WELCOME: ['w_hareket'] };
    const vis = visibleQuestions(selectedAreasFromAnswers(a), a).map((q) => q.id);
    expect(vis).toContain('Q_HAREKET_1');
    expect(vis).not.toContain('Q_BES_1'); // beslenme not selected
    expect(vis).toContain('Q_SAFETY'); // general always visible
  });

  it('maps answers to needs and changes when answers change', () => {
    const move = mapAnswersToNeeds({ Q_WELCOME: ['w_hareket'], Q_HAREKET_1: 'h1_start' });
    expect(move[0].microNeedId).toBe('MNEED_MOVE_START');

    const sleep = mapAnswersToNeeds({ Q_WELCOME: ['w_uyku'], Q_UYKU_1: 'u1_fall' });
    expect(sleep[0].microNeedId).toBe('MNEED_SLEEP');
    expect(sleep[0].microNeedId).not.toBe(move[0].microNeedId);
  });

  it('detects the safety stop', () => {
    expect(detectSafetyStop({ Q_SAFETY: 'safe_yes' })).toBe(true);
    expect(detectSafetyStop({ Q_SAFETY: 'safe_no' })).toBe(false);
  });
});

describe('recommendation engine', () => {
  it('scenario 1 — first-time movement, low commitment -> Easy Start on C05', () => {
    const answers = { Q_WELCOME: ['w_hareket'], Q_HAREKET_1: 'h1_start', Q_COMMIT: 'c_single', Q_BUDGET: 'bud_low', Q_TIME: 2 };
    const confirmed: ConfirmedNeed[] = [{ microNeedId: 'MNEED_MOVE_START', priority: 1 }];
    const cards = recommend(confirmed, mapAnswersToNeeds(answers), sig(answers, 1));
    expect(cards).toHaveLength(3);
    const primary = cards.find((c) => c.tier === 'primary')!;
    expect(primary.kind).toBe('easy_start');
    expect(primary.serviceIds).toContain('C05');
  });

  it('scenario 3 — multi-need prevention + nutrition, continuity -> package with core/optional separation', () => {
    const answers = { Q_WELCOME: ['w_riskler', 'w_beslenme'], Q_RISK_1: 'r1_priorities', Q_BES_1: 'b1_understand', Q_COMMIT: 'c_continuity', Q_SUPPORT: 'sup_guided' };
    const confirmed: ConfirmedNeed[] = [
      { microNeedId: 'MNEED_PRIORITIES', priority: 1 },
      { microNeedId: 'MNEED_NUTRITION_UNDERSTAND', priority: 2 },
    ];
    const cards = recommend(confirmed, mapAnswersToNeeds(answers), sig(answers, 2));
    const pkg = cards.find((c) => c.kind === 'package');
    expect(pkg).toBeTruthy();
    expect(pkg!.coverage.core.length).toBeGreaterThanOrEqual(1);

    // PK03 keeps core/optional distinct (C01 core, C02 optional)
    const pk03 = coverageForPackage('PK03', ['MNEED_PRIORITIES', 'MNEED_NUTRITION_UNDERSTAND']);
    expect(pk03.core).toContain('MNEED_PRIORITIES');
    expect(pk03.optional).toContain('MNEED_NUTRITION_UNDERSTAND');
  });

  it('different answers produce different recommendations', () => {
    const a1 = { Q_WELCOME: ['w_hareket'], Q_HAREKET_1: 'h1_start', Q_COMMIT: 'c_single' };
    const a2 = { Q_WELCOME: ['w_stres'], Q_STRES_1: 's1_tense', Q_COMMIT: 'c_single' };
    const c1 = recommend([{ microNeedId: 'MNEED_MOVE_START', priority: 1 }], mapAnswersToNeeds(a1), sig(a1, 1));
    const c2 = recommend([{ microNeedId: 'MNEED_STRESS', priority: 1 }], mapAnswersToNeeds(a2), sig(a2, 1));
    const svc1 = c1.find((c) => c.tier === 'primary')!.serviceIds[0];
    const svc2 = c2.find((c) => c.tier === 'primary')!.serviceIds[0];
    expect(svc1).toBe('C05');
    expect(svc2).toBe('SMPL_STRESS');
    expect(svc1).not.toBe(svc2);
  });
});

describe('entitlements — same service, different access', () => {
  it('C05 resolves differently by access category', () => {
    expect(evaluateEligibility('C05', 'alz').entitled).toBe(true);
    const un = evaluateEligibility('C05', 'uninsured');
    expect(un.entitled).toBe(false);
    expect(un.payPerUse).toBe(true);
    const el = evaluateEligibility('C05', 'insured_elsewhere');
    expect(el.entitled).toBe(false);
    expect(el.payPerUse).toBe(true);
  });

  it('a non-starter service is not purchasable for uninsured but included for aln', () => {
    expect(evaluateEligibility('C01', 'alz').entitled).toBe(true);
    const un = evaluateEligibility('C01', 'uninsured');
    expect(un.entitled).toBe(false);
    expect(un.payPerUse).toBe(false);
  });
});

describe('metrics de-duplication', () => {
  const d = today();
  const mk = (p: Partial<MetricRecord>): MetricRecord => ({ id: Math.random().toString(), kind: 'steps', date: d, value: 0, source: 'manual', at: new Date().toISOString(), ...p });

  it('device wins per day — manual + device same day is not double counted', () => {
    const records = [mk({ value: 4000, source: 'manual' }), mk({ value: 6000, source: 'wearable' })];
    expect(dailyTotal(records, 'steps', d)).toBe(6000);
  });

  it('manual fills the gap when there is no device record', () => {
    const records = [mk({ kind: 'water_ml', value: 250, source: 'manual' }), mk({ kind: 'water_ml', value: 250, source: 'manual' })];
    expect(dailyTotal(records, 'water_ml', d)).toBe(500);
  });

  it('no record -> null, not zero', () => {
    expect(dailyTotal([], 'steps', d)).toBeNull();
  });
});

describe('scores', () => {
  const d = today();
  it('routine score is null (not 0) with no data', () => {
    const goals: PersonalGoal[] = [{ kind: 'steps', target: 8000, unitTr: 'adım' }];
    const r = routineProgressScore(goals, [], [], d);
    expect(r.value).toBeNull();
  });

  it('routine score reflects progress toward a personal goal', () => {
    const goals: PersonalGoal[] = [{ kind: 'steps', target: 8000, unitTr: 'adım' }];
    const records: MetricRecord[] = [{ id: '1', kind: 'steps', date: d, value: 6000, source: 'wearable', at: new Date().toISOString() }];
    const r = routineProgressScore(goals, records, [], d);
    expect(r.value).toBe(75);
  });

  it('need priority score is self-report, never null when a need is confirmed', () => {
    const scored = mapAnswersToNeeds({ Q_WELCOME: ['w_hareket'], Q_HAREKET_1: 'h1_start' });
    const r = needPriorityScore(scored, [{ microNeedId: 'MNEED_MOVE_START', priority: 1 }]);
    expect(r.value).not.toBeNull();
    expect(r.value!).toBeGreaterThan(0);
  });
});

describe('rewards — idempotency, reversal, redemption', () => {
  it('the same verified event never earns twice', () => {
    let ledger: PointsLedgerEntry[] = [];
    const r1 = earnAndApprove(ledger, { sourceEventId: 'checkin:BK_1', points: 90, reasonTr: 'Doğrulanmış check-in' });
    ledger = r1.ledger;
    const r2 = earnAndApprove(ledger, { sourceEventId: 'checkin:BK_1', points: 90, reasonTr: 'Doğrulanmış check-in' });
    expect(r1.added).toBe(true);
    expect(r2.added).toBe(false);
    expect(ledger.filter((e) => e.points > 0)).toHaveLength(1);
    expect(balances(ledger).spendable).toBe(90);
  });

  it('reversal removes the points from spendable', () => {
    let ledger: PointsLedgerEntry[] = [];
    ledger = earnAndApprove(ledger, { sourceEventId: 'checkin:BK_2', points: 90, reasonTr: 'x' }).ledger;
    ledger = reverse(ledger, 'checkin:BK_2');
    expect(balances(ledger).spendable).toBe(0);
  });

  it('redeem succeeds only with enough spendable points', () => {
    let ledger: PointsLedgerEntry[] = [];
    ledger = earnAndApprove(ledger, { sourceEventId: 'e1', points: 250, reasonTr: 'x' }).ledger;
    const bad = redeem(ledger, 'RW_CLASS', 300, 'Ders');
    expect(bad.ok).toBe(false);
    const good = redeem(ledger, 'RW_SHOP', 180, 'Kupon');
    expect(good.ok).toBe(true);
    expect(balances(good.ledger).spendable).toBe(70);
  });
});
