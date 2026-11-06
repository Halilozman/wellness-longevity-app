# ALZ Health & Wellness — Wellness & Longevity (Etkileşimli Demo)

ALZ Dijital Sağlık alanı içindeki **Wellness & Longevity** deneyiminin, gerçek bir
telefonda denenebilen, uçtan uca çalışan etkileşimli mobil prototipi.

- **Teknoloji:** React + TypeScript + Vite (mobil-öncelikli web; telefon tarayıcısında
  veya masaüstünde telefon çerçevesiyle açılır, React Native’e taşımaya uygun mimari).
- **Durum:** Katalog + öneri motoru + plan + yaşam verisi + skorlar + fitness/ödüller +
  dijital stüdyolar **çalışır** durumda. Demo olan her alan ekranda açıkça işaretlidir.

## Çalıştırma

Kurulum (bir kez):

```bash
npm install
```

Geliştirme sunucusu (telefonda denemek için `--host` ağda yayınlar):

```bash
npm run dev -- --host
```

- Masaüstü: tarayıcıda `http://localhost:5173`
- Telefon: aynı Wi‑Fi’da, terminalde yazan `http://<bilgisayar-IP>:5173` adresi

Testler ve tip denetimi:

```bash
npm test
```

```bash
npm run typecheck
```

Üretim derlemesi:

```bash
npm run build
```

## Klasör düzeni

```
src/
  data/catalog/     Tek doğruluk kaynağı: 4 makro ihtiyaç, 24 modül, 9 paket,
                    servisler (doğrulanmış + örnek), sorular, aktiviteler, fitness, içerik
  engine/           Saf, versiyonlu kurallar (UI’dan bağımsız) + vitest testleri
                      assessment · recommend · scoring · entitlements · rewards · metrics
  state/            Tek olay deposu (ProgressEvent) + localStorage + demo senaryoları
  components/       Telefon çerçevesi, üst bar, alt gezinme, ortak arayüz parçaları
  screens/          33 ekran (spine + sekmeler + özellik ekranları + 4 stüdyo)
  types/            Alan tipleri (katalog + çalışma zamanı)
scripts/
  import-catalog.ts 193 servisi xlsx’ten içe aktaran betik (SheetJS)
docs/
  TESLIM.md         Ekran haritası, akış, veri modeli, kurallar, senaryolar, gerçek/demo
  xlsx-import.md    Gerçek katalog yüklendiğinde içe aktarma adımları
```

## Önemli sınırlar

- Bu uygulama **teşhis, tıbbi değerlendirme veya acil triyaj aracı değildir**.
- Fiyatlar, sağlayıcılar, spor salonları ve ödüller **demodur**; ekranda işaretlidir.
- İlk sürüm önerileri **kurala dayalı ve açıklanabilir**dir; otonom klinik AI yoktur.
- Skorlar sigorta fiyatlaması/kabul/ret için kullanılmaz; veriler cihazda yerel tutulur.

Ayrıntı için **[docs/TESLIM.md](docs/TESLIM.md)**.
