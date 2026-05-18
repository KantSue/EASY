'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface NavItem {
  icon : string;
  label: string;
  href : string;
}

interface SidebarProps {
  items: NavItem[];
  role : string;
  nom  : string;
}

export default function Sidebar({ items, role, nom }: SidebarProps) {
  const router   = useRouter();
  const pathname = usePathname();

  const deconnexion = () => {
    localStorage.clear();
    router.push('/login');
  };

  const initiales = nom
    ? nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'EC';

  return (
    <aside style={styles.aside}>
      {/* Logo */}
      <div style={styles.logoZone}>
        <div style={styles.logoIcon}>
          <span className="material-icons-round" style={{ fontSize: '22px', color: '#0a1830' }}>account_balance</span>
        </div>
        <div>
          <div style={styles.logoName}>e-EtatCivil</div>
          <div style={styles.logoSub}>2035 · Madagascar</div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Nav */}
      <nav style={styles.nav}>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} style={{
              ...styles.navItem,
              background: isActive ? 'rgba(240,180,41,0.12)' : 'transparent',
              color: isActive ? '#f0b429' : 'rgba(255,255,255,0.55)',
              borderLeft: isActive ? '3px solid #f0b429' : '3px solid transparent',
            }}>
              <span className="material-icons-round" style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Profil */}
      <div style={styles.profilZone}>
        <div style={styles.avatar}>{initiales}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.profilNom}>{nom || 'Chargement...'}</div>
          <div style={styles.profilRole}>{role}</div>
        </div>
      </div>

      {/* Déconnexion */}
      <button onClick={deconnexion} style={styles.btnDeco}>
        <span className="material-icons-round" style={{ fontSize: '18px' }}>logout</span>
        <span>Déconnexion</span>
      </button>
    </aside>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  aside: {
    width: '256px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a1830 0%, #060f1e 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px 20px',
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    zIndex: 100,
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  logoZone: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '4px 8px 4px',
  },
  logoIcon: {
    width: '42px', height: '42px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #f0b429, #fcd34d)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logoName: { color: '#fff', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '15px' },
  logoSub: { color: 'rgba(255,255,255,0.35)', fontSize: '11px' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.07)', margin: '20px 0 16px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 14px', borderRadius: '10px',
    textDecoration: 'none', fontSize: '14px', fontWeight: 500,
    transition: 'all 0.18s', marginLeft: '-3px',
  },
  navLabel: { fontSize: '14px' },
  profilZone: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '10px',
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #f0b429, #fcd34d)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: 700, color: '#0a1830', flexShrink: 0,
  },
  profilNom: { color: '#fff', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  profilRole: { color: '#f0b429', fontSize: '11px', marginTop: '1px' },
  btnDeco: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '10px', borderRadius: '10px',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
    width: '100%', transition: 'all 0.18s',
  },
};
