import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AnswerValue } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { ProgressBar } from '@/components/ui';
import {
  visibleQuestions, selectedAreasFromAnswers, mapAnswersToNeeds, detectSafetyStop,
} from '@/engine';
import { RULE_VERSION } from '@/data/catalog';
import { uid, nowIso } from '@/lib/ids';

export default function Assessment() {
  const nav = useNavigate();
  const { completeAssessment } = useStore();
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [i, setI] = useState(0);

  const selectedAreas = selectedAreasFromAnswers(answers);
  const visible = useMemo(() => visibleQuestions(selectedAreas, answers), [selectedAreas, answers]);
  const safety = detectSafetyStop(answers);
  const step = Math.min(i, visible.length - 1);
  const q = visible[step];
  const isLast = step >= visible.length - 1;

  if (safety) return <SafetyStop onHome={() => nav('/wl')} />;

  const value = answers[q.id];
  const answered = q.sensitive
    ? true
    : q.type === 'multi'
      ? Array.isArray(value) && value.length > 0
      : value !== undefined && value !== '';

  const set = (v: AnswerValue) => setAnswers((a) => ({ ...a, [q.id]: v }));

  const toggleMulti = (optId: string) => {
    const cur = Array.isArray(value) ? value : [];
    set(cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId]);
  };

  const finish = () => {
    const scored = mapAnswersToNeeds(answers);
    completeAssessment({ sessionId: uid('as'), createdAt: nowIso(), answers, scored, confirmed: [], ruleVersion: RULE_VERSION });
    nav('/wl/needs/confirm');
  };

  const onNext = () => {
    if (detectSafetyStop({ ...answers })) return; // guarded above
    if (isLast) finish();
    else setI(step + 1);
  };

  return (
    <div>
      <TopBar
        title="İhtiyaçlarını Keşfet"
        back={step === 0 ? '/wl/consent' : undefined}
        right={<span className="small faint">{step + 1}/{visible.length}</span>}
      />
      <div className="pad" style={{ paddingBottom: 8 }}>
        <ProgressBar value={((step + 1) / visible.length) * 100} blue />
      </div>

      <div className="pad stack" style={{ flex: 1 }}>
        <div>
          <div className="h2">{q.promptTr}</div>
          {q.helpTr && <div className="small muted" style={{ marginTop: 6 }}>{q.helpTr}</div>}
          {q.sensitive && <div className="small faint" style={{ marginTop: 4 }}>İsteğe bağlı — atlayabilirsin.</div>}
        </div>

        <div className="stack-sm" style={{ marginTop: 4 }}>
          {q.type === 'scale' ? (
            <>
              <div className="scale" role="group" aria-label={q.promptTr}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} className={value === n ? 'on' : ''} onClick={() => set(n)}>{n}</button>
                ))}
              </div>
              {q.scaleLabels && <div className="row-between tiny faint"><span>{q.scaleLabels[0]}</span><span>{q.scaleLabels[1]}</span></div>}
            </>
          ) : (
            q.options?.map((o) => {
              const on = q.type === 'multi' ? (Array.isArray(value) && value.includes(o.id)) : value === o.id;
              return (
                <button key={o.id} className={`opt ${on ? 'on' : ''}`} onClick={() => (q.type === 'multi' ? toggleMulti(o.id) : set(o.id))}>
                  {o.emoji && <span className="opt-emoji" aria-hidden>{o.emoji}</span>}
                  <span style={{ flex: 1 }}>{o.labelTr}</span>
                  <span className="opt-check" aria-hidden>{on ? '✓' : ''}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="pad stack-sm" style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', paddingTop: 10 }}>
        <button className="btn btn-primary block" disabled={!answered} onClick={onNext}>
          {isLast ? 'İhtiyaçlarımı Gör' : 'Devam'}
        </button>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          {step > 0 ? <button className="btn btn-ghost btn-sm" onClick={() => setI(step - 1)}>‹ Önceki</button> : <span />}
          {q.sensitive && !answered && <button className="btn btn-ghost btn-sm" onClick={onNext}>Atla →</button>}
        </div>
      </div>
    </div>
  );
}

function SafetyStop({ onHome }: { onHome: () => void }) {
  return (
    <div>
      <TopBar title="Önemli" />
      <div className="pad stack">
        <div className="card" style={{ borderColor: 'var(--danger-bg)', background: 'var(--danger-bg)' }}>
          <div className="h3" style={{ color: 'var(--danger)' }}>Acil belirti bildirdin</div>
          <p className="lead" style={{ marginTop: 8 }}>
            Acil tıbbi yardım gerektiren bir belirti yaşıyorsan lütfen vakit kaybetmeden <b>112 Acil</b>’i ara veya en yakın acil servise başvur.
          </p>
          <p className="small muted">Bu uygulama tıbbi triyaj, teşhis veya acil müdahale sağlamaz; öneri akışı güvenliğin için durduruldu.</p>
        </div>
        <button className="btn btn-primary block" onClick={onHome}>Ana sayfaya dön</button>
      </div>
    </div>
  );
}
