'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Icon from '@/components/Icon';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats/').then(r=>setStats(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><span className="spinner-dark" style={{ width:36,height:36,borderWidth:3 }}/></div>;

  const cards = [
    {label:'Total demandes',val:stats?.total_demandes??0,     icon:'folder_open',       color:'#1a3a6b'},
    {label:'En attente',    val:stats?.en_attente??0,          icon:'hourglass_empty',   color:'#f59e0b'},
    {label:'Validées',      val:stats?.validees??0,            icon:'check_circle',      color:'#10b981'},
    {label:'Refusées',      val:stats?.refusees??0,            icon:'cancel',            color:'#ef4444'},
    {label:'Terminées',     val:stats?.terminees??0,           icon:'task_alt',          color:'#8b5cf6'},
    {label:'Paiements',     val:stats?.paiements_confirmes??0, icon:'payments',          color:'#0891b2'},
  ];

  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24 }}>
        {cards.map((c,i)=>(
          <div key={i} className={`stat-card fu${i+1}`}>
            <div className="stat-icon" style={{ background:c.color+'15' }}><Icon name={c.icon} size={22} style={{ color:c.color }}/></div>
            <div><div className="stat-val">{c.val}</div><div className="stat-lbl">{c.label}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:18 }}>
        {/* Par type acte */}
        {stats?.par_type&&(
          <div className="card fu4">
            <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:15,fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:8 }}><Icon name="pie_chart" size={18} style={{ color:'#1a3a6b' }}/>Par type d'acte</h3>
            {Object.entries(stats.par_type).map(([type,val]:any)=>(
              <div key={type} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid #f8fafc',fontSize:14 }}>
                <span style={{ color:'var(--text-2)' }}>{type}</span>
                <span style={{ fontWeight:700,color:'#1a3a6b' }}>{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Journal récent */}
        {stats?.journal_recent?.length>0&&(
          <div className="card fu5">
            <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:15,fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:8 }}><Icon name="history" size={18} style={{ color:'#1a3a6b' }}/>Actions récentes</h3>
            {stats.journal_recent.slice(0,6).map((j:any,i:number)=>(
              <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid #f8fafc' }}>
                <Icon name={j.action==='VALIDER'?'check_circle':'cancel'} size={16} style={{ color:j.action==='VALIDER'?'#10b981':'#ef4444',flexShrink:0 }}/>
                <span style={{ fontSize:13,fontWeight:600,color:'var(--text-1)',minWidth:90,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{j.agent}</span>
                <span style={{ flex:1,fontSize:12,color:'var(--text-3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{j.action} · {j.num_demande}</span>
                <span style={{ fontSize:11,color:'var(--text-3)',flexShrink:0 }}>{new Date(j.horodatage).toLocaleDateString('fr-FR')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
