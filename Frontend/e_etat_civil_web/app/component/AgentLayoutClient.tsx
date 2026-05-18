'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/app/component/Sidebar';
import Topbar  from '@/app/component/topbar';
import { usePathname } from 'next/navigation';

const agentItems = [
  { icon: 'inbox',       label: "File d'attente", href: '/agent/file_attente' },
  { icon: 'search',      label: 'Archives',        href: '/archives'           },
  { icon: 'history',     label: 'Historique',      href: '/agent/historique'   },
  { icon: 'person',      label: 'Mon profil',      href: '/profil'             },
];

const titreMap: Record<string, string> = {
  '/agent/file_attente': "File d'attente",
  '/agent/historique':   'Historique',
  '/agent/detail':       'Détail demande',
  '/archives':           'Archives',
  '/profil':             'Mon profil',
};

export default function AgentLayoutClient({ children }: { children: React.ReactNode }) {
  const [nom,  setNom]  = useState('');
  const [role, setRole] = useState('Agent');
  const pathname        = usePathname();

  const titre = Object.entries(titreMap).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Agent';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/profil/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        setNom(`${d.prenom_user ?? ''} ${d.nom_user ?? ''}`.trim());
        setRole(d.role ?? 'Agent');
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar items={agentItems} role={role} nom={nom} />
      <main style={{ marginLeft: '256px', flex: 1, background: '#f0f4f8', minHeight: '100vh' }}>
        <Topbar nom={nom} role={role} titre={titre} />
        <div style={{ padding: '0 32px 40px' }}>{children}</div>
      </main>
    </div>
  );
}
