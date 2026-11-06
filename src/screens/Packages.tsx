import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge } from '@/components/ui';
import { PACKAGES, getMicroNeed, packageRelationsFor, getService } from '@/data/catalog';
import { coverageForPackage, offerFitScore, orderConfirmed, fitLabel } from '@/engine';

export default function Packages() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const focus = sp.get('focus');
  const { state } = useStore();
  const confirmedIds = orderConfirmed(state.assessment?.confirmed ?? []).map((c) => c.microNeedId);

  const ranked = useMemo(() => {
    return PACKAGES.map((p) => {
      const coverage = coverageForPackage(p.id, confirmedIds);
      const fit = offerFitScore(coverage, confirmedIds.length);
      const matched = coverage.core.length + coverage.optional.length + coverage.chooseOne.length;
      return { p, coverage, fit, matched };
    }).sort((a, b) => (b.matched - a.matched) || (b.fit - a.fit));
  }, [confirmedIds]);

  const suitable = ranked.filter((r) => r.matched > 0);
  const others = ranked.filter((r) => r.matched === 0);

  return (
    <div>
      <TopBar title="Paket Karşılaştırma" back={-1} breadcrumb={confirmedIds.length ? `${confirmedIds.length} doğrulanmış ihtiyaç` : 'Tüm paketler'} />
      <div className="pad stack">
        {confirmedIds.length === 0 && <div className="card tinted small">İhtiyaçlarını doğrularsan hangi paketin gerçekten örtüştüğünü gösterebiliriz.</div>}

        {suitable.length > 0 && <div className="sectiontitle">Sana en uygun paketler</div>}
        {suitable.map(({ p, coverage, fit }) => (
          <PkgCard key={p.id} id={p.id} highlight={p.id === focus} coverage={coverage} fit={fit} totalNeeds={confirmedIds.length} onSelect={() => nav(`/wl/checkout/package/${p.id}`)} />
        ))}

        <div className="sectiontitle">{suitable.length > 0 ? 'Diğer paketler' : 'Tüm paketler'}</div>
        {others.map(({ p, coverage, fit }) => (
          <PkgCard key={p.id} id={p.id} highlight={p.id === focus} coverage={coverage} fit={fit} totalNeeds={confirmedIds.length} onSelect={() => nav(`/wl/checkout/package/${p.id}`)} />
        ))}

        <div className="small faint center" style={{ paddingBottom: 8 }}>Yalnızca doğrulanmış <b>çekirdek</b> kapsam kesin karşılanmış sayılır. Servisler iki kez sayılmaz.</div>
      </div>
    </div>
  );
}

function PkgCard({ id, highlight, coverage, fit, totalNeeds, onSelect }: {
  id: string; highlight?: boolean; coverage: ReturnType<typeof coverageForPackage>; fit: number; totalNeeds: number; onSelect: () => void;
}) {
  const p = PACKAGES.find((x) => x.id === id)!;
  const rels = packageRelationsFor(id as any);
  const coreServices = rels.filter((r) => r.inclusion === 'core');
  return (
    <div className={`card ${highlight ? 'selected' : ''}`}>
      <div className="row-between">
        <div className="row" style={{ gap: 8 }}><span style={{ fontSize: 20 }}>{p.emoji}</span><div className="h3">{p.nameTr}</div></div>
        <span className="small faint">{id}</span>
      </div>
      <div className="small muted" style={{ marginTop: 4 }}>{p.descTr}</div>

      {totalNeeds > 0 && (
        <div className="card flat" style={{ background: 'var(--surface-2)', marginTop: 10 }}>
          <div className="row-between small"><span className="muted">İhtiyaç uyumu</span><span style={{ fontWeight: 700 }}>{fitLabel(fit)} · {fit}/100</span></div>
          <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
            {coverage.core.map((n) => <Badge key={n} tone="ok">✓ {getMicroNeed(n)?.shortTr}</Badge>)}
            {coverage.optional.map((n) => <Badge key={n} tone="info">○ {getMicroNeed(n)?.shortTr}</Badge>)}
            {coverage.chooseOne.map((n) => <Badge key={n} tone="warn">seç-bir {getMicroNeed(n)?.shortTr}</Badge>)}
          </div>
        </div>
      )}

      <div className="small muted" style={{ marginTop: 8 }}>
        Çekirdek servisler: {coreServices.map((r) => getService(r.serviceId)?.nameTr).filter(Boolean).join(', ') || '—'}
      </div>
      <button className="btn btn-secondary block" style={{ marginTop: 10 }} onClick={onSelect}>Bu paketi seç</button>
    </div>
  );
}
