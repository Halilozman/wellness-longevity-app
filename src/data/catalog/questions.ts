import type { Question } from '@/types';

/**
 * Adaptive "İhtiyaçlarını Keşfet" survey.
 * This is a goal & service-need discovery survey — NOT a diagnostic or a
 * validated clinical scale. Micro-need evidence comes from single/multi option
 * weights; scale/single preference questions feed the offer-shape & support
 * intensity signals (not micro-need scoring).
 *
 * Flow: welcome (pick areas) → area core questions (shown if area selected)
 *       → follow-ups → cross-cutting preferences → safety stop.
 */
export const QUESTIONS: Question[] = [
  {
    id: 'Q_WELCOME', kind: 'welcome', area: 'general', type: 'multi',
    promptTr: 'Sağlığın için bugün nereden başlamak istersin?',
    helpTr: 'Birden fazla seçebilirsin. Yalnızca seçtiğin alanlarla ilgili soruları göstereceğiz.',
    options: [
      { id: 'w_enerji', labelTr: 'Daha enerjik hissetmek', emoji: '⚡', opensAreas: ['enerji'], needWeights: [{ microNeedId: 'MNEED_ENERGY', weight: 1 }] },
      { id: 'w_beslenme', labelTr: 'Beslenmek', emoji: '🥗', opensAreas: ['beslenme'], needWeights: [{ microNeedId: 'MNEED_NUTRITION_UNDERSTAND', weight: 1 }] },
      { id: 'w_hareket', labelTr: 'Hareket etmek', emoji: '🏃', opensAreas: ['hareket'], needWeights: [{ microNeedId: 'MNEED_MOVE_START', weight: 1 }] },
      { id: 'w_uyku', labelTr: 'Daha iyi uyumak', emoji: '😴', opensAreas: ['uyku'], needWeights: [{ microNeedId: 'MNEED_SLEEP', weight: 1 }] },
      { id: 'w_stres', labelTr: 'Stresi yönetmek', emoji: '🧘', opensAreas: ['stres'], needWeights: [{ microNeedId: 'MNEED_STRESS', weight: 1 }] },
      { id: 'w_riskler', labelTr: 'Risklerimi anlamak', emoji: '🧭', opensAreas: ['riskler'], needWeights: [{ microNeedId: 'MNEED_PRIORITIES', weight: 1 }] },
      { id: 'w_yasam', labelTr: 'Yaşam evresi desteği', emoji: '🌺', opensAreas: ['yasam_evresi'] },
      { id: 'w_bagimsizlik', labelTr: 'Günlük bağımsızlık', emoji: '🌳', opensAreas: ['bagimsizlik'], needWeights: [{ microNeedId: 'MNEED_AGEING', weight: 1 }] },
      { id: 'w_diger', labelTr: 'Diğer', emoji: '✨', opensAreas: [] },
    ],
  },

  // ---------------- HAREKET ----------------
  {
    id: 'Q_HAREKET_1', kind: 'core', area: 'hareket', type: 'single',
    promptTr: 'Harekete dair sana en yakın olan hangisi?',
    options: [
      { id: 'h1_start', labelTr: 'Yeniye başlıyorum, güvenle başlamak istiyorum', needWeights: [{ microNeedId: 'MNEED_MOVE_START', weight: 3 }] },
      { id: 'h1_routine', labelTr: 'Ara ara hareket ediyorum, düzen kurmak istiyorum', needWeights: [{ microNeedId: 'MNEED_MOVE_ROUTINE', weight: 3 }] },
      { id: 'h1_keep', labelTr: 'Düzenliyim, sürdürmek istiyorum', needWeights: [{ microNeedId: 'MNEED_MOVE_ROUTINE', weight: 1 }, { microNeedId: 'MNEED_HABITS', weight: 1 }] },
    ],
  },
  {
    id: 'Q_HAREKET_2', kind: 'core', area: 'hareket', type: 'scale',
    promptTr: 'Harekete başlamanın önünde ne kadar engel hissediyorsun?',
    scaleLabels: ['Hiç', 'Çok fazla'],
  },
  {
    id: 'Q_HAREKET_FU', kind: 'followup', area: 'hareket', type: 'single',
    showIfAnyOption: ['h1_start'],
    promptTr: 'Daha önce bir sağlık nedeniyle egzersizden kaçındın mı?',
    helpTr: 'Bu bilgi yalnızca sana uygun bir başlangıç önermek için kullanılır.',
    options: [
      { id: 'hfu_yes', labelTr: 'Evet, dikkatli başlamam gerekiyor', needWeights: [{ microNeedId: 'MNEED_MOVE_START', weight: 2 }] },
      { id: 'hfu_no', labelTr: 'Hayır', needWeights: [] },
    ],
  },

  // ---------------- BESLENME ----------------
  {
    id: 'Q_BES_1', kind: 'core', area: 'beslenme', type: 'single',
    promptTr: 'Beslenmene dair önceliğin ne?',
    options: [
      { id: 'b1_understand', labelTr: 'İhtiyacımı anlamak istiyorum', needWeights: [{ microNeedId: 'MNEED_NUTRITION_UNDERSTAND', weight: 3 }] },
      { id: 'b1_plan', labelTr: 'Bana uygun bir plan istiyorum', needWeights: [{ microNeedId: 'MNEED_NUTRITION_PLAN', weight: 3 }] },
      { id: 'b1_weight', labelTr: 'Kilomu yönetmek istiyorum', needWeights: [{ microNeedId: 'MNEED_WEIGHT', weight: 3 }] },
      { id: 'b1_meal', labelTr: 'Öğün düzeni kurmak istiyorum', needWeights: [{ microNeedId: 'MNEED_NUTRITION_PLAN', weight: 2 }, { microNeedId: 'MNEED_HABITS', weight: 1 }] },
    ],
  },
  {
    id: 'Q_BES_FU', kind: 'followup', area: 'beslenme', type: 'single',
    showIfAnyOption: ['b1_plan', 'b1_weight'],
    promptTr: 'Beslenme konusunda uzman desteğine açık mısın?',
    options: [
      { id: 'bfu_yes', labelTr: 'Evet, bir diyetisyenle görüşebilirim', needWeights: [{ microNeedId: 'MNEED_NUTRITION_UNDERSTAND', weight: 1 }] },
      { id: 'bfu_self', labelTr: 'Önce kendi başıma denemek isterim', needWeights: [] },
    ],
  },

  // ---------------- UYKU ----------------
  {
    id: 'Q_UYKU_1', kind: 'core', area: 'uyku', type: 'single',
    promptTr: 'Uykunla ilgili en çok hangisi geçerli?',
    options: [
      { id: 'u1_fall', labelTr: 'Uykuya dalmakta zorlanıyorum', needWeights: [{ microNeedId: 'MNEED_SLEEP', weight: 3 }] },
      { id: 'u1_wake', labelTr: 'Gece sık bölünüyorum', needWeights: [{ microNeedId: 'MNEED_SLEEP', weight: 3 }] },
      { id: 'u1_tired', labelTr: 'Gündüz yorgun uyanıyorum', needWeights: [{ microNeedId: 'MNEED_SLEEP', weight: 2 }, { microNeedId: 'MNEED_ENERGY', weight: 1 }] },
    ],
  },

  // ---------------- STRES ----------------
  {
    id: 'Q_STRES_1', kind: 'core', area: 'stres', type: 'single',
    promptTr: 'Stresle ilgili sana en yakın olan?',
    options: [
      { id: 's1_tense', labelTr: 'Gün içinde gergin hissediyorum', needWeights: [{ microNeedId: 'MNEED_STRESS', weight: 3 }] },
      { id: 's1_focus', labelTr: 'Zihnimi toparlamakta zorlanıyorum', needWeights: [{ microNeedId: 'MNEED_STRESS', weight: 2 }, { microNeedId: 'MNEED_SLEEP', weight: 1 }] },
      { id: 's1_break', labelTr: 'Gün içinde küçük molalara ihtiyacım var', needWeights: [{ microNeedId: 'MNEED_STRESS', weight: 2 }, { microNeedId: 'MNEED_HABITS', weight: 1 }] },
    ],
  },

  // ---------------- ENERJI ----------------
  {
    id: 'Q_ENERJI_1', kind: 'core', area: 'enerji', type: 'single',
    promptTr: 'Enerjinle ilgili en çok hangisi geçerli?',
    options: [
      { id: 'e1_low', labelTr: 'Gün içinde enerjim düşük', needWeights: [{ microNeedId: 'MNEED_ENERGY', weight: 3 }] },
      { id: 'e1_routine', labelTr: 'Rutinim düzensiz', needWeights: [{ microNeedId: 'MNEED_HABITS', weight: 2 }, { microNeedId: 'MNEED_ENERGY', weight: 1 }] },
      { id: 'e1_move', labelTr: 'Daha hareketli olmak istiyorum', needWeights: [{ microNeedId: 'MNEED_MOVE_START', weight: 2 }, { microNeedId: 'MNEED_ENERGY', weight: 1 }] },
    ],
  },

  // ---------------- RISKLER ----------------
  {
    id: 'Q_RISK_1', kind: 'core', area: 'riskler', type: 'single',
    promptTr: 'Risklerinle ilgili önceliğin ne?',
    options: [
      { id: 'r1_priorities', labelTr: 'Önceliklerimi bir uzmanla netleştirmek', needWeights: [{ microNeedId: 'MNEED_PRIORITIES', weight: 3 }] },
      { id: 'r1_screen', labelTr: 'Önleyici kontrol/tarama planlamak', needWeights: [{ microNeedId: 'MNEED_PREVENTION', weight: 3 }] },
      { id: 'r1_heart', labelTr: 'Kalp sağlığımı önemsiyorum', needWeights: [{ microNeedId: 'MNEED_HEART', weight: 3 }] },
      { id: 'r1_metab', labelTr: 'Metabolik riskimi anlamak istiyorum', needWeights: [{ microNeedId: 'MNEED_METABOLIC', weight: 3 }] },
    ],
  },

  // ---------------- YASAM EVRESI ----------------
  {
    id: 'Q_LIFE_1', kind: 'core', area: 'yasam_evresi', type: 'single', sensitive: true,
    promptTr: 'Hangi yaşam evresi desteği sana yakın?',
    helpTr: 'Bu soru isteğe bağlıdır ve yalnızca uygun destekleri göstermek için kullanılır.',
    options: [
      { id: 'l1_women', labelTr: 'Kadın önleyici sağlığı', needWeights: [{ microNeedId: 'MNEED_WOMEN', weight: 3 }] },
      { id: 'l1_meno', labelTr: 'Menopoz / orta yaş', needWeights: [{ microNeedId: 'MNEED_MENOPAUSE', weight: 3 }] },
      { id: 'l1_mat', labelTr: 'Gebelik / doğum sonrası', needWeights: [{ microNeedId: 'MNEED_MATERNAL', weight: 3 }] },
      { id: 'l1_family', labelTr: 'Aile / çocuk', needWeights: [{ microNeedId: 'MNEED_FAMILY', weight: 3 }] },
      { id: 'l1_men', labelTr: 'Erkek sağlığı', needWeights: [{ microNeedId: 'MNEED_MEN', weight: 3 }] },
    ],
  },

  // ---------------- BAGIMSIZLIK ----------------
  {
    id: 'Q_BAG_1', kind: 'core', area: 'bagimsizlik', type: 'single',
    promptTr: 'Günlük bağımsızlığınla ilgili önceliğin ne?',
    options: [
      { id: 'g1_indep', labelTr: 'Bağımsızlığımı korumak', needWeights: [{ microNeedId: 'MNEED_AGEING', weight: 3 }] },
      { id: 'g1_balance', labelTr: 'Denge / düşme endişesi', needWeights: [{ microNeedId: 'MNEED_BALANCE', weight: 3 }] },
      { id: 'g1_msk', labelTr: 'Kas-iskelet rahatsızlığı', needWeights: [{ microNeedId: 'MNEED_MSK', weight: 3 }] },
      { id: 'g1_cog', labelTr: 'Hafıza / bilişsel', needWeights: [{ microNeedId: 'MNEED_COGNITIVE', weight: 3 }] },
    ],
  },

  // ---------------- CROSS-CUTTING (always) ----------------
  {
    id: 'Q_COMMIT', kind: 'core', area: 'general', type: 'single',
    promptTr: 'Nasıl ilerlemek istersin?',
    options: [
      { id: 'c_single', labelTr: 'Önce tek bir adımla başlamak' },
      { id: 'c_continuity', labelTr: 'Düzenli, sürekli bir destek almak' },
      { id: 'c_unsure', labelTr: 'Emin değilim, önerine bakmak isterim' },
    ],
  },
  {
    id: 'Q_SUPPORT', kind: 'core', area: 'general', type: 'single',
    promptTr: 'Nasıl destek almak istersin?',
    options: [
      { id: 'sup_digital', labelTr: 'Dijital olarak kendi hızımda (Essential)' },
      { id: 'sup_guided', labelTr: 'Planlı uzman kontrolüyle (Guided)' },
      { id: 'sup_premium', labelTr: 'Birden fazla uzman koordinasyonuyla (Premium)' },
    ],
  },
  {
    id: 'Q_TIME', kind: 'core', area: 'general', type: 'scale',
    promptTr: 'Haftada ne kadar zaman ayırabilirsin?',
    scaleLabels: ['Çok az', 'Bolca'],
  },
  {
    id: 'Q_BUDGET', kind: 'core', area: 'general', type: 'single',
    promptTr: 'Bütçe konusunda sana en yakın olan?',
    options: [
      { id: 'bud_low', labelTr: 'Düşük tutmak isterim' },
      { id: 'bud_mid', labelTr: 'Orta düzey' },
      { id: 'bud_flex', labelTr: 'Değer görürsem esnek olabilirim' },
    ],
  },
  {
    id: 'Q_SAFETY', kind: 'core', area: 'general', type: 'single', sensitive: true,
    promptTr: 'Şu anda acil tıbbi yardım gerektiren bir belirtin var mı?',
    helpTr: 'Örneğin göğüs ağrısı, nefes darlığı, bilinç bulanıklığı.',
    options: [
      { id: 'safe_no', labelTr: 'Hayır' },
      { id: 'safe_yes', labelTr: 'Evet', safetyStop: true },
    ],
  },
];
