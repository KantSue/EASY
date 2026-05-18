'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Icon from '@/components/Icon';

export default function AccueilCitoyen() {
  const router = useRouter();
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/dashboard/demandes/citoyen/').then(r=>setDemandes(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const count = (s:string) => demandes.filter(d=>d.statut_demande===s).length;

  const stats = [
    { label:'Total',      value: loading ? '…' : demandes.length, icon:'folder_open',       color:'#1a3a6b', bg:'rgba(26,58,107,.1)'   },
    { label:'En attente', value: loading ? '…' : count('EN ATTENTE'), icon:'hourglass_empty', color:'#f59e0b', bg:'rgba(245,158,11,.1)' },
    { label:'Validées',   value: loading ? '…' : count('VALIDER'),    icon:'check_circle',   color:'#10b981', bg:'rgba(16,185,129,.1)'  },
    { label:'Terminées',  value: loading ? '…' : count('TERMINER'),   icon:'task_alt',       color:'#8b5cf6', bg:'rgba(139,92,246,.1)'  },
  ];

  const actions = [
    { icon:'add_circle_outline', label:'Nouvelle demande',   desc:'Soumettre un acte civil',      color:'#1a3a6b', href:'/citoyen/demande'         },
    { icon:'track_changes',      label:'Suivi demandes',     desc:'Voir l\'état de mes demandes', color:'#0891b2', href:'/citoyen/suivi'            },
    { icon:'location_city',      label:'Arrondissements',    desc:'Disponibilité & proximité',    color:'#7c3aed', href:'/citoyen/arrondissements'  },
    { icon:'person_outline',     label:'Mon profil',         desc:'Gérer mes informations',       color:'#059669', href:'/profil'                   },
  ];

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {stats.map((s,i) => (
          <div className={`stat-card fu${i+1}`} key={i}>
            <div className="stat-icon" style={{ background:s.bg }}>
              <Icon name={s.icon} size={22} style={{ color:s.color }} />
            </div>
            <div>
              <div className="stat-val">{s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <h2 style={{ fontSize:16, fontWeight:700, color:'var(--text-1)', marginBottom:16, fontFamily:'Sora,sans-serif' }}>Que souhaitez-vous faire ?</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
        {actions.map((a,i) => (
          <button key={i} onClick={()=>router.push(a.href)} className={`card fu${i+1}`} style={{ border:'none', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:16, transition:'all .18s', padding:'22px 24px' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 8px 30px rgba(0,0,0,.1)'; (e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow=''; (e.currentTarget as HTMLElement).style.transform='';}}>
            <div style={{ width:54, height:54, borderRadius:15, background:a.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon name={a.icon} size={26} style={{ color:'#fff' }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15, color:'var(--text-1)', fontFamily:'Sora,sans-serif' }}>{a.label}</div>
              <div style={{ fontSize:13, color:'var(--text-3)', marginTop:3 }}>{a.desc}</div>
            </div>
            <Icon name="chevron_right" size={20} style={{ color:'var(--text-3)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
