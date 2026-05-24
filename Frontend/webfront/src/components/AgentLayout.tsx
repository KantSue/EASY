// src/components/AgentLayout.tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Inbox, Search, History, User } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import { authService } from '../service/authService';
import type { Utilisateur } from '../type';

// ── Icônes définies en dehors du composant ──
const IC = {
  inbox  : <Inbox   size={18} />,
  search : <Search  size={18} />,
  history: <History size={18} />,
  user   : <User    size={18} />,
};

interface Props { children: React.ReactNode; }

export default function AgentLayout({ children }: Props) {
  const { t }               = useTranslation();
  const [agent, setAgent]   = useState<Utilisateur | null>(null);
  const location            = useLocation();

  const NAV_ITEMS = [
    { icon: IC.inbox,   label: t('nav.file_attente'), href: '/agent/file-attente' },
    { icon: IC.search,  label: t('nav.archives'),     href: '/archives'           },
    { icon: IC.history, label: t('nav.historique'),   href: '/agent/historique'   },
    { icon: IC.user,    label: t('nav.profil'),       href: '/profil'             },
  ];

  const TITRE_MAP: Record<string, string> = {
    '/agent/file-attente' : t('nav.file_attente'),
    '/agent/detail'       : t('detail.detail_traitement'),
    '/agent/historique'   : t('nav.historique'),
    '/archives'           : t('nav.archives'),
    '/profil'             : t('nav.profil'),
  };

  const titre = Object.entries(TITRE_MAP)
    .find(([k]) => location.pathname.startsWith(k))?.[1] ?? 'Agent';

  useEffect(() => {
    authService.getProfil()
      .then(r => setAgent(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background:'#f0f4f8' }}>
      <Sidebar
        items={NAV_ITEMS}
        nom={agent ? `${agent.prenom_user} ${agent.nom_user}` : ''}
        role="Agent"
      />
      <div className="flex flex-col flex-1" style={{ marginLeft:256 }}>
        <Topbar
          titre={titre}
          nom={agent ? `${agent.prenom_user} ${agent.nom_user}` : ''}
          role="Agent"
        />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}