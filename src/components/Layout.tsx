import { NavLink, useNavigate } from 'react-router-dom';

export function StatusBar() {
  return (
    <div className="statusbar" aria-hidden>
      <span>9:41</span>
      <span className="sb-icons">●●● ▮▮ ⣿</span>
    </div>
  );
}

const TABS = [
  { to: '/wl', icon: '🧭', label: 'Keşfet', end: true },
  { to: '/wl/needs', icon: '🎯', label: 'İhtiyaçlarım' },
  { to: '/wl/plan', icon: '🗓️', label: 'Sağlık Planım' },
  { to: '/wl/progress', icon: '📈', label: 'İlerlemem' },
  { to: '/wl/profile', icon: '👤', label: 'Profilim' },
];

export function BottomNav() {
  return (
    <nav className="bottomnav" aria-label="Ana gezinme">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `navitem ${isActive ? 'active' : ''}`}>
          <span className="ni-icon" aria-hidden>{t.icon}</span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export interface TopBarProps {
  title: string;
  back?: string | number; // route to go to, or -1 for history back
  breadcrumb?: string;
  onBlue?: boolean;
  right?: React.ReactNode;
  nextStep?: string;
  context?: React.ReactNode;
}

export function TopBar({ title, back, breadcrumb, onBlue, right, nextStep, context }: TopBarProps) {
  const nav = useNavigate();
  const goBack = () => {
    if (back === undefined) return;
    if (typeof back === 'number') nav(back);
    else nav(back);
  };
  return (
    <header className={`topbar ${onBlue ? 'on-blue' : ''}`}>
      <div className="topbar-row">
        {back !== undefined && (
          <button className="iconbtn" aria-label="Geri" onClick={goBack}>‹</button>
        )}
        <div className="topbar-title">{title}</div>
        {right}
      </div>
      {breadcrumb && <div className="breadcrumb">{breadcrumb}</div>}
      {context && <div className="topbar-context">{context}</div>}
      {nextStep && <div className="nextstep"><span aria-hidden>→</span><span>{nextStep}</span></div>}
    </header>
  );
}
