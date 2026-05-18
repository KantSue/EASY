'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Icon from '@/components/Icon';

export default function AdminCommunes() {
  const [arronds, setArronds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/arrondissements/').then(r=>setArronds(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const toggle = async (a:any) => {
    const ns = a.statut==='disponible'?'indisponible':'disponible';
    await api.patch(`/dashboard/arrondissements/${a.id_arondissement}/`,{statut:ns})
      .then(()=>setArronds(p=>p.map(x=>x.id_arondissement===a.id_arondissement?{...x,statut:ns}:x)))
      .catch(()=>{});
  };

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><span className="spinner-dark" style={{ width:36,height:36,borderWidth:3 }}/></div>;

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
      {arronds.map((a:any,i:number)=>{
        const ok = a.statut==='disponible';
        return (
          <div key={a.id_arondissement} className={`card fu${Math.min(i+1,5)}`} style={{ display:'flex',alignItems:'center',gap:14,padding:'15px 20px' }}>
            <div style={{ width:44,height:44,borderRadius:12,background:ok?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <Icon name={ok?'location_on':'location_off'} size={22} style={{ color:ok?'#10b981':'#ef4444' }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600,fontSize:15,color:'var(--text-1)' }}>{a.nom_arondissement}</div>
              {a.nom_commune&&<div style={{ fontSize:12,color:'var(--text-3)',marginTop:2,display:'flex',alignItems:'center',gap:3 }}><Icon name="location_city" size:13/>{a.nom_commune}</div>}
            </div>
            <span className={`badge ${ok?'badge-success':'badge-danger'}`}>{ok?'Disponible':'Indisponible'}</span>
            <button onClick={()=>toggle(a)} className="switch" style={{ background:ok?'#10b981':'#e2e8f0',flexShrink:0 }}>
              <div className="switch-knob" style={{ transform:ok?'translateX(20px)':'translateX(2px)' }}/>
            </button>
          </div>
        );
      })}
    </div>
  );
}
