import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, MiniBars, Ring } from '@/components/ui';
import {
  needPriorityScore, routineProgressScore, recommend, deriveSignals,
  selectedAreasFromAnswers, orderConfirmed, seriesForKind, today,
} from '@/engine';

export default function Progress() {
  const nav = useNavigate();
  const { state } = useStore();
  const a = state.assessment;

  const needScore = useMemo(() => needPriorityScore(a?.scored ?? [], a?.confirmed ?? []), [a]);
  const routine = useMemo(() => routineProgressScore(state.personalGoals, state.metrics, state.planTasks, today()), [state.personalGoals, state.metrics, state.planTasks]);
  const offerFit = useMemo(() => {
    if (!a || a.confirmed.length === 0) return null;
    const cards = recommend(orderConfirmed(a.confirmed), a.scored, deriveSignals(a.answers ?? {}, selectedAreasFromAnswers(a.answers ?? {}).length));
    return cards.find((c) => c.tier === 'primary')?.fitScore ?? null;
  }, [a]);

  const stepsSeries = seriesForKind(state.metrics, 'steps', 7);
  const waterSeries = seriesForKind(state.metrics, 'water_ml', 7);
  const stepsGoal = state.personalGoals.find((g) => g.kind === 'steps')?.target ?? 8000;
  const waterGoal = state.personalGoals.find((g) => g.kind === 'water_ml')?.target ?? 2000;
  const hasMetrics = state.metrics.length > 0;

  return (
    <div>
      <TopBar title="İlerlemem" nextStep="Küçük bir adım: bugünkü su veya hareketini ekle" right={<button className="iconbtn" aria-label="Skor detayları" onClick={() => nav('/wl/scores')}>ⓘ</button>} />
      <div className="pad stack">
        <div className="sectiontitle">Skorlarım</div>
        <div className="row" style={{ gap: 10, alignItems: 'stretch' }}>
          <ScoreMini title="İhtiyaç Önceliklerim" value={needScore.value} fill="var(--alz-blue)" onClick={() => nav('/wl/scores')} />
          <ScoreMini title="Öneri Uygunluğu" value={offerFit} fill="var(--info)" onClick={() => nav('/wl/scores')} />
          <ScoreMini title="İlerlemem" value={routine.value} fill="var(--mint-500)" onClick={() => nav('/wl/scores')} />
        </div>
        <div className="small faint">Üç skor ayrıdır; tek bir “sağlık notu” altında birleşmez. Detay için bir skora dokun.</div>

        <div className="card">
          <div className="row-between"><div className="h3">Adım</div><Badge tone="neutral">Son 7 gün</Badge></div>
          {hasMetrics ? <MiniBars series={stepsSeries} goal={stepsGoal} unit="adım" /> : <Empty />}
          <div className="small muted" style={{ marginTop: 6 }}>Kişisel hedefin: {stepsGoal} adım</div>
        </div>

        <div className="card">
          <div className="row-between"><div className="h3">Su</div><Badge tone="neutral">Son 7 gün</Badge></div>
          {hasMetrics ? <MiniBars series={waterSeries} goal={waterGoal} unit="mL" /> : <Empty />}
          <div className="small muted" style={{ marginTop: 6 }}>Kişisel hedefin: {waterGoal} mL</div>
        </div>

        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-secondary btn-sm grow" onClick={() => nav('/wl/life-data')}>Yaşam Verilerim</button>
          <button className="btn btn-ghost btn-sm grow" onClick={() => nav('/wl/scores')}>Skor detayları</button>
        </div>

        {/* Menstrual as a separate, privacy-controlled optional card */}
        <div className="card">
          <div className="row-between"><div className="h3">🌸 Döngü takibi</div><Badge tone="neutral">İsteğe bağlı</Badge></div>
          <div className="small muted" style={{ marginTop: 4 }}>Ayrı ve gizlilik kontrollü. Skorunu düşürmez. {state.menstrualLogs.length > 0 ? `${state.menstrualLogs.length} kayıt` : 'Henüz kayıt yok.'}</div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => nav('/wl/life-data')}>Yaşam Verilerim’de yönet</button>
        </div>

        {routine.value == null && (
          <div className="card tinted small">Yeterli veri yok. Yaşam verisi ekledikçe kişisel ilerlemen görünür — eksik veri “başarısızlık” değildir.</div>
        )}
      </div>
    </div>
  );
}

function ScoreMini({ title, value, fill, onClick }: { title: string; value: number | null; fill: string; onClick: () => void }) {
  return (
    <button className="card pressable grow" style={{ padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }} onClick={onClick}>
      <Ring value={value} fill={fill} size={64} />
      <div className="tiny center" style={{ fontWeight: 650, lineHeight: 1.2 }}>{title}</div>
      {value == null && <div className="tiny faint">Veri yok</div>}
    </button>
  );
}

function Empty() {
  return <div className="small faint center" style={{ padding: '12px 0' }}>Yeterli veri yok</div>;
}
