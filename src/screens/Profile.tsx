import { useNavigate } from 'react-router-dom';
import type { AccessCategory } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { AccessBadge, Badge, ListRow, Segmented, Toggle, useToast } from '@/components/ui';

const ACCESS: { value: AccessCategory; label: string }[] = [
  { value: 'alz', label: 'ALZ' },
  { value: 'insured_elsewhere', label: 'Başka sigortalı' },
  { value: 'uninsured', label: 'Sigortasız' },
];

const SCENARIOS = [
  { id: 'first_time', label: 'İlk kez başlayan', emoji: '🌱' },
  { id: 'routine_builder', label: 'Rutin geliştiren (14 gün veri)', emoji: '📈' },
  { id: 'data_sharer', label: 'Veri paylaşan (10 gün)', emoji: '🔗' },
  { id: 'access_elsewhere', label: 'Başka sigortalı erişim', emoji: '🔒' },
  { id: 'access_uninsured', label: 'Sigortasız erişim', emoji: '🪪' },
  { id: 'corporate', label: 'Kurumsal sponsor', emoji: '🏢' },
];

export default function Profile() {
  const nav = useNavigate();
  const toast = useToast();
  const { state, setAccessCategory, setCorporate, setConsent, resetDemo, seedScenario } = useStore();

  return (
    <div>
      <TopBar title="Profilim" />
      <div className="pad stack">
        <div className="card">
          <div className="row-between">
            <div><div className="h2">{state.user.nameTr}</div><div style={{ marginTop: 4 }}><AccessBadge category={state.user.accessCategory} /></div></div>
            <span style={{ fontSize: 34 }} aria-hidden>🙂</span>
          </div>
        </div>

        <div className="card">
          <div className="sectiontitle" style={{ marginTop: 0 }}>Müşteri statüm (demo)</div>
          <Segmented options={ACCESS} value={state.user.accessCategory} onChange={(v) => { setAccessCategory(v); toast.show('Statü değişti'); }} />
          <div className="row-between" style={{ marginTop: 12 }}>
            <div className="small"><b>Kurumsal sponsorluk</b><div className="muted">İşveren paketi (demo)</div></div>
            <Toggle on={!!state.user.corporate} onChange={setCorporate} label="Kurumsal" />
          </div>
          <div className="small faint" style={{ marginTop: 8 }}>Statü değişince hak, görünürlük ve ödeme ekranları gerçekten değişir.</div>
        </div>

        <div className="card">
          <div className="sectiontitle" style={{ marginTop: 0 }}>Demo senaryosu yükle</div>
          <div className="stack-sm">
            {SCENARIOS.map((s) => (
              <button key={s.id} className="opt" onClick={() => { seedScenario(s.id); toast.show('Senaryo yüklendi'); nav('/wl'); }}>
                <span className="opt-emoji" aria-hidden>{s.emoji}</span>
                <span style={{ flex: 1 }}>{s.label}</span>
                <span className="lr-chevron">›</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sectiontitle">Ayarlar</div>
        <div className="card flat" style={{ padding: 4 }}>
          <ListRow icon="🧩" title="Haklarım ve Erişimim" sub="ALZ / başka sigorta / sigortasız" onClick={() => nav('/wl/health-overview')} />
          <ListRow icon="🔐" title="Veri Paylaşım İzinleri" sub="Ne, kiminle, ne kadar süre" onClick={() => nav('/wl/permissions')} />
          <ListRow icon="🤝" title="Destek Seviyem" sub="Essential / Guided / Premium" onClick={() => nav('/wl/support-tier')} />
          <ListRow icon="📊" title="Skorlarım ve Eğilimlerim" onClick={() => nav('/wl/scores')} />
          <ListRow icon="🎁" title="Ödül Cüzdanım" onClick={() => nav('/wl/rewards')} />
        </div>

        <div className="sectiontitle">Onaylarım</div>
        <div className="card">
          {state.consents.map((c) => (
            <div key={c.key} className="row-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="small" style={{ flex: 1 }}>{consentLabel(c.key)}</div>
              <Toggle on={c.granted} onChange={(v) => setConsent(c.key, v)} label={consentLabel(c.key)} />
            </div>
          ))}
          <div className="small faint" style={{ marginTop: 8 }}>Skorlar sigorta fiyatlaması, kabul/ret veya işveren performans ölçümü için kullanılmaz.</div>
        </div>

        <button className="btn btn-danger-ghost block" onClick={() => { if (confirm('Demo verilerini sıfırlamak istiyor musun?')) { resetDemo(); toast.show('Demo sıfırlandı'); nav('/'); } }}>Demoyu sıfırla</button>
        <div className="row-between small faint" style={{ paddingBottom: 8 }}>
          <span>ALZ Health &amp; Wellness</span><Badge tone="demo">Demo</Badge>
        </div>
      </div>
    </div>
  );
}

function consentLabel(k: string): string {
  switch (k) {
    case 'health_data_processing': return 'Sağlık verisi işleme';
    case 'wearable_sync': return 'Giyilebilir cihaz senkronizasyonu';
    case 'menstrual_tracking': return 'Döngü takibi';
    case 'marketing': return 'Pazarlama iletileri';
    case 'share_with_expert': return 'Uzmanla paylaşım';
    default: return k;
  }
}
