import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ScoreResult } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, ProgressBar, Ring } from '@/components/ui';
import {
  needPriorityScore, routineProgressScore, recommend, deriveSignals,
  selectedAreasFromAnswers, orderConfirmed, today, offerFitScore, coverageForServiceSet,
} from '@/engine';
import { RULE_VERSION } from '@/data/catalog';

export default function Scores() {
  const nav = useNavigate();
  const { state } = useStore();
  const a = state.assessment;

  const need = useMemo(() => needPriorityScore(a?.scored ?? [], a?.confirmed ?? []), [a]);
  const routine = useMemo(() => routineProgressScore(state.personalGoals, state.metrics, state.planTasks, today()), [state.personalGoals, state.metrics, state.planTasks]);
  const offer: ScoreResult = useMemo(() => {
    if (!a || a.confirmed.length === 0) return { value: null, breakdown: [], completeness: 0, updatedAt: new Date().toISOString(), ruleVersion: RULE_VERSION, note: 'Henüz bir öneri seçilmedi.' };
    const confirmed = orderConfirmed(a.confirmed);
    const cards = recommend(confirmed, a.scored, deriveSignals(a.answers ?? {}, selectedAreasFromAnswers(a.answers ?? {}).length));
    const primary = cards.find((c) => c.tier === 'primary');
    const cov = primary?.coverage ?? coverageForServiceSet([], confirmed.map((c) => c.microNeedId));
    return {
      value: primary?.fitScore ?? null,
      breakdown: [
        { labelTr: 'Karşılanan çekirdek ihtiyaç', value: Math.min(100, cov.core.length * 50), weight: 1, source: 'catalog' },
        { labelTr: 'Opsiyonel/seç-bir kapsam', value: Math.min(100, (cov.optional.length + cov.chooseOne.length) * 40), weight: 0.5, source: 'catalog' },
      ],
      completeness: 100, updatedAt: new Date().toISOString(), ruleVersion: RULE_VERSION,
      note: 'Doğrulanmış ihtiyaçların önerilen teklif tarafından karşılanma oranı. En yüksek skor en pahalı teklif değildir.',
    };
  }, [a]);

  return (
    <div>
      <TopBar title="Skorlarım ve Eğilimlerim" back="/wl/progress" />
      <div className="pad stack">
        <div className="card tinted small">Üç ayrı, açıklanabilir skor. Her birinin amacı, girdisi ve güncellenmesi farklıdır; tek bir “sağlık notu” altında birleşmez.</div>

        <ScoreCard title="Need Priority Score" subtitle="İhtiyaç Önceliklerim" fill="var(--alz-blue)" r={need}
          how="Test yanıtların, doğruladığın mikro ihtiyaçlar ve öncelik sıran. Öz-bildirimdir; tıbbi risk/teşhis değildir." />
        <ScoreCard title="Service / Module / Package Fit" subtitle="Öneri Uygunluğu" fill="var(--info)" r={offer}
          how="Doğrulanmış ihtiyaçların teklif tarafından karşılanma oranı. Yalnızca çekirdek kapsam kesin sayılır." />
        <ScoreCard title="My Wellness Progress" subtitle="İlerlemem" fill="var(--mint-500)" r={routine}
          how="Seçtiğin hedeflere göre, izinli günlük verilerden ve plan görevlerinden. Kendi başlangıcınla kıyaslanır; başkalarıyla değil." />

        {/* Clinical risk gate — locked, no percentages */}
        <div className="card" style={{ opacity: 0.95 }}>
          <div className="row-between"><div className="h3">🔒 Clinical Risk Insight</div><Badge tone="warn">Kilitli</Badge></div>
          <div className="small muted" style={{ marginTop: 6 }}>
            Hastalık riski yüzdesi/grafiği yalnızca onaylı veri kaynağı, valide model, profesyonel gözetim ve kullanıcı aydınlatması bir arada olduğunda açılır. Bu demoda bu kanıtlar yok; bu nedenle gizli ve kullanılamaz.
          </div>
        </div>

        <div className="small faint center" style={{ paddingBottom: 8 }}>Skorlar sigorta primi, kabul/ret, teminat veya risk sınıflandırması için kullanılmaz.</div>
      </div>
    </div>
  );
}

function ScoreCard({ title, subtitle, fill, r, how }: { title: string; subtitle: string; fill: string; r: ScoreResult; how: string }) {
  return (
    <div className="card">
      <div className="row" style={{ gap: 14 }}>
        <Ring value={r.value} fill={fill} size={72} />
        <div style={{ flex: 1 }}>
          <div className="small faint">{title}</div>
          <div className="h3">{subtitle}</div>
          <div className="row" style={{ gap: 6, marginTop: 4 }}>
            <Badge tone="neutral">Veri tamlığı {r.completeness}%</Badge>
          </div>
        </div>
      </div>

      {r.value == null ? (
        <div className="small muted" style={{ marginTop: 10 }}>{r.note ?? 'Yeterli veri yok.'}</div>
      ) : (
        <div className="stack-sm" style={{ marginTop: 10 }}>
          {r.breakdown.map((b, i) => (
            <div key={i}>
              <div className="row-between small"><span className="muted">{b.labelTr}</span><span style={{ fontWeight: 650 }}>{b.value}</span></div>
              <ProgressBar value={b.value} />
            </div>
          ))}
        </div>
      )}

      <details style={{ marginTop: 10 }}>
        <summary className="small" style={{ cursor: 'pointer', color: 'var(--alz-blue)', fontWeight: 650 }}>Bu puan nasıl hesaplandı?</summary>
        <div className="small muted" style={{ marginTop: 6, lineHeight: 1.5 }}>{how}</div>
        <div className="tiny faint" style={{ marginTop: 6 }}>Kural sürümü: {r.ruleVersion} · Güncellendi: {new Date(r.updatedAt).toLocaleString('tr-TR')}</div>
      </details>
    </div>
  );
}
