import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { SupportTier } from '@/types';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, DemoNote, EmptyState, Segmented } from '@/components/ui';
import { getService, getPackage, packageRelationsFor } from '@/data/catalog';
import { evaluateEligibility } from '@/engine';
import { daysAgo } from '@/engine/metrics';

const TIER_OPTS = [
  { value: 'essential' as SupportTier, label: 'Essential' },
  { value: 'guided' as SupportTier, label: 'Guided' },
  { value: 'premium' as SupportTier, label: 'Premium' },
];

function slots(): { dateIso: string; label: string }[] {
  const out: { dateIso: string; label: string }[] = [];
  const times = ['09:00', '10:00', '14:00'];
  for (let d = 1; d <= 4; d++) {
    const date = daysAgo(-d);
    for (const t of times) out.push({ dateIso: `${date}T${t}:00`, label: `${date.slice(8)}.${date.slice(5, 7)} · ${t}` });
  }
  return out;
}

export default function Checkout() {
  const { kind = 'service', id = '' } = useParams();
  const nav = useNavigate();
  const { state, createOrder, createBooking, addPlanItem, setPlanItemStatus, addPlanTask } = useStore();

  const isPackage = kind === 'package';
  const svc = !isPackage ? getService(id) : undefined;
  const pkg = isPackage ? getPackage(id) : undefined;
  const elig = svc ? evaluateEligibility(svc.id, state.user.accessCategory, state.user.corporate) : undefined;

  const needsBooking = !!svc && (svc.needsProfessional || svc.deliveryMode === 'video' || svc.deliveryMode === 'in_person');
  const allSlots = useMemo(slots, []);
  const [slot, setSlot] = useState<string>('');
  const [tier, setTier] = useState<SupportTier>('essential');
  const [done, setDone] = useState(false);

  if (!svc && !pkg) return <div><TopBar title="Ödeme" back={-1} /><EmptyState emoji="🔍" title="Bulunamadı" /></div>;

  const price = isPackage
    ? packageRelationsFor(pkg!.id).filter((r) => r.inclusion === 'core').reduce((a, r) => a + (getService(r.serviceId)?.demoPriceTry ?? 0), 0)
    : (svc!.demoPriceTry ?? 0);
  const entitled = elig?.entitled ?? false;
  // packages are purchasable only for ALZ customers (demo rule); services need entitlement or pay-per-use
  const purchasable = isPackage ? state.user.accessCategory === 'alz' : (entitled || (elig?.payPerUse ?? false));

  const confirm = () => {
    if (!purchasable) return;
    const title = svc ? svc.nameTr : pkg!.nameTr;
    createOrder({
      refId: id, kind: isPackage ? 'module_package' : 'single_service',
      status: entitled ? 'entitlement_used' : 'paid', supportTier: tier,
      amountTry: entitled ? 0 : price, isDemoPrice: true,
    });
    const pid = addPlanItem({
      title, microNeedIds: svc?.microNeedIds ?? [],
      serviceId: svc?.id, packageId: isPackage ? (pkg!.id as any) : undefined,
      status: needsBooking ? 'booked' : 'purchased', supportTier: tier,
    });
    if (svc && needsBooking && slot) {
      const bid = createBooking({ serviceId: svc.id, providerTr: 'ALZ anlaşmalı sağlayıcı (demo)', slotIso: slot, status: 'booked', channel: svc.deliveryMode === 'in_person' ? 'in_person' : 'video' });
      setPlanItemStatus(pid, 'booked');
      addPlanTask({ title: `${svc.nameTr} randevun`, kind: 'appointment', due: 'this_week', done: false, linkedPlanItemId: pid, });
      void bid;
    } else {
      addPlanTask({ title: `${title} — ilk adımını tamamla`, kind: 'habit', due: 'today', done: false, linkedPlanItemId: pid });
    }
    setDone(true);
  };

  if (done) {
    return (
      <div>
        <TopBar title="Tamamlandı" />
        <div className="pad stack" style={{ marginTop: 20 }}>
          <EmptyState emoji="✅" title={needsBooking ? 'Rezervasyonun alındı' : 'Seçimin eklendi'}
            desc={`${svc ? svc.nameTr : pkg!.nameTr} sağlık planına eklendi.`} />
          <button className="btn btn-primary block" onClick={() => nav('/wl/plan')}>Sağlık Planıma git</button>
          <button className="btn btn-ghost block" onClick={() => nav('/wl')}>Keşfete dön</button>
        </div>
      </div>
    );
  }

  const canConfirm = purchasable && (!needsBooking || !!slot);

  return (
    <div>
      <TopBar title={entitled ? 'Hakkımı Kullan' : 'Satın Al (Demo)'} back={-1} />
      <div className="pad stack">
        <div className="card">
          <div className="row-between">
            <div className="h3">{svc ? svc.nameTr : pkg!.nameTr}</div>
            {isPackage && <span className="small faint">{pkg!.id}</span>}
          </div>
          <div className="small muted" style={{ marginTop: 4 }}>{svc ? svc.descTr : pkg!.descTr}</div>
          {isPackage && (
            <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
              {packageRelationsFor(pkg!.id).filter((r) => r.inclusion === 'core').map((r) => <span key={r.serviceId} className="chip">{getService(r.serviceId)?.nameTr}</span>)}
            </div>
          )}
        </div>

        {/* support tier — the second axis */}
        <div className="card">
          <div className="sectiontitle" style={{ marginTop: 0 }}>Nasıl destek almak istersin?</div>
          <Segmented options={TIER_OPTS} value={tier} onChange={setTier} />
          <div className="small muted" style={{ marginTop: 8 }}>
            {tier === 'essential' ? 'Dijital, kendi hızında destek.' : tier === 'guided' ? 'Planlı uzman kontrolüyle destek.' : 'Birden fazla uzman koordinasyonu.'}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={() => nav('/wl/support-tier')}>Seviyeleri karşılaştır</button>
        </div>

        {needsBooking && (
          <div className="card">
            <div className="sectiontitle" style={{ marginTop: 0 }}>Tarih ve saat seç</div>
            <div className="row wrap" style={{ gap: 6 }}>
              {allSlots.map((s) => (
                <button key={s.dateIso} className={`chip selectable ${slot === s.dateIso ? 'on' : ''}`} onClick={() => setSlot(s.dateIso)}>{s.label}</button>
              ))}
            </div>
            <div className="small muted" style={{ marginTop: 8 }}>Sağlayıcı: ALZ anlaşmalı sağlayıcı (demo)</div>
          </div>
        )}

        <div className="card">
          <div className="sectiontitle" style={{ marginTop: 0 }}>Ödeme özeti</div>
          <div className="kv"><span className="kv-k">Kapsam</span><span className="kv-v">{entitled ? 'Teminata dahil' : 'Doğrudan ödeme'}</span></div>
          <div className="kv"><span className="kv-k">Tutar</span><span className="kv-v">{entitled ? 'Dahil' : `${price} ₺`}{!entitled && <span className="tiny faint"> Demo fiyatı</span>}</span></div>
          <div className="kv"><span className="kv-k">Destek seviyesi</span><span className="kv-v">{TIER_OPTS.find((t) => t.value === tier)!.label}</span></div>
        </div>

        {!purchasable && (
          <div className="card" style={{ borderColor: 'var(--warn-bg)', background: 'var(--warn-bg)' }}>
            <div className="small" style={{ color: 'var(--warn)' }}>
              {isPackage
                ? 'Bu statüde paket satın alınamaz. Uygun tekil servisleri seçebilir veya bilgi alabilirsin.'
                : 'Bu statüde bu servis için satın alma yolu yok; bilgi alabilirsin.'}
            </div>
          </div>
        )}

        <DemoNote>Bu bir demo ödemesidir; gerçek tahsilat, teminat kontrolü ve sağlayıcı kapasitesi yapılmaz.</DemoNote>
      </div>

      <div className="pad stack-sm" style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', paddingTop: 10 }}>
        <button className="btn btn-primary block" disabled={!canConfirm} onClick={confirm}>
          {!purchasable ? 'Bu statüde satın alınamaz' : entitled ? 'Hakkımı kullan' : needsBooking ? 'Rezervasyonu onayla' : 'Satın al (demo)'}
        </button>
        {purchasable && needsBooking && !slot && <div className="tiny faint center">Devam için bir slot seç</div>}
        {!purchasable && <button className="btn btn-ghost block" onClick={() => nav('/wl/catalog')}>Kataloğu keşfet</button>}
      </div>
    </div>
  );
}
