'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Icon from '@/components/Icon';

const TYPES = [
  { type:'acte naissance', label:'Acte de naissance', icon:'child_care',                  color:'#0891b2' },
  { type:'acte mariage',   label:'Acte de mariage',   icon:'favorite',                    color:'#e11d48' },
  { type:'acte décès',     label:'Acte de décès',     icon:'sentiment_very_dissatisfied', color:'#7c3aed' },
];

const ROLES_PAR_TYPE: Record<string,{role:string;label:string;icon:string}[]> = {
  'acte naissance': [
    {role:'enfant',  label:'Enfant', icon:'child_care'},
    {role:'pere',    label:'Père',   icon:'man'},
    {role:'mere',    label:'Mère',   icon:'woman'},
  ],
  'acte mariage': [
    {role:'epoux1',      label:'Époux',       icon:'man'},
    {role:'epoux2',      label:'Épouse',      icon:'woman'},
    {role:'temoin',      label:'Témoin 1',    icon:'person'},
    {role:'temoin2',     label:'Témoin 2',    icon:'person'},
    {role:'pere_epoux1', label:'Père époux',  icon:'man'},
    {role:'mere_epoux1', label:'Mère époux',  icon:'woman'},
    {role:'pere_epoux2', label:'Père épouse', icon:'man'},
    {role:'mere_epoux2', label:'Mère épouse', icon:'woman'},
  ],
  'acte décès': [
    {role:'defunt',      label:'Défunt(e)',   icon:'sentiment_very_dissatisfied'},
    {role:'pere_defunt', label:'Père défunt', icon:'man'},
    {role:'mere_defunt', label:'Mère défunt', icon:'woman'},
    {role:'temoin',      label:'Témoin 1',    icon:'person'},
    {role:'temoin2',     label:'Témoin 2',    icon:'person'},
  ],
};

function mkPersonne(role:string) {
  return { role, nom_personne:'', prenom_personne:'', date_naissance:'', lieu_naiss:'', sexe:'Masculin', profession:'' };
}

export default function NouvelleDemandeC() {
  const router = useRouter();
  const [etape,        setEtape]        = useState(1);
  const [typeActe,     setTypeActe]     = useState('');
  const [personnes,    setPersonnes]    = useState<any[]>([]);
  const [activeRole,   setActiveRole]   = useState(0);
  const [nb,           setNb]           = useState(1);
  const [arronds,      setArronds]      = useState<any[]>([]);
  const [selectedArr,  setSelectedArr]  = useState<number|null>(null);
  const [dijkstra,     setDijkstra]     = useState<any>(null);
  const [dijkLoading,  setDijkLoading]  = useState(false);
  const [ref,          setRef]          = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');

  useEffect(() => {
    api.get('/dashboard/arrondissements/public/').then(r => {
      setArronds(r.data);
      const d = r.data.find((a:any) => a.statut === 'disponible');
      if (d) setSelectedArr(d.id_arondissement);
    }).catch(()=>{});
  }, []);

  const choisirType = (t:string) => {
    setTypeActe(t);
    setPersonnes((ROLES_PAR_TYPE[t]||[]).map(r=>mkPersonne(r.role)));
    setActiveRole(0); setEtape(2);
  };

  const verifierArr = async (id:number) => {
    setSelectedArr(id); setDijkstra(null);
    const arr = arronds.find((a:any) => a.id_arondissement===id);
    if (!arr || arr.statut==='disponible') return;
    setDijkLoading(true);
    try {
      const r = await api.get(`/dashboard/arrondissements/${id}/verifier/`);
      setDijkstra(r.data);
      if (r.data?.id_arondissement) setSelectedArr(r.data.id_arondissement);
    } catch { setError('Aucun arrondissement disponible trouvé.'); }
    finally { setDijkLoading(false); }
  };

  const upd = (i:number, k:string, v:string) => setPersonnes(p => p.map((x,j) => j===i ? {...x,[k]:v} : x));

  const soumettre = async () => {
    setSubmitting(true); setError('');
    try {
      await api.post('/dashboard/paiements/', {
        type_acte: typeActe, id_arrondissement: selectedArr,
        personnes, nb_exemplaires: nb, montant: nb*1000,
        ref_transaction: ref || `MVola-${Date.now()}`,
      });
      router.push('/citoyen/suivi');
    } catch (err:any) { setError(err?.response?.data?.detail||'Erreur lors de la soumission.'); }
    finally { setSubmitting(false); }
  };

  const roles = ROLES_PAR_TYPE[typeActe]||[];
  const p     = personnes[activeRole];
  const montant = nb*1000;

  const STEPS = [
    { n:1, icon:'description', label:"Type d'acte"  },
    { n:2, icon:'group',       label:'Informations'  },
    { n:3, icon:'payment',     label:'Paiement'      },
  ];

  return (
    <div style={{ maxWidth:800 }}>
      {/* Stepper */}
      <div className="card fu" style={{ marginBottom:20, padding:'18px 24px' }}>
        <div className="stepper" style={{ gap:0 }}>
          {STEPS.map((s,i) => (
            <div key={s.n} style={{ display:'flex', alignItems:'center', flex:1 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div className="step-circle" style={{ background: etape>s.n ? '#10b981' : etape===s.n ? 'linear-gradient(135deg,#1a3a6b,#2456a0)' : '#e2e8f0', color: etape>=s.n?'#fff':'#94a3b8' }}>
                  {etape>s.n ? <Icon name="check" size={17}/> : <Icon name={s.icon} size={17}/>}
                </div>
                <span style={{ fontSize:12, color: etape>=s.n?'var(--text-1)':'var(--text-3)', fontWeight: etape===s.n?700:400, whiteSpace:'nowrap' }}>{s.label}</span>
              </div>
              {i<2 && <div className="step-line" style={{ background: etape>s.n?'#10b981':'#e2e8f0' }} />}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:12, padding:'12px 16px', color:'#ef4444', fontSize:14, marginBottom:14 }}>
          <Icon name="error_outline" size={18}/>{error}
          <button onClick={()=>setError('')} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:18 }}>×</button>
        </div>
      )}

      {/* ── ÉTAPE 1 ── */}
      {etape===1 && (
        <div className="card fu1">
          <h2 style={{ fontSize:17, fontWeight:700, fontFamily:'Sora,sans-serif', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
            <Icon name="description" size={22} style={{ color:'#1a3a6b' }}/>Quel type d'acte ?
          </h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {TYPES.map(t => (
              <button key={t.type} onClick={()=>choisirType(t.type)} style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 20px', borderRadius:14, background:'#f8fafc', border:'2px solid #e2e8f0', cursor:'pointer', textAlign:'left', transition:'all .18s' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=t.color; (e.currentTarget as HTMLElement).style.background=t.color+'0d';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#e2e8f0'; (e.currentTarget as HTMLElement).style.background='#f8fafc';}}>
                <div style={{ width:56, height:56, borderRadius:15, background:t.color+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon name={t.icon} size={28} style={{ color:t.color }}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:16, color:'var(--text-1)', fontFamily:'Sora,sans-serif' }}>{t.label}</div>
                </div>
                <Icon name="arrow_forward" size={20} style={{ color:'var(--text-3)' }}/>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 ── */}
      {etape===2 && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Personnes */}
          <div className="card fu1">
            <h2 style={{ fontSize:17, fontWeight:700, fontFamily:'Sora,sans-serif', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <Icon name="group" size={22} style={{ color:'#1a3a6b' }}/>{TYPES.find(t=>t.type===typeActe)?.label}
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'170px 1fr', gap:14 }}>
              {/* Tabs */}
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                {roles.map((r,i) => {
                  const filled = personnes[i]?.nom_personne && personnes[i]?.prenom_personne;
                  return (
                    <button key={r.role} onClick={()=>setActiveRole(i)} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 11px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:500, transition:'all .15s', background: activeRole===i?'linear-gradient(135deg,#1a3a6b,#2456a0)':'#f8fafc', color: activeRole===i?'#fff':'var(--text-2)', border: activeRole===i?'none':'1.5px solid #e8edf4', textAlign:'left' }}>
                      <Icon name={r.icon} size={15}/><span style={{ flex:1 }}>{r.label}</span>
                      {filled && <Icon name="check_circle" size={13} style={{ color: activeRole===i?'#86efac':'#10b981' }}/>}
                    </button>
                  );
                })}
              </div>
              {/* Form */}
              {p && (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 13px', background:'rgba(26,58,107,.05)', borderRadius:10, marginBottom:2 }}>
                    <Icon name={roles[activeRole]?.icon} size={18} style={{ color:'#1a3a6b' }}/>
                    <span style={{ fontWeight:700, color:'var(--text-1)', fontFamily:'Sora,sans-serif', fontSize:14 }}>{roles[activeRole]?.label}</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11 }}>
                    {[['prenom_personne','Prénom','Jean'],['nom_personne','Nom','Rakoto']].map(([k,label,ph])=>(
                      <div className="field" key={k}>
                        <label>{label}</label>
                        <input className="input no-icon" value={p[k as keyof typeof p]} onChange={e=>upd(activeRole,k,e.target.value)} placeholder={ph} style={{ paddingLeft:14 }}/>
                      </div>
                    ))}
                    <div className="field">
                      <label>Date de naissance</label>
                      <input className="input no-icon" type="date" value={p.date_naissance} onChange={e=>upd(activeRole,'date_naissance',e.target.value)} style={{ paddingLeft:14 }}/>
                    </div>
                    <div className="field">
                      <label>Lieu de naissance</label>
                      <input className="input no-icon" value={p.lieu_naiss} onChange={e=>upd(activeRole,'lieu_naiss',e.target.value)} placeholder="Antananarivo" style={{ paddingLeft:14 }}/>
                    </div>
                    <div className="field">
                      <label>Sexe</label>
                      <div style={{ display:'flex', gap:8 }}>
                        {['Masculin','Féminin'].map(s=>(
                          <button key={s} onClick={()=>upd(activeRole,'sexe',s)} style={{ flex:1, padding:'10px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:500, transition:'all .15s', background: p.sexe===s?'linear-gradient(135deg,#1a3a6b,#2456a0)':'#f8fafc', color: p.sexe===s?'#fff':'var(--text-2)', border: p.sexe===s?'none':'1.5px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                            <Icon name={s==='Masculin'?'man':'woman'} size={15}/>{s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="field">
                      <label>Profession</label>
                      <input className="input no-icon" value={p.profession} onChange={e=>upd(activeRole,'profession',e.target.value)} placeholder="Enseignant…" style={{ paddingLeft:14 }}/>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:10, marginTop:4 }}>
                    {activeRole>0 && <button className="btn btn-ghost" onClick={()=>setActiveRole(activeRole-1)}><Icon name="arrow_back" size={17}/>Préc.</button>}
                    {activeRole<roles.length-1 && <button className="btn btn-primary" onClick={()=>setActiveRole(activeRole+1)} style={{ marginLeft:'auto' }}>Suiv.<Icon name="arrow_forward" size={17}/></button>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Arrondissement */}
          <div className="card fu2">
            <h2 style={{ fontSize:16, fontWeight:700, fontFamily:'Sora,sans-serif', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <Icon name="location_city" size={20} style={{ color:'#1a3a6b' }}/>Arrondissement
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {arronds.map((a:any) => {
                const ok  = a.statut==='disponible';
                const sel = selectedArr===a.id_arondissement;
                return (
                  <button key={a.id_arondissement} onClick={()=>verifierArr(a.id_arondissement)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:12, cursor:'pointer', border: sel?'2px solid #1a3a6b':'2px solid #e2e8f0', background: sel?'rgba(26,58,107,.04)':'#fff', transition:'all .15s', width:'100%' }}>
                    <Icon name={ok?'location_on':'location_off'} size={20} style={{ color: ok?'#10b981':'#ef4444' }}/>
                    <span style={{ flex:1, textAlign:'left', fontSize:14, fontWeight:500, color:'var(--text-1)' }}>{a.nom_arondissement}</span>
                    <span className={`badge ${ok?'badge-success':'badge-danger'}`}>{ok?'Disponible':'Indispo'}</span>
                    {sel && <Icon name="check_circle" size={18} style={{ color:'#1a3a6b' }}/>}
                  </button>
                );
              })}
            </div>
            {dijkLoading && <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background:'rgba(240,180,41,.07)', borderRadius:11, marginTop:10, fontSize:13, color:'#92400e' }}><span className="spinner-dark" style={{ width:16,height:16 }}/>Dijkstra — recherche en cours…</div>}
            {dijkstra && !dijkLoading && (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background:'rgba(16,185,129,.07)', border:'1px solid rgba(16,185,129,.2)', borderRadius:11, marginTop:10, fontSize:13, color:'#065f46' }}>
                <Icon name="alt_route" size={20} style={{ color:'#10b981' }}/>
                <div><strong>Redirection Dijkstra :</strong> {dijkstra.nom_arondissement} ({dijkstra.distance_km} km)</div>
              </div>
            )}
          </div>

          {/* Nb exemplaires */}
          <div className="card fu3">
            <h2 style={{ fontSize:16, fontWeight:700, fontFamily:'Sora,sans-serif', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <Icon name="content_copy" size={20} style={{ color:'#1a3a6b' }}/>Nombre d'exemplaires
            </h2>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <button onClick={()=>setNb(Math.max(1,nb-1))} style={{ width:40,height:40,borderRadius:'50%',background:'#f1f5f9',border:'1.5px solid #e2e8f0',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><Icon name="remove" size={20}/></button>
              <span style={{ fontSize:30,fontWeight:800,fontFamily:'Sora,sans-serif',minWidth:40,textAlign:'center' }}>{nb}</span>
              <button onClick={()=>setNb(nb+1)} style={{ width:40,height:40,borderRadius:'50%',background:'#f1f5f9',border:'1.5px solid #e2e8f0',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><Icon name="add" size={20}/></button>
              <span style={{ fontSize:16,color:'var(--text-2)',marginLeft:8 }}>= <strong style={{ color:'#f0b429',fontSize:20 }}>{montant.toLocaleString()} Ar</strong></span>
            </div>
          </div>

          <div style={{ display:'flex', gap:12 }}>
            <button className="btn btn-ghost" onClick={()=>setEtape(1)}><Icon name="arrow_back" size={17}/>Retour</button>
            <button className="btn btn-primary" style={{ flex:1 }} onClick={()=>{
              const bad = personnes.find(x=>!x.nom_personne||!x.prenom_personne);
              if (bad) { setError('Remplissez prénom et nom pour toutes les personnes.'); return; }
              if (!selectedArr) { setError('Choisissez un arrondissement.'); return; }
              setError(''); setEtape(3);
            }}>Continuer<Icon name="arrow_forward" size={17}/></button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 3 ── */}
      {etape===3 && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Récap */}
          <div className="card fu1">
            <h2 style={{ fontSize:17,fontWeight:700,fontFamily:'Sora,sans-serif',marginBottom:16,display:'flex',alignItems:'center',gap:8 }}>
              <Icon name="receipt_long" size={22} style={{ color:'#1a3a6b' }}/>Récapitulatif
            </h2>
            <div style={{ display:'flex',flexDirection:'column',gap:0 }}>
              {[
                { icon:'description',  label:"Type d'acte",      val:typeActe },
                { icon:'location_city',label:'Arrondissement',   val:arronds.find(a=>a.id_arondissement===selectedArr)?.nom_arondissement??'—' },
                { icon:'content_copy', label:'Nb exemplaires',   val:`${nb} exemplaire(s)` },
                { icon:'payments',     label:'Montant total',    val:`${montant.toLocaleString()} Ar`, accent:true },
              ].map((row,i)=>(
                <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'11px 0',borderBottom:'1px solid #f1f5f9' }}>
                  <Icon name={row.icon} size={16} style={{ color:'var(--text-3)' }}/>
                  <span style={{ fontSize:13,color:'var(--text-3)',flex:1 }}>{row.label}</span>
                  <span style={{ fontWeight:600,color:row.accent?'#f0b429':'var(--text-1)',fontSize:row.accent?17:14 }}>{row.val}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:12,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10 }}>Personnes</div>
              <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
                {personnes.map((per,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:'#f8fafc',borderRadius:10,fontSize:13 }}>
                    <Icon name={roles[i]?.icon??'person'} size={15} style={{ color:'#1a3a6b' }}/>
                    <span style={{ fontWeight:600,color:'#1a3a6b',minWidth:110 }}>{roles[i]?.label}</span>
                    <span style={{ color:'var(--text-1)',fontWeight:500 }}>{per.prenom_personne} {per.nom_personne}</span>
                    <span style={{ color:'var(--text-3)',fontSize:12,marginLeft:'auto' }}>{per.date_naissance} · {per.lieu_naiss}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="card fu2">
            <h2 style={{ fontSize:17,fontWeight:700,fontFamily:'Sora,sans-serif',marginBottom:16,display:'flex',alignItems:'center',gap:8 }}>
              <Icon name="payment" size={22} style={{ color:'#10b981' }}/>Paiement MVola
            </h2>
            <div style={{ textAlign:'center',padding:'22px',background:'linear-gradient(135deg,rgba(16,185,129,.07),rgba(16,185,129,.03))',borderRadius:14,border:'1px solid rgba(16,185,129,.15)',marginBottom:16 }}>
              <div style={{ fontSize:40,fontWeight:800,color:'#10b981',fontFamily:'Sora,sans-serif' }}>{montant.toLocaleString()} Ar</div>
              <div style={{ fontSize:13,color:'var(--text-3)',marginTop:4 }}>Montant à payer</div>
            </div>
            <div className="field">
              <label>Référence MVola (optionnel)</label>
              <div className="input-wrap">
                <Icon name="tag" size={17} className="input-icon"/>
                <input className="input" value={ref} onChange={e=>setRef(e.target.value)} placeholder="MVola-2035-XXXX"/>
              </div>
              <div style={{ fontSize:12,color:'var(--text-3)',marginTop:5 }}>Laissez vide pour une référence automatique. Paiement simulé (succès automatique).</div>
            </div>
          </div>

          <div style={{ display:'flex', gap:12 }}>
            <button className="btn btn-ghost" onClick={()=>setEtape(2)}><Icon name="arrow_back" size={17}/>Retour</button>
            <button className="btn btn-success" style={{ flex:1 }} onClick={soumettre} disabled={submitting}>
              {submitting ? <span className="spinner" style={{ width:18,height:18 }}/> : <><Icon name="send" size={18}/>Soumettre la demande</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
