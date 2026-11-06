import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { MacroNeedId } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, ListRow } from '@/components/ui';
import { SERVICES, MACRO_NEEDS, modulesForService, getModule } from '@/data/catalog';
import { evaluateEligibility } from '@/engine';

export default function Catalog() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [mn, setMn] = useState<MacroNeedId | 'all'>((sp.get('mn') as MacroNeedId) ?? 'all');

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return SERVICES.filter((s) => {
      if (mn !== 'all' && s.macroNeedId !== mn) return false;
      if (t && !(`${s.nameTr} ${s.nameEn} ${s.id}`.toLowerCase().includes(t))) return false;
      return true;
    });
  }, [q, mn]);

  return (
    <div>
      <TopBar title="Servis Kataloğu" back="/wl" />
      <div className="pad stack">
        <input className="card" style={{ width: '100%', padding: 12, fontSize: 15, border: '1px solid var(--border)' }}
          placeholder="Servis ara…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Servis ara" />

        <div className="row wrap" style={{ gap: 6 }}>
          <button className={`chip selectable ${mn === 'all' ? 'on' : ''}`} onClick={() => setMn('all')}>Tümü</button>
          {MACRO_NEEDS.map((m) => (
            <button key={m.id} className={`chip selectable ${mn === m.id ? 'on' : ''}`} onClick={() => setMn(m.id)}>{m.emoji} {m.nameTr}</button>
          ))}
        </div>

        <div className="small muted">{results.length} servis · Herkes kataloğu keşfedebilir; erişim ve ödeme statüne göre değişir.</div>

        <div className="card flat" style={{ padding: 4 }}>
          {results.map((s) => {
            const elig = evaluateEligibility(s.id, state.user.accessCategory, state.user.corporate);
            const mod = modulesForService(s.id)[0];
            return (
              <ListRow key={s.id}
                icon={getModule(mod ?? 'M01')?.emoji}
                title={<span>{s.nameTr} {s.isSample && <Badge tone="demo">Örnek</Badge>} {s.verified && <Badge tone="ok">✓</Badge>}</span>}
                sub={s.status === 'soon' ? 'Yakında' : s.status === 'request_info' ? 'Bilgi al' : elig.entitled ? 'Teminata dahil (demo)' : elig.payPerUse ? `${s.demoPriceTry ?? ''} ₺ (demo)` : 'Bilgi al'}
                onClick={() => nav(`/wl/service/${s.id}`)}
              />
            );
          })}
          {results.length === 0 && <div className="empty"><span className="empty-emoji">🔍</span><div className="small muted">Eşleşen servis yok</div></div>}
        </div>

        <div className="small faint center" style={{ paddingBottom: 8 }}>Katalog, 193 servisi destekleyecek şekilde kuruldu. Doğrulanmış örnekler ve açıkça işaretli örnek servisler gösterilir.</div>
      </div>
    </div>
  );
}
