# Teslim Özeti — Wellness & Longevity Prototipi

Çalışan prototip teslim edildi. Aşağıda ne gerçek çalışıyor, ne demo, nasıl çalıştırılır
ve 193 servis yüklendiğinde ne olur — karar için gereken bilgi.

İşaretler: **+** çalışıyor · **○** demo/temsili (ekranda işaretli) · **−** sonraki entegrasyon.

---

## 1. Ekran haritası (33 ekran)

| # | Ekran | Rota | Durum |
|---|-------|------|-------|
| 1 | ALZ ana + Dijital Sağlık girişi | `/` | + |
| 2 | Wellness & Longevity açılış (iki CTA) | `/wl` | + |
| 3 | Onboarding + sağlık verisi onayı | `/wl/consent` | + |
| 4 | Adaptif ihtiyaç testi | `/wl/assessment` | + |
| 5 | Mikro ihtiyaç doğrulama/önceliklendirme | `/wl/needs/confirm` | + |
| 6 | İhtiyaç Haritam | `/wl/needs/map` | + |
| 7 | Üç kademeli öneri + “neden” | `/wl/recommend` | + |
| 8 | Servis detayı + hak/fiyat | `/wl/service/:id` | + / ○ fiyat |
| 9 | Kendi Modülümü Oluştur | `/wl/module-builder` | + |
| 10 | Paket karşılaştırma (9 paket) | `/wl/packages` | + |
| 11 | Hak/erişim + demo checkout + rezervasyon | `/wl/checkout/:kind/:id` | + / ○ ödeme |
| 12 | My Plan (görev + takip) | `/wl/plan` | + |
| 13 | Sağlık Testlerim (Know & Connect içinde) | `/wl/health-overview` | ○ |
| 14 | İlerleme + yeniden değerlendirme | `/wl/needs`, `/wl/progress` | + |
| 15 | Servis kataloğu + arama/filtre | `/wl/catalog` | + |
| 16 | İzinler, güvenlik, gizlilik | `/wl/permissions` | + |
| 17 | Yaşam Verilerim (adım/su/aktivite/uyku/ruh hâli/döngü) | `/wl/life-data` | + / ○ cihaz sync |
| 18 | Skorlarım (3 ayrı skor) | `/wl/scores` | + |
| 19 | Veri Paylaşım İzinleri | `/wl/permissions` | + |
| 20 | Haklarım ve Erişimim | `/wl/health-overview` | + |
| 21 | Destek Seviyem (Essential/Guided/Premium) | `/wl/support-tier` | + |
| 22 | Üyeliğim / Kurumsal (Profil + checkout) | `/wl/profile` | ○ |
| 23 | Sağlık Görünümüm / Know & Connect | `/wl/health-overview` | + / ○ kaynaklar |
| 24 | Next Best Action / Act Early | `/wl/health-overview` | + |
| 25 | Coach & Adapt (İlerlemem) | `/wl/progress` | + |
| 26 | Fitness Access Marketplace | `/wl/fitness` | + / ○ tesisler |
| 27 | Gym rezervasyon + check-in | `/wl/fitness` | + |
| 28 | Rewards Home & Wallet | `/wl/rewards` | + / ○ ödüller |
| 29 | Reward kuralları/izinler | `/wl/rewards`, `/wl/profile` | + |
| 30 | Movement Studio | `/wl/studio/movement` | + / ○ içerik |
| 31 | Mind & Sleep Studio | `/wl/studio/mind` | + / ○ içerik |
| 32 | My Food & Nutrition | `/wl/studio/food` | + / ○ içerik |
| 33 | Membership & Community Challenges | `/wl/community` | + / ○ içerik |

İki ana sekme omurgası birbirine bağlı: servis yolculuğu (Keşfet→Plan) ile
Know & Connect → Monitor & Adapt döngüsü aynı olay deposunu paylaşır.

---

## 2. Ana akış (çalışıyor)

ALZ → Dijital Sağlık → W&L → **İhtiyaçlarını Keşfet** (onay) → **Adaptif test**
→ **İhtiyaç doğrulama/önceliklendirme** → **İhtiyaç Haritam** → **3 kademeli öneri**
(Easy Start / tekil servis / kendi modülüm / paket) → **hak & fiyat** (statüye göre)
→ **demo checkout / hakkımı kullan** → **randevu** → **My Plan** → **Yaşam Verileri +
3 skor + yeniden değerlendirme**. Fitness & Rewards ve dijital stüdyolar My Plan ve
İlerlemem ile olay bazında eşitlenir.

İki eksen ayrı tutulur: **ne alıyor** (tekil servis / modül / paket) ve **ne kadar
destekle** (Essential / Guided / Premium).

---

## 3. Veri modeli (özet)

- **Katalog:** MacroNeed(4) · Module(24) · MicroNeed · Service · ServiceModuleRelation ·
  Package(9) · PackageServiceRelation(core/optional/choose_one/not_included).
- **Değerlendirme:** Question · AnswerOption · AssessmentResult · ScoredNeed · ConfirmedNeed.
- **Öneri:** RecommendationCard(reason, matchedNeeds, coverage, ruleVersion) · CustomModulePlan.
- **Ticaret:** EligibilityResult · Order · Booking · SupportTier.
- **Plan/olay:** PlanItem · PlanTask · **ProgressEvent** (tek olay deposu) · Reassessment.
- **Yaşam verisi:** MetricRecord · DataConnection · PersonalGoal · MenstrualCycleLog · SharingGrant.
- **Skor:** NeedPriorityScore · OfferFitScore · RoutineProgressScore · ScoreBreakdown · ruleVersion.
- **Fitness/ödül:** GymPartner · FitnessBooking · PointsLedgerEntry · WeeklyMission · RewardRedemption.
- **Dijital:** DigitalActivity · Recipe · MealPlanEntry · GroceryItem · CommunityChallenge.
- **Klinik risk:** ClinicalRiskInsightApproval — bu sürümde `approved=false`, yüzde gizli.

Her ID izlenebilir: ekran → servis → modül → paket → katalog açıklaması.

---

## 4. Eşleştirme kuralları (versiyonlu: `rules-v1.0.0`)

- **İhtiyaç skoru:** test seçeneklerindeki ağırlıklar toplanır → 0–100 öz‑bildirim keşif skoru.
- **Öneri:** doğrulanmış ihtiyaç + öncelik + sinyaller (taahhüt/bütçe/zaman/destek) →
  birincil + “daha küçük” + “daha kapsamlı”. Tek düşük‑taahhüt ihtiyaç → Easy Start (PK05);
  çok modüllü + süreklilik → paket; aynı alanda 2+ → kendi modülün.
- **Hak:** aynı servis statüye göre farklı çözülür (ALZ dahil / başka sigortalı pay‑per‑use /
  sigortasız sınırlı başlangıç). Doğrulanmış 4 eşleştirme (C01, C02, C03, C05) kuralda birebir.
- **Metrik tekilleştirme:** aynı gün cihaz + manuel → cihaz kazanır, çift sayılmaz.
- **Ödül:** yalnızca doğrulanmış olayla, `sourceEventId` ile idempotent; günlük üst limit; ters işlem.
- **Skorlar:** 3 ayrı; veri yoksa 0 değil “yeterli veri yok”; prim/teminat için kullanılmaz.

Testlerle kanıtlı: `npm test` → 18/18 (katalog bütünlüğü, cevap→ihtiyaç değişimi,
Easy Start/paket, hak farkı, tekilleştirme, ödül idempotency/ters işlem).

---

## 5. Demo senaryoları

| # | Senaryo | Sonuç | Nasıl doğrulandı |
|---|---------|-------|------------------|
| 1 | İlk kez, hareket, düşük taahhüt | Easy Start → C05 (100/100) → randevu → My Plan ilk görev | UI gezinti |
| 3 | Çoklu ihtiyaç (önleyici+beslenme) | Paket core/optional ayrımı (PK01/PK03) | Birim testi |
| 8 | Aynı servis/paket, farklı statü | ALZ dahil · sigortasız paket **satın alınamaz** (engellendi) | UI + birim testi |
| 10 | Fitness + Rewards | Rezervasyon → check‑in → +60; tekrar gönderimde çift puan yok | UI gezinti |
| 11 | Dijital stüdyo (hareket oturumu) | Başlat/Duraklat/Bitir → tamam → My Plan kaydı; aynı gün tekrar sayılmaz | UI gezinti |

Diğer senaryolar (2, 4–7, 9) aynı motor ve ekranlarla çalışır; Profil → “Demo
senaryosu yükle” ile statü ve veri önceden kurulu olarak denenebilir. Mikro ihtiyaç,
hak farkı, metrik tekilleştirme ve ödül idempotency ayrıca birim testleriyle kanıtlı.

---

## 6. Gerçek mi, demo mu?

| Gerçek çalışan (+) | Demo / temsili (○) |
|---|---|
| Adaptif test, ihtiyaç eşleştirme, öneri motoru | Fiyatlar (“Demo fiyatı”) |
| Hak/erişim mantığı (statüye göre) | Spor salonları, ödüller (“Kurgusal/Örnek ödül”) |
| My Plan, görev/olay senkronu, yeniden değerlendirme | Cihaz senkronizasyonu (izin taklidi) |
| Üç skor + açıklaması + veri tamlığı | Stüdyo içerikleri (özgün demo) |
| Yaşam verisi girişi/tekilleştirme/paylaşım izinleri | Checkout tahsilatı |
| Ödül kazanma/kullanma/ters işlem (idempotent) | Sağlayıcı kapasitesi, teminat kontrolü |

---

## 7. Tam entegrasyon gerektiren noktalar (−)

- Gerçek katalog: 193 servis `ALZ_Servis_Bazli_Uygulama_Plani.xlsx` → `import-catalog.ts`.
- Gerçek hak/teminat, fiyat, sağlayıcı kapasitesi ve rezervasyon backend’leri.
- Giyilebilir cihaz/sağlık‑verisi bağlantıları (veri türü bazlı izin).
- Ödeme, üyelik/abonelik, partner salon ve ödül sağlayıcı sözleşmeleri.
- Clinical Risk Insight: onaylı veri kaynağı + valide model + profesyonel gözetim (bu sürümde kilitli).
- Kimlik doğrulama, KVKK/GDPR uyumu, güvenlik tasarımı, denetim kaydı.

---

## 8. 193 servis nasıl yüklenir

`docs/xlsx-import.md` — kısası:

```bash
npm run import:catalog -- "C:/.../ALZ_Servis_Bazli_Uygulama_Plani.xlsx"
```

Betik, sekme adlarını ve sütun eşlemesini (`scripts/import-catalog.ts` içindeki
`SHEETS`/`COLMAP`) kullanarak `src/data/catalog/imported/*.json` üretir ve bütünlüğü
doğrular. Doğrulama hatası olursa ekler ekrana yazılır.

---

## Sözlük

- **Macro/Micro need:** makro = geniş ihtiyaç alanı (MN1–MN4); mikro = kullanıcının
  doğruladığı granüler ihtiyaç.
- **core / optional / choose_one:** paketin bir servisi çekirdek / opsiyonel / “birini seç” kapsaması.
- **Easy Start (PK05):** tek uygun başlangıç servisiyle küçük ilk adım.
- **Essential / Guided / Premium:** destek yoğunluğu (ticari teklif biçiminden ayrı).
- **ProgressEvent:** tüm ekranların paylaştığı tek olay kaydı (plan/ilerleme/ödül senkronu).
- **Idempotent:** aynı olayın (ör. check‑in) iki kez puan üretmemesi.
- **ruleVersion:** kural/skor hesabının versiyon etiketi (ör. `rules-v1.0.0`).
