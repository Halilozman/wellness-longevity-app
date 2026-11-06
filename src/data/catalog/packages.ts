import type { Package, PackageServiceRelation } from '@/types';

export const PACKAGES: Package[] = [
  { id: 'PK01', nameEn: 'Personalized Wellness & Longevity', nameTr: 'Kişiye Özel Wellness & Longevity', descTr: 'Birden fazla alanda sürekli ve koordineli destek.', focusTr: 'Çoklu ihtiyaç, uzun dönem', emoji: '🌿' },
  { id: 'PK02', nameEn: 'Active & Balanced Life', nameTr: 'Aktif ve Dengeli Yaşam', descTr: 'Hareket ve beslenmeyi birlikte düzene sokmak.', focusTr: 'Hareket + beslenme', emoji: '⚡' },
  { id: 'PK03', nameEn: 'Healthy Life Essentials', nameTr: 'Sağlıklı Yaşam Temelleri', descTr: 'Önleme ve temel sağlık önceliklerine odak.', focusTr: 'Önleme + temel', emoji: '🧭' },
  { id: 'PK04', nameEn: 'Guided Wellbeing', nameTr: 'Rehberli İyi Oluş', descTr: 'Planlı rehberlikle iyi oluş rutini.', focusTr: 'Rehberli rutin', emoji: '🧘' },
  { id: 'PK05', nameEn: 'Easy Start', nameTr: 'Kolay Başlangıç', descTr: 'Tek bir uygun başlangıç servisiyle küçük bir ilk adım.', focusTr: 'Tek adım başlangıç', emoji: '🌱' },
  { id: 'PK06', nameEn: 'Family Wellness', nameTr: 'Aile İyi Oluşu', descTr: 'Aile ve çocuk odaklı iyi oluş desteği.', focusTr: 'Aile', emoji: '👨‍👩‍👧' },
  { id: 'PK07', nameEn: "Women's Wellbeing", nameTr: 'Kadın İyi Oluşu', descTr: 'Kadın sağlığı ve yaşam evresi desteği.', focusTr: 'Kadın sağlığı', emoji: '🌺' },
  { id: 'PK08', nameEn: 'Healthy Ageing', nameTr: 'Sağlıklı Yaşlanma', descTr: 'Bağımsızlık, denge ve hareketlilik desteği.', focusTr: 'Yaşlanma', emoji: '🌳' },
  { id: 'PK09', nameEn: 'Workplace Wellbeing', nameTr: 'İş Yerinde İyi Oluş', descTr: 'Çalışan iyi oluşu için kurumsal destek.', focusTr: 'Kurumsal', emoji: '💼' },
];

/**
 * Package ↔ Service inclusion rules.
 * VERIFIED rows (from the master prompt) are marked with // verified.
 * A service appearing in a module does NOT automatically grant package entitlement.
 */
export const PACKAGE_SERVICE_RELATIONS: PackageServiceRelation[] = [
  // --- C01 ---
  { packageId: 'PK01', serviceId: 'C01', inclusion: 'core' },          // verified
  { packageId: 'PK03', serviceId: 'C01', inclusion: 'core' },          // verified
  // --- C02 ---
  { packageId: 'PK01', serviceId: 'C02', inclusion: 'core' },          // verified
  { packageId: 'PK02', serviceId: 'C02', inclusion: 'core' },          // verified
  { packageId: 'PK03', serviceId: 'C02', inclusion: 'optional' },      // verified
  { packageId: 'PK05', serviceId: 'C02', inclusion: 'choose_one', chooseGroup: 'start' }, // verified
  // --- C03 ---
  { packageId: 'PK02', serviceId: 'C03', inclusion: 'core' },          // verified
  { packageId: 'PK04', serviceId: 'C03', inclusion: 'core' },          // verified
  // --- C05 ---
  { packageId: 'PK05', serviceId: 'C05', inclusion: 'choose_one', chooseGroup: 'start' }, // verified

  // --- SAMPLE inclusions (demo depth so packages are comparable) ---
  { packageId: 'PK01', serviceId: 'SMPL_SLEEP', inclusion: 'optional' },
  { packageId: 'PK01', serviceId: 'SMPL_STRESS', inclusion: 'optional' },
  { packageId: 'PK01', serviceId: 'SMPL_METAB', inclusion: 'optional' },

  { packageId: 'PK02', serviceId: 'SMPL_MOVE_PROG', inclusion: 'core' },
  { packageId: 'PK02', serviceId: 'SMPL_WEIGHT', inclusion: 'optional' },
  { packageId: 'PK02', serviceId: 'SMPL_HABITS', inclusion: 'optional' },

  { packageId: 'PK03', serviceId: 'SMPL_PREV', inclusion: 'core' },
  { packageId: 'PK03', serviceId: 'SMPL_ENERGY', inclusion: 'optional' },

  { packageId: 'PK04', serviceId: 'SMPL_STRESS', inclusion: 'core' },
  { packageId: 'PK04', serviceId: 'SMPL_SLEEP', inclusion: 'optional' },
  { packageId: 'PK04', serviceId: 'SMPL_HABITS', inclusion: 'optional' },
  { packageId: 'PK04', serviceId: 'N02', inclusion: 'optional' },

  { packageId: 'PK05', serviceId: 'SMPL_STRESS', inclusion: 'choose_one', chooseGroup: 'start' },

  { packageId: 'PK06', serviceId: 'SMPL_FAMILY', inclusion: 'core' },
  { packageId: 'PK06', serviceId: 'SMPL_HABITS', inclusion: 'optional' },
  { packageId: 'PK06', serviceId: 'SMPL_ENERGY', inclusion: 'optional' },

  { packageId: 'PK07', serviceId: 'SMPL_WOMEN', inclusion: 'core' },
  { packageId: 'PK07', serviceId: 'SMPL_MENO', inclusion: 'optional' },
  { packageId: 'PK07', serviceId: 'SMPL_MAT', inclusion: 'optional' },
  { packageId: 'PK07', serviceId: 'SMPL_PELVIC', inclusion: 'optional' },

  { packageId: 'PK08', serviceId: 'SMPL_AGE', inclusion: 'core' },
  { packageId: 'PK08', serviceId: 'SMPL_BAL', inclusion: 'optional' },
  { packageId: 'PK08', serviceId: 'SMPL_MSK', inclusion: 'optional' },

  { packageId: 'PK09', serviceId: 'SMPL_WORK', inclusion: 'core' },
  { packageId: 'PK09', serviceId: 'SMPL_STRESS', inclusion: 'optional' },
  { packageId: 'PK09', serviceId: 'SMPL_ENERGY', inclusion: 'optional' },
];
