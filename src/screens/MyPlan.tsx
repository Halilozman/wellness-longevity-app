import { useNavigate } from 'react-router-dom';
import type { PlanItemStatus, PlanTask } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, EmptyState } from '@/components/ui';
import { getService } from '@/data/catalog';

const STATUS: Record<PlanItemStatus, { t: string; tone: 'ok' | 'info' | 'warn' | 'neutral' }> = {
  recommended: { t: 'Önerildi', tone: 'neutral' },
  selected: { t: 'Seçildi', tone: 'info' },
  eligibility_check: { t: 'Hak kontrolünde', tone: 'warn' },
  purchased: { t: 'Satın alındı', tone: 'ok' },
  booked: { t: 'Randevu alındı', tone: 'info' },
  in_progress: { t: 'Sürüyor', tone: 'info' },
  completed: { t: 'Tamamlandı', tone: 'ok' },
  follow_up: { t: 'Takip zamanı', tone: 'warn' },
};

export default function MyPlan() {
  const nav = useNavigate();
  const { state, toggleTask } = useStore();
  const { planItems, planTasks } = state;

  const byDue = (d: PlanTask['due']) => planTasks.filter((t) => t.due === d);
  const hasAnything = planItems.length > 0 || planTasks.length > 0;

  return (
    <div>
      <TopBar title="Sağlık Planım" nextStep={hasAnything ? 'Bugünkü görevlerini tamamla' : 'Bir hizmet seçerek planını başlat'} />
      <div className="pad stack">
        {!hasAnything ? (
          <EmptyState emoji="🗓️" title="Planın henüz boş" desc="İhtiyaçlarını keşfet, bir hizmet seç; planın burada oluşsun."
            action={<button className="btn btn-primary" onClick={() => nav('/wl/consent')}>İhtiyaçlarımı Keşfet</button>} />
        ) : (
          <>
            <TaskGroup title="Bugün" tasks={byDue('today')} onToggle={toggleTask} onGo={() => nav('/wl/studio/movement')} />
            <TaskGroup title="Bu hafta" tasks={byDue('this_week')} onToggle={toggleTask} />
            <TaskGroup title="Sonraki adımım" tasks={byDue('next')} onToggle={toggleTask} />

            {planItems.length > 0 && (
              <>
                <div className="sectiontitle">Hizmetlerim</div>
                <div className="stack-sm">
                  {planItems.map((p) => (
                    <button key={p.id} className="card pressable flat" style={{ textAlign: 'left', width: '100%' }} onClick={() => p.serviceId && nav(`/wl/service/${p.serviceId}`)}>
                      <div className="row-between">
                        <div style={{ flex: 1 }}>
                          <div className="lr-title">{p.title}</div>
                          <div className="small muted" style={{ marginTop: 2 }}>{p.supportTier ? `${p.supportTier[0].toUpperCase()}${p.supportTier.slice(1)} destek · ` : ''}İhtiyaç → seçim → aksiyon → takip</div>
                        </div>
                        <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].t}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="sectiontitle">Hızlı erişim</div>
            <div className="stack-sm">
              <QuickRow emoji="🧪" title="Sağlık Testlerim" sub="Biyolojik yaş, check-up, genetik (demo)" onClick={() => nav('/wl/health-overview')} />
              <QuickRow emoji="📈" title="İlerlemem" sub="Skorlar ve eğilimler" onClick={() => nav('/wl/progress')} />
              <QuickRow emoji="🧘" title="Dijital aktiviteler" sub="Hareket, zihin & uyku, beslenme" onClick={() => nav('/wl/studio/mind')} />
            </div>

            <div className="card">
              <div className="small muted">İhtiyacın değiştiyse planını yeniden önerilere döndürebilirsin.</div>
              <button className="btn btn-ghost block" style={{ marginTop: 10 }} onClick={() => nav('/wl/needs')}>İhtiyaç profilimi gözden geçir</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TaskGroup({ title, tasks, onToggle, onGo }: { title: string; tasks: PlanTask[]; onToggle: (id: string) => void; onGo?: () => void }) {
  if (tasks.length === 0) return null;
  return (
    <>
      <div className="sectiontitle">{title}</div>
      <div className="card flat" style={{ padding: 6 }}>
        {tasks.map((t) => (
          <div key={t.id} className="listrow" style={{ padding: '10px 8px' }}>
            <button className="opt-check" style={{ borderWidth: 2, borderStyle: 'solid', borderRadius: '50%', background: t.done ? 'var(--ok)' : '#fff', borderColor: t.done ? 'var(--ok)' : 'var(--border-strong)' }} aria-label="Tamamla" onClick={() => onToggle(t.id)}>{t.done ? '✓' : ''}</button>
            <span className="lr-main"><span className="lr-title" style={{ textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.6 : 1 }}>{t.title}</span><span className="lr-sub">{t.kind === 'appointment' ? 'Randevu' : t.kind === 'digital_activity' ? 'Dijital aktivite' : t.kind === 'review' ? 'Değerlendirme' : 'Alışkanlık'}</span></span>
            {t.kind === 'digital_activity' && onGo && <button className="btn btn-sm btn-ghost" onClick={onGo}>Başla</button>}
          </div>
        ))}
      </div>
    </>
  );
}

function QuickRow({ emoji, title, sub, onClick }: { emoji: string; title: string; sub: string; onClick: () => void }) {
  return (
    <button className="card pressable flat" style={{ textAlign: 'left', width: '100%', padding: 12 }} onClick={onClick}>
      <div className="row"><span className="lr-icon" aria-hidden>{emoji}</span><span className="lr-main"><span className="lr-title" style={{ display: 'block' }}>{title}</span><span className="lr-sub">{sub}</span></span><span className="lr-chevron">›</span></div>
    </button>
  );
}
