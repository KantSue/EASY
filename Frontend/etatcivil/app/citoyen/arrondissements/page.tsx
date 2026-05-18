'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Icon from '@/components/Icon';

export default function Arrondissements() {
  const [arronds, setArronds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/arrondissements/public/').then(r=>setArronds(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const dispo   = arronds.filter(a=>a.statut==='disponible');
  const indispo = arronds.filter(a=>a.statut!=='disponible');

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><span className="spinner-dark" style={{ width:36,height:36,borderWidth:3 }}/></div>;

  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:22 }}>
        {[
          {val:dispo.length,  label:'Disponibles',   icon:'check_circle', color:'#10b981',border:'#10b981'},
          {val:indispo.length,label:'Indisponibles',  icon:'cancel',       color:'#ef4444',border:'#ef4444'},
        ].map((s,i)=>(
          <div key={i} className={`stat-card fu${i+1}`} style={{ borderLeft:`4px solid ${s.border}` }}>
            <div className="stat-icon" style={{ background:s.color+'15' }}><Icon name={s.icon} size={22} style={{ color:s.color }}/></div>
            <div><div className="stat-val" style={{ color:s.color }}>{s.val}</div><div className="stat-lbl">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
        {arronds.map((a:any,i:number)=>{
          const ok = a.statut==='disponible';
          return (
            <div key={a.id_arondissement} className={`card fu${Math.min(i+1,5)}`} style={{ display:'flex',alignItems:'center',gap:14,padding:'15px 20px' }}>
              <div style={{ width:44,height:44,borderRadius:12,background:ok?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <Icon name={ok?'location_on':'location_off'} size={22} style={{ color:ok?'#10b981':'#ef4444' }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600,fontSize:15,color:'var(--text-1)' }}>{a.nom_arondissement}</div>
                {a.nom_commune && <div style={{ fontSize:12,color:'var(--text-3)',marginTop:2 }}>{a.nom_commune}</div>}
              </div>
              <span className={`badge ${ok?'badge-success':'badge-danger'}`}>{ok?'Disponible':'Indisponible'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
