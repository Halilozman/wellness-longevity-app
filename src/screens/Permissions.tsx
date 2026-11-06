import { useState } from 'react';
import type { MetricKind } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, Chip, useToast } from '@/components/ui';

const KINDS: { kind: MetricKind; label: string }[] = [
  { kind: 'steps', label: 'Adım' }, { kind: 'activity_min', label: 'Aktivite' },
  { kind: 'sleep_h', label: 'Uyku' }, { kind: 'water_ml', label: 'Su' }, { kind: 'mood', label: 'Ruh hâli' },
];
const EXPERTS = ['Beslenme uzmanım (demo)', 'Aile hekimim (demo)', 'Fizyoterapistim (demo)'];
const RANGES = [14, 30, 90];

export default function Permissions() {
  const toast = useToast();
  const { state, grantSharing, revokeSharing } = useStore();
  const [sel, setSel] = useState<Set<MetricKind>>(new Set(['steps', 'activity_min']));
  const [withTr, setWithTr] = useState(EXPERTS[0]);
  const [range, setRange] = useState(14);

  const toggle = (k: MetricKind) => setSel((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const grant = () => {
    if (sel.size === 0) { toast.show('En az bir veri türü seç'); return; }
    grantSharing({ withTr, dataKinds: [...sel], rangeDays: range });
    toast.show('Paylaşım izni verildi');
  };

  const active = state.sharingGrants.filter((g) => g.active);

  return (
    <div>
      <TopBar title="Veri Paylaşım İzinleri" back="/wl/profile" />
      <div className="pad stack">
        <div className="card tinted small">Ne paylaşıyorum? Kiminle? Ne kadar süre? Paylaşılmayan veriler öneri/destek ekranlarında görünmez. İşveren veya sigorta fiyatlama ekipleri kişisel sağlık kaydı görmez.</div>

        <div className="card">
          <div className="sectiontitle" style={{ marginTop: 0 }}>Yeni paylaşım</div>
          <div className="small muted">Ne paylaşıyorsun?</div>
          <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>
            {KINDS.map((k) => <Chip key={k.kind} on={sel.has(k.kind)} onClick={() => toggle(k.kind)}>{k.label}</Chip>)}
          </div>

          <div className="small muted" style={{ marginTop: 12 }}>Kiminle?</div>
          <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>
            {EXPERTS.map((e) => <Chip key={e} on={withTr === e} onClick={() => setWithTr(e)}>{e}</Chip>)}
          </div>

          <div className="small muted" style={{ marginTop: 12 }}>Ne kadar süre?</div>
          <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>
            {RANGES.map((r) => <Chip key={r} on={range === r} onClick={() => setRange(r)}>Son {r} gün</Chip>)}
          </div>

          <button className="btn btn-primary block" style={{ marginTop: 14 }} onClick={grant}>Paylaşım iznini ver</button>
        </div>

        <div className="sectiontitle">Aktif izinler</div>
        {active.length === 0 ? <div className="small muted">Aktif paylaşım izni yok.</div> : (
          <div className="stack-sm">
            {active.map((g) => (
              <div key={g.id} className="card">
                <div className="row-between"><div className="h3" style={{ fontSize: 15 }}>{g.withTr}</div><Badge tone="ok">Aktif</Badge></div>
                <div className="small muted" style={{ marginTop: 4 }}>{g.dataKinds.map((k) => KINDS.find((x) => x.kind === k)?.label).join(', ')} · Son {g.rangeDays} gün</div>
                <button className="btn btn-danger-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => { revokeSharing(g.id); toast.show('İzin geri çekildi'); }}>İznimi geri çek</button>
              </div>
            ))}
          </div>
        )}

        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-ghost btn-sm grow" onClick={() => toast.show('Dışa aktarma talebi alındı (demo)')}>Dışa aktar</button>
          <button className="btn btn-ghost btn-sm grow" onClick={() => toast.show('Silme talebi alındı (demo)')}>Silme talebi</button>
        </div>
      </div>
    </div>
  );
}
