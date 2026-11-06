import type { Module } from '@/types';

/** 24 fixed modules — codes and names are stable and must not change. */
export const MODULES: Module[] = [
  { id: 'M01', nameEn: 'Nutrition & digestive wellbeing', nameTr: 'Beslenme ve sindirim sağlığı', macroNeedIds: ['MN1'], emoji: '🥗' },
  { id: 'M02', nameEn: 'Healthy weight', nameTr: 'Sağlıklı kilo', macroNeedIds: ['MN1'], emoji: '⚖️' },
  { id: 'M03', nameEn: 'Movement, strength & fitness', nameTr: 'Hareket, güç ve fitness', macroNeedIds: ['MN1'], emoji: '🏃' },
  { id: 'M04', nameEn: 'Sleep health', nameTr: 'Uyku sağlığı', macroNeedIds: ['MN1'], emoji: '😴' },
  { id: 'M05', nameEn: 'Stress & mental wellbeing', nameTr: 'Stres ve zihinsel iyi oluş', macroNeedIds: ['MN1'], emoji: '🧘' },
  { id: 'M06', nameEn: 'Healthy habits', nameTr: 'Sağlıklı alışkanlıklar', macroNeedIds: ['MN1'], emoji: '✅' },
  { id: 'M07', nameEn: 'Health navigation & prevention', nameTr: 'Sağlık yönlendirme ve önleme', macroNeedIds: ['MN2'], emoji: '🧭' },
  { id: 'M08', nameEn: 'Heart & cardiovascular health', nameTr: 'Kalp ve damar sağlığı', macroNeedIds: ['MN2'], emoji: '❤️' },
  { id: 'M09', nameEn: 'Metabolic risk & prevention', nameTr: 'Metabolik risk ve önleme', macroNeedIds: ['MN2'], emoji: '🩸' },
  { id: 'M10', nameEn: 'Oral health', nameTr: 'Ağız sağlığı', macroNeedIds: ['MN2'], emoji: '🦷' },
  { id: 'M11', nameEn: 'Vision health', nameTr: 'Görme sağlığı', macroNeedIds: ['MN2'], emoji: '👁️' },
  { id: 'M12', nameEn: 'Hearing health', nameTr: 'İşitme sağlığı', macroNeedIds: ['MN2'], emoji: '👂' },
  { id: 'M13', nameEn: "Women's preventive health", nameTr: 'Kadın önleyici sağlığı', macroNeedIds: ['MN2', 'MN3'], emoji: '🌺' },
  { id: 'M14', nameEn: "Men's health", nameTr: 'Erkek sağlığı', macroNeedIds: ['MN3'], emoji: '🧔' },
  { id: 'M15', nameEn: 'Maternal & postnatal wellbeing', nameTr: 'Gebelik ve doğum sonrası iyi oluş', macroNeedIds: ['MN3'], emoji: '🤰' },
  { id: 'M16', nameEn: 'Menopause & midlife wellbeing', nameTr: 'Menopoz ve orta yaş iyi oluşu', macroNeedIds: ['MN3'], emoji: '🌙' },
  { id: 'M17', nameEn: 'Family & child wellbeing', nameTr: 'Aile ve çocuk iyi oluşu', macroNeedIds: ['MN3'], emoji: '👨‍👩‍👧' },
  { id: 'M18', nameEn: 'Healthy ageing & independence', nameTr: 'Sağlıklı yaşlanma ve bağımsızlık', macroNeedIds: ['MN4'], emoji: '🌳' },
  { id: 'M19', nameEn: 'Musculoskeletal wellbeing', nameTr: 'Kas-iskelet iyi oluşu', macroNeedIds: ['MN4'], emoji: '🦴' },
  { id: 'M20', nameEn: 'Cognitive health & memory', nameTr: 'Bilişsel sağlık ve hafıza', macroNeedIds: ['MN4'], emoji: '🧠' },
  { id: 'M21', nameEn: 'Balance & fall prevention', nameTr: 'Denge ve düşme önleme', macroNeedIds: ['MN4'], emoji: '🤸' },
  { id: 'M22', nameEn: 'Social connection & wellbeing', nameTr: 'Sosyal bağ ve iyi oluş', macroNeedIds: ['MN1', 'MN4'], emoji: '🫂' },
  { id: 'M23', nameEn: 'Workplace wellbeing', nameTr: 'İş yerinde iyi oluş', macroNeedIds: ['MN1'], emoji: '💼' },
  { id: 'M24', nameEn: 'Pelvic health & continence', nameTr: 'Pelvik sağlık ve kontinans', macroNeedIds: ['MN3'], emoji: '🌸' },
];
