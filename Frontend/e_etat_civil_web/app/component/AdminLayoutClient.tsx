'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/app/component/Sidebar';
import Topbar  from '@/app/component/topbar';
import { usePathname } from 'next/navigation';

const adminItems = [
  { icon: 'dashboard',    label: 'Dashboard',      href: '/admin/dashboard'  },
  { icon: 'group',        label: 'Citoyens',        href: '/admin/citoyens'   },
  { icon: 'badge',        label: 'Agents',          href: '/admin/agents'     },
  { icon: 'location_city',label: 'Communes',        href: '/admin/communes'   },
  { icon: 'folder_open',  label: 'Archives',        href: '/archives'         },
];

const titreMap: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/citoyens':  'Citoyens',
  '/admin/agents':    'Agents',
  '/admin/communes':  'Communes',
  '/archives':        'Archives',
};

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [nom,  setNom]  = useState('');
  const [role, setRole] = useState('Administrateur');
  const pathname        = usePathname();

  const titre = Object.entries(titreMap).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Admin';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/profil/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        setNom(`${d.prenom_user ?? ''} ${d.nom_user ?? ''}`.trim());
        setRole(d.role ?? 'Administrateur');
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar items={adminItems} role={role} nom={nom} />
      <main style={{ marginLeft: '256px', flex: 1, background: '#f0f4f8', minHeight: '100vh' }}>
        <Topbar nom={nom} role={role} titre={titre} />
        <div style={{ padding: '0 32px 40px' }}>{children}</div>
      </main>
    </div>
  );
}
