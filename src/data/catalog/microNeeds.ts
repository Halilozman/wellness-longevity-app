import type { MicroNeed } from '@/types';

/**
 * Micro-needs: the granular, user-confirmable units the product turns on.
 * Each links to one macro need and the relevant module(s).
 */
export const MICRO_NEEDS: MicroNeed[] = [
  // MN1 — feel better every day
  { id: 'MNEED_MOVE_START', nameTr: 'Harekete güvenle başlamak', shortTr: 'Güvenle harekete başlamak', macroNeedId: 'MN1', moduleIds: ['M03'] },
  { id: 'MNEED_MOVE_ROUTINE', nameTr: 'Düzenli bir hareket rutini kurmak', shortTr: 'Hareket rutini kurmak', macroNeedId: 'MN1', moduleIds: ['M03', 'M06'] },
  { id: 'MNEED_NUTRITION_UNDERSTAND', nameTr: 'Beslenme ihtiyacımı anlamak', shortTr: 'Beslenmemi anlamak', macroNeedId: 'MN1', moduleIds: ['M01'] },
  { id: 'MNEED_NUTRITION_PLAN', nameTr: 'Beslenme düzenime uygun bir plan kurmak', shortTr: 'Beslenme planı kurmak', macroNeedId: 'MN1', moduleIds: ['M01'] },
  { id: 'MNEED_WEIGHT', nameTr: 'Sağlıklı kiloma yönelmek', shortTr: 'Sağlıklı kilo', macroNeedId: 'MN1', moduleIds: ['M02'] },
  { id: 'MNEED_SLEEP', nameTr: 'Daha iyi uyumak', shortTr: 'Daha iyi uyku', macroNeedId: 'MN1', moduleIds: ['M04'] },
  { id: 'MNEED_STRESS', nameTr: 'Stresi yönetmek', shortTr: 'Stresi yönetmek', macroNeedId: 'MN1', moduleIds: ['M05'] },
  { id: 'MNEED_ENERGY', nameTr: 'Gün içinde daha enerjik olmak', shortTr: 'Daha enerjik olmak', macroNeedId: 'MN1', moduleIds: ['M06', 'M01'] },
  { id: 'MNEED_HABITS', nameTr: 'Sağlıklı alışkanlıklar kurmak', shortTr: 'Sağlıklı alışkanlıklar', macroNeedId: 'MN1', moduleIds: ['M06'] },
  { id: 'MNEED_SOCIAL', nameTr: 'Sosyal bağımı güçlendirmek', shortTr: 'Sosyal bağ', macroNeedId: 'MN1', moduleIds: ['M22'] },
  { id: 'MNEED_WORKPLACE', nameTr: 'İş yerinde iyi oluşumu desteklemek', shortTr: 'İş yerinde iyi oluş', macroNeedId: 'MN1', moduleIds: ['M23'] },

  // MN2 — understand risks & act earlier
  { id: 'MNEED_PRIORITIES', nameTr: 'Sağlık önceliklerimi bir uzmanla netleştirmek', shortTr: 'Önceliklerimi netleştirmek', macroNeedId: 'MN2', moduleIds: ['M07'] },
  { id: 'MNEED_PREVENTION', nameTr: 'Önleyici kontrol ve taramalarımı planlamak', shortTr: 'Önleyici kontrol', macroNeedId: 'MN2', moduleIds: ['M07', 'M09'] },
  { id: 'MNEED_HEART', nameTr: 'Kalp ve damar sağlığımı önemsemek', shortTr: 'Kalp sağlığı', macroNeedId: 'MN2', moduleIds: ['M08'] },
  { id: 'MNEED_METABOLIC', nameTr: 'Metabolik riskimi anlamak ve azaltmak', shortTr: 'Metabolik risk', macroNeedId: 'MN2', moduleIds: ['M09'] },
  { id: 'MNEED_ORAL', nameTr: 'Ağız sağlığımı korumak', shortTr: 'Ağız sağlığı', macroNeedId: 'MN2', moduleIds: ['M10'] },
  { id: 'MNEED_VISION', nameTr: 'Görme sağlığımı kontrol ettirmek', shortTr: 'Görme sağlığı', macroNeedId: 'MN2', moduleIds: ['M11'] },
  { id: 'MNEED_HEARING', nameTr: 'İşitme sağlığımı kontrol ettirmek', shortTr: 'İşitme sağlığı', macroNeedId: 'MN2', moduleIds: ['M12'] },

  // MN3 — support as life changes
  { id: 'MNEED_WOMEN', nameTr: 'Kadın önleyici sağlığı desteği almak', shortTr: 'Kadın sağlığı', macroNeedId: 'MN3', moduleIds: ['M13'] },
  { id: 'MNEED_MEN', nameTr: 'Erkek sağlığı desteği almak', shortTr: 'Erkek sağlığı', macroNeedId: 'MN3', moduleIds: ['M14'] },
  { id: 'MNEED_MATERNAL', nameTr: 'Gebelik/doğum sonrası iyi oluş desteği', shortTr: 'Gebelik/doğum sonrası', macroNeedId: 'MN3', moduleIds: ['M15'] },
  { id: 'MNEED_MENOPAUSE', nameTr: 'Menopoz ve orta yaş desteği almak', shortTr: 'Menopoz desteği', macroNeedId: 'MN3', moduleIds: ['M16'] },
  { id: 'MNEED_FAMILY', nameTr: 'Ailem ve çocuğum için iyi oluş desteği', shortTr: 'Aile/çocuk iyi oluşu', macroNeedId: 'MN3', moduleIds: ['M17'] },
  { id: 'MNEED_PELVIC', nameTr: 'Pelvik sağlık ve kontinans desteği', shortTr: 'Pelvik sağlık', macroNeedId: 'MN3', moduleIds: ['M24'] },

  // MN4 — stay capable
  { id: 'MNEED_AGEING', nameTr: 'Bağımsızlığımı koruyarak sağlıklı yaşlanmak', shortTr: 'Sağlıklı yaşlanma', macroNeedId: 'MN4', moduleIds: ['M18', 'M21'] },
  { id: 'MNEED_MSK', nameTr: 'Kas-iskelet rahatsızlığımı yönetmek', shortTr: 'Kas-iskelet sağlığı', macroNeedId: 'MN4', moduleIds: ['M19'] },
  { id: 'MNEED_COGNITIVE', nameTr: 'Bilişsel sağlığımı ve hafızamı desteklemek', shortTr: 'Bilişsel sağlık', macroNeedId: 'MN4', moduleIds: ['M20'] },
  { id: 'MNEED_BALANCE', nameTr: 'Dengemi geliştirip düşme riskini azaltmak', shortTr: 'Denge / düşme önleme', macroNeedId: 'MN4', moduleIds: ['M21'] },
];
