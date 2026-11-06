import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GymPartner } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, DemoNote, ProgressBar, Sheet, useToast } from '@/components/ui';
import { GYM_PARTNERS } from '@/data/catalog';
import { balances } from '@/engine/rewards';
import { daysAgo } from '@/engine/metrics';

export default function Fitness() {
  const nav = useNavigate();
  const toast = useToast();
  const { state, bookClass, checkInClass, cancelClass } = useStore();
  const [gym, setGym] = useState<GymPartner | null>(null);
  const bal = balances(state.pointsLedger);
  const todayActs = state.events.filter((e) => e.type === 'activity_completed' && e.at.slice(0, 10) === daysAgo(0)).length;
  const mission = state.missions.find((m) => m.progress < m.target) ?? state.missions[0];

  const book = (offerId: string) => {
    if (!gym) return;
    bookClass(gym.id, offerId, `${daysAgo(-1)}T18:00:00`, 'Grup dersi');
    setGym(null);
    toast.show('Rezervasyon oluşturuldu (demo)');
  };

  return (
    <div>
      <TopBar title="Fitness & Ödüller" back="/wl" right={<Badge tone="demo">Demo</Badge>} />
      <div className="pad stack">
        {/* 4 summary cards */}
        <div className="row" style={{ gap: 10 }}>
          <div className="card grow" style={{ padding: 12 }}><div className="small muted">Bugünkü aktivitem</div><div className="h2">{todayActs}</div></div>
          <div className="card grow" style={{ padding: 12 }}><div className="small muted">Puanlarım</div><div className="h2">{bal.spendable}</div><div className="tiny faint">Seviye 1</div></div>
        </div>
        <div className="card">
          <div className="row-between"><div className="small muted">Bu haftaki hedefim</div><Badge tone="info">+{mission?.points} puan</Badge></div>
          <div className="h3" style={{ marginTop: 2 }}>{mission?.titleTr}</div>
          <div style={{ marginTop: 8 }}><ProgressBar value={mission ? (mission.progress / mission.target) * 100 : 0} /></div>
          <div className="tiny faint" style={{ marginTop: 4 }}>{mission?.progress}/{mission?.target} · {mission?.accessibleAlt}</div>
        </div>
        <button className="btn btn-secondary block" onClick={() => nav('/wl/rewards')}>🎁 Ödül Cüzdanım</button>

        {/* Bookings with check-in */}
        {state.fitnessBookings.length > 0 && (
          <>
            <div className="sectiontitle">Rezervasyonlarım</div>
            <div className="stack-sm">
              {state.fitnessBookings.map((b) => {
                const g = GYM_PARTNERS.find((x) => x.id === b.gymId);
                return (
                  <div key={b.id} className="card">
                    <div className="row-between">
                      <div><div className="lr-title">{g?.nameTr}</div><div className="small muted">{b.classTr} · {b.slotIso.slice(8, 10)}.{b.slotIso.slice(5, 7)} {b.slotIso.slice(11, 16)}</div></div>
                      <Badge tone={b.status === 'checked_in' ? 'ok' : b.status === 'cancelled' ? 'danger' : 'info'}>{b.status === 'checked_in' ? 'Check-in ✓' : b.status === 'cancelled' ? 'İptal' : 'Rezerve'}</Badge>
                    </div>
                    {b.status === 'booked' && (
                      <div className="row" style={{ gap: 8, marginTop: 10 }}>
                        <button className="btn btn-primary btn-sm grow" onClick={() => { checkInClass(b.id); toast.show('Check-in doğrulandı, +60 puan'); }}>QR ile check-in</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { cancelClass(b.id); toast.show('İptal edildi'); }}>İptal</button>
                      </div>
                    )}
                    {b.status === 'checked_in' && (
                      <div className="row" style={{ gap: 8, marginTop: 10 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { checkInClass(b.id); toast.show('Aynı check-in iki kez puan vermez'); }}>Tekrar gönder (test)</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { cancelClass(b.id); toast.show('İptal — puan ters işlendi'); }}>İptal / ters işlem</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Marketplace */}
        <div className="sectiontitle">Uygun salon ve stüdyolar</div>
        <div className="stack-sm">
          {GYM_PARTNERS.map((g) => (
            <button key={g.id} className="card pressable flat" style={{ textAlign: 'left', width: '100%' }} onClick={() => setGym(g)}>
              <div className="row-between">
                <div><div className="lr-title">{g.nameTr}</div><div className="small muted">{g.cityTr}{g.districtTr !== '—' ? ' · ' + g.districtTr : ''} · ⭐ {g.rating}</div></div>
                <Badge tone="demo">Kurgusal</Badge>
              </div>
              <div className="row wrap" style={{ gap: 4, marginTop: 6 }}>{g.sportsTr.map((s) => <span key={s} className="tiny faint">#{s}</span>)}</div>
            </button>
          ))}
        </div>

        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-ghost btn-sm grow" onClick={() => nav('/wl/studio/movement')}>Movement Studio</button>
          <button className="btn btn-ghost btn-sm grow" onClick={() => nav('/wl/community')}>Topluluk</button>
        </div>

        <DemoNote>Demo tesisler kurgusaldır; onaylı anlaşma olmadan gerçek tesis partner gösterilmez. Sigorta teminatı, salon üyeliği, ödül/indirim farklı hak defterleridir.</DemoNote>
      </div>

      <Sheet open={!!gym} onClose={() => setGym(null)} title={gym?.nameTr}>
        <div className="small muted" style={{ marginBottom: 10 }}>{gym?.accessibilityTr.join(' · ')}</div>
        <div className="stack-sm">
          {gym?.offers.map((o) => (
            <div key={o.id} className="card flat" style={{ border: '1px solid var(--border)' }}>
              <div className="row-between">
                <div><div className="lr-title">{o.titleTr}</div><div className="tiny faint">{o.termsTr}</div></div>
                <div style={{ textAlign: 'right' }}><div className="h3">{o.demoPriceTry} ₺</div><div className="tiny faint">Demo fiyatı</div></div>
              </div>
              <button className="btn btn-primary block" style={{ marginTop: 10 }} onClick={() => book(o.id)}>Rezerve et</button>
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
