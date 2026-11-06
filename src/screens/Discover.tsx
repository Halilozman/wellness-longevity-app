import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { AccessBadge, Badge } from '@/components/ui';
import { DIGITAL_ACTIVITIES, MACRO_NEEDS, getMicroNeed } from '@/data/catalog';

export default function Discover() {
  const nav = useNavigate();
  const { state } = useStore();
  const confirmed = state.assessment?.confirmed ?? [];
  const confirmedIds = confirmed.map((c) => c.microNeedId);
  const hasNeeds = confirmedIds.length > 0;

  const todayActivities = (() => {
    const matched = DIGITAL_ACTIVITIES.filter((a) => a.mappedMicroNeeds.some((m) => confirmedIds.includes(m)));
    const pool = matched.length ? matched : DIGITAL_ACTIVITIES.filter((a) => a.status === 'active');
    return pool.slice(0, 4);
  })();

  const studioRoute = (type: string) =>
    type === 'movement' ? '/wl/studio/movement' : type === 'mind' || type === 'sleep' ? '/wl/studio/mind' : type === 'nutrition' ? '/wl/studio/food' : '/wl/community';

  return (
    <div>
      <TopBar
        title="Wellness & Longevity"
        back="/"
        onBlue
        right={<Badge tone="demo">Demo</Badge>}
        context={<AccessBadge category={state.user.accessCategory} />}
      />

      <div className="pad stack">
        {/* Hero / primary CTA */}
        <div className="card-hero">
          <div className="h2" style={{ color: '#fff' }}>Sağlığın için nereden başlamak istersin?</div>
          <div className="small" style={{ opacity: 0.92, marginTop: 6, lineHeight: 1.5 }}>
            İhtiyaçlarını keşfet; sana özel, açıklanabilir öneriler ve bir sağlık planı oluşturalım.
          </div>
          <div className="stack-sm" style={{ marginTop: 14 }}>
            <button className="btn btn-mint block" onClick={() => nav(hasNeeds ? '/wl/needs/map' : '/wl/consent')}>
              {hasNeeds ? 'İhtiyaç Haritamı Gör' : 'İhtiyaçlarımı Keşfet'}
            </button>
            <button className="btn btn-ghost block" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }} onClick={() => nav('/wl/catalog')}>
              Servisleri İncele
            </button>
          </div>
        </div>

        {hasNeeds && (
          <button className="card pressable" style={{ textAlign: 'left', width: '100%' }} onClick={() => nav('/wl/recommend')}>
            <div className="row-between">
              <div><div className="h3">Sana özel önerilerin hazır</div><div className="small muted">{confirmedIds.length} doğrulanmış ihtiyaç</div></div>
              <span className="btn btn-secondary btn-sm">Gör →</span>
            </div>
          </button>
        )}

        {/* Today cards */}
        <div className="row-between">
          <div className="sectiontitle" style={{ margin: 0 }}>Bugün senin için</div>
          {hasNeeds && <button className="btn btn-sm btn-ghost" onClick={() => nav('/wl/needs/map')}>İhtiyaçlarım</button>}
        </div>
        <div className="stack-sm">
          {todayActivities.map((a) => (
            <button key={a.id} className="card pressable flat" style={{ textAlign: 'left', width: '100%', borderColor: 'var(--border)' }} onClick={() => nav(studioRoute(a.activityType))}>
              <div className="row">
                <span className="lr-icon" aria-hidden>{a.activityType === 'movement' ? '🏃' : a.activityType === 'nutrition' ? '🥗' : a.activityType === 'community' ? '🫂' : '🧘'}</span>
                <span className="lr-main">
                  <span className="lr-title" style={{ display: 'block' }}>{a.title}</span>
                  <span className="lr-sub">{a.durationMin} dk · {a.format}</span>
                </span>
                <span className="lr-chevron">›</span>
              </div>
            </button>
          ))}
        </div>

        {/* Explore categories */}
        <div className="sectiontitle">Hizmet alanlarını keşfet</div>
        <div className="accessgrid">
          {MACRO_NEEDS.map((mn) => (
            <button key={mn.id} className="accesscell" onClick={() => nav(`/wl/catalog?mn=${mn.id}`)}>
              <div className="ac-ico" aria-hidden>{mn.emoji}</div>
              <div className="ac-lbl">{mn.nameTr}</div>
            </button>
          ))}
        </div>

        {/* Quick tiles */}
        <div className="sectiontitle">Diğer</div>
        <div className="stack-sm">
          <QuickRow emoji="🏋️" title="Fitness & Ödüller" sub="Salon, ders, puan ve ödüller" onClick={() => nav('/wl/fitness')} />
          <QuickRow emoji="🧩" title="Sağlık Görünümüm" sub="Verilerini tanı ve bağla" onClick={() => nav('/wl/health-overview')} />
          <QuickRow emoji="📊" title="Skorlarım" sub="İhtiyaç, uygunluk ve ilerleme" onClick={() => nav('/wl/scores')} />
          <QuickRow emoji="🎁" title="Ödül Cüzdanım" sub="Puanlar ve kuponlar" onClick={() => nav('/wl/rewards')} />
        </div>

        <div className="small faint center" style={{ marginTop: 6, paddingBottom: 8 }}>
          Bu uygulama teşhis veya tıbbi değerlendirme aracı değildir.
        </div>
      </div>
    </div>
  );
}

function QuickRow({ emoji, title, sub, onClick }: { emoji: string; title: string; sub: string; onClick: () => void }) {
  return (
    <button className="card pressable flat" style={{ textAlign: 'left', width: '100%', borderColor: 'var(--border)', padding: 12 }} onClick={onClick}>
      <div className="row">
        <span className="lr-icon" aria-hidden>{emoji}</span>
        <span className="lr-main"><span className="lr-title" style={{ display: 'block' }}>{title}</span><span className="lr-sub">{sub}</span></span>
        <span className="lr-chevron">›</span>
      </div>
    </button>
  );
}
