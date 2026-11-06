import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { Badge, DemoNote, EmptyState, useToast } from '@/components/ui';
import { getService, getMicroNeed, modulesForService, getModule, packagesContainingService, getPackage } from '@/data/catalog';
import { evaluateEligibility, eligibilityActionLabel } from '@/engine';

const DELIVERY: Record<string, string> = { digital: 'Dijital', in_person: 'Yüz yüze', phone: 'Telefon', video: 'Video görüşme', hybrid: 'Karma' };

export default function ServiceDetail() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { state } = useStore();
  const svc = getService(id);

  if (!svc) return <div><TopBar title="Servis" back={-1} /><EmptyState emoji="🔍" title="Servis bulunamadı" /></div>;

  const elig = evaluateEligibility(svc.id, state.user.accessCategory, state.user.corporate);
  const modules = modulesForService(svc.id);
  const pkgs = packagesContainingService(svc.id);
  const purchasable = elig.entitled || elig.payPerUse;

  const act = () => {
    if (svc.status === 'soon') { toast.show('Bu servis yakında açılacak'); return; }
    if (!purchasable) { toast.show('Bu statüde bilgi alabilirsin'); return; }
    nav(`/wl/checkout/service/${svc.id}`);
  };

  return (
    <div>
      <TopBar title="Servis Detayı" back={-1} right={svc.isSample ? <Badge tone="demo">Örnek</Badge> : svc.verified ? <Badge tone="ok">Doğrulanmış</Badge> : undefined} />
      <div className="pad stack">
        <div className="card">
          <div className="row" style={{ gap: 8 }}>
            <span className="small faint">{svc.id}</span>
            {svc.status === 'soon' && <Badge tone="soon">Yakında</Badge>}
            {svc.status === 'request_info' && <Badge tone="warn">Bilgi al</Badge>}
          </div>
          <div className="h2" style={{ marginTop: 4 }}>{svc.nameTr}</div>
          <div className="small muted" style={{ marginTop: 2 }}>{svc.nameEn}</div>
          <p className="lead" style={{ marginTop: 8 }}>{svc.descTr}</p>
          <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
            <span className="chip">{DELIVERY[svc.deliveryMode]}</span>
            {svc.needsProfessional && <span className="chip">Uzman desteği</span>}
            {modules.map((m) => <span key={m} className="chip">{getModule(m)?.emoji} {getModule(m)?.nameTr}</span>)}
          </div>
        </div>

        <div className="card">
          <div className="sectiontitle" style={{ marginTop: 0 }}>Hak ve erişim</div>
          <div className="kv"><span className="kv-k">Statün</span><span className="kv-v">{state.user.accessCategory === 'alz' ? 'ALZ müşterisi' : state.user.accessCategory === 'insured_elsewhere' ? 'Başka sigortalı' : 'Sigortasız'}</span></div>
          <div className="kv"><span className="kv-k">Durum</span><span className="kv-v">{elig.entitled ? 'Teminat kapsamında (demo)' : elig.payPerUse ? 'Doğrudan ödeme (demo)' : 'Satın alma yok'}</span></div>
          {purchasable && svc.demoPriceTry != null && (
            <div className="kv"><span className="kv-k">Fiyat</span><span className="kv-v">{elig.entitled ? 'Dahil' : `${svc.demoPriceTry} ₺`} <span className="tiny faint">{elig.entitled ? '' : 'Demo fiyatı'}</span></span></div>
          )}
          <div className="small muted" style={{ marginTop: 6 }}>{elig.reasonTr}</div>
        </div>

        {svc.microNeedIds.length > 0 && (
          <div className="card">
            <div className="sectiontitle" style={{ marginTop: 0 }}>Karşıladığı ihtiyaçlar</div>
            <div className="row wrap" style={{ gap: 6 }}>{svc.microNeedIds.map((m) => <span key={m} className="chip">{getMicroNeed(m)?.shortTr ?? m}</span>)}</div>
          </div>
        )}

        {pkgs.length > 0 && (
          <div className="card">
            <div className="sectiontitle" style={{ marginTop: 0 }}>Paket kapsamı</div>
            <div className="stack-sm">
              {pkgs.map((r) => (
                <div key={r.packageId} className="row-between small">
                  <span>{getPackage(r.packageId)?.nameTr}</span>
                  <Badge tone={r.inclusion === 'core' ? 'ok' : r.inclusion === 'optional' ? 'info' : 'warn'}>
                    {r.inclusion === 'core' ? 'Çekirdek' : r.inclusion === 'optional' ? 'Opsiyonel' : r.inclusion === 'choose_one' ? 'Seç-bir' : 'Dahil değil'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {svc.isSample && <DemoNote>Bu örnek bir katalog servisidir. Gerçek servis verisi (ID, kapsam, fiyat) xlsx içe aktarıldığında gelir.</DemoNote>}
      </div>

      <div className="pad stack-sm" style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', paddingTop: 10 }}>
        <button className="btn btn-primary block" disabled={svc.status === 'soon'} onClick={act}>{eligibilityActionLabel(elig)}</button>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-ghost btn-sm grow" onClick={() => nav('/wl/module-builder')}>Modülümü özelleştir</button>
          <button className="btn btn-ghost btn-sm grow" onClick={() => nav('/wl/catalog')}>Kataloğu keşfet</button>
        </div>
      </div>
    </div>
  );
}
