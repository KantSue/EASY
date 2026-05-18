'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Icon from '@/components/Icon';

export default function Historique() {
  const [items,   setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/demandes/historique/').then(r=>setItems(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><span className="spinner-dark" style={{ width:36,height:36,borderWidth:3 }}/></div>;

  if (!items.length) return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'50vh',gap:14 }}>
      <Icon name="history" size={56} style={{ color:'#cbd5e1' }}/>
      <p style={{ color:'var(--text-3)' }}>Aucune action enregistrée</p>
    </div>
  );

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
      {items.map((item:any,i:number)=>{
        const ok = item.action==='VALIDER';
        return (
          <div key={item.id||i} className={`card fu${Math.min(i+1,5)}`} style={{ display:'flex',alignItems:'flex-start',gap:14,padding:'16px 20px' }}>
            <div style={{ width:42,height:42,borderRadius:11,background:ok?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2 }}>
              <Icon name={ok?'check_circle':'cancel'} size={20} style={{ color:ok?'#10b981':'#ef4444' }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:4 }}>
                <span style={{ fontWeight:700,color:'#f0b429',fontSize:14 }}>{item.num_demande}</span>
                <span className={`badge ${ok?'badge-success':'badge-danger'}`}>{ok?'Validée':'Refusée'}</span>
              </div>
              {item.type_acte&&<div style={{ fontSize:13,color:'var(--text-1)',fontWeight:500 }}>{item.type_acte}</div>}
              {item.citoyen&&<div style={{ display:'flex',alignItems:'center',gap:4,fontSize:12,color:'var(--text-3)',marginTop:3 }}><Icon name="person" size={13}/>{item.citoyen}</div>}
              {item.motif&&(
                <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#92400e',background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.2)',borderRadius:8,padding:'6px 10px',marginTop:6 }}>
                  <Icon name="info_outline" size={14} style={{ color:'#f59e0b' }}/>Motif : {item.motif}
                </div>
              )}
            </div>
            <div style={{ fontSize:12,color:'var(--text-3)',flexShrink:0,marginTop:2 }}>
              {new Date(item.horodatage).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}
            </div>
          </div>
        );
      })}
    </div>
  );
}
