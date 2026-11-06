import type { MetricKind, MetricRecord } from '@/types';

const CUMULATIVE: MetricKind[] = ['steps', 'water_ml', 'activity_min'];
const isDevice = (s: string) => s === 'phone' || s === 'wearable';

/* ------------------------------ date helpers ------------------------------ */
export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function today(): string {
  return ymd(new Date());
}
export function daysAgo(n: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return ymd(d);
}
export function lastNDates(n: number, endDay = today()): string[] {
  const end = new Date(endDay + 'T00:00:00');
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    out.push(ymd(d));
  }
  return out;
}

/**
 * dailyTotal — the single de-duplication rule for a metric on a day.
 *
 * Rule (explicit, versioned):
 *  - Cumulative metrics (steps / water / activity minutes):
 *      if ANY device record exists that day -> total = sum of DEVICE records
 *      (device wins; manual is ignored for the total to avoid double counting).
 *      else -> total = sum of MANUAL records (manual fills the gap).
 *  - Single-value metrics (sleep / mood / resting HR):
 *      latest record wins, device preferred over manual.
 *  - No record that day -> null (NOT zero).
 *
 * Both device and manual records remain visible in the list with source labels;
 * only the TOTAL de-duplicates.
 */
export function dailyTotal(records: MetricRecord[], kind: MetricKind, day: string): number | null {
  const rs = records.filter((r) => r.kind === kind && r.date === day);
  if (rs.length === 0) return null;

  if (CUMULATIVE.includes(kind)) {
    const device = rs.filter((r) => isDevice(r.source));
    const use = device.length > 0 ? device : rs.filter((r) => r.source === 'manual' || r.source === 'expert');
    const pool = use.length > 0 ? use : rs;
    return pool.reduce((a, r) => a + r.value, 0);
  }

  // single-value: latest, device preferred
  const sorted = [...rs].sort((a, b) => {
    const dev = Number(isDevice(b.source)) - Number(isDevice(a.source));
    if (dev !== 0) return dev;
    return b.at.localeCompare(a.at);
  });
  return sorted[0].value;
}

export function seriesForKind(records: MetricRecord[], kind: MetricKind, days: number, endDay = today()): { date: string; value: number | null }[] {
  return lastNDates(days, endDay).map((date) => ({ date, value: dailyTotal(records, kind, date) }));
}

/** Weekly active days for a cumulative metric above a threshold. */
export function activeDays(records: MetricRecord[], kind: MetricKind, days: number, threshold: number, endDay = today()): number {
  return seriesForKind(records, kind, days, endDay).filter((d) => (d.value ?? 0) >= threshold).length;
}

/** Simple consecutive-day streak ending at endDay for records of any source. */
export function streak(records: MetricRecord[], kind: MetricKind, threshold: number, endDay = today()): number {
  let n = 0;
  const dates = lastNDates(60, endDay).reverse(); // newest first
  for (const date of dates) {
    const v = dailyTotal(records, kind, date);
    if (v != null && v >= threshold) n++;
    else break;
  }
  return n;
}

export function sum(records: MetricRecord[], kind: MetricKind, days: number, endDay = today()): number {
  return seriesForKind(records, kind, days, endDay).reduce((a, d) => a + (d.value ?? 0), 0);
}
