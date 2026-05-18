'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from './Icon';

export interface NavItem { icon: string; label: string; href: string; }
interface Props { items: NavItem[]; nom: string; role: string; }

export default function Sidebar({ items, nom, role }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const initials = nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'EC';

  const logout = () => { localStorage.clear(); router.push('/login'); };

  return (
    <aside className="dashboard-sidebar">
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'4px 6px 0', marginBottom:28 }}>
        <div style={{ width:42, height:42, borderRadius:13, background:'linear-gradient(135deg,#f0b429,#fcd34d)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 14px rgba(240,180,41,.35)' }}>
          <Icon name="account_balance" size={22} style={{ color:'#0a1830' }} />
        </div>
        <div>
          <div style={{ color:'#fff', fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:15, lineHeight:1.2 }}>e-EtatCivil</div>
          <div style={{ color:'rgba(255,255,255,.35)', fontSize:11 }}>2035 · Madagascar</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height:1, background:'rgba(255,255,255,.06)', marginBottom:16 }} />

      {/* Nav */}
      <nav style={{ display:'flex', flexDirection:'column', gap:2, flex:1 }}>
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} className={`nav-item${active ? ' active' : ''}`}>
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:16, display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,.05)' }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#f0b429,#fcd34d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#0a1830', flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ color:'#fff', fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nom || '…'}</div>
            <div style={{ color:'#f0b429', fontSize:11 }}>{role}</div>
          </div>
        </div>
        <button onClick={logout} className="btn btn-danger-soft" style={{ width:'100%', fontSize:13, padding:'9px 14px' }}>
          <Icon name="logout" size={17} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
