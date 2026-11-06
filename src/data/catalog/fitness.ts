import type { GymPartner, WeeklyMission, RewardCatalogueItem } from '@/types';

/** Demo gym partners — ALWAYS fictional, never presented as real ALZ deals. */
export const GYM_PARTNERS: GymPartner[] = [
  {
    id: 'GYM_ARI', nameTr: 'Arı Spor Stüdyo (demo)', cityTr: 'İstanbul', districtTr: 'Kadıköy',
    sportsTr: ['Fitness', 'Yoga', 'Pilates'], accessibilityTr: ['Asansör', 'Engelli erişimi'],
    rating: 4.6, fictional: true,
    offers: [
      { id: 'OF_ARI_DAY', kind: 'day_pass', titleTr: 'Tek gün giriş', demoPriceTry: 350, termsTr: 'Tek seferlik, iptal yok.' },
      { id: 'OF_ARI_PACK', kind: 'class_pack', titleTr: '10 derslik paket', demoPriceTry: 2800, termsTr: '3 ay geçerli, devredilemez.' },
      { id: 'OF_ARI_MONTH', kind: 'monthly', titleTr: 'Aylık üyelik', demoPriceTry: 1900, termsTr: 'Aylık yenilenir, 14 gün önce iptal.' },
    ],
  },
  {
    id: 'GYM_MAVI', nameTr: 'Mavi Fit Kulüp (demo)', cityTr: 'İstanbul', districtTr: 'Şişli',
    sportsTr: ['Fitness', 'Yüzme', 'Grup dersi'], accessibilityTr: ['Otopark'],
    rating: 4.3, fictional: true,
    offers: [
      { id: 'OF_MAVI_VISIT', kind: 'pay_per_visit', titleTr: 'Kullanım başına', demoPriceTry: 420, termsTr: 'Her girişte ödenir.' },
      { id: 'OF_MAVI_MULTI', kind: 'multi_site', titleTr: 'Çok tesisli aylık', demoPriceTry: 2600, termsTr: 'Tüm şubeler, aylık yenilenir.' },
    ],
  },
  {
    id: 'GYM_ONLINE', nameTr: 'Evde Hareket Online (demo)', cityTr: 'Çevrim içi', districtTr: '—',
    sportsTr: ['Canlı ders', 'İsteğe bağlı ders'], accessibilityTr: ['Evden katılım'],
    rating: 4.5, fictional: true,
    offers: [
      { id: 'OF_ONLINE_MONTH', kind: 'online', titleTr: 'Aylık online erişim', demoPriceTry: 700, termsTr: 'Sınırsız canlı/kayıt ders, aylık.' },
    ],
  },
];

export const WEEKLY_MISSIONS: WeeklyMission[] = [
  { id: 'WM_FIRST_STEP', titleTr: 'İlk adımını at', target: 1, progress: 0, points: 50, accessibleAlt: 'Dijital hareket oturumu da sayılır.' },
  { id: 'WM_3_DAYS', titleTr: '3 farklı gün hareket et', target: 3, progress: 0, points: 120, accessibleAlt: 'Kısa yürüyüş veya esneme de sayılır.' },
  { id: 'WM_STUDIO', titleTr: 'İlk stüdyo dersine katıl', target: 1, progress: 0, points: 90, accessibleAlt: 'Online canlı ders de uygundur.' },
  { id: 'WM_ROUTINE', titleTr: '7 gün küçük bir rutin dene', target: 7, progress: 0, points: 150, accessibleAlt: 'Kendi kapasitene göre hedefi ayarlayabilirsin.' },
];

export const REWARD_CATALOGUE: RewardCatalogueItem[] = [
  { id: 'RW_GYM_DISC', titleTr: 'Partner salon indirimi %15', costPoints: 200, kindTr: 'Salon indirimi', demo: true, validDaysAfterRedeem: 30 },
  { id: 'RW_CLASS', titleTr: 'Ücretsiz stüdyo dersi', costPoints: 300, kindTr: 'Ders hakkı', demo: true, validDaysAfterRedeem: 45 },
  { id: 'RW_WELLNESS', titleTr: 'Wellness servisi indirim kuponu', costPoints: 250, kindTr: 'Servis indirimi', demo: true, validDaysAfterRedeem: 60 },
  { id: 'RW_SHOP', titleTr: 'Sağlıklı yaşam alışveriş kuponu', costPoints: 180, kindTr: 'Alışveriş kuponu', demo: true, validDaysAfterRedeem: 30 },
];
