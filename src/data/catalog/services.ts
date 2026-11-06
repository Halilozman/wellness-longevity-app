import type { Service, ServiceModuleRelation } from '@/types';

/**
 * SERVICES
 * - 4 VERIFIED mappings taken verbatim from the master prompt (verified: true).
 * - N02 referenced in the spec (nutrition studio).
 * - The remainder are clearly-flagged SAMPLE services (isSample: true) so the
 *   catalog, recommendations and package comparison are demonstrable. They are
 *   NOT fabricated catalog rows — real rows arrive via scripts/import-catalog.ts
 *   from ALZ_Servis_Bazli_Uygulama_Plani.xlsx (193 unique services).
 */
export const SERVICES: Service[] = [
  // ---- VERIFIED ----
  {
    id: 'C01', nameTr: 'Sağlık öyküsü ve ihtiyaç görüşmesi', nameEn: 'Health history and needs consultation',
    descTr: 'Bir klinisyenle sağlık önceliklerini netleştirdiğin başlangıç görüşmesi.',
    macroNeedId: 'MN2', microNeedIds: ['MNEED_PRIORITIES'], deliveryMode: 'video', phase: 'phase1',
    status: 'active', needsProfessional: true, demoPriceTry: 1200, priceModel: 'per_use', isSample: false, verified: true,
  },
  {
    id: 'C02', nameTr: 'Diyetisyen görüşmesi', nameEn: 'Dietitian consultation',
    descTr: 'Beslenme ihtiyacını bir diyetisyenle değerlendirdiğin görüşme.',
    macroNeedId: 'MN1', microNeedIds: ['MNEED_NUTRITION_UNDERSTAND', 'MNEED_NUTRITION_PLAN'], deliveryMode: 'video',
    phase: 'phase1', status: 'active', needsProfessional: true, demoPriceTry: 900, priceModel: 'per_use', isSample: false, verified: true,
  },
  {
    id: 'C03', nameTr: 'Kişisel beslenme planı', nameEn: 'Personal nutrition plan',
    descTr: 'Günlük rutinine uygun, uzman onaylı kişisel beslenme planı.',
    macroNeedId: 'MN1', microNeedIds: ['MNEED_NUTRITION_PLAN'], deliveryMode: 'hybrid', phase: 'phase1',
    status: 'active', needsProfessional: true, demoPriceTry: 700, priceModel: 'per_use', isSample: false, verified: true,
  },
  {
    id: 'C05', nameTr: 'Aktivite ve egzersiz uygunluğu', nameEn: 'Activity and exercise suitability',
    descTr: 'Güvenle egzersize başlaman için uygunluk değerlendirmesi.',
    macroNeedId: 'MN1', microNeedIds: ['MNEED_MOVE_START'], deliveryMode: 'video', phase: 'phase1',
    status: 'active', needsProfessional: true, demoPriceTry: 600, priceModel: 'per_use', isSample: false, verified: true,
  },
  // ---- Referenced in spec (nutrition studio) ----
  {
    id: 'N02', nameTr: 'Öğün planlama rehberliği', nameEn: 'Meal planning guidance',
    descTr: 'Haftalık öğün planı kurman için rehberlik ve pratik araçlar.',
    macroNeedId: 'MN1', microNeedIds: ['MNEED_NUTRITION_PLAN', 'MNEED_HABITS'], deliveryMode: 'digital', phase: 'phase1',
    status: 'active', needsProfessional: false, demoPriceTry: 300, priceModel: 'per_use', isSample: false, verified: false,
  },

  // ---- SAMPLE (isSample: true) — one per remaining micro-need ----
  s('SMPL_MOVE_PROG', 'Rehberli hareket programı', 'Guided movement programme', 'MN1', ['MNEED_MOVE_ROUTINE'], ['M03', 'M06'], 'hybrid', 'active', false, 500),
  s('SMPL_WEIGHT', 'Sağlıklı kilo koçluğu', 'Healthy weight coaching', 'MN1', ['MNEED_WEIGHT'], ['M02'], 'video', 'active', true, 800),
  s('SMPL_SLEEP', 'Uyku görüşmesi', 'Sleep consultation', 'MN1', ['MNEED_SLEEP'], ['M04'], 'video', 'active', true, 850),
  s('SMPL_STRESS', 'Stres yönetimi programı', 'Stress relief programme', 'MN1', ['MNEED_STRESS'], ['M05'], 'digital', 'active', false, 450),
  s('SMPL_ENERGY', 'Enerji ve alışkanlık kontrolü', 'Energy & habits check-in', 'MN1', ['MNEED_ENERGY'], ['M06', 'M01'], 'digital', 'active', false, 350),
  s('SMPL_HABITS', 'Sağlıklı alışkanlık koçluğu', 'Healthy habits coaching', 'MN1', ['MNEED_HABITS'], ['M06'], 'digital', 'active', false, 400),
  s('SMPL_SOCIAL', 'Sosyal bağ programı', 'Social connection programme', 'MN1', ['MNEED_SOCIAL'], ['M22'], 'in_person', 'soon', false),
  s('SMPL_WORK', 'İş yerinde iyi oluş seansı', 'Workplace wellbeing session', 'MN1', ['MNEED_WORKPLACE'], ['M23'], 'hybrid', 'active', true, 600),
  s('SMPL_PREV', 'Önleyici tarama yönlendirmesi', 'Preventive screening navigation', 'MN2', ['MNEED_PREVENTION'], ['M07', 'M09'], 'video', 'active', true, 950),
  s('SMPL_HEART', 'Kalp-damar kontrolü', 'Cardiovascular check', 'MN2', ['MNEED_HEART'], ['M08'], 'in_person', 'active', true, 1400),
  s('SMPL_METAB', 'Metabolik risk değerlendirmesi', 'Metabolic risk review', 'MN2', ['MNEED_METABOLIC'], ['M09'], 'video', 'active', true, 1100),
  s('SMPL_ORAL', 'Ağız sağlığı kontrolü', 'Oral health check', 'MN2', ['MNEED_ORAL'], ['M10'], 'in_person', 'request_info', true),
  s('SMPL_VISION', 'Görme taraması', 'Vision screening', 'MN2', ['MNEED_VISION'], ['M11'], 'in_person', 'soon', true),
  s('SMPL_HEAR', 'İşitme taraması', 'Hearing screening', 'MN2', ['MNEED_HEARING'], ['M12'], 'in_person', 'soon', true),
  s('SMPL_WOMEN', 'Kadın önleyici sağlık görüşmesi', "Women's preventive consultation", 'MN3', ['MNEED_WOMEN'], ['M13'], 'video', 'active', true, 950),
  s('SMPL_MEN', 'Erkek sağlığı kontrolü', "Men's health check", 'MN3', ['MNEED_MEN'], ['M14'], 'video', 'active', true, 950),
  s('SMPL_MAT', 'Gebelik ve doğum sonrası destek', 'Maternal & postnatal support', 'MN3', ['MNEED_MATERNAL'], ['M15'], 'hybrid', 'active', true, 1000),
  s('SMPL_MENO', 'Menopoz destek görüşmesi', 'Menopause support consultation', 'MN3', ['MNEED_MENOPAUSE'], ['M16'], 'video', 'active', true, 900),
  s('SMPL_FAMILY', 'Aile iyi oluş seansı', 'Family wellbeing session', 'MN3', ['MNEED_FAMILY'], ['M17'], 'hybrid', 'active', false, 650),
  s('SMPL_PELVIC', 'Pelvik sağlık görüşmesi', 'Pelvic health consultation', 'MN3', ['MNEED_PELVIC'], ['M24'], 'video', 'request_info', true),
  s('SMPL_AGE', 'Sağlıklı yaşlanma değerlendirmesi', 'Healthy ageing assessment', 'MN4', ['MNEED_AGEING'], ['M18', 'M21'], 'hybrid', 'active', true, 1050),
  s('SMPL_MSK', 'Kas-iskelet görüşmesi', 'Musculoskeletal consultation', 'MN4', ['MNEED_MSK'], ['M19'], 'video', 'active', true, 900),
  s('SMPL_COG', 'Bilişsel sağlık kontrolü', 'Cognitive health check', 'MN4', ['MNEED_COGNITIVE'], ['M20'], 'video', 'soon', true),
  s('SMPL_BAL', 'Denge ve düşme önleme programı', 'Balance & fall prevention programme', 'MN4', ['MNEED_BALANCE'], ['M21'], 'hybrid', 'active', false, 550),
];

/** compact helper for sample services */
function s(
  id: string, nameTr: string, nameEn: string, macroNeedId: Service['macroNeedId'],
  microNeedIds: string[], moduleIds: string[], deliveryMode: Service['deliveryMode'],
  status: Service['status'], needsProfessional: boolean, demoPriceTry?: number,
): Service & { _moduleIds: string[] } {
  return {
    id, nameTr, nameEn, descTr: `${nameTr} — örnek katalog servisi (demo).`,
    macroNeedId, microNeedIds, deliveryMode, phase: 'phase1', status, needsProfessional,
    demoPriceTry, priceModel: demoPriceTry ? 'per_use' : undefined, isSample: true, verified: false,
    _moduleIds: moduleIds,
  } as Service & { _moduleIds: string[] };
}

/** Service ↔ Module relations (a service may map to several modules, one Service ID). */
export const SERVICE_MODULE_RELATIONS: ServiceModuleRelation[] = (() => {
  const rels: ServiceModuleRelation[] = [];
  // verified / referenced
  const fixed: Record<string, string[]> = {
    C01: ['M07'], C02: ['M01'], C03: ['M01'], C05: ['M03'], N02: ['M01'],
  };
  for (const [serviceId, mods] of Object.entries(fixed)) {
    for (const moduleId of mods) rels.push({ serviceId, moduleId: moduleId as any });
  }
  // samples carry their module list on _moduleIds
  for (const svc of SERVICES as Array<Service & { _moduleIds?: string[] }>) {
    if (svc._moduleIds) for (const m of svc._moduleIds) rels.push({ serviceId: svc.id, moduleId: m as any });
  }
  return rels;
})();
