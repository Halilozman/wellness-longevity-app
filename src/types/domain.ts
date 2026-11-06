/* ============================================================================
   Runtime / user domain types — user, access, assessment results,
   recommendations, entitlements, plan, metrics, scores, rewards, digital.
   ============================================================================ */

import type { Inclusion, ModuleId, PackageId } from './catalog';

/* ------------------------------- User / access ---------------------------- */

export type AccessCategory = 'alz' | 'insured_elsewhere' | 'uninsured';

export interface User {
  id: string;
  nameTr: string;
  accessCategory: AccessCategory;
  corporate?: boolean; // employer-sponsored eligibility
}

export type ConsentKey =
  | 'health_data_processing'
  | 'wearable_sync'
  | 'menstrual_tracking'
  | 'marketing'
  | 'share_with_expert';

export interface Consent {
  key: ConsentKey;
  granted: boolean;
  grantedAt?: string;
}

/* ------------------------------- Assessment ------------------------------- */

export interface AssessmentSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  selectedAreas: string[];
  answers: Record<string, AnswerValue>;
  safetyTriggered?: boolean;
}

export type AnswerValue = string | string[] | number;

export interface ScoredNeed {
  microNeedId: string;
  rawScore: number; // self-report evidence 0..100
}

export interface ConfirmedNeed {
  microNeedId: string;
  priority: number; // 1 = top; 0 = confirmed but unranked
}

export interface AssessmentResult {
  sessionId: string;
  createdAt: string;
  answers: Record<string, AnswerValue>; // raw answers, for signals + reassessment diffs
  scored: ScoredNeed[]; // all candidates with discovery score
  confirmed: ConfirmedNeed[]; // after user edits/ranks
  ruleVersion: string;
}

/* ----------------------------- Recommendation ----------------------------- */

export type OfferKind = 'single_service' | 'custom_module' | 'package' | 'easy_start';

export interface CoverageBreakdown {
  core: string[]; // confirmed micro-need ids covered as core
  optional: string[];
  chooseOne: string[];
  uncovered: string[];
}

export interface RecommendationCard {
  id: string;
  tier: 'primary' | 'smaller' | 'larger';
  kind: OfferKind;
  refId: string; // serviceId | packageId | moduleId
  titleTr: string;
  matchedMicroNeeds: string[];
  serviceIds: string[];
  coverage: CoverageBreakdown;
  reasonTr: string;
  fitScore: number; // 0..100
  ruleVersion: string;
}

export interface CustomModulePlan {
  id: string;
  baseModuleId: ModuleId;
  microNeedId: string;
  serviceIds: string[];
  createdAt: string;
}

/* ----------------------------- Entitlement / commerce --------------------- */

export type CommercialOfferType = 'single_service' | 'module_package' | 'membership' | 'corporate';
export type SupportTier = 'essential' | 'guided' | 'premium';

export interface EligibilityResult {
  serviceId: string;
  accessCategory: AccessCategory;
  visible: boolean;
  entitled: boolean; // covered without extra payment
  payPerUse: boolean;
  reasonTr: string;
  demoPriceTry?: number;
}

export type OrderStatus = 'created' | 'paid' | 'entitlement_used' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  refId: string; // serviceId | packageId | offer id
  kind: OfferKind | CommercialOfferType;
  status: OrderStatus;
  supportTier?: SupportTier;
  amountTry?: number;
  isDemoPrice: boolean;
  createdAt: string;
}

export type BookingStatus = 'booked' | 'completed' | 'cancelled' | 'rescheduled';

export interface Booking {
  id: string;
  orderId?: string;
  serviceId: string;
  providerTr: string;
  slotIso: string;
  status: BookingStatus;
  channel: 'video' | 'in_person' | 'digital';
}

/* --------------------------------- My Plan -------------------------------- */

export type PlanItemStatus =
  | 'recommended' | 'selected' | 'eligibility_check' | 'purchased'
  | 'booked' | 'in_progress' | 'completed' | 'follow_up';

export interface PlanItem {
  id: string;
  title: string;
  microNeedIds: string[];
  serviceId?: string;
  packageId?: PackageId;
  status: PlanItemStatus;
  supportTier?: SupportTier;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanTask {
  id: string;
  title: string;
  kind: 'habit' | 'appointment' | 'digital_activity' | 'review';
  due: 'today' | 'this_week' | 'next';
  done: boolean;
  linkedActivityId?: string;
  linkedPlanItemId?: string;
}

export interface Reassessment {
  id: string;
  createdAt: string;
  resultSessionId: string;
  note?: string;
}

/* --------------------------- Progress event store ------------------------- */

export type ProgressEventType =
  | 'need_confirmed' | 'recommendation_selected' | 'order_created' | 'order_paid'
  | 'entitlement_used' | 'booking_created' | 'booking_checkin' | 'service_completed'
  | 'task_completed' | 'metric_logged' | 'activity_completed'
  | 'reward_earned' | 'reward_redeemed' | 'reward_reversed'
  | 'plan_adapted' | 'reassessment' | 'sharing_granted' | 'sharing_revoked';

export interface ProgressEvent {
  id: string;
  type: ProgressEventType;
  at: string;
  /** free payload — kept generic so one store feeds Plan/Progress/Rewards */
  data: Record<string, unknown>;
  /** idempotency key for de-duplicating e.g. gym check-ins */
  sourceEventId?: string;
}

/* ------------------------------- Metrics ---------------------------------- */

export type MetricKind = 'steps' | 'water_ml' | 'activity_min' | 'sleep_h' | 'mood' | 'resting_hr';
export type MetricSource = 'manual' | 'phone' | 'wearable' | 'expert';

export interface MetricRecord {
  id: string;
  kind: MetricKind;
  date: string; // YYYY-MM-DD
  value: number;
  source: MetricSource;
  at: string;
  note?: string;
}

export interface DataConnection {
  id: string;
  source: MetricSource;
  label: string;
  connected: boolean;
  kinds: MetricKind[]; // per-data-type permission (no "all data" grant)
}

export interface PersonalGoal {
  kind: MetricKind;
  target: number;
  unitTr: string;
}

export interface MenstrualCycleLog {
  id: string;
  start: string;
  end?: string;
  flow?: 'light' | 'medium' | 'heavy';
  symptomsTr?: string[];
  note?: string;
}

export interface SharingGrant {
  id: string;
  withTr: string; // "Beslenme uzmanım Dr. ..."
  dataKinds: MetricKind[];
  rangeDays: number;
  grantedAt: string;
  active: boolean;
}

/* --------------------------------- Scores --------------------------------- */

export interface ScoreBreakdownItem {
  labelTr: string;
  value: number; // 0..100 progress toward that sub-goal
  weight: number;
  source: MetricSource | 'self_report' | 'catalog';
}

export interface ScoreResult {
  value: number | null; // null => insufficient data
  breakdown: ScoreBreakdownItem[];
  completeness: number; // 0..100 data-completeness
  updatedAt: string;
  ruleVersion: string;
  note?: string;
}

/* ------------------------------ Fitness access ---------------------------- */

export interface GymPartner {
  id: string;
  nameTr: string;
  cityTr: string;
  districtTr: string;
  sportsTr: string[];
  accessibilityTr: string[];
  rating: number;
  fictional: true; // demo partners are always flagged
  offers: GymAccessOffer[];
}

export type GymOfferKind = 'day_pass' | 'pay_per_visit' | 'class_pack' | 'monthly' | 'multi_site' | 'online';

export interface GymAccessOffer {
  id: string;
  kind: GymOfferKind;
  titleTr: string;
  demoPriceTry: number;
  termsTr: string;
}

export interface FitnessBooking {
  id: string;
  gymId: string;
  offerId: string;
  slotIso: string;
  classTr?: string;
  status: 'booked' | 'checked_in' | 'cancelled';
  checkInSourceId?: string; // idempotency for check-in
}

/* -------------------------------- Rewards --------------------------------- */

export type PointsStatus = 'pending' | 'approved' | 'reversed';

export interface PointsLedgerEntry {
  id: string;
  at: string;
  points: number; // positive earn, negative redemption/reversal
  status: PointsStatus;
  reasonTr: string;
  sourceEventId: string; // idempotency
  ruleVersion: string;
}

export interface WeeklyMission {
  id: string;
  titleTr: string;
  target: number;
  progress: number;
  points: number;
  accessibleAlt?: string; // alternative earning path
}

export interface RewardCatalogueItem {
  id: string;
  titleTr: string;
  costPoints: number;
  kindTr: string;
  demo: true;
  validDaysAfterRedeem: number;
}

export interface RewardRedemption {
  id: string;
  itemId: string;
  at: string;
  code: string;
  status: 'issued' | 'used' | 'cancelled' | 'expired';
  expiresAt: string;
}

/* ----------------------------- Digital activities ------------------------- */

export type ActivityType = 'movement' | 'mind' | 'sleep' | 'nutrition' | 'community';

export interface DigitalActivity {
  id: string;
  title: string;
  activityType: ActivityType;
  mappedMicroNeeds: string[];
  moduleIds: ModuleId[];
  durationMin: number;
  difficulty: 'baslangic' | 'orta' | 'ileri';
  format: string;
  providerTr: string;
  contentRights: 'original_demo' | 'licensed';
  accessRequirement: 'free' | 'eligible' | 'pay_per_use';
  healthSafetyNoteTr?: string;
  rewardEligible: boolean;
  reusesServiceId?: string;
  status: 'active' | 'soon';
}

export interface Recipe {
  id: string;
  titleTr: string;
  minutes: number;
  servings: number;
  ingredientsTr: string[];
  stepsTr: string[];
  tagsTr: string[];
}

export type MealSlot = 'kahvalti' | 'ogle' | 'aksam' | 'ara';

export interface MealPlanEntry {
  id: string;
  date: string; // YYYY-MM-DD
  slot: MealSlot;
  recipeId: string;
}

export interface GroceryItem {
  id: string;
  nameTr: string;
  qtyTr: string;
  done: boolean;
}

export interface CommunityChallenge {
  id: string;
  titleTr: string;
  descTr: string;
  goalTr: string;
  statusPoints: number;
  spendablePoints: number;
  accessibleAltTr?: string;
}

/* ----------------------- Clinical risk gate (future) ---------------------- */

export interface ClinicalRiskInsightApproval {
  approved: boolean; // false in this build — percentages stay hidden
  dataSourceValidated: boolean;
  intendedUseDefined: boolean;
  scientificValidation: boolean;
  professionalOversight: boolean;
  version: string;
}
