import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ModuleId } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, useToast } from '@/components/ui';
import { MODULES, getModule, getMicroNeed, servicesForModule } from '@/data/catalog';
import { orderConfirmed } from '@/engine';

export default function ModuleBuilder() {
  const nav = useNavigate();
  const toast = useToast();
  const [sp] = useSearchParams();
  const { state, addCustomModule, addPlanItem, setPlanItemStatus } = useStore();

  const confirmed = orderConfirmed(state.assessment?.confirmed ?? []);
  const suggestedModules = useMemo(() => {
    const set = new Set<ModuleId>();
    confirmed.forEach((c) => getMicroNeed(c.microNeedId)?.moduleIds.forEach((m) => set.add(m)));
    if (set.size === 0) { set.add('M03'); set.add('M01'); }
    return [...set];
  }, [confirmed]);

  const baseParam = sp.get('base');
  const initial = (baseParam && MODULES.some((m) => m.id === baseParam) ? baseParam : suggestedModules[0]) as ModuleId;
  const [moduleId, setModuleId] = useState<ModuleId>(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const mod = getModule(moduleId);
  const services = servicesForModule(moduleId).filter((s) => s.status !== 'soon');
  const confirmedIds = confirmed.map((c) => c.microNeedId);

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const save = () => {
    const ids = [...selected];
    const micro = confirmedIds.find((m) => getMicroNeed(m)?.moduleIds.includes(moduleId)) ?? confirmedIds[0] ?? '';
    addCustomModule({ baseModuleId: moduleId, microNeedId: micro, serviceIds: ids });
    const pid = addPlanItem({ title: `Kendi modülüm — ${mod?.nameTr}`, microNeedIds: confirmedIds.filter((m) => getMicroNeed(m)?.moduleIds.includes(moduleId)), status: 'selected' });
    setPlanItemStatus(pid, 'selected');
    toast.show('Modülün planına eklendi');
    nav('/wl/plan');
  };

  return (
    <div>
      <TopBar title="Kendi Modülümü Oluştur" back={-1} />
      <div className="pad stack">
        <div className="card tinted small">İlgili bir modül seç, uygun servisleri ekle. Sonuç kişisel bir program olur; katalogdaki M01–M24 kodlarını değiştirmez. Erişim, kapasite ve fiyat ayrıca kontrol edilir.</div>

        <div className="sectiontitle">Modül</div>
        <div className="row wrap" style={{ gap: 6 }}>
          {suggestedModules.map((m) => (
            <button key={m} className={`chip selectable ${m === moduleId ? 'on' : ''}`} onClick={() => { setModuleId(m); setSelected(new Set()); }}>
              {getModule(m)?.emoji} {getModule(m)?.nameTr}
            </button>
          ))}
        </div>

        <div className="sectiontitle">{mod?.nameTr} servisleri</div>
        <div className="stack-sm">
          {services.map((s) => {
            const on = selected.has(s.id);
            const servesConfirmed = s.microNeedIds.some((m) => confirmedIds.includes(m));
            return (
              <button key={s.id} className={`opt ${on ? 'on' : ''}`} onClick={() => toggle(s.id)}>
                <span style={{ flex: 1 }}>
                  <span style={{ fontWeight: 650 }}>{s.nameTr}</span>
                  <span className="row wrap" style={{ gap: 4, marginTop: 4 }}>
                    {servesConfirmed && <Badge tone="ok">İhtiyacına uygun</Badge>}
                    {s.needsProfessional && <Badge tone="info">Uzman onayı</Badge>}
                    {s.isSample && <Badge tone="demo">Örnek</Badge>}
                  </span>
                </span>
                <span className="opt-check" aria-hidden>{on ? '✓' : ''}</span>
              </button>
            );
          })}
          {services.length === 0 && <div className="small muted">Bu modül için uygun servis henüz yok.</div>}
        </div>

        {selected.size > 0 && (
          <div className="card">
            <div className="sectiontitle" style={{ marginTop: 0 }}>Program özeti</div>
            <div className="small muted">{selected.size} servis · tahmini temas: düzenli · ilk adım: uzman onaylı değerlendirme</div>
          </div>
        )}
      </div>

      <div className="pad stack-sm" style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', paddingTop: 10 }}>
        <button className="btn btn-primary block" disabled={selected.size === 0} onClick={save}>Programı oluştur ({selected.size})</button>
      </div>
    </div>
  );
}
