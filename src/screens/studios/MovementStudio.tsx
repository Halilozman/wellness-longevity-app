import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DigitalActivity } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, DemoNote, useToast } from '@/components/ui';
import { SessionPlayer } from '@/components/SessionPlayer';
import { DIGITAL_ACTIVITIES } from '@/data/catalog';
import { today } from '@/engine/metrics';

const STEPS = ['Rahat bir pozisyon al', 'Nazikçe ısın', 'Hareketleri kontrollü yap', 'Nefesini düzenli tut'];

export default function MovementStudio() {
  const nav = useNavigate();
  const toast = useToast();
  const { state, addEvent, addPlanTask } = useStore();
  const [session, setSession] = useState<DigitalActivity | null>(null);
  const items = DIGITAL_ACTIVITIES.filter((a) => a.activityType === 'movement');

  const doneToday = (id: string) => state.events.some((e) => e.type === 'activity_completed' && (e.data as any).activityId === id && e.at.slice(0, 10) === today());

  const complete = () => {
    if (!session) return;
    if (!doneToday(session.id)) {
      addEvent('activity_completed', { activityId: session.id });
      addPlanTask({ title: `${session.title} — tamamlandı`, kind: 'digital_activity', due: 'today', done: true, linkedActivityId: session.id });
      toast.show('Oturum tamamlandı, planına eklendi');
    } else {
      toast.show('Bu oturumu bugün zaten tamamladın');
    }
    setSession(null);
  };

  return (
    <div>
      <TopBar title="Movement Studio" back={-1} right={<Badge tone="demo">Demo içerik</Badge>} />
      <div className="pad stack">
        <div className="card tinted small">Özgün/demo hareket oturumları. Ağrı veya rahatsızlıkla devam etme; gerekiyorsa C05 uygunluk değerlendirmesini seç.</div>
        {items.map((a) => (
          <div key={a.id} className="card">
            <div className="row-between"><div className="h3">{a.title}</div><Badge tone={doneToday(a.id) ? 'ok' : 'neutral'}>{doneToday(a.id) ? 'Bugün ✓' : `${a.durationMin} dk`}</Badge></div>
            <div className="small muted" style={{ marginTop: 4 }}>{a.difficulty} · {a.format}</div>
            {a.healthSafetyNoteTr && <div className="tiny faint" style={{ marginTop: 6 }}>⚠ {a.healthSafetyNoteTr}</div>}
            <button className="btn btn-primary block" style={{ marginTop: 10 }} onClick={() => setSession(a)}>Oturumu başlat</button>
          </div>
        ))}
        <button className="btn btn-ghost block" onClick={() => nav('/wl/service/C05')}>Egzersiz uygunluğu (C05) ile başla</button>
        <DemoNote>Üçüncü taraf markalı antrenman içeriği yoktur; içerikler özgün demodur.</DemoNote>
      </div>

      <SessionPlayer
        open={!!session}
        title={session?.title ?? ''}
        durationMin={session?.durationMin ?? 5}
        steps={STEPS}
        onClose={() => setSession(null)}
        onComplete={complete}
      />
    </div>
  );
}
