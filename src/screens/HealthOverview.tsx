import { useNavigate } from 'react-router-dom';
import type { AccessCategory } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { AccessBadge, Badge, DemoNote, Toggle, useToast } from '@/components/ui';
import { getMicroNeed, servicesForMicroNeed } from '@/data/catalog';
import { orderConfirmed, evaluateEligibility } from '@/engine';

const CATEGORIES = [
  { key: 'wellbeing', label: 'Wellbeing', emoji: '🌼' },
  { key: 'fitness', label: 'Fitness', emoji: '🏃' },
  { key: 'nutrition', label: 'Beslenme', emoji: '🥗' },
  { key: 'preventive', label: 'Önleyici', emoji: '🩺' },
  { key: 'mental', label: 'Zihinsel', emoji: '🧠' },
  { key: 'sleep', label: 'Uyku', emoji: '🌙' },
  { key: 'ageing', label: 'Sağlıklı yaşlanma', emoji: '🌳' },
  { key: 'care', label: 'Bakım & destek', emoji: '🤝' },
];

const OPEN_BY_ACCESS: Record<AccessCategory, Set<string>> = {
  alz: new Set(CATEGORIES.map((c) => c.key)),
  insured_elsewhere: new Set(['wellbeing', 'fitness', 'nutrition', 'mental', 'sleep']),
  uninsured: new Set(['wellbeing', 'fitness', 'nutrition']),
};

const SOURCES = [
  { label: 'Sağlık profili & öyküm', reliability: 'Yüksek', state: 'connected' },
  { label: 'Adım / aktivite / uyku (giyilebilir)', reliability: 'Orta', state: 'toggle' },
  { label: 'Laboratuvar & test sonuçları', reliability: 'Yüksek', state: 'soon' },
  { label: 'Klinik kayıt & görüntüleme', reliability: 'Yüksek', state: 'soon' },
  { label: 'İlaç bilgileri', reliability: 'Orta', state: 'soon' },
  { label: 'Yaşam alışkanlıkları & çevre', reliability: 'Düşük', state: 'manual' },
  { label: 'Genetik sonuçlar', reliability: '—', state: 'soon' },
];

export default function HealthOverview() {
  const nav = useNavigate();
  const toast = useToast();
  const { state, toggleConnection } = useStore();
  const open = OPEN_BY_ACCESS[state.user.accessCategory];
  const confirmed = orderConfirmed(state.assessment?.confirmed ?? []);
  const topNeed = confirmed[0];
  const nbaService = topNeed ? servicesForMicroNeed(topNeed.microNeedId).find((s) => s.status === 'active') : undefined;
  const wear = state.dataConnections.find((c) => c.source === 'wearable');

  return (
    <div>
      <TopBar title="Sağlık Görünümüm" back={-1} context={<AccessBadge category={state.user.accessCategory} />} />
      <div className="pad stack">
        {/* Next Best Action */}
        {topNeed && (
          <div className="card-hero">
            <div className="small" style={{ opacity: 0.9 }}>Sıradaki en iyi adım</div>
            <div className="h3" style={{ color: '#fff', marginTop: 4 }}>{nbaService ? nbaService.nameTr : 'Bir uzmanla netleştir'}</div>
            <div className="small" style={{ opacity: 0.92, marginTop: 6 }}>Önceliğin “{getMicroNeed(topNeed.microNeedId)?.shortTr}” olduğu için öne çıktı.</div>
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <button className="btn btn-mint btn-sm" onClick={() => nbaService ? nav(`/wl/service/${nbaService.id}`) : nav('/wl/service/C01')}>Randevu al</button>
              <button className="btn btn-ghost btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }} onClick={() => toast.show('Hatırlatma eklendi')}>Hatırlat</button>
              <button className="btn btn-ghost btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }} onClick={() => toast.show('Şimdilik geçildi')}>Şimdilik geç</button>
            </div>
          </div>
        )}

        {/* Haklarım ve Erişimim */}
        <div className="sectiontitle">Haklarım ve Erişimim</div>
        <div className="card">
          <div className="small muted">Herkes keşfedebilir; erişim statüne göre genişler. {state.user.accessCategory === 'alz' ? 'ALZ müşterisi: genişletilmiş erişim.' : state.user.accessCategory === 'insured_elsewhere' ? 'Başka sigortalı: seçili hizmetler.' : 'Sigortasız: sınırlı başlangıç erişimi.'}</div>
          <div className="accessgrid" style={{ marginTop: 10 }}>
            {CATEGORIES.map((c) => {
              const isOpen = open.has(c.key);
              return (
                <div key={c.key} className={`accesscell ${isOpen ? '' : 'locked'}`}>
                  <div className="ac-ico" aria-hidden>{isOpen ? c.emoji : '🔒'}</div>
                  <div className="ac-lbl">{c.label}</div>
                </div>
              );
            })}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => nav('/wl/catalog')}>Kataloğu keşfet</button>
        </div>

        {/* Know & Connect */}
        <div className="sectiontitle">Verilerimi Tanı ve Bağla</div>
        <div className="card">
          {SOURCES.map((s) => (
            <div key={s.label} className="row-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div className="small" style={{ fontWeight: 650 }}>{s.label}</div>
                <div className="tiny faint">Güvenilirlik: {s.reliability}</div>
              </div>
              {s.state === 'toggle' ? <Toggle on={!!wear?.connected} onChange={() => { toggleConnection(wear!.id); toast.show('Bağlantı güncellendi'); }} label={s.label} />
                : s.state === 'connected' ? <Badge tone="ok">Bağlı</Badge>
                : s.state === 'manual' ? <Badge tone="info">Elle</Badge>
                : <Badge tone="soon">Yakında</Badge>}
            </div>
          ))}
          <div className="tiny faint" style={{ marginTop: 8 }}>Tüm kaynaklara bağlanmadan da devam edebilirsin.</div>
        </div>

        <DemoNote>Klinik hastalık riski veya 5–10 yıllık olasılık tahmini yalnızca onaylı, valide, profesyonel gözetimli ayrı bir sistemle gösterilir. Bu demoda risk yüzdesi üretilmez; yalnızca ihtiyaç haritası ve davranışsal trendler gösterilir.</DemoNote>
      </div>
    </div>
  );
}
