// src/components/DashboardLayout.tsx
'use client';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import { authService } from '../service/authService';
import type { Utilisateur } from '../type';

interface NavItem {
  icon : React.ReactNode;
  label: string;
  href : string;
}

interface Props {
  items       : NavItem[];
  titreMap    : Record<string, string>;
  defaultTitre: string;
  children    : React.ReactNode;
}

export default function DashboardLayout({ items, titreMap, defaultTitre, children }: Props) {
  const [profil,  setProfil]  = useState<Utilisateur | null>(null);
  const location              = useLocation();

  const titre = Object.entries(titreMap)
    .find(([k]) => location.pathname.startsWith(k))?.[1] ?? defaultTitre;

  const nom  = profil ? `${profil.nom_user} ${profil.prenom_user}` : '';
  const role = profil?.role ?? '';

  useEffect(() => {
    authService.getProfil()
      .then(r => setProfil(r.data))
      .catch(() => {});
  }, []);

  return (
    
    // DashboardLayout.tsx — SharedLayout.tsx — AgentLayout.tsx
<div className="flex min-h-screen" style={{ background:'#f0f4f8' }}>
  <Sidebar items={items} nom={nom} role={role} />
  <div className="flex flex-col flex-1" style={{ marginLeft: 256 }}>  {/* ← 256 exactement */}
    <Topbar titre={titre} nom={nom} role={role} />
    <main className="flex-1 p-8">{children}</main>
  </div>
</div>
  );
}