import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, DemoNote, ProgressBar, useToast } from '@/components/ui';
import { REWARD_CATALOGUE } from '@/data/catalog';
import { balances } from '@/engine/rewards';
import { formatTime, tryFormat } from '@/lib/ids';

export default function Rewards() {
  const nav = useNavigate();
  const toast = useToast();
  const { state, redeemReward } = useStore();
  const bal = balances(state.pointsLedger);

  const redeem = (id: string) => {
    const ok = redeemReward(id);
    toast.show(ok ? 'Ödül kullanıldı, kupon oluşturuldu' : 'Yeterli kullanılabilir puan yok');
  };

  return (
    <div>
      <TopBar title="Ödül Cüzdanım" back="/wl/fitness" right={<Badge tone="demo">Demo</Badge>} />
      <div className="pad stack">
        <div className="card-hero">
          <div className="small" style={{ opacity: 0.9 }}>Kullanılabilir puan</div>
          <div className="h1" style={{ color: '#fff' }}>{bal.spendable}</div>
          <div className="row" style={{ gap: 14, marginTop: 10 }}>
            <div><div className="tiny" style={{ opacity: 0.85 }}>Bekleyen</div><div style={{ fontWeight: 700 }}>{bal.pending}</div></div>
            <div><div className="tiny" style={{ opacity: 0.85 }}>Onaylanan</div><div style={{ fontWeight: 700 }}>{bal.approved}</div></div>
            <div><div className="tiny" style={{ opacity: 0.85 }}>Seviye</div><div style={{ fontWeight: 700 }}>1</div></div>
          </div>
        </div>

        {/* Missions */}
        <div className="sectiontitle">Haftalık görevler</div>
        <div className="stack-sm">
          {state.missions.map((m) => (
            <div key={m.id} className="card flat" style={{ border: '1px solid var(--border)' }}>
              <div className="row-between"><div className="small" style={{ fontWeight: 650 }}>{m.titleTr}</div><Badge tone="info">+{m.points}</Badge></div>
              <div style={{ marginTop: 8 }}><ProgressBar value={(m.progress / m.target) * 100} /></div>
              <div className="tiny faint" style={{ marginTop: 4 }}>{m.progress}/{m.target}{m.accessibleAlt ? ` · ${m.accessibleAlt}` : ''}</div>
            </div>
          ))}
        </div>

        {/* Catalogue */}
        <div className="sectiontitle">Ödülleri keşfet</div>
        <div className="stack-sm">
          {REWARD_CATALOGUE.map((r) => (
            <div key={r.id} className="card">
              <div className="row-between">
                <div><div className="lr-title">{r.titleTr}</div><div className="small muted">{r.kindTr} · {r.validDaysAfterRedeem} gün geçerli</div></div>
                <Badge tone="demo">Örnek ödül</Badge>
              </div>
              <div className="row-between" style={{ marginTop: 10 }}>
                <div className="h3">{r.costPoints} puan</div>
                <button className="btn btn-primary btn-sm" disabled={bal.spendable < r.costPoints} onClick={() => redeem(r.id)}>Kullan</button>
              </div>
            </div>
          ))}
        </div>

        {/* Redemptions */}
        {state.redemptions.length > 0 && (
          <>
            <div className="sectiontitle">Kuponlarım</div>
            <div className="stack-sm">
              {state.redemptions.map((rd) => {
                const item = REWARD_CATALOGUE.find((x) => x.id === rd.itemId);
                return (
                  <div key={rd.id} className="card flat" style={{ border: '1px dashed var(--border-strong)' }}>
                    <div className="row-between"><div className="lr-title">{item?.titleTr}</div><Badge tone="ok">{rd.status === 'issued' ? 'Hazır' : rd.status}</Badge></div>
                    <div className="small" style={{ marginTop: 4, fontFamily: 'monospace', letterSpacing: 1 }}>{rd.code}</div>
                    <div className="tiny faint" style={{ marginTop: 2 }}>Son kullanım: {rd.expiresAt.slice(0, 10)}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Ledger */}
        {state.pointsLedger.length > 0 && (
          <>
            <div className="sectiontitle">Puan geçmişi</div>
            <div className="card">
              {[...state.pointsLedger].reverse().map((e) => (
                <div key={e.id} className="row-between" style={{ padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}><div className="small" style={{ textDecoration: e.status === 'reversed' ? 'line-through' : 'none' }}>{e.reasonTr}</div><div className="tiny faint">{tryFormat(e.at)} {formatTime(e.at)} · {e.status === 'pending' ? 'Bekliyor' : e.status === 'approved' ? 'Onaylı' : 'Ters işlem'}</div></div>
                  <div style={{ fontWeight: 700, color: e.points < 0 ? 'var(--danger)' : e.status === 'reversed' ? 'var(--text-faint)' : 'var(--ok)' }}>{e.points > 0 ? '+' : ''}{e.points}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <DemoNote>Puanlar yalnızca doğrulanmış katılımla kazanılır; menstrual/ruh hâli/genetik/laboratuvar verisinden puan üretilmez. Gerçek partner, oran ve kampanya tarihi uydurulmaz.</DemoNote>
        <button className="btn btn-ghost block" onClick={() => nav('/wl/fitness')}>Fitness’a dön</button>
      </div>
    </div>
  );
}
