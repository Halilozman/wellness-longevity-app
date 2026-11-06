import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, EmptyState } from '@/components/ui';
import { getMicroNeed, getMacroNeed, getModule, servicesForMicroNeed } from '@/data/catalog';
import { orderConfirmed } from '@/engine';

export default function NeedMap() {
  const nav = useNavigate();
  const { state } = useStore();
  const confirmed = orderConfirmed(state.assessment?.confirmed ?? []);

  if (confirmed.length === 0) {
    return (
      <div>
        <TopBar title="İhtiyaç Haritam" back="/wl" />
        <EmptyState emoji="🧭" title="Henüz ihtiyaç yok" desc="Kısa keşif anketini tamamla, ihtiyaç haritanı oluşturalım."
          action={<button className="btn btn-primary" onClick={() => nav('/wl/consent')}>İhtiyaçlarımı Keşfet</button>} />
      </div>
    );
  }

  const top = confirmed.filter((c) => c.priority > 0);
  const others = confirmed.filter((c) => c.priority === 0);
  const summary = top.map((c, i) => `${i === 0 ? 'Önceliğin' : i === 1 ? 'İkinci ihtiyacın' : 'Üçüncü ihtiyacın'}: ${getMicroNeed(c.microNeedId)?.shortTr}`).join('. ');

  return (
    <div>
      <TopBar title="İhtiyaç Haritam" back="/wl" breadcrumb="Doğrulanmış ihtiyaçların" />
      <div className="pad stack">
        {summary && <div className="card tinted"><div className="small" style={{ lineHeight: 1.6 }}>{summary}.</div></div>}

        <div className="sectiontitle">Öncelikli ihtiyaçların</div>
        <div className="stack-sm">
          {top.map((c) => <NeedCard key={c.microNeedId} id={c.microNeedId} priority={c.priority} />)}
          {top.length === 0 && <div className="small muted">Henüz öncelik seçmedin.</div>}
        </div>

        {others.length > 0 && (
          <>
            <div className="sectiontitle">Diğer doğrulanmış ihtiyaçların</div>
            <div className="stack-sm">{others.map((c) => <NeedCard key={c.microNeedId} id={c.microNeedId} priority={0} />)}</div>
          </>
        )}

        <div className="small faint">Buradaki sayılar öz-bildirim ve kurala dayalı keşif skorudur; klinik risk, tanı veya kesin sağlık düzeyi değildir.</div>
      </div>

      <div className="pad stack-sm" style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', paddingTop: 10 }}>
        <button className="btn btn-primary block" onClick={() => nav('/wl/recommend')}>Önerilerimi Gör</button>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-ghost btn-sm grow" onClick={() => nav('/wl/needs/confirm')}>İhtiyaçlarımı düzenle</button>
          <button className="btn btn-ghost btn-sm grow" onClick={() => nav('/wl/needs')}>Sonra değerlendir</button>
        </div>
      </div>
    </div>
  );
}

function NeedCard({ id, priority }: { id: string; priority: number }) {
  const mn = getMicroNeed(id);
  if (!mn) return null;
  const macro = getMacroNeed(mn.macroNeedId);
  const services = servicesForMicroNeed(id).filter((s) => s.status === 'active');
  return (
    <div className="card">
      <div className="row" style={{ gap: 8 }}>
        {priority > 0 && <Badge tone="info">Öncelik {priority}</Badge>}
        <div className="h3" style={{ flex: 1 }}>{mn.nameTr}</div>
      </div>
      <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
        <span className="chip">{macro?.emoji} {macro?.nameTr}</span>
        {mn.moduleIds.map((m) => <span key={m} className="chip">{getModule(m)?.emoji} {getModule(m)?.nameTr}</span>)}
      </div>
      <div className="small muted" style={{ marginTop: 8 }}>
        {services.length > 0 ? `${services.length} uygun servis` : 'Uygun servis için uzmanla görüşmeyi öneririz'} · Neden: yanıtların bu ihtiyaca işaret etti.
      </div>
    </div>
  );
}
