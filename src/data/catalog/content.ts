import type { Recipe, CommunityChallenge } from '@/types';

/** Original demo recipes — no third-party licensed content. */
export const RECIPES: Recipe[] = [
  {
    id: 'RC_OATS', titleTr: 'Yulaflı kahvaltı kâsesi', minutes: 10, servings: 1,
    ingredientsTr: ['1/2 su bardağı yulaf', '1 su bardağı süt veya bitki sütü', '1 muz', '1 tatlı kaşığı bal', 'Tarçın'],
    stepsTr: ['Yulafı sütle ısıt.', 'Muzu dilimle.', 'Kâseye al, bal ve tarçın ekle.'],
    tagsTr: ['Kahvaltı', 'Hızlı', 'Vejetaryen'],
  },
  {
    id: 'RC_SALAD', titleTr: 'Nohutlu yeşil salata', minutes: 15, servings: 2,
    ingredientsTr: ['1 kutu nohut', 'Marul', 'Salatalık', 'Domates', 'Zeytinyağı', 'Limon'],
    stepsTr: ['Sebzeleri doğra.', 'Nohutu ekle.', 'Zeytinyağı ve limonla karıştır.'],
    tagsTr: ['Öğle', 'Vejetaryen', 'Lifli'],
  },
  {
    id: 'RC_SOUP', titleTr: 'Sebzeli mercimek çorbası', minutes: 30, servings: 4,
    ingredientsTr: ['1 su bardağı kırmızı mercimek', '1 soğan', '1 havuç', '1 patates', 'Baharat'],
    stepsTr: ['Sebzeleri doğra.', 'Mercimekle kaynat.', 'Blenderdan geçir.'],
    tagsTr: ['Akşam', 'Sıcak', 'Ekonomik'],
  },
  {
    id: 'RC_WRAP', titleTr: 'Tavuklu tam buğday dürüm', minutes: 20, servings: 2,
    ingredientsTr: ['2 tam buğday lavaş', '200 g ızgara tavuk', 'Marul', 'Domates', 'Yoğurt sos'],
    stepsTr: ['Tavuğu pişir.', 'Lavaşa malzemeleri yerleştir.', 'Yuvarlayarak sar.'],
    tagsTr: ['Akşam', 'Proteinli', 'Pratik'],
  },
  {
    id: 'RC_YOGURT', titleTr: 'Meyveli yoğurt atıştırması', minutes: 5, servings: 1,
    ingredientsTr: ['1 kâse yoğurt', '1 avuç yaban mersini', '1 yemek kaşığı ceviz'],
    stepsTr: ['Yoğurdu kâseye al.', 'Meyve ve cevizi ekle.'],
    tagsTr: ['Ara öğün', 'Hızlı'],
  },
  {
    id: 'RC_EGG', titleTr: 'Sebzeli menemen', minutes: 15, servings: 2,
    ingredientsTr: ['3 yumurta', '2 domates', '1 biber', 'Zeytinyağı'],
    stepsTr: ['Biberi kavur.', 'Domatesi ekle.', 'Yumurtaları kır ve karıştır.'],
    tagsTr: ['Kahvaltı', 'Proteinli'],
  },
];

export const COMMUNITY_CHALLENGES: CommunityChallenge[] = [
  { id: 'CC_WALK', titleTr: 'Hafta sonu yürüyüş challenge', descTr: 'Bu hafta sonu 3 kısa yürüyüş tamamla.', goalTr: '3 yürüyüş', statusPoints: 80, spendablePoints: 40, accessibleAltTr: 'Evde 3 hareket oturumu da sayılır.' },
  { id: 'CC_HYDRATE', titleTr: 'Su alışkanlığı challenge', descTr: '5 gün su hedefini tuttur.', goalTr: '5 gün', statusPoints: 60, spendablePoints: 30 },
  { id: 'CC_MIND', titleTr: 'Nefes molası serisi', descTr: '3 gün kısa nefes molası yap.', goalTr: '3 oturum', statusPoints: 50, spendablePoints: 25 },
];
