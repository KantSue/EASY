'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Icon from '@/components/Icon';

export default function FileAttente() {
  const router = useRouter();
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/dashboard/demandes/').then(r=>{ console.log('DEMANDES:',r.data); setDemandes(r.data); }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const handleClick = (d:any, i:number) => {
    if (i===0) router.push(`/agent/detail?id=${d.id_demande}`);
    else alert(`⛔ Traitez d'abord la demande #1 (${demandes[0]?.num_demande})`);
  };

  if (loading) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:'50vh' }}><span className="spinner-dark" style={{ width:36,height:36,borderWidth:3 }}/></div>;

  return (
    <div>
      {/* Stats rapides */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24 }}>
        {[
          {label:'En attente',    val:demandes.length,                    icon:'inbox',         color:'#1a3a6b',border:'#1a3a6b'},
          {label:'Prioritaire',   val:demandes[0]?.num_demande||'Aucune', icon:'local_fire_department', color:'#ef4444',border:'#ef4444'},
          {label:'Type prioritaire', val:demandes[0]?.type_acte||'N/A',  icon:'description',   color:'#f0b429',border:'#f0b429'},
        ].map((s,i)=>(
          <div key={i} className={`stat-card fu${i+1}`} style={{ borderLeft:`4px solid ${s.border}` }}>
            <div className="stat-icon" style={{ background:s.color+'15' }}><Icon name={s.icon} size={22} style={{ color:s.color }}/></div>
            <div><div className="stat-val" style={{ fontSize: i===0?28:18, color:s.color }}>{s.val}</div><div className="stat-lbl">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap fu2">
        <div style={{ padding:'20px 22px',borderBottom:'1px solid #f1f5f9' }}>
          <h2 style={{ fontFamily:'Sora,sans-serif',fontSize:17,fontWeight:700,color:'var(--text-1)',margin:0 }}>Demandes en attente</h2>
          <p style={{ fontSize:13,color:'var(--text-3)',marginTop:3 }}>Classées par ancienneté — priorité au plus ancien (tas binaire)</p>
        </div>

        {!demandes.length ? (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:60,gap:12 }}>
            <Icon name="check_circle" size={52} style={{ color:'#10b981' }}/>
            <p style={{ color:'var(--text-3)' }}>Aucune demande en attente</p>
          </div>
        ) : (
          <>
            <div className="thead">
              <span className="th" style={{ width:70 }}>#</span>
              <span className="th" style={{ flex:1 }}>Numéro</span>
              <span className="th" style={{ flex:1 }}>Type</span>
              <span className="th" style={{ flex:1.2 }}>Citoyen</span>
              <span className="th" style={{ flex:1 }}>Date dépôt</span>
              <span className="th" style={{ width:110 }}>Action</span>
            </div>
            {demandes.map((d:any,i:number)=>(
              <div key={d.id_demande} className="trow" style={{ borderLeft: i===0?'4px solid #ef4444':'4px solid transparent', opacity: i===0?1:.55, background: i===0?'#fff':'#fafbfc' }}>
                <div style={{ width:70,display:'flex',alignItems:'center',gap:6 }}>
                  <div style={{ width:30,height:30,borderRadius:'50%',background:i===0?'linear-gradient(135deg,#ef4444,#ff6b6b)':'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:i===0?'#fff':'#94a3b8' }}>{i+1}</div>
                  {i===0&&<Icon name="local_fire_department" size={16} style={{ color:'#ef4444' }}/>}
                </div>
                <span style={{ flex:1,fontWeight:600,color:'#f0b429',fontSize:14 }}>{d.num_demande}</span>
                <span style={{ flex:1 }}><span className="badge badge-navy" style={{ fontSize:12 }}>{d.type_acte}</span></span>
                <span style={{ flex:1.2,fontSize:13,color:'var(--text-1)',display:'flex',alignItems:'center',gap:5 }}><Icon name="person" size={14} style={{ color:'var(--text-3)' }}/>{d.citoyen}</span>
                <span style={{ flex:1,fontSize:12,color:'var(--text-3)',display:'flex',alignItems:'center',gap:5 }}><Icon name="calendar_today" size={13}/>{d.date_depot?.split('T')[0]}</span>
                <div style={{ width:110 }}>
                  <button onClick={()=>handleClick(d,i)} className={`btn ${i===0?'btn-primary':'btn-ghost'}`} style={{ padding:'8px 14px',fontSize:12,cursor:i===0?'pointer':'not-allowed',opacity:i===0?1:.7 }}>
                    {i===0?<><Icon name="arrow_forward" size={15}/>Traiter</>:<><Icon name="lock" size={14}/>Bloqué</>}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
