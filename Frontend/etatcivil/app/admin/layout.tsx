import DashboardLayout from '@/components/DashboardLayout';

const items = [
  { icon:'dashboard',     label:'Dashboard',   href:'/admin/dashboard' },
  { icon:'group',         label:'Citoyens',    href:'/admin/citoyens'  },
  { icon:'badge',         label:'Agents',      href:'/admin/agents'    },
  { icon:'location_city', label:'Communes',    href:'/admin/communes'  },
  { icon:'folder_open',   label:'Archives',    href:'/archives'        },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout items={items} titreMap={{ '/admin/dashboard':'Dashboard', '/admin/citoyens':'Citoyens', '/admin/agents':'Agents', '/admin/communes':'Communes', '/archives':'Archives', '/profil':'Mon profil' }} defaultTitre="Administration">
      {children}
    </DashboardLayout>
  );
}
