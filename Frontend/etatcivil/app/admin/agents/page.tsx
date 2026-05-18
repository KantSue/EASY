'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Icon from '@/components/Icon';

export default function AdminAgents() {
  const [agents,   setAgents]   = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [arronds,  setArronds]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom_user:'',prenom_user:'',email:'',matricule:'',id_commune:'',id_arondissement:'' });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => api.get('/dashboard/agents/').then(r=>setAgents(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(()=>{ load(); api.get('/accounts/communes/').then(r=>setCommunes(r.data)).catch(()=>{}); },[]);
  useEffect(()=>{
    if (!form.id_commune) { setArronds([]); return; }
    api.get(`/dashboard/arrondissements/public/?commune=${form.id_commune}`).then(r=>setArronds(r.data)).catch(()=>{});
  },[form.id_commune]);

  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}));

  const create = async (e:React.FormEvent) => {
    e.preventDefault(); setCreating(true);
    try { await api.post('/accounts/agents/',form); setMsg('Agent créé. Mot de passe envoyé par email.'); setShowForm(false); load(); setForm({nom_user:'',prenom_user:'',email:'',matricule:'',id_commune:'',id_arondissement:''}); }
    catch { setMsg('Erreur lors de la création.'); }
    finally { setCreating(false); }
  };

  const del = async (id:number) => {
    if (!confirm('Supprimer cet agent ?')) return;
    await api.delete(`/dashboard/agents/${id}/`).then(()=>load()).catch(()=>{});
  };

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><span className="spinner-dark" style={{ width:36,height:36,borderWidth:3 }}/></div>;

  return (
    <div>
      {msg&&<div style={{ padding:'11px 16px',borderRadius:11,background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.2)',color:'#047857',fontSize:14,marginBottom:16 }}>{msg}</div>}

      <div style={{ display:'flex',justifyContent:'flex-end',marginBottom:16 }}>
        <button className={`btn ${showForm?'btn-ghost':'btn-gold'}`} onClick={()=>setShowForm(!showForm)}>
          <Icon name={showForm?'close':'person_add'} size={18}/>{showForm?'Annuler':'Nouvel agent'}
        </button>
      </div>

      {showForm&&(
        <div className="card fu1" style={{ marginBottom:20 }}>
          <h3 style={{ fontFamily:'Sora,sans-serif',fontSize:15,fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:8 }}><Icon name="person_add" size={18} style={{ color:'#1a3a6b' }}/>Créer un agent</h3>
          <form onSubmit={create} style={{ display:'flex',flexDirection:'column',gap:13 }}>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              {[['prenom_user','Prénom'],['nom_user','Nom'],['email','Email'],['matricule','Matricule']].map(([k,label])=>(
                <div className="field" key={k}>
                  <label>{label}</label>
                  <input className="input no-icon" style={{ paddingLeft:14 }} type={k==='email'?'email':'text'} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} required/>
                </div>
              ))}
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              <div className="field"><label>Commune</label>
                <select className="input select no-icon" style={{ paddingLeft:14 }} value={form.id_commune} onChange={e=>set('id_commune',e.target.value)} required>
                  <option value="">Choisir</option>
                  {communes.map((c:any)=><option key={c.id_commune} value={c.id_commune}>{c.nom_commune}</option>)}
                </select>
              </div>
              <div className="field"><label>Arrondissement</label>
                <select className="input select no-icon" style={{ paddingLeft:14 }} value={form.id_arondissement} onChange={e=>set('id_arondissement',e.target.value)} required disabled={!form.id_commune}>
                  <option value="">Choisir</option>
                  {arronds.map((a:any)=><option key={a.id_arondissement} value={a.id_arondissement}>{a.nom_arondissement}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={creating} style={{ alignSelf:'flex-end',minWidth:160 }}>
              {creating?<span className="spinner" style={{ width:17,height:17 }}/>:<><Icon name="person_add" size={17}/>Créer l'agent</>}
            </button>
          </form>
        </div>
      )}

      <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14 }}>
        {agents.map((a:any,i:number)=>{
          const init = ((a.prenom_user?.[0]??'')+(a.nom_user?.[0]??'')).toUpperCase();
          return (
            <div key={a.id_user} className={`card fu${Math.min(i+1,5)}`} style={{ display:'flex',alignItems:'center',gap:14 }}>
              <div style={{ width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#1a3a6b,#2456a0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,color:'#fff',flexShrink:0 }}>{init}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,color:'var(--text-1)',fontFamily:'Sora,sans-serif',fontSize:15 }}>{a.prenom_user} {a.nom_user}</div>
                <div style={{ fontSize:12,color:'var(--text-3)',marginTop:2 }}>{a.email}</div>
                {a.nom_commune&&<div style={{ display:'flex',alignItems:'center',gap:3,fontSize:12,color:'var(--text-3)',marginTop:2 }}><Icon name="location_city" size:13/>{a.nom_commune} · {a.nom_arondissement}</div>}
              </div>
              <button onClick={()=>del(a.id_user)} className="btn btn-danger-soft" style={{ padding:'8px 10px',flexShrink:0 }}><Icon name="delete_outline" size={18}/></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
