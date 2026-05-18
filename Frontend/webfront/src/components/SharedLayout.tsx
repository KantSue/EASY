import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Inbox, Search, History, User, Home, PlusCircle, Activity, MapPin, LayoutDashboard, Users, BadgeCheck, Building2 } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import { authService } from '../service/authService';
import type { Utilisateur } from '../type';

const NAV_CITOYEN = [
  { icon: <Home size={18} />,        label: 'Accueil',          href: '/citoyen/accueil'         },
  { icon: <PlusCircle size={18} />,  label: 'Nouvelle demande', href: '/citoyen/demande'          },
  { icon: <Activity size={18} />,    label: 'Suivi demandes',   href: '/citoyen/suivi'            },
  { icon: <MapPin size={18} />,      label: 'Arrondissements',  href: '/citoyen/arrondissements'  },
  { icon: <User size={18} />,        label: 'Mon profil',       href: '/profil'                   },
];

const NAV_AGENT = [
  { icon: <Inbox size={18} />,       label: "File d'attente",   href: '/agent/file-attente'       },
  { icon: <Search size={18} />,      label: 'Archives',         href: '/archives'                 },
  { icon: <History size={18} />,     label: 'Historique',       href: '/agent/historique'         },
  { icon: <User size={18} />,        label: 'Mon profil',       href: '/profil'                   },
];

const NAV_ADMIN = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard',    href: '/admin/dashboard'          },
  { icon: <Users size={18} />,           label: 'Citoyens',     href: '/admin/citoyens'           },
  { icon: <BadgeCheck size={18} />,      label: 'Agents',       href: '/admin/agents'             },
  { icon: <Building2 size={18} />,       label: 'Communes',     href: '/admin/communes'           },
  { icon: <Search size={18} />,          label: 'Archives',     href: '/archives'                 },
  { icon: <User size={18} />,            label: 'Mon profil',   href: '/profil'                   },
];

const TITRE_MAP: Record<string, string> = {
  '/profil'                  : 'Mon profil',
  '/archives'                : 'Archives',
  '/mot-de-passe-oublie'     : 'Mot de passe oublié',
  '/citoyen/accueil'         : 'Accueil',
  '/citoyen/demande'         : 'Nouvelle demande',
  '/citoyen/suivi'           : 'Suivi des demandes',
  '/citoyen/arrondissements' : 'Arrondissements',
  '/agent/file-attente'      : "File d'attente",
  '/agent/detail'            : 'Détail demande',
  '/agent/historique'        : 'Historique',
  '/admin/dashboard'         : 'Dashboard',
  '/admin/citoyens'          : 'Citoyens',
  '/admin/agents'            : 'Agents',
  '/admin/communes'          : 'Communes',
};

interface Props { children: React.ReactNode; }

export default function SharedLayout({ children }: Props) {
  const [profil,  setProfil]  = useState<Utilisateur | null>(null);
  const location              = useLocation();

  useEffect(() => {
    authService.getProfil()
      .then(r => setProfil(r.data))
      .catch(() => {});
  }, []);

  const role  = profil?.role?.toLowerCase() ?? localStorage.getItem('role')?.toLowerCase() ?? '';
  const nom   = profil ? `${profil.prenom_user} ${profil.nom_user}` : '';
  const titre = Object.entries(TITRE_MAP).find(([k]) => location.pathname.startsWith(k))?.[1] ?? '';

  const items = role === 'administrateur' ? NAV_ADMIN
              : role === 'agent'          ? NAV_AGENT
              : NAV_CITOYEN;

  return (
    // DashboardLayout.tsx — SharedLayout.tsx — AgentLayout.tsx
// DashboardLayout.tsx — SharedLayout.tsx — AgentLayout.tsx
<div className="flex min-h-screen rounded-4xl shadow-lg" style={{ background:'#f5feff' }}>
  <Sidebar items={items} nom={nom} role={role} />
  <div className="flex flex-col flex-1" style={{ marginLeft: 256 }}>  {/* ← 256 exactement */}
    <Topbar titre={titre} nom={nom} role={role} />
    <main className="flex-1 p-8">{children}</main>
  </div>
</div>
    
  );
}