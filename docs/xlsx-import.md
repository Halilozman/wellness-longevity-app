# 193 Servis — xlsx İçe Aktarma

Gerçek katalog `ALZ_Servis_Bazli_Uygulama_Plani.xlsx` dosyasından içe aktarılır.
Betik: `scripts/import-catalog.ts` (SheetJS).

## 1. Çalıştırma

```bash
npm run import:catalog -- "C:/tam/yol/ALZ_Servis_Bazli_Uygulama_Plani.xlsx"
```

Çıktı: `src/data/catalog/imported/` içine
`services.json`, `serviceModuleRelations.json`, `packageServiceRelations.json`
ve ekrana içe aktarma + bütünlük raporu.

## 2. Eşleme sözleşmesi (düzenlenebilir)

`scripts/import-catalog.ts` başındaki iki sabit, betiği gerçek dosyaya uydurur:

- **`SHEETS`** — okunacak sekme adları: `Service Cards`, `Module Package Fit`,
  `Teams and Needs`, `Packages`. Dosyadaki adlar farklıysa burada değiştir.
- **`COLMAP`** — sütun başlığı → alan eşlemesi (Service ID, ad, tanım, makro/mikro
  ihtiyaç, teslim şekli, faz, durum, fiyat; modül ilişkisi; paket dahil olma + choose grup).

Dönüşümler:
- Mikro ihtiyaç listeleri `;` `,` `|` ile ayrılır.
- Paket dahil olma `core / optional / choose_one / not_included` olarak normalize edilir
  (`çekirdek/opsiyonel/seç-bir` TR karşılıkları tanınır).
- `Service ID` **tek ve benzersiz**dir; aynı servis birden çok modülde olabilir ama
  çoğaltılmaz. Betik tekrarlı ID ve kırık referansları raporlar.

## 3. Uygulamaya bağlama

İçe aktarma JSON’u üretir; çalışan demo ise TS katalog modüllerini kullanır
(`src/data/catalog/*.ts`). Gerçek veriye geçmek için iki yol:

- **A (önerilen):** `src/data/catalog/services.ts`, `.../packages.ts` içindeki
  dizileri üretilen JSON ile değiştir (içeri aktar ve `export const ... = importedJson`).
- **B:** katalog yükleyicisini, `imported/*.json` varsa onu tercih edecek şekilde güncelle.

Her iki durumda `validateCatalog()` (`src/data/catalog/index.ts`) referans bütünlüğünü
doğrular; `npm test` içindeki bütünlük testi 193 servisle de çalışır.

## 4. Korunması gerekenler

Dosyadaki ID, ad, tanım, mikro ihtiyaç, faz, modül kullanımı, paket dahil olma kuralı,
uygunluk, teslim şekli, durum ve onay bilgisi tek doğruluk kaynağıdır — hayal ederek
doldurulmaz. Açılmamış servis **“Yakında”**, fiyatı/kapasitesi onaysız servis
**“Bilgi al / Talep bırak”** olarak gösterilir.
