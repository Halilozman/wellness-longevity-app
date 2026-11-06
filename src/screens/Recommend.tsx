import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RecommendationCard } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, EmptyState, useToast } from '@/components/ui';
import { getMicroNeed, getService } from '@/data/catalog';
import { recommend, deriveSignals, selectedAreasFromAnswers, orderConfirmed, fitLabel } from '@/engine';

const TIER_LABEL: Record<RecommendationCard['tier'], string> = {
  primary: 'Senin için en uygun başlangıç',
  smaller: 'Daha küçük başla',
  larger: 'Daha kapsamlı destek al',
};
const KIND_LABEL: Record<string, string> = {
  easy_start: 'Kolay Başlangıç', single_service: 'Tekil servis', custom_module: 'Kendi modülün', package: 'Paket',
};

export default function Recommend() {
  const nav = useNavigate();
  const toast = useToast();
  const { state, saveRecommendation } = useStore();
  const a = state.assessment;

  const cards = useMemo(() => {
    if (!a) return [];
    const confirmed = orderConfirmed(a.confirmed);
    const signals = deriveSignals(a.answers ?? {}, selectedAreasFromAnswers(a.answers ?? {}).length);
    return recommend(confirmed, a.scored, signals);
  }, [a]);

  if (!a || a.confirmed.length === 0) {
    return (
      <div>
        <TopBar title="Önerilerim" back="/wl/needs/map" />
        <EmptyState emoji="🧭" title="Önce ihtiyaçlarını doğrula" action={<button className="btn btn-primary" onClick={() => nav('/wl/needs/confirm')}>İhtiyaçlarıma dön</button>} />
      </div>
    );
  }

  const primary = cards.find((c) => c.tier === 'primary');
  const smaller = cards.find((c) => c.tier === 'smaller');
  const larger = cards.find((c) => c.tier === 'larger');

  const openCard = (c: RecommendationCard) => {
    if (c.kind === 'package') nav(`/wl/packages?focus=${c.refId}`);
    else if (c.kind === 'custom_module') nav(`/wl/module-builder?base=${c.refId}`);
    else nav(`/wl/service/${c.serviceIds[0]}`);
  };

  return (
    <div>
      <TopBar title="Sana Özel Öneriler" back="/wl/needs/map" breadcrumb={`${a.confirmed.length} doğrulanmış ihtiyaç`} />
      <div className="pad stack">
        <div className="card tinted">
          <div className="small" style={{ lineHeight: 1.6 }}>
            İki ayrı seçim var: <b>İhtiyacına uygun hizmeti seç</b> ve <b>Nasıl destek almak istersin?</b> (Essential / Guided / Premium).
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => nav('/wl/support-tier')}>Destek seviyelerini gör</button>
        </div>

        {primary && <RecCard card={primary} prominent onOpen={openCard} />}
        <div className="divider-label">Alternatifler</div>
        {smaller && <RecCard card={smaller} onOpen={openCard} />}
        {larger && <RecCard card={larger} onOpen={openCard} />}

        <div className="stack-sm" style={{ marginTop: 6 }}>
          <button className="btn btn-ghost block" onClick={() => nav('/wl/module-builder')}>Kendi modülümü oluştur</button>
          <button className="btn btn-ghost block" onClick={() => { if (primary) { saveRecommendation(primary); toast.show('Öneri kaydedildi'); } }}>Bu öneriyi kaydet</button>
        </div>
        <div className="small faint center" style={{ paddingBottom: 8 }}>En yüksek uyum, en pahalı teklif anlamına gelmez. Daha küçük ya da büyük çözümü seçmekte özgürsün.</div>
      </div>
    </div>
  );
}

function RecCard({ card, prominent, onOpen }: { card: RecommendationCard; prominent?: boolean; onOpen: (c: RecommendationCard) => void }) {
  const cov = card.coverage;
  return (
    <div className={`card ${prominent ? 'selected' : ''}`}>
      <div className="row-between">
        <span className="small" style={{ fontWeight: 700, color: prominent ? 'var(--alz-blue)' : 'var(--text-muted)' }}>{TIER_LABEL[card.tier]}</span>
        <Badge tone="neutral">{KIND_LABEL[card.kind]}</Badge>
      </div>
      <div className="h2" style={{ marginTop: 6 }}>{card.titleTr}</div>

      <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
        {card.matchedMicroNeeds.slice(0, 4).map((m) => <span key={m} className="chip">{getMicroNeed(m)?.shortTr}</span>)}
      </div>

      <div className="card flat" style={{ marginTop: 10, background: 'var(--surface-2)' }}>
        <div className="row-between small">
          <span className="muted">Uyum</span>
          <span style={{ fontWeight: 700 }}>{fitLabel(card.fitScore)} · {card.fitScore}/100</span>
        </div>
        {card.kind === 'package' && (
          <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
            {cov.core.length > 0 && <Badge tone="ok">{cov.core.length} çekirdek</Badge>}
            {cov.optional.length > 0 && <Badge tone="info">{cov.optional.length} opsiyonel</Badge>}
            {cov.chooseOne.length > 0 && <Badge tone="warn">{cov.chooseOne.length} seç-bir</Badge>}
          </div>
        )}
      </div>

      {card.serviceIds.length > 0 && (
        <div className="small muted" style={{ marginTop: 8 }}>
          Servisler: {card.serviceIds.map((id) => getService(id)?.nameTr).filter(Boolean).slice(0, 3).join(', ')}
          {card.serviceIds.length > 3 ? ` +${card.serviceIds.length - 3}` : ''}
        </div>
      )}

      <details style={{ marginTop: 8 }}>
        <summary className="small" style={{ cursor: 'pointer', color: 'var(--alz-blue)', fontWeight: 650 }}>Neden bunu önerdik?</summary>
        <div className="small muted" style={{ marginTop: 6, lineHeight: 1.5 }}>{card.reasonTr}</div>
      </details>

      <button className={`btn ${prominent ? 'btn-primary' : 'btn-secondary'} block`} style={{ marginTop: 12 }} onClick={() => onOpen(card)}>
        {card.kind === 'package' ? 'Paketi incele' : card.kind === 'custom_module' ? 'Modülü özelleştir' : 'Seç ve devam et'}
      </button>
    </div>
  );
}
