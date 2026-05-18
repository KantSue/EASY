'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Icon from '@/components/Icon';
import {demandeService} from '../../../../webfront/src/service/demandeService'
const ROLE_LABEL: Record<string,string> = {
  enfant:'Enfant',pere:'Père',mere:'Mère',epoux1:'Époux',epoux2:'Épouse',
  defunt:'Défunt(e)',temoin:'Témoin 1',temoin2:'Témoin 2',
  pere_epoux1:'Père époux',mere_epoux1:'Mère époux',
  pere_epoux2:'Père épouse',mere_epoux2:'Mère épouse',
  pere_defunt:'Père défunt',mere_defunt:'Mère défunt',
};
const ST_CFG: Record<string,{color:string;bg:string}> = {
  'EN ATTENTE':{color:'#b45309',bg:'rgba(245,158,11,.1)'},
  'VALIDER':   {color:'#047857',bg:'rgba(16,185,129,.1)'},
  'REFUSER':   {color:'#b91c1c',bg:'rgba(239,68,68,.1)'},
  'TERMINER':  {color:'#6d28d9',bg:'rgba(139,92,246,.1)'},
};

function DetailContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const id = sp.get('id');

  const [demande,      setDemande]      = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [recherche,    setRecherche]    = useState('');
  const [suggestions,  setSuggestions]  = useState<string[]>([]);
  const [actePreview,  setActePreview]  = useState<any>(null);
  const [acteLoading,  setActeLoading]  = useState(false);
  const [acteConfirme, setActeConfirme] = useState<any>(null);
  const [motif,        setMotif]        = useState('');
  const [showRefus,    setShowRefus]    = useState(false);
  const [showEmail,    setShowEmail]    = useState(false);
  const [email,        setEmail]        = useState('');
  const [acting,       setActing]       = useState(false);
  const [msg,          setMsg]          = useState<{type:'ok'|'err';text:string}|null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/dashboard/demandes/${id}/`)
      .then(r=>{ setDemande(r.data); setRecherche(r.data.num_acte||''); setEmail(r.data.email_citoyen||''); })
      .catch(()=>setMsg({type:'err',text:'Impossible de charger la demande.'}))
      .finally(()=>setLoading(false));
  }, [id]);

  useEffect(() => {
    if (recherche.length<2) { setSuggestions([]); return; }
    const t = setTimeout(()=>{
      api.get(`/dashboard/recherche/suggestions/?q=${recherche}`)
        .then(r=>{ const d=r.data; setSuggestions(Array.isArray(d)?d:Array.isArray(d.suggestions)?d.suggestions:[]); })
        .catch(()=>setSuggestions([]));
    },300);
    return ()=>clearTimeout(t);
  },[recherche]);

  const clickSugg = async (num:string) => {
    setSuggestions([]); setRecherche(num); setActePreview(null); setActeLoading(true);
    try {
      const res = await api.get(`/dashboard/recherche/?q=${num}`);
      const list = res.data.actes||res.data.resultats||res.data||[];
      const found = list.find((a:any)=>a.num_acte===num||String(a.id_acte)===num);
      if (found) {
        const det = await api.get(`/dashboard/actes/${found.id_acte}/?id_demande=${id}`);
        setActePreview(det.data);
      } else setMsg({type:'err',text:'Acte introuvable.'});
    } catch { setMsg({type:'err',text:"Erreur lors du chargement de l'acte."}); }
    finally { setActeLoading(false); }
  };

  const confirmer = () => { setActeConfirme(actePreview); setActePreview(null); setMsg({type:'ok',text:`✓ Acte ${actePreview.num_acte} confirmé.`}); };

  const valider = async () => {
    setActing(true);
    try {
      await api.patch(`/dashboard/demandes/${demande.id_agent}/${id}/`,{action:'VALIDER'});
      setDemande((p:any)=>({...p,statut_demande:'VALIDER'}));
      setMsg({type:'ok',text:'Demande validée.'});
    } catch { setMsg({type:'err',text:'Erreur validation.'}); }
    finally { setActing(false); }
  };

  const refuser = async () => {
    if (!motif.trim()) return;
    setActing(true);
    try {
      await api.patch(`/dashboard/demandes/${demande.id_agent}/${id}/`,{action:'REFUSER',motif});
      setDemande((p:any)=>({...p,statut_demande:'REFUSER'}));
      setShowRefus(false); setMsg({type:'err',text:'Demande refusée.'});
    } catch { setMsg({type:'err',text:'Erreur refus.'}); }
    finally { setActing(false); }
  };

const genPDF = async () => {
  try {
    const r = await demandeService.genererPDF(Number(id));
    // Le backend retourne { url_pdf: "..." }
    const urlPdf = r.data?.url_pdf;
    if (urlPdf) {
      window.open(urlPdf, '_blank');
      setMsg({ type: 'ok', text: 'PDF généré avec succès.' });
    } else {
      // Fallback blob
      window.open(
        URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' })),
        '_blank'
      );
      setMsg({ type: 'ok', text: 'PDF généré avec succès.' });
    }
  } catch (err: any) {
    const msgErr = err?.response?.data?.error || err?.response?.data?.detail || 'Erreur génération PDF.';
    setMsg({ type: 'err', text: String(msgErr) });
  }
};
  const envoyerEmail = async () => {
    try {
      await api.post(`/dashboard/demandes/${id}/envoyer-pdf/`,{email});
      setShowEmail(false); setMsg({type:'ok',text:`PDF envoyé à ${email}.`});
    } catch { setMsg({type:'err',text:"Erreur envoi email."}); }
  };

  if (loading) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:'60vh' }}><span className="spinner-dark" style={{ width:36,height:36,borderWidth:3 }}/></div>;
  if (!demande) return <div style={{ color:'#ef4444',padding:40,textAlign:'center' }}>Demande introuvable.</div>;

  const st = ST_CFG[demande.statut_demande]??{color:'#64748b',bg:'#f1f5f9'};
const canPDF = demande.statut_demande === 'VALIDER';

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22 }}>
        <div>
          <button onClick={()=>router.push('/agent/file-attente')} style={{ display:'flex',alignItems:'center',gap:5,background:'none',border:'none',cursor:'pointer',color:'var(--text-3)',fontSize:13,marginBottom:6 }}>
            <Icon name="arrow_back" size={16}/>Retour
          </button>
          <h1 style={{ fontFamily:'Sora,sans-serif',fontSize:22,fontWeight:700,color:'var(--text-1)' }}>Demande {demande.num_demande}</h1>
        </div>
        <span className="badge" style={{ background:st.bg,color:st.color,padding:'6px 16px',fontSize:13 }}>{demande.statut_demande}</span>
      </div>

      {/* Message */}
      {msg && (
        <div style={{ display:'flex',alignItems:'center',gap:8,padding:'12px 16px',borderRadius:12,background:msg.type==='ok'?'rgba(16,185,129,.08)':'rgba(239,68,68,.08)',border:`1px solid ${msg.type==='ok'?'rgba(16,185,129,.25)':'rgba(239,68,68,.25)'}`,color:msg.type==='ok'?'#047857':'#b91c1c',fontSize:14,marginBottom:16 }}>
          <Icon name={msg.type==='ok'?'check_circle':'error_outline'} size={18}/>{msg.text}
          <button onClick={()=>setMsg(null)} style={{ marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'inherit',fontSize:20 }}>×</button>
        </div>
      )}

      {/* 2 colonnes */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:18 }}>
        {/* Col gauche */}
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          {/* Citoyen */}
          <div className="card fu1">
            <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:14,display:'flex',alignItems:'center',gap:8 }}><Icon name="person" size={18} style={{ color:'#1a3a6b' }}/>Citoyen</h3>
            {[['Nom',`${demande.prenom_citoyen||''} ${demande.nom_citoyen||''}`],['Email',demande.email_citoyen],['Type',demande.type_acte],['Date',new Date(demande.date_demande).toLocaleDateString('fr-FR')],["N° acte demandé",demande.num_acte]].map(([k,v])=>(
              <div key={k} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f8fafc',fontSize:13 }}>
                <span style={{ color:'var(--text-3)' }}>{k}</span>
                <span style={{ fontWeight:500,color:'var(--text-1)',maxWidth:'60%',textAlign:'right' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Photo CIN */}
          {demande.photo_cin && (
            <div className="card fu2">
              <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:12,display:'flex',alignItems:'center',gap:8 }}><Icon name="badge" size={18} style={{ color:'#1a3a6b' }}/>Photo CIN</h3>
              <img src={demande.photo_cin} alt="CIN" style={{ width:'100%',borderRadius:10,objectFit:'cover',maxHeight:200 }}/>
            </div>
          )}

          {/* Personnes */}
          <div className="card fu3">
            <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:12,display:'flex',alignItems:'center',gap:8 }}><Icon name="group" size={18} style={{ color:'#1a3a6b' }}/>Personnes</h3>
            {(demande.personnes||[]).map((p:any,i:number)=>(
              <div key={i} style={{ padding:'10px 12px',background:'#f8fafc',borderRadius:10,marginBottom:7 }}>
                <div style={{ fontWeight:700,color:'#1a3a6b',fontSize:12,marginBottom:3 }}>{ROLE_LABEL[p.role]||p.role}</div>
                <div style={{ fontWeight:600,color:'var(--text-1)',fontSize:14 }}>{p.prenom} {p.nom}</div>
                {p.date_naissance&&<div style={{ color:'var(--text-3)',fontSize:12,marginTop:2 }}>Né(e) le {p.date_naissance}{p.lieu_naissance?` à ${p.lieu_naissance}`:''}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Col droite */}
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          {/* Recherche acte */}
          <div className="card fu1">
            <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:14,fontWeight:700,color:'var(--text-1)',marginBottom:14,display:'flex',alignItems:'center',gap:8 }}><Icon name="search" size={18} style={{ color:'#1a3a6b' }}/>Recherche acte (Trie)</h3>
            <div style={{ position:'relative' }}>
              <div className="input-wrap">
                <Icon name="search" size={17} className="input-icon"/>
                <input className="input" value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="N° acte (ex: NAISS-2024-001)"/>
              </div>
              {suggestions.length>0&&(
                <div style={{ position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,boxShadow:'0 8px 24px rgba(0,0,0,.1)',zIndex:100,marginTop:4,overflow:'hidden' }}>
                  {suggestions.map((s,i)=>(
                    <button key={i} onClick={()=>clickSugg(s)} style={{ width:'100%',textAlign:'left',padding:'11px 14px',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:10,fontSize:13,color:'var(--text-1)',borderBottom:i<suggestions.length-1?'1px solid #f8fafc':'none',transition:'background .15s' }}
                      onMouseEnter={e=>(e.currentTarget.style.background='#f8fafc')}
                      onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                      <Icon name="article" size={16} style={{ color:'#1a3a6b' }}/>{s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {acteLoading&&<div style={{ marginTop:14,display:'flex',alignItems:'center',gap:8,color:'#f0b429',fontSize:13 }}><span className="spinner" style={{ width:16,height:16,borderTopColor:'#f0b429',borderColor:'rgba(240,180,41,.2)' }}/>Chargement de l'acte…</div>}

            {/* Preview acte */}
            {actePreview&&!acteLoading&&(
              <div style={{ marginTop:14,border:'2px solid #1a3a6b',borderRadius:14,overflow:'hidden' }}>
                <div style={{ background:'linear-gradient(135deg,#1a3a6b,#0a1830)',padding:'13px 16px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div>
                    <div style={{ color:'#f0b429',fontWeight:700,fontSize:14 }}>{actePreview.num_acte}</div>
                    <div style={{ color:'rgba(255,255,255,.55)',fontSize:12,marginTop:2 }}>{actePreview.type_acte} · {new Date(actePreview.date_acte).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <button onClick={()=>setActePreview(null)} style={{ background:'rgba(255,255,255,.1)',border:'none',cursor:'pointer',color:'#fff',borderRadius:6,padding:'4px 8px',fontSize:16 }}>×</button>
                </div>
                <div style={{ padding:14,background:'#f8fafc',maxHeight:280,overflowY:'auto' }}>
                  <div style={{ fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:10 }}>Personnes enregistrées</div>
                  {(actePreview.personnes||[]).map((p:any,i:number)=>(
                    <div key={i} style={{ padding:'9px 11px',background:'#fff',borderRadius:9,marginBottom:7,border:'1px solid #e8edf4' }}>
                      <div style={{ fontWeight:700,color:'#1a3a6b',fontSize:11,marginBottom:3 }}>{ROLE_LABEL[p.role]||p.role}</div>
                      <div style={{ fontWeight:600,color:'var(--text-1)',fontSize:14 }}>{p.prenom} {p.nom}</div>
                      {p.date_naissance&&<div style={{ color:'var(--text-3)',fontSize:12,marginTop:1 }}>{p.date_naissance}{p.lieu_naissance?` · ${p.lieu_naissance}`:''}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ padding:'12px 14px',background:'#fff',borderTop:'1px solid #e8edf4',display:'flex',gap:10 }}>
                  <button className="btn btn-success" onClick={confirmer} style={{ flex:1,fontSize:13 }}><Icon name="check" size={16}/>C'est le bon acte</button>
                  <button className="btn btn-danger-soft" onClick={()=>setActePreview(null)} style={{ padding:'10px 14px' }}><Icon name="close" size={16}/></button>
                </div>
              </div>
            )}

            {acteConfirme&&(
              <div style={{ marginTop:12,padding:'11px 14px',background:'rgba(16,185,129,.07)',border:'1px solid rgba(16,185,129,.25)',borderRadius:11,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div><div style={{ color:'#047857',fontWeight:700,fontSize:13 }}>✓ Acte confirmé</div><div style={{ color:'var(--text-1)',fontSize:13,marginTop:1 }}>{acteConfirme.num_acte}</div></div>
                <button onClick={()=>setActeConfirme(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-3)',fontSize:18 }}>×</button>
              </div>
            )}
          </div>

          {/* Actions */}
          {demande.statut_demande==='EN ATTENTE'&&(
            <div className="card fu2" style={{ gap:12 }}>
              <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:14,fontWeight:700,color:'var(--text-1)',display:'flex',alignItems:'center',gap:8 }}><Icon name="bolt" size={18} style={{ color:'#f0b429' }}/>Actions</h3>
              <button className="btn btn-success" onClick={valider} disabled={acting} style={{ width:'100%' }}><Icon name="check_circle" size={18}/>Valider la demande</button>
              <button className="btn btn-danger-soft" onClick={()=>setShowRefus(true)} disabled={acting} style={{ width:'100%' }}><Icon name="cancel" size={18}/>Refuser la demande</button>
            </div>
          )}

          {/* PDF */}
          {canPDF&&(
            <div className="card fu3" style={{ gap:12 }}>
              <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:14,fontWeight:700,color:'var(--text-1)',display:'flex',alignItems:'center',gap:8 }}><Icon name="picture_as_pdf" size={18} style={{ color:'#8b5cf6' }}/>Document PDF</h3>
              <button className="btn" onClick={genPDF} style={{ width:'100%',background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',color:'#fff' }}><Icon name="picture_as_pdf" size={18}/>Générer le PDF</button>
              <button className="btn btn-ghost" onClick={()=>setShowEmail(true)} style={{ width:'100%' }}><Icon name="mail_outline" size={18}/>Envoyer par email</button>
            </div>
          )}

          {acteConfirme&&demande.statut_demande==='VALIDER'&&!demande.paiement_ok&&(
            <div style={{ padding:'12px 14px',background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.2)',borderRadius:12,color:'#b45309',fontSize:13,display:'flex',alignItems:'center',gap:8 }}>
              <Icon name="warning" size={18} style={{ color:'#f59e0b' }}/>Paiement non confirmé — PDF disponible après confirmation.
            </div>
          )}
        </div>
      </div>

      {/* Modal refus */}
      {showRefus&&(
        <div className="overlay"><div className="modal">
          <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:17,fontWeight:700,marginBottom:16 }}>Motif de refus</h3>
          <textarea value={motif} onChange={e=>setMotif(e.target.value)} placeholder="Expliquez le motif…" rows={4} className="input no-icon" style={{ paddingLeft:14,resize:'vertical',width:'100%' }}/>
          <div style={{ display:'flex',gap:12,marginTop:16 }}>
            <button className="btn btn-danger-soft" onClick={refuser} disabled={!motif.trim()||acting} style={{ flex:1 }}>Confirmer le refus</button>
            <button className="btn btn-ghost" onClick={()=>setShowRefus(false)} style={{ flex:1 }}>Annuler</button>
          </div>
        </div></div>
      )}

      {/* Modal email */}
      {showEmail&&(
        <div className="overlay"><div className="modal">
          <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:17,fontWeight:700,marginBottom:16 }}>Envoyer le PDF</h3>
          <div className="field">
            <label>Email du citoyen</label>
            <div className="input-wrap"><Icon name="mail_outline" size={17} className="input-icon"/><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          </div>
          <div style={{ display:'flex',gap:12,marginTop:16 }}>
            <button className="btn btn-primary" onClick={envoyerEmail} style={{ flex:1 }}>Envoyer</button>
            <button className="btn btn-ghost" onClick={()=>setShowEmail(false)} style={{ flex:1 }}>Annuler</button>
          </div>
        </div></div>
      )}
    </div>
  );
}

export default function DetailPage() {
  return <Suspense fallback={<div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:'60vh' }}><span className="spinner-dark" style={{ width:36,height:36,borderWidth:3 }}/></div>}><DetailContent/></Suspense>;
}
