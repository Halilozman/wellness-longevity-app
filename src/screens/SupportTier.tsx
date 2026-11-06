import { TopBar } from '@/components/Layout';
import { Badge } from '@/components/ui';

const TIERS = [
  {
    id: 'essential', name: 'Essential', tag: 'Digital support at your pace', emoji: '📱',
    plan: 'Dijital profil/hedefler, mikro ihtiyaca dayalı modül seçimi, günlük basit rehberlik',
    ongoing: 'Wellness ipuçları, hatırlatmalar, aktivite ve alışkanlık takibi',
    reviews: 'Kişisel ilerleme kayıtları ve öz değerlendirme',
    followup: 'Dijital hatırlatmalar ve gerektiğinde rezervasyon yardımı',
    role: 'Uzman teması yok (isteğe bağlı ek satın alınabilir)', freq: 'Kendi hızında', extra: 'Dahil',
  },
  {
    id: 'guided', name: 'Guided', tag: 'Expert guidance with planned reviews', emoji: '🤝',
    plan: 'Başlangıç uzman görüşmesi, uzmanla belirlenmiş hedef ve eylem planı',
    ongoing: 'Planlı uzman kontrolü, dijital rutin desteği',
    reviews: 'Planlı uzman değerlendirmeleri ve geri bildirimi',
    followup: 'Uygun yönlendirme ve sonraki adımların takibi',
    role: 'Planlı uzman teması', freq: 'Periyodik görüşme', extra: 'Teklife göre',
  },
  {
    id: 'premium', name: 'Premium', tag: 'Coordinated support across experts', emoji: '🧩',
    plan: 'Birleşik uzman değerlendirmesi, kişiselleştirilmiş hedef ve öncelikler',
    ongoing: 'Alanlar arası uzman rehberliği, bağlantılı dijital destek',
    reviews: 'Koordine uzman değerlendirmeleri, birleştirilmiş öneriler',
    followup: 'Randevu/sonuç koordinasyonu, izinli iletişim ve takip',
    role: 'Çoklu uzman koordinasyonu', freq: 'Sık ve koordineli', extra: 'Teklife göre',
  },
];

export default function SupportTier() {
  return (
    <div>
      <TopBar title="Destek Seviyem" back={-1} />
      <div className="pad stack">
        <div className="card tinted small">
          Bu bir <b>destek/operasyon modeli</b>dir; paket kodları (PK01–PK09) veya ticari teklif biçimleriyle aynı değildir. Önce ihtiyacına uygun hizmeti seç; sonra bu teklifte gerçekten mevcut destek yoğunluğunu seç.
        </div>
        {TIERS.map((t) => (
          <div key={t.id} className="card">
            <div className="row-between">
              <div className="row" style={{ gap: 8 }}><span style={{ fontSize: 20 }}>{t.emoji}</span><div className="h3">{t.name}</div></div>
              <Badge tone="neutral">{t.freq}</Badge>
            </div>
            <div className="small faint" style={{ marginTop: 2 }}>{t.tag}</div>
            <div className="stack-sm" style={{ marginTop: 10 }}>
              <Line k="Personal Plan" v={t.plan} />
              <Line k="Ongoing Support" v={t.ongoing} />
              <Line k="Progress & Reviews" v={t.reviews} />
              <Line k="Follow-up & Coordination" v={t.followup} />
              <Line k="Uzman rolü" v={t.role} />
              <Line k="Ek ücret" v={t.extra} />
            </div>
          </div>
        ))}
        <div className="small faint center" style={{ paddingBottom: 8 }}>Bu seviyeler tıbbi kalite sıralaması değildir. Essential ile başlayıp ihtiyaç değişince Guided/Premium’a <b>isteğe bağlı</b> geçebilirsin; otomatik ücretli yükseltme olmaz.</div>
      </div>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return <div><div className="tiny faint" style={{ textTransform: 'uppercase', letterSpacing: 0.3 }}>{k}</div><div className="small">{v}</div></div>;
}
