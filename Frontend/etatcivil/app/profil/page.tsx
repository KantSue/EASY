'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Icon from '@/components/Icon';

export default function Profil() {
  const [f, setF] = useState({ nom_user:'',prenom_user:'',email:'',ancien_mdp:'',nouveau_mdp:'',confirmer:'' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState<{type:'ok'|'err';text:string}|null>(null);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    api.get('/accounts/profil/').then(r=>setF(p=>({...p,nom_user:r.data.nom_user??'',prenom_user:r.data.prenom_user??'',email:r.data.email??''}))).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const set = (k:string,v:string) => setF(p=>({...p,[k]:v}));

  const save = async (e:React.FormEvent) => {
    e.preventDefault();
    if (f.nouveau_mdp && f.nouveau_mdp!==f.confirmer) { setMsg({type:'err',text:'Les mots de passe ne correspondent pas.'}); return; }
    setSaving(true);
    try {
      const payload:any = { nom_user:f.nom_user, prenom_user:f.prenom_user };
      if (f.nouveau_mdp) { payload.ancien_mdp=f.ancien_mdp; payload.nouveau_mdp=f.nouveau_mdp; }
      await api.patch('/accounts/profil/',payload);
      setMsg({type:'ok',text:'Profil mis à jour.'});
      setF(p=>({...p,ancien_mdp:'',nouveau_mdp:'',confirmer:''}));
    } catch { setMsg({type:'err',text:'Erreur lors de la mise à jour.'}); }
    finally { setSaving(false); }
  };

  const init = ((f.prenom_user[0]??'')+(f.nom_user[0]??'')).toUpperCase()||'?';

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><span className="spinner-dark" style={{ width:36,height:36,borderWidth:3 }}/></div>;

  return (
    <div style={{ maxWidth:580 }}>
      {/* Avatar */}
      <div className="card fu" style={{ display:'flex',alignItems:'center',gap:18,marginBottom:18,padding:'22px 24px' }}>
        <div style={{ width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#f0b429,#fcd34d)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:700,color:'#0a1830',flexShrink:0 }}>{init}</div>
        <div>
          <div style={{ fontFamily:'Sora,sans-serif',fontSize:20,fontWeight:700,color:'var(--text-1)' }}>{f.prenom_user} {f.nom_user}</div>
          <div style={{ fontSize:14,color:'var(--text-3)',marginTop:4 }}>{f.email}</div>
        </div>
      </div>

      {msg&&(
        <div style={{ display:'flex',alignItems:'center',gap:8,padding:'12px 16px',borderRadius:12,background:msg.type==='ok'?'rgba(16,185,129,.08)':'rgba(239,68,68,.08)',border:`1px solid ${msg.type==='ok'?'rgba(16,185,129,.25)':'rgba(239,68,68,.25)'}`,color:msg.type==='ok'?'#047857':'#b91c1c',fontSize:14,marginBottom:16 }}>
          <Icon name={msg.type==='ok'?'check_circle':'error_outline'} size={18}/>{msg.text}
        </div>
      )}

      <form onSubmit={save} style={{ display:'flex',flexDirection:'column',gap:16 }}>
        {/* Infos */}
        <div className="card fu1">
          <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:15,fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:8 }}><Icon name="person" size={18} style={{ color:'#1a3a6b' }}/>Informations personnelles</h3>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12 }}>
            {[['prenom_user','Prénom'],['nom_user','Nom']].map(([k,label])=>(
              <div className="field" key={k}>
                <label>{label}</label>
                <input className="input no-icon" style={{ paddingLeft:14 }} value={(f as any)[k]} onChange={e=>set(k,e.target.value)}/>
              </div>
            ))}
          </div>
          <div className="field">
            <label>Email (non modifiable)</label>
            <input className="input no-icon" style={{ paddingLeft:14,opacity:.6 }} value={f.email} disabled/>
          </div>
        </div>

        {/* Mot de passe */}
        <div className="card fu2">
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom: showPwd?16:0 }}>
            <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:15,fontWeight:700,display:'flex',alignItems:'center',gap:8 }}><Icon name="lock" size={18} style={{ color:'#1a3a6b' }}/>Changer le mot de passe</h3>
            <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{ fontSize:13,color:'#1a3a6b',fontWeight:600,background:'none',border:'none',cursor:'pointer' }}>{showPwd?'Annuler':'Modifier'}</button>
          </div>
          {showPwd&&(
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {[['ancien_mdp','Ancien mot de passe'],['nouveau_mdp','Nouveau mot de passe'],['confirmer','Confirmer le nouveau']].map(([k,label])=>(
                <div className="field" key={k}>
                  <label>{label}</label>
                  <input className="input no-icon" style={{ paddingLeft:14 }} type="password" value={(f as any)[k]} onChange={e=>set(k,e.target.value)}/>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf:'flex-start',minWidth:180 }}>
          {saving?<span className="spinner" style={{ width:17,height:17 }}/>:<><Icon name="save" size={18}/>Enregistrer</>}
        </button>
      </form>
    </div>
  );
}
