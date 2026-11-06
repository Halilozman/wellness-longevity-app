import React, { createContext, useContext, useState, useCallback } from 'react';

/* --------------------------------- Badge ---------------------------------- */
type Tone = 'ok' | 'warn' | 'info' | 'danger' | 'demo' | 'neutral' | 'soon';
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function DemoNote({ children }: { children: React.ReactNode }) {
  return <div className="demo-note"><span aria-hidden>ⓘ</span><span>{children}</span></div>;
}

/* ---------------------------------- Chip ---------------------------------- */
export function Chip({ on, onClick, children, mint }: { on?: boolean; onClick?: () => void; children: React.ReactNode; mint?: boolean }) {
  return (
    <button type="button" className={`chip selectable ${mint ? 'mint' : ''} ${on ? 'on' : ''}`} aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}

/* ------------------------------ Progress / Ring --------------------------- */
export function ProgressBar({ value, blue }: { value: number; blue?: boolean }) {
  return (
    <div className={`progressbar ${blue ? 'blue' : ''}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Ring({ value, cap, fill = 'var(--mint-500)', size = 76 }: { value: number | null; cap?: string; fill?: string; size?: number }) {
  const v = value ?? 0;
  return (
    <div className="ring" style={{ ['--val' as any]: v, ['--fill' as any]: fill, ['--size' as any]: `${size}px`, position: 'relative' }}>
      <div className="ring-inner">
        <span className="ring-val">{value == null ? '–' : value}</span>
        {cap && <span className="ring-cap">{cap}</span>}
      </div>
    </div>
  );
}

/* ------------------------------- Empty state ------------------------------ */
export function EmptyState({ emoji, title, desc, action }: { emoji?: string; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="empty">
      {emoji && <span className="empty-emoji" aria-hidden>{emoji}</span>}
      <div className="h3" style={{ marginBottom: 4 }}>{title}</div>
      {desc && <div className="small muted" style={{ maxWidth: 280, margin: '0 auto 12px' }}>{desc}</div>}
      {action}
    </div>
  );
}

/* -------------------------------- List row -------------------------------- */
export function ListRow({ icon, title, sub, right, onClick }: { icon?: React.ReactNode; title: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode; onClick?: () => void }) {
  const Tag: any = onClick ? 'button' : 'div';
  return (
    <Tag className="listrow" style={onClick ? { width: '100%', border: 'none', background: 'none', textAlign: 'left', borderBottom: '1px solid var(--border)', cursor: 'pointer' } : undefined} onClick={onClick}>
      {icon != null && <span className="lr-icon" aria-hidden>{icon}</span>}
      <span className="lr-main">
        <span className="lr-title" style={{ display: 'block' }}>{title}</span>
        {sub && <span className="lr-sub" style={{ display: 'block' }}>{sub}</span>}
      </span>
      {right ?? (onClick && <span className="lr-chevron" aria-hidden>›</span>)}
    </Tag>
  );
}

/* ------------------------------- Segmented -------------------------------- */
export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* --------------------------------- Toggle --------------------------------- */
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} />;
}

/* ---------------------------------- Sheet --------------------------------- */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-handle" />
        {title && <div className="h3" style={{ marginBottom: 10 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

/* --------------------------------- Bars ----------------------------------- */
export function MiniBars({ series, goal, unit }: { series: { date: string; value: number | null }[]; goal?: number; unit?: string }) {
  const max = Math.max(goal ?? 0, ...series.map((s) => s.value ?? 0), 1);
  return (
    <div>
      <div className="bars">
        {series.map((s, i) => (
          <div key={s.date} className={`bar ${i === series.length - 1 ? 'today' : ''}`} title={`${s.date}: ${s.value ?? '—'}${unit ? ' ' + unit : ''}`}>
            <i style={{ height: `${((s.value ?? 0) / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="bars-x">
        {series.map((s) => <span key={s.date}>{s.date.slice(8)}</span>)}
      </div>
    </div>
  );
}

/* --------------------------------- Toast ---------------------------------- */
interface ToastApi { show: (msg: string) => void; }
const ToastCtx = createContext<ToastApi>({ show: () => {} });
export function useToast() { return useContext(ToastCtx); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout((show as any)._t);
    (show as any)._t = window.setTimeout(() => setMsg(null), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {msg && <div className="toast" role="status"><span aria-hidden>✓</span><span>{msg}</span></div>}
    </ToastCtx.Provider>
  );
}

/* ----------------------------- Access badge ------------------------------- */
export function AccessBadge({ category }: { category: 'alz' | 'insured_elsewhere' | 'uninsured' }) {
  const map = {
    alz: { tone: 'info' as Tone, label: 'ALZ müşterisi' },
    insured_elsewhere: { tone: 'neutral' as Tone, label: 'Başka sigortalı' },
    uninsured: { tone: 'warn' as Tone, label: 'Sigortasız' },
  };
  const m = map[category];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
