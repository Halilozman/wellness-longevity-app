import { useEffect, useRef, useState } from 'react';
import { Sheet } from './ui';

interface Props {
  open: boolean;
  title: string;
  durationMin: number;
  steps?: string[];
  askMood?: boolean; // Mind sessions ask "Nasıl hissettin?"
  onClose: () => void;
  onComplete: (mood?: string) => void;
}

const MOODS = ['Daha sakin', 'Aynı', 'Daha odaklı', 'Yorgun'];

/** A real, controllable session: Başlat / Duraklat / Bitir, countdown, then done. */
export function SessionPlayer({ open, title, durationMin, steps, askMood, onClose, onComplete }: Props) {
  const total = Math.max(5, durationMin * 60);
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'running' | 'mood' | 'done'>('idle');
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) { setLeft(total); setRunning(false); setPhase('idle'); }
  }, [open, total]);

  useEffect(() => {
    if (running && phase === 'running') {
      timer.current = window.setInterval(() => {
        setLeft((l) => {
          if (l <= 1) { window.clearInterval(timer.current!); setRunning(false); setPhase(askMood ? 'mood' : 'done'); return 0; }
          return l - 1;
        });
      }, 1000);
      return () => { if (timer.current) window.clearInterval(timer.current); };
    }
  }, [running, phase, askMood]);

  const mmss = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;

  const start = () => { setPhase('running'); setRunning(true); };
  const pause = () => setRunning((r) => !r);
  const finish = () => { if (timer.current) window.clearInterval(timer.current); setRunning(false); setPhase(askMood ? 'mood' : 'done'); };

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {phase !== 'mood' && phase !== 'done' && (
        <>
          <div className="center" style={{ padding: '10px 0 4px' }}>
            <div style={{ fontSize: 44, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--alz-blue)' }}>{mmss}</div>
            <div className="small faint">{durationMin} dakikalık oturum</div>
          </div>
          {steps && steps.length > 0 && (
            <ul className="small muted" style={{ paddingLeft: 18, lineHeight: 1.7, marginTop: 8 }}>
              {steps.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          )}
          <div className="stack-sm" style={{ marginTop: 14 }}>
            {phase === 'idle'
              ? <button className="btn btn-primary block" onClick={start}>Başlat</button>
              : <button className="btn btn-primary block" onClick={pause}>{running ? 'Duraklat' : 'Devam'}</button>}
            {phase === 'running' && <button className="btn btn-ghost block" onClick={finish}>Bitir</button>}
          </div>
        </>
      )}

      {phase === 'mood' && (
        <div className="stack-sm">
          <div className="h3">Nasıl hissettin?</div>
          <div className="row wrap" style={{ gap: 8 }}>
            {MOODS.map((m) => <button key={m} className="chip selectable" onClick={() => { onComplete(m); }}>{m}</button>)}
          </div>
          <button className="btn btn-ghost block" onClick={() => onComplete()}>Geç</button>
        </div>
      )}

      {phase === 'done' && (
        <div className="stack-sm center" style={{ padding: '8px 0' }}>
          <div style={{ fontSize: 40 }} aria-hidden>✅</div>
          <div className="h3">Oturum tamamlandı</div>
          <button className="btn btn-primary block" onClick={() => onComplete()}>Planıma ekle</button>
        </div>
      )}
    </Sheet>
  );
}
