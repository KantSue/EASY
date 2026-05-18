import { useNavigate, useLocation } from 'react-router-dom';
import { Inbox, Search, History, User, LogOut, Building2 } from 'lucide-react';

interface NavItem {
  icon : React.ReactNode;
  label: string;
  href : string;
}

interface Props {
  items: NavItem[];
  nom  : string;
  role : string;
}

export default function Sidebar({ items }: Props) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 flex flex-col z-50 shadow-lg"
      style={{ width: 256, background:'#112250', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 mb-1">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #f0b429, #fcd34d)', boxShadow: '0 4px 14px rgba(240,180,41,0.35)' }}
        >
          <Building2 size={20} style={{ color: '#0a1830' }} />
        </div>
        <div>
          <div className="font-bold text-medium text-white " style={{ fontFamily: 'Sora, sans-serif' }}>eaSy</div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-4" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {items.map((item, i) => {
          const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <button
              key={i}
              onClick={() => navigate(item.href)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full"
              style={{
                background    : active ? 'rgba(240,180,41,0.12)' : 'transparent',
                color         : active ? '#f0b429' : 'rgba(255,255,255,0.5)',
                border    : active ? '0.5px solid #f0b429' : '3px solid transparent',
                marginLeft    : -3,
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Profil + Déconnexion */}
      <div className="p-4 flex flex-col gap-3">
        

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}