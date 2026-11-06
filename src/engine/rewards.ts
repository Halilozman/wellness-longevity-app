import type { PointsLedgerEntry } from '@/types';
import { RULE_VERSION } from '@/data/catalog';

export const REWARD_RULES_VERSION = RULE_VERSION;
export const DAILY_EARN_CAP = 300; // configurable anti-abuse cap

let seq = 0;
const newId = () => `ple_${Date.now().toString(36)}_${(seq++).toString(36)}`;

export interface EarnInput {
  sourceEventId: string; // idempotency key (e.g. "checkin:BK_123")
  points: number;
  reasonTr: string;
  at?: string;
}

export interface EarnResult {
  ledger: PointsLedgerEntry[];
  added: boolean;
  grantedPoints: number;
  note?: string;
}

function dayOf(iso: string) { return iso.slice(0, 10); }

function earnedOnDay(ledger: PointsLedgerEntry[], day: string): number {
  return ledger
    .filter((e) => e.points > 0 && e.status !== 'reversed' && dayOf(e.at) === day)
    .reduce((a, e) => a + e.points, 0);
}

/**
 * earn — idempotent on sourceEventId. Points are earned only via a VERIFIED
 * activity event, never for raw device/manual data, and never from menstrual /
 * mood / genetic / lab / disease signals. Applies a daily earn cap.
 */
export function earn(ledger: PointsLedgerEntry[], input: EarnInput): EarnResult {
  const at = input.at ?? new Date().toISOString();
  if (ledger.some((e) => e.sourceEventId === input.sourceEventId && e.status !== 'reversed' && e.points > 0)) {
    return { ledger, added: false, grantedPoints: 0, note: 'Bu etkinlik için puan zaten verildi (tekrar sayılmaz).' };
  }
  const already = earnedOnDay(ledger, dayOf(at));
  const remaining = Math.max(0, DAILY_EARN_CAP - already);
  if (remaining <= 0) {
    return { ledger, added: false, grantedPoints: 0, note: 'Günlük puan üst limitine ulaşıldı.' };
  }
  const granted = Math.min(input.points, remaining);
  const entry: PointsLedgerEntry = {
    id: newId(), at, points: granted, status: 'pending', reasonTr: input.reasonTr,
    sourceEventId: input.sourceEventId, ruleVersion: RULE_VERSION,
  };
  const note = granted < input.points ? 'Günlük üst limit nedeniyle puan sınırlandı.' : undefined;
  return { ledger: [...ledger, entry], added: true, grantedPoints: granted, note };
}

/** Move a pending earn to approved (e.g. after verified check-in settles). */
export function approve(ledger: PointsLedgerEntry[], sourceEventId: string): PointsLedgerEntry[] {
  return ledger.map((e) =>
    e.sourceEventId === sourceEventId && e.status === 'pending' ? { ...e, status: 'approved' } : e,
  );
}

export function earnAndApprove(ledger: PointsLedgerEntry[], input: EarnInput): EarnResult {
  const r = earn(ledger, input);
  if (!r.added) return r;
  return { ...r, ledger: approve(r.ledger, input.sourceEventId) };
}

/** Reverse a prior earn — idempotent. */
export function reverse(ledger: PointsLedgerEntry[], sourceEventId: string): PointsLedgerEntry[] {
  return ledger.map((e) =>
    e.sourceEventId === sourceEventId && e.status !== 'reversed' && e.points > 0 ? { ...e, status: 'reversed' } : e,
  );
}

export interface Balances { pending: number; approved: number; spendable: number; }

export function balances(ledger: PointsLedgerEntry[]): Balances {
  const pending = ledger.filter((e) => e.status === 'pending' && e.points > 0).reduce((a, e) => a + e.points, 0);
  const approved = ledger.filter((e) => e.status === 'approved').reduce((a, e) => a + e.points, 0);
  return { pending, approved, spendable: Math.max(0, approved) };
}

export interface RedeemResult { ledger: PointsLedgerEntry[]; ok: boolean; note?: string; }

export function redeem(ledger: PointsLedgerEntry[], itemId: string, cost: number, titleTr: string): RedeemResult {
  const { spendable } = balances(ledger);
  if (spendable < cost) return { ledger, ok: false, note: 'Yeterli kullanılabilir puan yok.' };
  const entry: PointsLedgerEntry = {
    id: newId(), at: new Date().toISOString(), points: -cost, status: 'approved',
    reasonTr: `Ödül kullanıldı: ${titleTr}`, sourceEventId: `redeem:${itemId}:${Date.now()}`, ruleVersion: RULE_VERSION,
  };
  return { ledger: [...ledger, entry], ok: true };
}
