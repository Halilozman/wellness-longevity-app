import { useNavigate } from 'react-router-dom';
import { Badge, useToast } from '@/components/ui';

export default function ALZHome() {
  const nav = useNavigate();
  const toast = useToast();
  const outside = () => toast.show('Bu alan demonun kapsamı dışında');
  return (
    <div>
      <div style={{ background: 'var(--alz-blue)', color: '#fff', padding: '18px 16px 22px' }}>
        <div className="row-between">
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.3 }}>ALZ <span style={{ opacity: 0.8, fontWeight: 400 }}>|ılı</span></div>
          <Badge tone="demo">Demo</Badge>
        </div>
        <div style={{ marginTop: 14 }} className="small" aria-hidden>Tekrar hoş geldin</div>
        <div className="h1" style={{ color: '#fff' }}>Merhaba, Ela</div>
      </div>

      <div className="pad stack">
        <div className="sectiontitle">Poliçelerim</div>
        <div className="row" style={{ gap: 10 }}>
          <div className="card grow"><div className="small muted">Sağlık</div><div className="h3">Aktif</div></div>
          <div className="card grow"><div className="small muted">Kasko</div><div className="h3">Aktif</div></div>
        </div>

        <div className="sectiontitle" style={{ marginTop: 6 }}>Dijital Sağlık</div>
        <button className="card pressable card-hero" style={{ textAlign: 'left', width: '100%', border: 'none' }} onClick={() => nav('/wl')}>
          <div className="row-between">
            <div style={{ fontWeight: 800, fontSize: 18 }}>Wellness &amp; Longevity</div>
            <span style={{ fontSize: 22 }} aria-hidden>🌿</span>
          </div>
          <div className="small" style={{ opacity: 0.92, marginTop: 6, lineHeight: 1.5 }}>
            İhtiyaçlarını keşfet, sana özel önerilere ve sağlık planına ulaş.
          </div>
          <div style={{ marginTop: 12 }}><span className="btn btn-mint btn-sm">Keşfet →</span></div>
        </button>

        <div className="stack-sm">
          <HostRow emoji="📄" title="Poliçe belgelerim" sub="Görüntüle ve indir" onClick={outside} />
          <HostRow emoji="🩺" title="Sağlık provizyonu" sub="Anlaşmalı kurumlar" onClick={outside} />
          <HostRow emoji="💬" title="Destek" sub="Bize ulaş" onClick={outside} />
        </div>

        <div className="small faint center" style={{ marginTop: 10 }}>
          Bu, Wellness &amp; Longevity deneyimini gösteren etkileşimli bir demodur.
        </div>
      </div>
    </div>
  );
}

function HostRow({ emoji, title, sub, onClick }: { emoji: string; title: string; sub: string; onClick: () => void }) {
  return (
    <button className="listrow" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={onClick}>
      <span className="lr-icon" aria-hidden>{emoji}</span>
      <span className="lr-main"><span className="lr-title">{title}</span><span className="lr-sub">{sub}</span></span>
      <span className="lr-chevron">›</span>
    </button>
  );
}
