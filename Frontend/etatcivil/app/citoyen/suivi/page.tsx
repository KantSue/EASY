'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Icon from '@/components/Icon';

const ST: Record<string,{color:string;bg:string;icon:string;label:string}> = {
  'EN ATTENTE': {color:'#b45309',bg:'rgba(245,158,11,.1)', icon:'hourglass_empty',     label:'En attente'},
  'VALIDER':    {color:'#047857',bg:'rgba(16,185,129,.1)', icon:'check_circle_outline', label:'Validée'},
  'REFUSER':    {color:'#b91c1c',bg:'rgba(239,68,68,.1)',  icon:'cancel',               label:'Refusée'},
  'TERMINER':   {color:'#6d28d9',bg:'rgba(139,92,246,.1)',icon:'task_alt',             label:'Terminée'},
};

export default function SuiviDemandes() {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/dashboard/demandes/citoyen/').then(r=>setDemandes(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const dlPDF = async (id:number) => {
    try { const r = await api.get(`/dashboard/demandes/${id}/pdf/`); window.open(r.data.url_pdf,'_blank'); }
    catch { alert('PDF non disponible.'); }
  };

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><span className="spinner-dark" style={{ width:36,height:36,borderWidth:3 }}/></div>;

  if (!demandes.length) return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'50vh',gap:14 }}>
      <Icon name="inbox" size={56} style={{ color:'#cbd5e1' }}/>
      <p style={{ color:'var(--text-3)',fontSize:16 }}>Aucune demande pour le moment</p>
      <a href="/citoyen/demande" className="btn btn-primary">Faire une demande</a>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {demandes.map((d:any,i:number) => {
        const st = ST[d.statut_demande]??{color:'#64748b',bg:'#f1f5f9',icon:'help_outline',label:d.statut_demande};
        return (
          <div key={d.id_demande} className={`card fu${Math.min(i+1,5)}`} style={{ display:'flex',alignItems:'center',gap:16,padding:'18px 22px' }}>
            <div style={{ width:46,height:46,borderRadius:12,background:st.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <Icon name={st.icon} size={22} style={{ color:st.color }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:4 }}>
                <span style={{ fontWeight:700,color:'#f0b429',fontSize:15,fontFamily:'Sora,sans-serif' }}>{d.num_demande}</span>
                <span className="badge" style={{ background:st.bg,color:st.color }}>{st.label}</span>
              </div>
              <div style={{ fontSize:14,color:'var(--text-1)',fontWeight:500 }}>{d.type_acte}</div>
              <div style={{ display:'flex',alignItems:'center',gap:4,fontSize:12,color:'var(--text-3)',marginTop:3 }}>
                <Icon name="calendar_today" size={13}/>
                {new Date(d.date_demande).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}
              </div>
            </div>
            {d.statut_demande==='TERMINER' && (
              <button className="btn btn-primary" onClick={()=>dlPDF(d.id_demande)} style={{ gap:6,background:'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}>
                <Icon name="download" size={17}/>PDF
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
