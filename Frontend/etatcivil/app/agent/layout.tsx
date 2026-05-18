import DashboardLayout from '@/components/DashboardLayout';

const items = [
  { icon:'inbox',       label:"File d'attente", href:'/agent/file-attente' },
  { icon:'search',      label:'Archives',        href:'/archives'           },
  { icon:'history',     label:'Historique',      href:'/agent/historique'   },
  { icon:'person',      label:'Mon profil',      href:'/profil'             },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout items={items} titreMap={{ '/agent/file-attente':"File d'attente", '/agent/detail':'Détail demande', '/agent/historique':'Historique', '/archives':'Archives', '/profil':'Mon profil' }} defaultTitre="Agent">
      {children}
    </DashboardLayout>
  );
}
