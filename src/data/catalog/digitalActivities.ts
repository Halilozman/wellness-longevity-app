import type { DigitalActivity } from '@/types';

/**
 * Digital care activities (Movement / Mind & Sleep / Nutrition / Community).
 * Content is ORIGINAL DEMO — no third-party branded videos, audio or recipes.
 * These are NOT new catalog services unless they reuse an approved Service ID.
 */
export const DIGITAL_ACTIVITIES: DigitalActivity[] = [
  // ---- Movement ----
  {
    id: 'DA_MOVE_STRETCH', title: '10 dk nazik esneme', activityType: 'movement',
    mappedMicroNeeds: ['MNEED_MOVE_START', 'MNEED_MSK'], moduleIds: ['M03', 'M19'],
    durationMin: 10, difficulty: 'baslangic', format: 'Rehberli adımlar', providerTr: 'ALZ W&L (demo)',
    contentRights: 'original_demo', accessRequirement: 'free',
    healthSafetyNoteTr: 'Ağrı hissedersen dur. Egzersiz uygunluğu için C05 değerlendirmesini düşün.',
    rewardEligible: true, status: 'active',
  },
  {
    id: 'DA_MOVE_STRENGTH', title: 'Başlangıç güç — 15 dk', activityType: 'movement',
    mappedMicroNeeds: ['MNEED_MOVE_ROUTINE'], moduleIds: ['M03', 'M06'],
    durationMin: 15, difficulty: 'baslangic', format: 'Rehberli adımlar', providerTr: 'ALZ W&L (demo)',
    contentRights: 'original_demo', accessRequirement: 'free',
    healthSafetyNoteTr: 'Kendi kapasitene göre ilerle.', rewardEligible: true, status: 'active',
  },
  {
    id: 'DA_MOVE_WALK', title: 'Yürüyüş hazırlığı — 5 dk', activityType: 'movement',
    mappedMicroNeeds: ['MNEED_MOVE_START', 'MNEED_ENERGY'], moduleIds: ['M03', 'M06'],
    durationMin: 5, difficulty: 'baslangic', format: 'Rehberli adımlar', providerTr: 'ALZ W&L (demo)',
    contentRights: 'original_demo', accessRequirement: 'free', rewardEligible: true, status: 'active',
  },
  {
    id: 'DA_MOVE_BALANCE', title: 'Denge mini pratiği — 8 dk', activityType: 'movement',
    mappedMicroNeeds: ['MNEED_BALANCE', 'MNEED_AGEING'], moduleIds: ['M21'],
    durationMin: 8, difficulty: 'baslangic', format: 'Rehberli adımlar', providerTr: 'ALZ W&L (demo)',
    contentRights: 'original_demo', accessRequirement: 'free',
    healthSafetyNoteTr: 'Düşme riski varsa bir yere tutunarak yap.', rewardEligible: true, status: 'active',
  },

  // ---- Mind & Sleep ----
  {
    id: 'DA_MIND_BREATH', title: '3 dk nefes molası', activityType: 'mind',
    mappedMicroNeeds: ['MNEED_STRESS'], moduleIds: ['M05', 'M06'],
    durationMin: 3, difficulty: 'baslangic', format: 'Sesli rehber (demo)', providerTr: 'ALZ W&L (demo)',
    contentRights: 'original_demo', accessRequirement: 'free',
    healthSafetyNoteTr: 'Meditasyon tedavi veya psikoterapi yerine geçmez.', rewardEligible: true, status: 'active',
  },
  {
    id: 'DA_MIND_FOCUS', title: 'Odak için 5 dk', activityType: 'mind',
    mappedMicroNeeds: ['MNEED_STRESS'], moduleIds: ['M05'],
    durationMin: 5, difficulty: 'baslangic', format: 'Sesli rehber (demo)', providerTr: 'ALZ W&L (demo)',
    contentRights: 'original_demo', accessRequirement: 'free', rewardEligible: true, status: 'active',
  },
  {
    id: 'DA_SLEEP_WIND', title: 'Uyku öncesi gevşeme — 6 dk', activityType: 'sleep',
    mappedMicroNeeds: ['MNEED_SLEEP'], moduleIds: ['M04', 'M05'],
    durationMin: 6, difficulty: 'baslangic', format: 'Sesli rehber (demo)', providerTr: 'ALZ W&L (demo)',
    contentRights: 'original_demo', accessRequirement: 'free', rewardEligible: true, status: 'active',
  },

  // ---- Nutrition ----
  {
    id: 'DA_FOOD_PLAN', title: '3 günlük kolay öğün planı', activityType: 'nutrition',
    mappedMicroNeeds: ['MNEED_NUTRITION_PLAN', 'MNEED_HABITS'], moduleIds: ['M01', 'M06'],
    durationMin: 10, difficulty: 'baslangic', format: 'Planlayıcı', providerTr: 'ALZ W&L (demo)',
    contentRights: 'original_demo', accessRequirement: 'free', reusesServiceId: 'N02',
    healthSafetyNoteTr: 'Tıbbi/özel diyet için diyetisyen (C02) değerlendirmesi önerilir.',
    rewardEligible: false, status: 'active',
  },

  // ---- Community ----
  {
    id: 'DA_COMMUNITY_WALK', title: 'Topluluk yürüyüş görevi', activityType: 'community',
    mappedMicroNeeds: ['MNEED_SOCIAL', 'MNEED_MOVE_ROUTINE'], moduleIds: ['M22', 'M03'],
    durationMin: 30, difficulty: 'baslangic', format: 'Gönüllü görev', providerTr: 'ALZ W&L (demo)',
    contentRights: 'original_demo', accessRequirement: 'free', rewardEligible: true, status: 'active',
  },
];
