import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type {
  AccessCategory, AssessmentResult, Booking, Consent, ConsentKey, ConfirmedNeed,
  CustomModulePlan, DataConnection, FitnessBooking, GroceryItem, MealPlanEntry, MealSlot,
  MenstrualCycleLog, MetricKind, MetricRecord, MetricSource, Order, PersonalGoal, PlanItem,
  PlanItemStatus, PlanTask, PointsLedgerEntry, ProgressEvent, ProgressEventType, Reassessment,
  RecommendationCard, RewardRedemption, SharingGrant, User, WeeklyMission,
} from '@/types';
import { WEEKLY_MISSIONS, REWARD_CATALOGUE, RECIPES, getPackage, getService } from '@/data/catalog';
import { uid, nowIso } from '@/lib/ids';
import { daysAgo, today } from '@/engine/metrics';
import { earn, earnAndApprove, approve, reverse, redeem as redeemPoints, balances } from '@/engine/rewards';

const STORE_KEY = 'wl-demo-state-v5';
const STATE_VERSION = 5;

export interface StoreState {
  version: number;
  onboarded: boolean;
  user: User;
  consents: Consent[];
  assessment?: AssessmentResult;
  assessmentHistory: AssessmentResult[];
  savedRecommendations: RecommendationCard[];
  planItems: PlanItem[];
  planTasks: PlanTask[];
  orders: Order[];
  bookings: Booking[];
  events: ProgressEvent[];
  metrics: MetricRecord[];
  dataConnections: DataConnection[];
  personalGoals: PersonalGoal[];
  menstrualLogs: MenstrualCycleLog[];
  sharingGrants: SharingGrant[];
  pointsLedger: PointsLedgerEntry[];
  redemptions: RewardRedemption[];
  fitnessBookings: FitnessBooking[];
  missions: WeeklyMission[];
  mealPlan: MealPlanEntry[];
  grocery: GroceryItem[];
  customModules: CustomModulePlan[];
  reassessments: Reassessment[];
  seededScenario?: string;
}

const defaultConsents: Consent[] = [
  { key: 'health_data_processing', granted: false },
  { key: 'wearable_sync', granted: false },
  { key: 'menstrual_tracking', granted: false },
  { key: 'marketing', granted: false },
  { key: 'share_with_expert', granted: false },
];

const defaultConnections: DataConnection[] = [
  { id: 'conn_phone', source: 'phone', label: 'Telefon sağlık verisi', connected: false, kinds: ['steps', 'activity_min'] },
  { id: 'conn_wear', source: 'wearable', label: 'Giyilebilir cihaz', connected: false, kinds: ['steps', 'activity_min', 'sleep_h', 'resting_hr'] },
];

const defaultGoals: PersonalGoal[] = [
  { kind: 'steps', target: 8000, unitTr: 'adım' },
  { kind: 'water_ml', target: 2000, unitTr: 'mL' },
];

function freshState(user?: Partial<User>): StoreState {
  return {
    version: STATE_VERSION,
    onboarded: false,
    user: { id: 'u_demo', nameTr: 'Ela', accessCategory: 'alz', corporate: false, ...user },
    consents: defaultConsents.map((c) => ({ ...c })),
    assessment: undefined,
    assessmentHistory: [],
    savedRecommendations: [],
    planItems: [],
    planTasks: [],
    orders: [],
    bookings: [],
    events: [],
    metrics: [],
    dataConnections: defaultConnections.map((c) => ({ ...c })),
    personalGoals: defaultGoals.map((g) => ({ ...g })),
    menstrualLogs: [],
    sharingGrants: [],
    pointsLedger: [],
    redemptions: [],
    fitnessBookings: [],
    missions: WEEKLY_MISSIONS.map((m) => ({ ...m })),
    mealPlan: [],
    grocery: [],
    customModules: [],
    reassessments: [],
  };
}

/* ------------------------------ seed helpers ------------------------------ */
function seedMetrics(days: number): MetricRecord[] {
  const out: MetricRecord[] = [];
  for (let i = 0; i < days; i++) {
    const date = daysAgo(i);
    const steps = 4500 + Math.round(Math.sin(i / 2) * 1800 + i * 120);
    out.push({ id: uid('m'), kind: 'steps', date, value: Math.max(1500, steps), source: 'wearable', at: date + 'T20:00:00' });
    out.push({ id: uid('m'), kind: 'water_ml', date, value: 1250 + (i % 3) * 250, source: 'manual', at: date + 'T19:00:00' });
    if (i % 2 === 0) out.push({ id: uid('m'), kind: 'activity_min', date, value: 20 + (i % 3) * 10, source: 'manual', at: date + 'T18:00:00' });
    out.push({ id: uid('m'), kind: 'sleep_h', date, value: 6.5 + (i % 3) * 0.4, source: 'manual', at: date + 'T07:00:00' });
  }
  return out;
}

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreState;
      if (parsed.version === STATE_VERSION) return parsed;
    }
  } catch { /* ignore */ }
  return freshState();
}

/* -------------------------------- API ------------------------------------- */
export interface StoreApi {
  state: StoreState;
  setAccessCategory: (c: AccessCategory) => void;
  setCorporate: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  setConsent: (k: ConsentKey, granted: boolean) => void;
  completeAssessment: (r: AssessmentResult) => void;
  confirmNeeds: (confirmed: ConfirmedNeed[]) => void;
  saveRecommendation: (c: RecommendationCard) => void;
  selectOffer: (c: RecommendationCard) => string; // -> planItemId
  addPlanItem: (p: Omit<PlanItem, 'id' | 'createdAt' | 'updatedAt'>) => string;
  setPlanItemStatus: (id: string, status: PlanItemStatus) => void;
  createOrder: (o: Omit<Order, 'id' | 'createdAt'>) => string;
  createBooking: (b: Omit<Booking, 'id'>) => string;
  checkInBooking: (id: string) => void;
  addPlanTask: (t: Omit<PlanTask, 'id'>) => string;
  toggleTask: (id: string) => void;
  logMetric: (m: Omit<MetricRecord, 'id' | 'at'> & { at?: string }) => void;
  deleteMetric: (id: string) => void;
  setGoal: (g: PersonalGoal) => void;
  addMenstrualLog: (l: Omit<MenstrualCycleLog, 'id'>) => void;
  deleteMenstrualLog: (id: string) => void;
  toggleConnection: (id: string) => void;
  grantSharing: (g: Omit<SharingGrant, 'id' | 'grantedAt' | 'active'>) => void;
  revokeSharing: (id: string) => void;
  earnReward: (sourceEventId: string, points: number, reasonTr: string, autoApprove?: boolean) => void;
  reverseReward: (sourceEventId: string) => void;
  redeemReward: (itemId: string) => boolean;
  bookClass: (gymId: string, offerId: string, slotIso: string, classTr?: string) => string;
  checkInClass: (bookingId: string) => void;
  cancelClass: (bookingId: string) => void;
  addMealEntry: (date: string, slot: MealSlot, recipeId: string) => void;
  removeMealEntry: (id: string) => void;
  buildGrocery: () => void;
  toggleGrocery: (id: string) => void;
  addCustomModule: (m: Omit<CustomModulePlan, 'id' | 'createdAt'>) => void;
  reassess: (r: AssessmentResult, note?: string) => void;
  addEvent: (type: ProgressEventType, data: Record<string, unknown>, sourceEventId?: string) => void;
  resetDemo: () => void;
  seedScenario: (name: string) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(() => loadState());

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const patch = useCallback((fn: (s: StoreState) => StoreState) => setState((s) => fn(s)), []);

  const pushEvent = (s: StoreState, type: ProgressEventType, data: Record<string, unknown>, sourceEventId?: string): StoreState => ({
    ...s,
    events: [...s.events, { id: uid('ev'), type, at: nowIso(), data, sourceEventId }],
  });

  const api: StoreApi = useMemo(() => ({
    state,
    setAccessCategory: (c) => patch((s) => ({ ...s, user: { ...s.user, accessCategory: c } })),
    setCorporate: (v) => patch((s) => ({ ...s, user: { ...s.user, corporate: v } })),
    setOnboarded: (v) => patch((s) => ({ ...s, onboarded: v })),
    setConsent: (k, granted) => patch((s) => ({
      ...s, consents: s.consents.map((c) => (c.key === k ? { ...c, granted, grantedAt: granted ? nowIso() : undefined } : c)),
    })),
    completeAssessment: (r) => patch((s) => ({ ...s, assessment: r, assessmentHistory: [...s.assessmentHistory, r] })),
    confirmNeeds: (confirmed) => patch((s) => {
      if (!s.assessment) return s;
      const next = { ...s, assessment: { ...s.assessment, confirmed } };
      return pushEvent(next, 'need_confirmed', { count: confirmed.length, ids: confirmed.map((c) => c.microNeedId) });
    }),
    saveRecommendation: (c) => patch((s) => ({ ...s, savedRecommendations: dedupeById([...s.savedRecommendations, c]) })),
    selectOffer: (c) => {
      const id = uid('pi');
      patch((s) => {
        const item: PlanItem = {
          id, title: c.titleTr, microNeedIds: c.matchedMicroNeeds,
          serviceId: c.kind === 'single_service' || c.kind === 'easy_start' ? c.serviceIds[0] : undefined,
          packageId: c.kind === 'package' ? (c.refId as any) : undefined,
          status: 'selected', createdAt: nowIso(), updatedAt: nowIso(),
        };
        let next = { ...s, planItems: [...s.planItems, item] };
        next = pushEvent(next, 'recommendation_selected', { refId: c.refId, kind: c.kind, planItemId: id });
        return next;
      });
      return id;
    },
    addPlanItem: (p) => {
      const id = uid('pi');
      patch((s) => ({ ...s, planItems: [...s.planItems, { ...p, id, createdAt: nowIso(), updatedAt: nowIso() }] }));
      return id;
    },
    setPlanItemStatus: (id, status) => patch((s) => ({
      ...s, planItems: s.planItems.map((p) => (p.id === id ? { ...p, status, updatedAt: nowIso() } : p)),
    })),
    createOrder: (o) => {
      const id = uid('ord');
      patch((s) => {
        let next = { ...s, orders: [...s.orders, { ...o, id, createdAt: nowIso() }] };
        next = pushEvent(next, o.status === 'entitlement_used' ? 'entitlement_used' : 'order_paid', { orderId: id, refId: o.refId });
        return next;
      });
      return id;
    },
    createBooking: (b) => {
      const id = uid('bk');
      patch((s) => {
        let next = { ...s, bookings: [...s.bookings, { ...b, id }] };
        next = pushEvent(next, 'booking_created', { bookingId: id, serviceId: b.serviceId });
        return next;
      });
      return id;
    },
    checkInBooking: (id) => patch((s) => {
      let next = { ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: 'completed' as const } : b)) };
      next = pushEvent(next, 'service_completed', { bookingId: id });
      return next;
    }),
    addPlanTask: (t) => {
      const id = uid('tk');
      patch((s) => ({ ...s, planTasks: [...s.planTasks, { ...t, id }] }));
      return id;
    },
    toggleTask: (id) => patch((s) => {
      const task = s.planTasks.find((t) => t.id === id);
      const willBeDone = task ? !task.done : false;
      let next = { ...s, planTasks: s.planTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) };
      if (willBeDone) next = pushEvent(next, 'task_completed', { taskId: id });
      return next;
    }),
    logMetric: (m) => patch((s) => {
      const rec: MetricRecord = { ...m, id: uid('m'), at: m.at ?? nowIso() };
      let next = { ...s, metrics: [...s.metrics, rec] };
      next = pushEvent(next, 'metric_logged', { kind: m.kind, value: m.value, source: m.source });
      return next;
    }),
    deleteMetric: (id) => patch((s) => ({ ...s, metrics: s.metrics.filter((m) => m.id !== id) })),
    setGoal: (g) => patch((s) => ({
      ...s, personalGoals: s.personalGoals.some((x) => x.kind === g.kind)
        ? s.personalGoals.map((x) => (x.kind === g.kind ? g : x))
        : [...s.personalGoals, g],
    })),
    addMenstrualLog: (l) => patch((s) => ({ ...s, menstrualLogs: [...s.menstrualLogs, { ...l, id: uid('mc') }] })),
    deleteMenstrualLog: (id) => patch((s) => ({ ...s, menstrualLogs: s.menstrualLogs.filter((l) => l.id !== id) })),
    toggleConnection: (id) => patch((s) => ({
      ...s, dataConnections: s.dataConnections.map((c) => (c.id === id ? { ...c, connected: !c.connected } : c)),
    })),
    grantSharing: (g) => patch((s) => {
      let next = { ...s, sharingGrants: [...s.sharingGrants, { ...g, id: uid('sg'), grantedAt: nowIso(), active: true }] };
      next = pushEvent(next, 'sharing_granted', { withTr: g.withTr, kinds: g.dataKinds });
      return next;
    }),
    revokeSharing: (id) => patch((s) => {
      let next = { ...s, sharingGrants: s.sharingGrants.map((g) => (g.id === id ? { ...g, active: false } : g)) };
      next = pushEvent(next, 'sharing_revoked', { id });
      return next;
    }),
    earnReward: (sourceEventId, points, reasonTr, autoApprove = true) => patch((s) => {
      const res = autoApprove
        ? earnAndApprove(s.pointsLedger, { sourceEventId, points, reasonTr })
        : earn(s.pointsLedger, { sourceEventId, points, reasonTr });
      let next = { ...s, pointsLedger: res.ledger };
      if (res.added) next = pushEvent(next, 'reward_earned', { sourceEventId, points: res.grantedPoints });
      return next;
    }),
    reverseReward: (sourceEventId) => patch((s) => {
      let next = { ...s, pointsLedger: reverse(s.pointsLedger, sourceEventId) };
      next = pushEvent(next, 'reward_reversed', { sourceEventId });
      return next;
    }),
    redeemReward: (itemId) => {
      const item = REWARD_CATALOGUE.find((r) => r.id === itemId);
      if (!item) return false;
      if (balances(state.pointsLedger).spendable < item.costPoints) return false;
      patch((s) => {
        const res = redeemPoints(s.pointsLedger, itemId, item.costPoints, item.titleTr);
        if (!res.ok) return s;
        const redemption: RewardRedemption = {
          id: uid('rd'), itemId, at: nowIso(), code: 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
          status: 'issued', expiresAt: daysAgo(-item.validDaysAfterRedeem),
        };
        let next = { ...s, pointsLedger: res.ledger, redemptions: [...s.redemptions, redemption] };
        next = pushEvent(next, 'reward_redeemed', { itemId, cost: item.costPoints });
        return next;
      });
      return true;
    },
    bookClass: (gymId, offerId, slotIso, classTr) => {
      const id = uid('fb');
      patch((s) => ({ ...s, fitnessBookings: [...s.fitnessBookings, { id, gymId, offerId, slotIso, classTr, status: 'booked' }] }));
      return id;
    },
    checkInClass: (bookingId) => patch((s) => {
      const bk = s.fitnessBookings.find((b) => b.id === bookingId);
      if (!bk || bk.status === 'checked_in') return s; // idempotent at UI level
      const sourceEventId = `checkin:${bookingId}`;
      const res = earnAndApprove(s.pointsLedger, { sourceEventId, points: 60, reasonTr: 'Doğrulanmış salon check-in (demo)' });
      let next = {
        ...s,
        fitnessBookings: s.fitnessBookings.map((b) => (b.id === bookingId ? { ...b, status: 'checked_in' as const, checkInSourceId: sourceEventId } : b)),
        pointsLedger: res.ledger,
        missions: bumpMission(s.missions),
      };
      next = pushEvent(next, 'booking_checkin', { bookingId, sourceEventId });
      if (res.added) next = pushEvent(next, 'reward_earned', { sourceEventId, points: res.grantedPoints });
      return next;
    }),
    cancelClass: (bookingId) => patch((s) => {
      const bk = s.fitnessBookings.find((b) => b.id === bookingId);
      let ledger = s.pointsLedger;
      if (bk?.status === 'checked_in' && bk.checkInSourceId) ledger = reverse(ledger, bk.checkInSourceId);
      let next = {
        ...s, pointsLedger: ledger,
        fitnessBookings: s.fitnessBookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b)),
      };
      if (bk?.status === 'checked_in') next = pushEvent(next, 'reward_reversed', { bookingId });
      return next;
    }),
    addMealEntry: (date, slot, recipeId) => patch((s) => ({
      ...s, mealPlan: [...s.mealPlan.filter((e) => !(e.date === date && e.slot === slot)), { id: uid('mp'), date, slot, recipeId }],
    })),
    removeMealEntry: (id) => patch((s) => ({ ...s, mealPlan: s.mealPlan.filter((e) => e.id !== id) })),
    buildGrocery: () => patch((s) => ({ ...s, grocery: buildGroceryList(s.mealPlan) })),
    toggleGrocery: (id) => patch((s) => ({ ...s, grocery: s.grocery.map((g) => (g.id === id ? { ...g, done: !g.done } : g)) })),
    addCustomModule: (m) => patch((s) => ({ ...s, customModules: [...s.customModules, { ...m, id: uid('cm'), createdAt: nowIso() }] })),
    reassess: (r, note) => patch((s) => {
      let next: StoreState = { ...s, assessment: r, assessmentHistory: [...s.assessmentHistory, r], reassessments: [...s.reassessments, { id: uid('ra'), createdAt: nowIso(), resultSessionId: r.sessionId, note }] };
      next = pushEvent(next, 'reassessment', { sessionId: r.sessionId });
      return next;
    }),
    addEvent: (type, data, sourceEventId) => patch((s) => {
      let next = pushEvent(s, type, data, sourceEventId);
      if (type === 'activity_completed') next = { ...next, missions: bumpMission(next.missions) };
      return next;
    }),
    resetDemo: () => setState(freshState()),
    seedScenario: (name) => setState(() => buildScenario(name)),
  }), [state, patch]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

/* ------------------------------ helper funcs ------------------------------ */
function dedupeById<T extends { id: string }>(arr: T[]): T[] {
  const m = new Map<string, T>();
  for (const x of arr) m.set(x.id, x);
  return [...m.values()];
}

function bumpMission(missions: WeeklyMission[]): WeeklyMission[] {
  // advance the first incomplete, accessible "active" missions by one
  let bumped = false;
  return missions.map((m) => {
    if (!bumped && m.progress < m.target) { bumped = true; return { ...m, progress: m.progress + 1 }; }
    return m;
  });
}

function buildGroceryList(entries: MealPlanEntry[]): GroceryItem[] {
  const map = new Map<string, number>();
  for (const e of entries) {
    const r = RECIPES.find((x) => x.id === e.recipeId);
    for (const ing of r?.ingredientsTr ?? []) {
      map.set(ing, (map.get(ing) ?? 0) + 1);
    }
  }
  return [...map.entries()].map(([name, count]) => ({
    id: uid('gi'), nameTr: name, qtyTr: count > 1 ? `${count} tarifte` : '1 tarif', done: false,
  }));
}

function buildScenario(name: string): StoreState {
  const base = freshState();
  base.onboarded = true;
  base.consents = base.consents.map((c) => (c.key === 'health_data_processing' ? { ...c, granted: true, grantedAt: nowIso() } : c));
  base.seededScenario = name;
  switch (name) {
    case 'first_time':
      return { ...freshState(), onboarded: false, seededScenario: name };
    case 'routine_builder':
      base.metrics = seedMetrics(14);
      base.dataConnections = base.dataConnections.map((c) => (c.source === 'wearable' ? { ...c, connected: true } : c));
      return base;
    case 'data_sharer':
      base.metrics = seedMetrics(10);
      return base;
    case 'access_elsewhere':
      base.user = { ...base.user, accessCategory: 'insured_elsewhere' };
      return base;
    case 'access_uninsured':
      base.user = { ...base.user, accessCategory: 'uninsured' };
      return base;
    case 'corporate':
      base.user = { ...base.user, corporate: true };
      return base;
    default:
      return base;
  }
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export { getPackage, getService, today, REWARD_CATALOGUE };
