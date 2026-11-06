import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ConfirmedNeed } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, Sheet } from '@/components/ui';
import { MICRO_NEEDS, getMicroNeed, getMacroNeed } from '@/data/catalog';

export default function ConfirmNeeds() {
  const nav = useNavigate();
  const { state, confirmNeeds } = useStore();
  const scored = state.assessment?.scored ?? [];

  const candidateIds = useMemo(() => {
    const ids = scored.map((s) => s.microNeedId);
    return ids.length ? ids : [];
  }, [scored]);

  const [confirmed, setConfirmed] = useState<Set<string>>(() => new Set(candidateIds.slice(0, 3)));
  const [order, setOrder] = useState<string[]>(() => candidateIds.slice(0, 3));
  const [addOpen, setAddOpen] = useState(false);
  const [extra, setExtra] = useState<string[]>([]);

  const allShown = [...candidateIds, ...extra.filter((e) => !candidateIds.includes(e))];
  const scoreOf = (id: string) => scored.find((s) => s.microNeedId === id)?.rawScore;

  const toggleConfirm = (id: string) => {
    setConfirmed((s) => {
      const n = new Set(s);
      if (n.has(id)) { n.delete(id); setOrder((o) => o.filter((x) => x !== id)); }
      else n.add(id);
      return n;
    });
  };
  const togglePriority = (id: string) => {
    if (!confirmed.has(id)) toggleConfirm(id);
    setOrder((o) => (o.includes(id) ? o.filter((x) => x !== id) : o.length < 3 ? [...o, id] : o));
  };

  const confirmedList: ConfirmedNeed[] = [...confirmed].map((id) => ({
    microNeedId: id, priority: order.includes(id) ? order.indexOf(id) + 1 : 0,
  }));

  const proceed = () => {
    confirmNeeds(confirmedList);
    nav('/wl/needs/map');
  };

  const addable = MICRO_NEEDS.filter((m) => !allShown.includes(m.id));

  return (
    <div>
      <TopBar title="İhtiyaç Haritan" back="/wl/assessment" breadcrumb="Doğrula ve önceliklendir" />
      <div className="pad stack">
        <div className="card tinted">
          <div className="h3">Bunlar sana uygun görünüyor</div>
          <div className="small muted" style={{ marginTop: 4 }}>
            Hangileri gerçekten senin için önemli? Onayla, çıkar veya ekle; en fazla 3 önceliğini seç.
          </div>
        </div>

        {allShown.length === 0 && (
          <div className="card">
            <div className="h3">Belirgin bir ihtiyaç çıkmadı</div>
            <div className="small muted" style={{ marginTop: 4 }}>Aşağıdan ekleyebilir veya bir uzmanla netleştirebilirsin.</div>
            <button className="btn btn-secondary block" style={{ marginTop: 10 }} onClick={() => setAddOpen(true)}>İhtiyaç ekle</button>
          </div>
        )}

        <div className="stack-sm">
          {allShown.map((id) => {
            const mn = getMicroNeed(id);
            if (!mn) return null;
            const macro = getMacroNeed(mn.macroNeedId);
            const isC = confirmed.has(id);
            const pr = order.indexOf(id);
            const sc = scoreOf(id);
            return (
              <div key={id} className={`card ${isC ? 'selected' : 'flat'}`} style={{ padding: 12 }}>
                <div className="row-between">
                  <div style={{ flex: 1 }}>
                    <div className="row" style={{ gap: 8 }}>
                      {pr >= 0 && <Badge tone="info">Öncelik {pr + 1}</Badge>}
                      <div className="lr-title">{mn.shortTr}</div>
                    </div>
                    <div className="small muted" style={{ marginTop: 3 }}>
                      {macro?.emoji} {macro?.nameTr}
                      {sc != null && <> · <span title="Öz-bildirim keşif skoru">keşif {sc}</span></>}
                    </div>
                  </div>
                  <button className={`opt-check`} style={{ background: isC ? 'var(--alz-blue)' : '#fff', borderColor: isC ? 'var(--alz-blue)' : 'var(--border-strong)', borderWidth: 2, borderStyle: 'solid', borderRadius: '50%' }} aria-label="Onayla" onClick={() => toggleConfirm(id)}>{isC ? '✓' : ''}</button>
                </div>
                {isC && (
                  <div className="row" style={{ marginTop: 10, gap: 8 }}>
                    <button className={`chip selectable ${pr >= 0 ? 'on' : ''}`} onClick={() => togglePriority(id)}>
                      {pr >= 0 ? `Öncelik ${pr + 1} ✓` : '⭐ Öncele'}
                    </button>
                    <span className="tiny faint" style={{ flex: 1 }}>Neden: yanıtların bu ihtiyaca işaret etti.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button className="btn btn-ghost block" onClick={() => setAddOpen(true)}>+ Başka ihtiyaç ekle</button>
      </div>

      <div className="pad stack-sm" style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', paddingTop: 10 }}>
        <div className="small muted center">{confirmed.size} ihtiyaç · {order.length} öncelik seçildi</div>
        <button className="btn btn-primary block" disabled={confirmed.size === 0} onClick={proceed}>Önerilerimi Gör</button>
      </div>

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="İhtiyaç ekle">
        <div className="stack-sm">
          {addable.map((m) => (
            <button key={m.id} className="opt" onClick={() => { setExtra((e) => [...e, m.id]); setConfirmed((s) => new Set(s).add(m.id)); setAddOpen(false); }}>
              <span style={{ flex: 1 }}>{m.shortTr}</span>
              <span className="small faint">{getMacroNeed(m.macroNeedId)?.emoji}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
