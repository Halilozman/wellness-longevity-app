import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, EmptyState, ListRow } from '@/components/ui';
import { getMicroNeed, getModule } from '@/data/catalog';
import { orderConfirmed } from '@/engine';
import { tryFormat } from '@/lib/ids';

export default function MyNeeds() {
  const nav = useNavigate();
  const { state } = useStore();
  const a = state.assessment;
  const confirmed = orderConfirmed(a?.confirmed ?? []);

  return (
    <div>
      <TopBar title="İhtiyaçlarım" nextStep={confirmed.length ? 'Önerilerini güncelle veya planını gözden geçir' : 'Kısa keşif anketini tamamla'} />
      <div className="pad stack">
        {confirmed.length === 0 ? (
          <EmptyState emoji="🎯" title="Henüz ihtiyaç yok" desc="İhtiyaçlarını keşfet; sana özel öneriler oluşturalım."
            action={<button className="btn btn-primary" onClick={() => nav('/wl/consent')}>İhtiyaçlarımı Keşfet</button>} />
        ) : (
          <>
            <div className="card tinted small">
              Son keşif: {a?.createdAt ? tryFormat(a.createdAt) : '—'} · {state.assessmentHistory.length > 1 ? `${state.assessmentHistory.length} kayıt` : 'ilk kayıt'}
            </div>

            <div className="sectiontitle">Doğrulanmış ihtiyaçların</div>
            <div className="card flat" style={{ padding: 4 }}>
              {confirmed.map((c) => {
                const mn = getMicroNeed(c.microNeedId);
                return (
                  <ListRow key={c.microNeedId}
                    icon={getModule(mn?.moduleIds[0] ?? 'M01')?.emoji}
                    title={mn?.shortTr}
                    sub={mn?.moduleIds.map((m) => getModule(m)?.nameTr).join(', ')}
                    right={c.priority > 0 ? <Badge tone="info">Öncelik {c.priority}</Badge> : undefined}
                  />
                );
              })}
            </div>

            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-secondary btn-sm grow" onClick={() => nav('/wl/needs/map')}>İhtiyaç Haritam</button>
              <button className="btn btn-primary btn-sm grow" onClick={() => nav('/wl/recommend')}>Önerilerim</button>
            </div>

            {state.savedRecommendations.length > 0 && (
              <>
                <div className="sectiontitle">Kaydettiğin öneriler</div>
                <div className="stack-sm">
                  {state.savedRecommendations.map((r) => (
                    <ListRow key={r.id} icon="💾" title={r.titleTr} sub={`Uyum ${r.fitScore}/100`} onClick={() => nav('/wl/recommend')} />
                  ))}
                </div>
              </>
            )}

            {state.customModules.length > 0 && (
              <>
                <div className="sectiontitle">Kendi modüllerin</div>
                <div className="stack-sm">
                  {state.customModules.map((m) => (
                    <ListRow key={m.id} icon={getModule(m.baseModuleId)?.emoji} title={`Kendi modülüm — ${getModule(m.baseModuleId)?.nameTr}`} sub={`${m.serviceIds.length} servis`} onClick={() => nav('/wl/plan')} />
                  ))}
                </div>
              </>
            )}

            <div className="sectiontitle">Yeniden değerlendirme</div>
            <div className="card">
              <div className="small muted">Önerilen: 30 / 60 / 90 gün. Yeni yanıtlar eski sonuçları silmez; karşılaştırılabilir kayıt tutulur.</div>
              <div className="stack-sm" style={{ marginTop: 10 }}>
                <button className="btn btn-ghost block" onClick={() => nav('/wl/consent')}>İhtiyacım değişti — yeniden değerlendir</button>
                <button className="btn btn-ghost block" onClick={() => nav('/wl/recommend')}>Bu plan bana fazla geldi</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
