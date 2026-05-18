'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar, { NavItem } from './Sidebar';
import Topbar from './Topbar';
import api from '@/lib/api';

interface Props { items: NavItem[]; titreMap: Record<string, string>; defaultTitre: string; children: React.ReactNode; }

export default function DashboardLayout({ items, titreMap, defaultTitre, children }: Props) {
  const [nom,  setNom]  = useState('');
  const [role, setRole] = useState('');
  const pathname        = usePathname();

  const titre = Object.entries(titreMap).find(([k]) => pathname.startsWith(k))?.[1] ?? defaultTitre;

  useEffect(() => {
    api.get('/accounts/profil/')
      .then(r => {
        setNom(`${r.data.prenom_user ?? ''} ${r.data.nom_user ?? ''}`.trim());
        setRole(r.data.role ?? '');
      }).catch(() => {});
  }, []);

  return (
    <div>
      <Sidebar items={items} nom={nom} role={role} />
      <div className="dashboard-main">
        <Topbar titre={titre} nom={nom} role={role} />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
