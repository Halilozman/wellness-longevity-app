import { TopBar } from '@/components/Layout';
import { Badge, DemoNote, useToast } from '@/components/ui';
import { useStore } from '@/state/store';
import { COMMUNITY_CHALLENGES } from '@/data/catalog';
import { balances } from '@/engine/rewards';

export default function Community() {
  const toast = useToast();
  const { state, earnReward, addEvent } = useStore();
  const bal = balances(state.pointsLedger);

  const done = (id: string) => state.events.some((e) => e.type === 'activity_completed' && (e.data as any).challengeId === id);

  const join = (c: typeof COMMUNITY_CHALLENGES[number]) => {
    if (done(c.id)) { toast.show('Bu göreve zaten katıldın — tekrar puan verilmez'); return; }
    addEvent('activity_completed', { challengeId: c.id });
    earnReward(`challenge:${c.id}`, c.spendablePoints, `Topluluk görevi: ${c.titleTr}`);
    toast.show(`+${c.statusPoints} statü, +${c.spendablePoints} harcanabilir puan`);
  };

  return (
    <div>
      <TopBar title="Üyelik & Topluluk" back={-1} right={<Badge tone="demo">Demo</Badge>} />
      <div className="pad stack">
        <div className="card">
          <div className="row-between">
            <div><div className="small muted">Statü ilerlemesi</div><div className="h3">Seviye 1</div></div>
            <div style={{ textAlign: 'right' }}><div className="small muted">Harcanabilir puan</div><div className="h3">{bal.spendable}</div></div>
          </div>
          <div className="small faint" style={{ marginTop: 8 }}>Statü puanı ile harcanabilir puan ayrı izlenir; sağlık risk skoru veya Essential/Guided/Premium ile birleşmez.</div>
        </div>

        <div className="sectiontitle">Gönüllü görevler ve etkinlikler</div>
        {COMMUNITY_CHALLENGES.map((c) => (
          <div key={c.id} className="card">
            <div className="h3">{c.titleTr}</div>
            <div className="small muted" style={{ marginTop: 4 }}>{c.descTr}</div>
            <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
              <Badge tone="info">Hedef: {c.goalTr}</Badge>
              <Badge tone="neutral">+{c.statusPoints} statü</Badge>
              <Badge tone="ok">+{c.spendablePoints} puan</Badge>
            </div>
            {c.accessibleAltTr && <div className="tiny faint" style={{ marginTop: 6 }}>Erişilebilir alternatif: {c.accessibleAltTr}</div>}
            <button className="btn btn-secondary block" style={{ marginTop: 10 }} disabled={done(c.id)} onClick={() => join(c)}>{done(c.id) ? 'Tamamlandı ✓' : 'Gönüllü katıl ve tamamla'}</button>
          </div>
        ))}

        <DemoNet />
      </div>
    </div>
  );
}

function DemoNet() {
  return <DemoNote>Canlı konum, sağlık ölçümleri ve kişisel skorlar varsayılan olarak başka kullanıcılara gösterilmez. Gruba katılmadan da tam değer alırsın.</DemoNote>;
}
