import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/Layout';
import { DemoNote, Toggle } from '@/components/ui';

export default function Consent() {
  const nav = useNavigate();
  const { state, setConsent, setOnboarded } = useStore();
  const health = state.consents.find((c) => c.key === 'health_data_processing')?.granted ?? false;
  const [shareLife, setShareLife] = useState(false);

  return (
    <div>
      <TopBar title="İhtiyaçlarını Keşfet" back="/wl" breadcrumb="Başlamadan önce" />
      <div className="pad stack">
        <div className="card">
          <div className="h3">Bu kısa bir keşif anketidir</div>
          <p className="lead" style={{ marginTop: 6 }}>
            Yaklaşık <b>3–5 dakika</b> sürer. Amacı sana uygun hizmetleri bulmaktır; <b>tıbbi tanı veya klinik ölçek değildir</b>.
          </p>
          <ul className="small muted" style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
            <li>Yalnızca seçtiğin alanlarla ilgili soruları sorarız.</li>
            <li>Hassas soruların hepsi isteğe bağlıdır.</li>
            <li>Sonuçlarını sen onaylamadan eşleştirme yapmayız.</li>
          </ul>
        </div>

        <div className="card">
          <div className="row-between">
            <div style={{ flex: 1 }}>
              <div className="h3">Sağlık verimin işlenmesine onay</div>
              <div className="small muted" style={{ marginTop: 4 }}>
                Yanıtlarını, sana kişisel öneri üretmek için işleyebilmemiz için ayrı açık rıza gerekir. Dilediğin zaman geri çekebilirsin.
              </div>
            </div>
            <Toggle on={health} onChange={(v) => setConsent('health_data_processing', v)} label="Sağlık verisi onayı" />
          </div>
        </div>

        <div className="card">
          <div className="row-between">
            <div style={{ flex: 1 }}>
              <div className="h3">Yaşam verisi paylaşımı <span className="small faint">(isteğe bağlı)</span></div>
              <div className="small muted" style={{ marginTop: 4 }}>
                Adım, uyku gibi verilerini paylaşırsan önerileri kişiselleştirebiliriz. Paylaşmadan da anket tam çalışır.
              </div>
            </div>
            <Toggle on={shareLife} onChange={setShareLife} label="Yaşam verisi paylaşımı" />
          </div>
        </div>

        <DemoNote>Bu bir demodur; gerçek sağlık verisi işleme KVKK/GDPR uyumu, kimlik doğrulama ve güvenlik tasarımı gerektirir.</DemoNote>

        <button
          className="btn btn-primary block"
          disabled={!health}
          onClick={() => { setOnboarded(true); nav('/wl/assessment'); }}
        >
          {health ? 'Ankete Başla' : 'Devam için onay gerekir'}
        </button>
        <button className="btn btn-ghost block" onClick={() => nav('/wl')}>Vazgeç</button>
      </div>
    </div>
  );
}
