'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/app/component/Sidebar';
import Topbar  from '@/app/component/topbar';
import { usePathname } from 'next/navigation';

const citoyenItems = [
  { icon: 'home',             label: 'Accueil',          href: '/citoyen/accueil'        },
  { icon: 'add_circle',       label: 'Nouvelle demande', href: '/citoyen/demande'         },
  { icon: 'track_changes',    label: 'Suivi demandes',   href: '/citoyen/suivi'           },
  { icon: 'location_city',    label: 'Arrondissements',  href: '/citoyen/arrondissements' },
  { icon: 'person',           label: 'Mon profil',       href: '/profil'                  },
];

const titreMap: Record<string, string> = {
  '/citoyen/accueil':          'Accueil',
  '/citoyen/demande':          'Nouvelle demande',
  '/citoyen/suivi':            'Suivi des demandes',
  '/citoyen/arrondissements':  'Arrondissements',
  '/profil':                   'Mon profil',
};

export default function CitoyenLayoutClient({ children }: { children: React.ReactNode }) {
  const [nom,  setNom]  = useState('');
  const [role, setRole] = useState('Citoyen');
  const pathname        = usePathname();

  const titre = Object.entries(titreMap).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Citoyen';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/profil/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        setNom(`${d.prenom_user ?? ''} ${d.nom_user ?? ''}`.trim());
        setRole(d.role ?? 'Citoyen');
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar items={citoyenItems} role={role} nom={nom} />
      <main style={{ marginLeft: '256px', flex: 1, background: '#f0f4f8', minHeight: '100vh' }}>
        <Topbar nom={nom} role={role} titre={titre} />
        <div style={{ padding: '0 32px 40px' }}>{children}</div>
      </main>
    </div>
  );
}
