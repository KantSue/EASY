import DashboardLayout from '@/components/DashboardLayout';

const items = [
  { icon:'home',          label:'Accueil',          href:'/citoyen/accueil'         },
  { icon:'add_circle',    label:'Nouvelle demande', href:'/citoyen/demande'          },
  { icon:'track_changes', label:'Suivi demandes',   href:'/citoyen/suivi'            },
  { icon:'location_city', label:'Arrondissements',  href:'/citoyen/arrondissements'  },
  { icon:'person',        label:'Mon profil',       href:'/profil'                   },
];
const titreMap: Record<string,string> = {
  '/citoyen/accueil':'/citoyen/accueil',
  '/citoyen/demande':'Nouvelle demande',
  '/citoyen/suivi':'Suivi des demandes',
  '/citoyen/arrondissements':'Arrondissements',
  '/profil':'Mon profil',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout items={items} titreMap={{ '/citoyen/accueil':'Accueil', '/citoyen/demande':'Nouvelle demande', '/citoyen/suivi':'Suivi des demandes', '/citoyen/arrondissements':'Arrondissements', '/profil':'Mon profil' }} defaultTitre="Citoyen">{children}</DashboardLayout>;
}
