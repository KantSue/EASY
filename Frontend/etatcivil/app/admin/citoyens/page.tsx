'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Icon from '@/components/Icon';

export default function AdminCitoyens() {
  const [citoyens, setCitoyens] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/dashboard/citoyens/').then(r=>setCitoyens(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><span className="spinner-dark" style={{ width:36,height:36,borderWidth:3 }}/></div>;

  return (
    <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14 }}>
      {citoyens.map((c:any,i:number)=>{
        const init = ((c.prenom_user?.[0]??'')+(c.nom_user?.[0]??'')).toUpperCase();
        const mini = [
          {label:'Total',  val:c.total??0,     color:'#1a3a6b'},
          {label:'Attente',val:c.en_attente??0, color:'#f59e0b'},
          {label:'Validées',val:c.validees??0,  color:'#10b981'},
          {label:'Terminées',val:c.terminees??0,color:'#8b5cf6'},
        ];
        return (
          <div key={c.id_user} className={`card fu${Math.min(i+1,5)}`}>
            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:14 }}>
              <div style={{ width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#f0b429,#fcd34d)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,color:'#0a1830',flexShrink:0 }}>{init}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:700,color:'var(--text-1)',fontFamily:'Sora,sans-serif',fontSize:15,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{c.prenom_user} {c.nom_user}</div>
                <div style={{ fontSize:12,color:'var(--text-3)',marginTop:2 }}>{c.email}</div>
                {c.nom_commune&&<div style={{ display:'flex',alignItems:'center',gap:3,fontSize:12,color:'var(--text-3)',marginTop:1 }}><Icon name="location_city" size={13}/>{c.nom_commune} · {c.nom_arondissement}</div>}
              </div>
            </div>
            <div style={{ display:'flex',justifyContent:'space-around',borderTop:'1px solid #f1f5f9',paddingTop:12 }}>
              {mini.map(m=>(
                <div key={m.label} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:20,fontWeight:800,color:m.color,fontFamily:'Sora,sans-serif' }}>{m.val}</div>
                  <div style={{ fontSize:11,color:'var(--text-3)' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
