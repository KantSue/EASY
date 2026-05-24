// src/components/SharedLayout.tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Inbox, Search, History, User, Home,
  PlusCircle, Activity, MapPin,
  LayoutDashboard, Users, BadgeCheck, Building2,
} from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import { authService } from '../service/authService';
import type { Utilisateur } from '../type';

// ── Icônes définies UNE SEULE FOIS en dehors ──
const IC = {
  home       : <Home            size={18} />,
  plus       : <PlusCircle      size={18} />,
  activity   : <Activity        size={18} />,
  mappin     : <MapPin          size={18} />,
  user       : <User            size={18} />,
  inbox      : <Inbox           size={18} />,
  search     : <Search          size={18} />,
  history    : <History         size={18} />,
  dashboard  : <LayoutDashboard size={18} />,
  users      : <Users           size={18} />,
  badge      : <BadgeCheck      size={18} />,
  building   : <Building2       size={18} />,
};

interface Props { children: React.ReactNode; }

export default function SharedLayout({ children }: Props) {
  const { t }               = useTranslation();
  const [profil, setProfil] = useState<Utilisateur | null>(null);
  const location            = useLocation();

  const NAV_CITOYEN = [
    { icon: IC.home,     label: t('nav.accueil'),            href: '/citoyen/accueil'         },
    { icon: IC.plus,     label: t('common.nouvelle_dem'),    href: '/citoyen/demande'         },
    { icon: IC.activity, label: t('common.suivi'),           href: '/citoyen/suivi'           },
    { icon: IC.mappin,   label: t('common.arrondissements'), href: '/citoyen/arrondissements' },
    { icon: IC.user,     label: t('nav.profil'),             href: '/profil'                  },
  ];

  const NAV_AGENT = [
    { icon: IC.inbox,   label: t('nav.file_attente'), href: '/agent/file-attente' },
    { icon: IC.search,  label: t('nav.archives'),     href: '/archives'           },
    { icon: IC.history, label: t('nav.historique'),   href: '/agent/historique'   },
    { icon: IC.user,    label: t('nav.profil'),       href: '/profil'             },
  ];

  const NAV_ADMIN = [
    { icon: IC.dashboard, label: t('nav.dashboard'), href: '/admin/dashboard' },
    { icon: IC.users,     label: t('nav.citoyens'),  href: '/admin/citoyens'  },
    { icon: IC.badge,     label: t('nav.agents'),    href: '/admin/agents'    },
    { icon: IC.building,  label: t('nav.communes'),  href: '/admin/communes'  },
    { icon: IC.search,    label: t('nav.archives'),  href: '/archives'        },
    { icon: IC.user,      label: t('nav.profil'),    href: '/profil'          },
  ];

  const TITRE_MAP: Record<string, string> = {
    '/profil'                  : t('nav.profil'),
    '/archives'                : t('nav.archives'),
    '/mot-de-passe-oublie'     : t('auth.mdp_oublie'),
    '/citoyen/accueil'         : t('nav.accueil'),
    '/citoyen/demande'         : t('common.nouvelle_dem'),
    '/citoyen/suivi'           : t('common.suivi'),
    '/citoyen/arrondissements' : t('common.arrondissements'),
    '/agent/file-attente'      : t('nav.file_attente'),
    '/agent/detail'            : t('detail.detail_traitement'),
    '/agent/historique'        : t('nav.historique'),
    '/admin/dashboard'         : t('nav.dashboard'),
    '/admin/citoyens'          : t('nav.citoyens'),
    '/admin/agents'            : t('nav.agents'),
    '/admin/communes'          : t('nav.communes'),
  };

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
    <div className="flex min-h-screen rounded-4xl shadow-lg" style={{ background:'#f5feff' }}>
      <Sidebar items={items} nom={nom} role={role} />
      <div className="flex flex-col flex-1" style={{ marginLeft:256 }}>
        <Topbar titre={titre} nom={nom} role={role} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}