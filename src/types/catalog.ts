/* ============================================================================
   Catalog domain types — the single source of truth for needs, modules,
   services, packages and the assessment. Mirrors the ALZ W&L catalog
   structure (4 macro needs, 24 modules, 193 services, 9 packages).
   The shipped data populates all modules/packages/macro-needs and a set of
   VERIFIED + SAMPLE services; the full 193 are imported from the xlsx.
   ============================================================================ */

export type MacroNeedId = 'MN1' | 'MN2' | 'MN3' | 'MN4';

export interface MacroNeed {
  id: MacroNeedId;
  nameEn: string;
  nameTr: string;
  descTr: string;
  emoji: string;
}

/** 24 fixed modules M01..M24 */
export type ModuleId =
  | 'M01' | 'M02' | 'M03' | 'M04' | 'M05' | 'M06' | 'M07' | 'M08'
  | 'M09' | 'M10' | 'M11' | 'M12' | 'M13' | 'M14' | 'M15' | 'M16'
  | 'M17' | 'M18' | 'M19' | 'M20' | 'M21' | 'M22' | 'M23' | 'M24';

export interface Module {
  id: ModuleId;
  nameEn: string;
  nameTr: string;
  macroNeedIds: MacroNeedId[];
  emoji: string;
}

/** A micro-need: the granular, user-confirmable unit the whole product turns on. */
export interface MicroNeed {
  id: string; // e.g. "MNEED_MOVE_START"
  nameTr: string;
  shortTr: string; // phrasing shown on the need map
  macroNeedId: MacroNeedId;
  moduleIds: ModuleId[];
}

export type ServiceStatus = 'active' | 'soon' | 'request_info' | 'leave_request';
export type DeliveryMode = 'digital' | 'in_person' | 'phone' | 'video' | 'hybrid';
export type ServicePhase = 'phase1' | 'phase2' | 'phase3' | 'future';

export interface Service {
  id: string; // e.g. "C01", "C02", "N02" — stable Service ID, never duplicated
  nameTr: string;
  nameEn: string;
  descTr: string;
  macroNeedId: MacroNeedId;
  microNeedIds: string[];
  deliveryMode: DeliveryMode;
  phase: ServicePhase;
  status: ServiceStatus;
  needsProfessional: boolean;
  /** demo price in TRY — ALWAYS rendered as "Demo fiyatı", never a real quote */
  demoPriceTry?: number;
  priceModel?: 'per_use' | 'included' | 'subscription';
  /** true => invented placeholder sample, not a verified catalog row */
  isSample: boolean;
  verified?: boolean; // true for the 4 explicitly-verified mappings
}

/** A service may appear in several modules but carries ONE id. */
export interface ServiceModuleRelation {
  serviceId: string;
  moduleId: ModuleId;
}

export type PackageId =
  | 'PK01' | 'PK02' | 'PK03' | 'PK04' | 'PK05' | 'PK06' | 'PK07' | 'PK08' | 'PK09';

export interface Package {
  id: PackageId;
  nameEn: string;
  nameTr: string;
  descTr: string;
  focusTr: string;
  emoji: string;
}

export type Inclusion = 'core' | 'optional' | 'choose_one' | 'not_included';

export interface PackageServiceRelation {
  packageId: PackageId;
  serviceId: string;
  inclusion: Inclusion;
  /** choose_one services are grouped; user picks one per group */
  chooseGroup?: string;
}

/* ----------------------------- Assessment --------------------------------- */

export type AnswerType = 'single' | 'multi' | 'scale' | 'priority' | 'text';

export interface AnswerOption {
  id: string;
  labelTr: string;
  emoji?: string;
  /** micro-needs this answer contributes evidence toward, with a weight 1..3 */
  needWeights?: { microNeedId: string; weight: number }[];
  /** safety stop (e.g. acute symptom) -> halts recommendations */
  safetyStop?: boolean;
  /** which goal areas this option opens follow-up questions for */
  opensAreas?: string[];
}

export interface Question {
  id: string;
  kind: 'welcome' | 'core' | 'followup';
  /** goal-area this question belongs to; welcome + core may be area 'general' */
  area: string;
  promptTr: string;
  helpTr?: string;
  type: AnswerType;
  options?: AnswerOption[];
  sensitive?: boolean; // optional, may be skipped
  /** show this follow-up only if one of these option ids was chosen earlier */
  showIfAnyOption?: string[];
  scaleLabels?: [string, string];
}
