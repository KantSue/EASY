import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Inbox, Search, History, User } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import { authService } from '../service/authService';
import type { Utilisateur } from '../type';

const NAV_ITEMS = [
  { icon: <Inbox size={18} />,   label: "File d'attente", href: '/agent/file-attente' },
  { icon: <Search size={18} />,  label: 'Archives',        href: '/archives'           },
  { icon: <History size={18} />, label: 'Historique',      href: '/agent/historique'   },
  { icon: <User size={18} />,    label: 'Mon profil',      href: '/profil'             },
];

const TITRE_MAP: Record<string, string> = {
  '/agent/file-attente' : "File d'attente",
  '/agent/detail'       : 'Détail demande',
  '/agent/historique'   : 'Historique',
  '/archives'           : 'Archives',
  '/profil'             : 'Mon profil',
};

interface Props { children: React.ReactNode; }

export default function AgentLayout({ children }: Props) {
  const [agent,   setAgent]   = useState<Utilisateur | null>(null);
  const location  = useLocation();

  const titre = Object.entries(TITRE_MAP).find(([k]) => location.pathname.startsWith(k))?.[1] ?? 'Agent';

  useEffect(() => {
    authService.getProfil()
      .then(r => setAgent(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: '#f0f4f8' }}>
      <Sidebar
        items={NAV_ITEMS}
        nom={agent ? `${agent.prenom_user} ${agent.nom_user}` : ''}
        role="Agent"
      />
      <div className="flex flex-col flex-1" style={{ marginLeft: 256 }}>
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