'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const citoyenItems = [
  { icon:'home',          label:'Accueil',          href:'/citoyen/accueil'        },
  { icon:'add_circle',    label:'Nouvelle demande', href:'/citoyen/demande'         },
  { icon:'track_changes', label:'Suivi demandes',   href:'/citoyen/suivi'           },
  { icon:'location_city', label:'Arrondissements',  href:'/citoyen/arrondissements' },
  { icon:'person',        label:'Mon profil',       href:'/profil'                  },
];
const agentItems = [
  { icon:'inbox',   label:"File d'attente", href:'/agent/file-attente' },
  { icon:'search',  label:'Archives',        href:'/archives'           },
  { icon:'history', label:'Historique',      href:'/agent/historique'   },
  { icon:'person',  label:'Mon profil',      href:'/profil'             },
];
const adminItems = [
  { icon:'dashboard',     label:'Dashboard', href:'/admin/dashboard' },
  { icon:'group',         label:'Citoyens',  href:'/admin/citoyens'  },
  { icon:'badge',         label:'Agents',    href:'/admin/agents'    },
  { icon:'location_city', label:'Communes',  href:'/admin/communes'  },
  { icon:'folder_open',   label:'Archives',  href:'/archives'        },
];

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState('');
  useEffect(() => { setRole(localStorage.getItem('role')?.toLowerCase()??''); }, []);

  const items = role==='administrateur' ? adminItems : role==='agent' ? agentItems : citoyenItems;
  return <DashboardLayout items={items} titreMap={{ '/profil':'Mon profil' }} defaultTitre="Mon profil">{children}</DashboardLayout>;
}
