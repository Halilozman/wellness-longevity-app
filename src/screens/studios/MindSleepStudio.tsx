import { useState } from 'react';
import type { DigitalActivity } from '@/types';
import { TopBar } from '@/components/Layout';
import { Badge, Chip, DemoNote, useToast } from '@/components/ui';
import { SessionPlayer } from '@/components/SessionPlayer';
import { useStore } from '@/state/store';
import { DIGITAL_ACTIVITIES } from '@/data/catalog';
import { today } from '@/engine/metrics';

const INTENTS = [
  { id: 'calm', label: 'Sakinleşmek', types: ['mind'] },
  { id: 'break', label: 'Kısa mola', types: ['mind'] },
  { id: 'focus', label: 'Odaklanmak', types: ['mind'] },
  { id: 'sleep', label: 'Uykuya hazırlanmak', types: ['sleep'] },
];
const STEPS = ['Rahatça otur veya uzan', 'Omuzlarını gevşet', 'Nefesini yavaşça takip et'];

export default function MindSleepStudio() {
  const toast = useToast();
  const { state, addEvent, addPlanTask } = useStore();
  const [intent, setIntent] = useState<string | null>(null);
  const [session, setSession] = useState<DigitalActivity | null>(null);

  const all = DIGITAL_ACTIVITIES.filter((a) => a.activityType === 'mind' || a.activityType === 'sleep');
  const items = intent ? all.filter((a) => INTENTS.find((i) => i.id === intent)?.types.includes(a.activityType)) : all;
  const doneToday = (id: string) => state.events.some((e) => e.type === 'activity_completed' && (e.data as any).activityId === id && e.at.slice(0, 10) === today());

  const complete = (mood?: string) => {
    if (!session) return;
    if (!doneToday(session.id)) {
      addEvent('activity_completed', { activityId: session.id, mood });
      addPlanTask({ title: `${session.title} — tamamlandı`, kind: 'digital_activity', due: 'today', done: true, linkedActivityId: session.id });
      toast.show(mood ? `Oturum tamam · ${mood}` : 'Oturum haftalık rutinine eklendi');
    } else {
      toast.show('Bu oturumu bugün zaten tamamladın');
    }
    setSession(null);
  };

  return (
    <div>
      <TopBar title="Mind & Sleep Studio" back={-1} right={<Badge tone="demo">Demo içerik</Badge>} />
      <div className="pad stack">
        <div className="card">
          <div className="h3">Bugün nasıl hissediyorsun?</div>
          <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
            {INTENTS.map((i) => <Chip key={i.id} on={intent === i.id} onClick={() => setIntent(intent === i.id ? null : i.id)}>{i.label}</Chip>)}
          </div>
          <div className="small faint" style={{ marginTop: 6 }}>Duygu etiketi tanı değildir. Meditasyon tedavi veya psikoterapi yerine geçmez.</div>
        </div>

        {items.map((a) => (
          <div key={a.id} className="card">
            <div className="row-between"><div className="h3">{a.title}</div><Badge tone={doneToday(a.id) ? 'ok' : 'neutral'}>{doneToday(a.id) ? 'Bugün ✓' : `${a.durationMin} dk`}</Badge></div>
            <div className="small muted" style={{ marginTop: 4 }}>{a.format}</div>
            <button className="btn btn-primary block" style={{ marginTop: 10 }} onClick={() => setSession(a)}>Oturumu başlat</button>
          </div>
        ))}

        <DemoNote>Kriz/akut güvenlik durumunda uygun profesyonel/acil desteğe yönlendirilir; ruh hâli kaydına ticari puan bağlanmaz.</DemoNote>
      </div>

      <SessionPlayer
        open={!!session}
        title={session?.title ?? ''}
        durationMin={session?.durationMin ?? 3}
        steps={STEPS}
        askMood
        onClose={() => setSession(null)}
        onComplete={complete}
      />
    </div>
  );
}
