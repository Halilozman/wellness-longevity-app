import { useState } from 'react';
import type { MetricKind } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, MiniBars, Segmented, Toggle, useToast } from '@/components/ui';
import { dailyTotal, seriesForKind, today } from '@/engine';

const RANGE = [{ value: '1', label: 'Bugün' }, { value: '7', label: '7 gün' }, { value: '30', label: '30 gün' }];

const METRICS: { kind: MetricKind; label: string; unit: string; emoji: string }[] = [
  { kind: 'steps', label: 'Adım', unit: 'adım', emoji: '👟' },
  { kind: 'water_ml', label: 'Su', unit: 'mL', emoji: '💧' },
  { kind: 'activity_min', label: 'Aktivite', unit: 'dk', emoji: '🏃' },
  { kind: 'sleep_h', label: 'Uyku', unit: 'saat', emoji: '😴' },
];

export default function LifeData() {
  const toast = useToast();
  const { state, logMetric, deleteMetric, toggleConnection, setGoal, addMenstrualLog, deleteMenstrualLog, setConsent } = useStore();
  const [range, setRange] = useState('7');
  const d = today();
  const menstrualConsent = state.consents.find((c) => c.key === 'menstrual_tracking')?.granted ?? false;

  const srcLabel = (kind: MetricKind) => {
    const rs = state.metrics.filter((m) => m.kind === kind && m.date === d);
    if (rs.some((r) => r.source === 'wearable')) return 'Giyilebilir cihaz';
    if (rs.some((r) => r.source === 'phone')) return 'Telefon';
    if (rs.length) return 'Elle girdim';
    return '—';
  };

  const [cycleStart, setCycleStart] = useState(d);

  return (
    <div>
      <TopBar title="Yaşam Verilerim" back="/wl/progress" />
      <div className="pad stack">
        <Segmented options={RANGE} value={range} onChange={setRange} />

        <div className="card">
          <div className="sectiontitle" style={{ marginTop: 0 }}>Hızlı ekle</div>
          <div className="row wrap" style={{ gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { logMetric({ kind: 'water_ml', date: d, value: 250, source: 'manual' }); toast.show('+250 mL su'); }}>💧 +250 mL</button>
            <button className="btn btn-secondary btn-sm" onClick={() => { logMetric({ kind: 'water_ml', date: d, value: 500, source: 'manual' }); toast.show('+500 mL su'); }}>💧 +500 mL</button>
            <button className="btn btn-secondary btn-sm" onClick={() => { const v = Number(window.prompt('Adım sayısı?', '3000')); if (v > 0) { logMetric({ kind: 'steps', date: d, value: v, source: 'manual' }); toast.show('Adım eklendi'); } }}>👟 Adım</button>
            <button className="btn btn-secondary btn-sm" onClick={() => { const v = Number(window.prompt('Aktivite (dakika)?', '20')); if (v > 0) { logMetric({ kind: 'activity_min', date: d, value: v, source: 'manual' }); toast.show('Aktivite eklendi'); } }}>🏃 Aktivite</button>
            <button className="btn btn-secondary btn-sm" onClick={() => { const v = Number(window.prompt('Uyku (saat)?', '7')); if (v > 0) { logMetric({ kind: 'sleep_h', date: d, value: v, source: 'manual' }); toast.show('Uyku eklendi'); } }}>😴 Uyku</button>
          </div>
          <div className="row" style={{ gap: 6, marginTop: 10 }}>
            <span className="small muted">Ruh hâli:</span>
            {[1, 2, 3, 4, 5].map((n) => <button key={n} className="chip selectable" onClick={() => { logMetric({ kind: 'mood', date: d, value: n, source: 'manual' }); toast.show('Ruh hâli kaydedildi'); }}>{['😞', '🙁', '😐', '🙂', '😄'][n - 1]}</button>)}
          </div>
        </div>

        {METRICS.map((m) => {
          const total = dailyTotal(state.metrics, m.kind, d);
          const series = seriesForKind(state.metrics, m.kind, Number(range));
          const goal = state.personalGoals.find((g) => g.kind === m.kind)?.target;
          return (
            <div key={m.kind} className="card">
              <div className="row-between">
                <div className="row" style={{ gap: 8 }}><span style={{ fontSize: 20 }}>{m.emoji}</span><div className="h3">{m.label}</div></div>
                <div style={{ textAlign: 'right' }}><div className="h3">{total == null ? '—' : m.kind === 'sleep_h' ? total.toFixed(1) : total}</div><div className="tiny faint">{m.unit}</div></div>
              </div>
              <div className="small muted" style={{ marginTop: 2 }}>Kaynak: {srcLabel(m.kind)} {total != null && m.kind === 'steps' && <span className="tiny faint">(birden çok kaynakta çift sayılmaz)</span>}</div>
              {Number(range) > 1 && <div style={{ marginTop: 8 }}><MiniBars series={series} goal={goal} unit={m.unit} /></div>}
              {goal != null && (
                <div className="row" style={{ gap: 8, marginTop: 8 }}>
                  <span className="small muted">Hedef: {goal} {m.unit}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => { const v = Number(window.prompt(`${m.label} hedefi (${m.unit})?`, String(goal))); if (v > 0) { setGoal({ kind: m.kind, target: v, unitTr: m.unit }); toast.show('Hedef güncellendi'); } }}>Değiştir</button>
                </div>
              )}
            </div>
          );
        })}

        <div className="card">
          <div className="sectiontitle" style={{ marginTop: 0 }}>Cihaz bağlantıları</div>
          {state.dataConnections.map((c) => (
            <div key={c.id} className="row-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}><div className="small" style={{ fontWeight: 650 }}>{c.label}</div><div className="tiny faint">Veri türleri: {c.kinds.join(', ')}</div></div>
              <Toggle on={c.connected} onChange={() => { toggleConnection(c.id); toast.show(c.connected ? 'Bağlantı kesildi' : 'Bağlandı (demo)'); }} label={c.label} />
            </div>
          ))}
          <div className="tiny faint" style={{ marginTop: 8 }}>İzinler veri türü bazında istenir; “tüm verilere eriş” gibi tek parça izin kullanılmaz. Demo ortamında gerçek senkronizasyon yapılmaz.</div>
        </div>

        {/* Menstrual — separate, sensitive, optional */}
        <div className="card">
          <div className="row-between"><div className="h3">🌸 Döngü takibi</div><Badge tone="neutral">Hassas · isteğe bağlı</Badge></div>
          {!menstrualConsent ? (
            <>
              <div className="small muted" style={{ marginTop: 6 }}>Tamamen isteğe bağlıdır ve ayrı onay gerektirir. Döngü/semptomdan otomatik negatif skor üretilmez; gebelik/doğurganlık/tanı kararı verilmez.</div>
              <button className="btn btn-ghost block" style={{ marginTop: 10 }} onClick={() => { setConsent('menstrual_tracking', true); toast.show('Döngü takibi açıldı'); }}>Döngü takibini aç</button>
            </>
          ) : (
            <>
              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                <input type="date" value={cycleStart} onChange={(e) => setCycleStart(e.target.value)} className="chip" style={{ padding: 8 }} aria-label="Döngü başlangıcı" />
                <button className="btn btn-secondary btn-sm" onClick={() => { addMenstrualLog({ start: cycleStart, flow: 'medium', symptomsTr: [] }); toast.show('Döngü kaydı eklendi'); }}>Kaydet</button>
              </div>
              <div className="tiny faint" style={{ marginTop: 6 }}>Döngü uzunluğu değişkendir; tahmin varsa belirsizlik açıkça gösterilir.</div>
              <div className="stack-sm" style={{ marginTop: 8 }}>
                {state.menstrualLogs.map((l) => (
                  <div key={l.id} className="row-between small" style={{ padding: '6px 0', borderTop: '1px solid var(--border)' }}>
                    <span>Başlangıç: {l.start}</span>
                    <button className="btn btn-danger-ghost btn-sm" onClick={() => deleteMenstrualLog(l.id)}>Sil</button>
                  </div>
                ))}
                {state.menstrualLogs.length === 0 && <div className="tiny faint">Henüz kayıt yok.</div>}
              </div>
            </>
          )}
        </div>

        {/* Recent records with delete */}
        {state.metrics.length > 0 && (
          <div className="card">
            <div className="sectiontitle" style={{ marginTop: 0 }}>Son kayıtlar</div>
            <div className="stack-sm">
              {[...state.metrics].reverse().slice(0, 8).map((r) => (
                <div key={r.id} className="row-between small" style={{ padding: '4px 0' }}>
                  <span>{METRICS.find((m) => m.kind === r.kind)?.emoji ?? '•'} {r.value} · {r.date.slice(5)} · <span className="faint">{r.source === 'manual' ? 'Elle' : r.source === 'wearable' ? 'Cihaz' : r.source === 'phone' ? 'Telefon' : 'Uzman'}</span></span>
                  <button className="btn btn-danger-ghost btn-sm" onClick={() => deleteMetric(r.id)}>Sil</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
