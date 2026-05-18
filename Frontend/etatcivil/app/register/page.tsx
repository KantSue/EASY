'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Icon from '@/components/Icon';

export default function Register() {
  const router = useRouter();
  const [f, setF] = useState({ prenom_user:'', nom_user:'', email:'', mdp_user:'', id_commune:'', id_arondissement:'' });
  const [communes, setCommunes] = useState<any[]>([]);
  const [arronds,  setArronds]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [show,     setShow]     = useState(false);

  useEffect(() => { api.get('/accounts/communes/').then(r=>setCommunes(r.data)).catch(()=>{}); }, []);
  useEffect(() => {
    if (!f.id_commune) { setArronds([]); return; }
    api.get(`/dashboard/arrondissements/public/?commune=${f.id_commune}`).then(r=>setArronds(r.data)).catch(()=>{});
  }, [f.id_commune]);

  const set = (k: string, v: string) => setF(p => ({...p,[k]:v}));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await api.post('/accounts/register/', f); router.push('/login'); }
    catch (err:any) { setError(err?.response?.data?.detail || 'Erreur lors de l\'inscription.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(240,180,41,.07),transparent 70%)', top:-80, right:-80, pointerEvents:'none' }} />

      <div className="glass-card fu" style={{ width:'100%', maxWidth:480, padding:'36px 32px' }}>
        <div style={{ textAlign:'center', marginBottom:26 }}>
          <div style={{ width:60, height:60, borderRadius:18, background:'linear-gradient(135deg,#f0b429,#fcd34d)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 8px 28px rgba(240,180,41,.3)' }}>
            <Icon name="account_balance" size={26} style={{ color:'#0a1830' }} />
          </div>
          <h1 style={{ color:'#fff', fontSize:20, fontWeight:700, fontFamily:'Sora,sans-serif' }}>Créer un compte citoyen</h1>
          <p style={{ color:'rgba(255,255,255,.3)', fontSize:12, marginTop:5 }}>e-EtatCivil 2035 · Madagascar</p>
        </div>

        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:11, padding:'11px 14px', color:'#f87171', fontSize:13, marginBottom:14 }}>
            <Icon name="error_outline" size={17} />{error}
          </div>
        )}

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[['prenom_user','Prénom','badge','Jean'],['nom_user','Nom','badge','Rakoto']].map(([k,label,icon,ph])=>(
              <div className="field" key={k}>
                <label style={{ color:'rgba(255,255,255,.5)' }}>{label}</label>
                <div className="input-wrap">
                  <Icon name={icon} size={17} className="input-icon" />
                  <input className="input" value={(f as any)[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} required style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'#fff' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="field">
            <label style={{ color:'rgba(255,255,255,.5)' }}>Email</label>
            <div className="input-wrap">
              <Icon name="mail_outline" size={17} className="input-icon" />
              <input className="input" type="email" value={f.email} onChange={e=>set('email',e.target.value)} placeholder="jean@email.mg" required style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'#fff' }} />
            </div>
          </div>

          <div className="field">
            <label style={{ color:'rgba(255,255,255,.5)' }}>Mot de passe</label>
            <div className="input-wrap">
              <Icon name="lock_outline" size={17} className="input-icon" />
              <input className="input" type={show?'text':'password'} value={f.mdp_user} onChange={e=>set('mdp_user',e.target.value)} placeholder="••••••••" required style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'#fff', paddingRight:42 }} />
              <button type="button" onClick={()=>setShow(!show)} style={{ position:'absolute', right:10, background:'none', border:'none', cursor:'pointer', display:'flex', padding:4 }}>
                <Icon name={show?'visibility_off':'visibility'} size={17} style={{ color:'rgba(255,255,255,.35)' }} />
              </button>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="field">
              <label style={{ color:'rgba(255,255,255,.5)' }}>Commune</label>
              <div className="input-wrap">
                <Icon name="location_city" size={17} className="input-icon" />
                <select className="input select" value={f.id_commune} onChange={e=>set('id_commune',e.target.value)} required style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color: f.id_commune ? '#fff' : 'rgba(255,255,255,.35)' }}>
                  <option value="">Choisir</option>
                  {communes.map((c:any)=><option key={c.id_commune} value={c.id_commune} style={{ background:'#0a1830' }}>{c.nom_commune}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label style={{ color:'rgba(255,255,255,.5)' }}>Arrondissement</label>
              <div className="input-wrap">
                <Icon name="map" size={17} className="input-icon" />
                <select className="input select" value={f.id_arondissement} onChange={e=>set('id_arondissement',e.target.value)} required disabled={!f.id_commune} style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color: f.id_arondissement ? '#fff' : 'rgba(255,255,255,.35)', opacity: f.id_commune ? 1 : 0.5 }}>
                  <option value="">Choisir</option>
                  {arronds.map((a:any)=><option key={a.id_arondissement} value={a.id_arondissement} style={{ background:'#0a1830' }}>{a.nom_arondissement}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button className="btn btn-gold" type="submit" disabled={loading} style={{ width:'100%', padding:'13px', fontSize:14, marginTop:4, borderRadius:13 }}>
            {loading ? <span className="spinner" style={{ width:17, height:17, borderTopColor:'#0a1830', borderColor:'rgba(10,24,48,.2)' }} /> : <><Icon name="person_add" size={18} />Créer mon compte</>}
          </button>
        </form>

        <p style={{ textAlign:'center', color:'rgba(255,255,255,.3)', fontSize:13, marginTop:18 }}>
          Déjà un compte ? <a href="/login" style={{ color:'#f0b429', fontWeight:600, textDecoration:'none' }}>Se connecter</a>
        </p>
      </div>
    </div>
  );
}
