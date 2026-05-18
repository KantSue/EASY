'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Icon from '@/components/Icon';

export default function Login() {
  const router = useRouter();
  const [email,   setEmail]   = useState('');
  const [mdp,     setMdp]     = useState('');
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const r = await api.post('/accounts/login/', { email, mdp_user: mdp });
      localStorage.setItem('token', r.data.token);
      localStorage.setItem('role',  r.data.role);
      const role = r.data.role?.toLowerCase();
      if      (role === 'citoyen')        router.push('/citoyen/accueil');
      else if (role === 'agent')          router.push('/agent/file-attente');
      else if (role === 'administrateur') router.push('/admin/dashboard');
    } catch { setError('Email ou mot de passe incorrect.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      {/* Decorative orbs */}
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(240,180,41,.07),transparent 70%)', top:-80, right:-80, pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(36,86,160,.12),transparent 70%)', bottom:-60, left:-60, pointerEvents:'none' }} />

      <div className="glass-card fu" style={{ width:'100%', maxWidth:420, padding:'40px 36px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:68, height:68, borderRadius:20, background:'linear-gradient(135deg,#f0b429,#fcd34d)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 8px 32px rgba(240,180,41,.35)' }}>
            <Icon name="account_balance" size={30} style={{ color:'#0a1830' }} />
          </div>
          <h1 style={{ color:'#fff', fontSize:22, fontWeight:700, fontFamily:'Sora,sans-serif' }}>e-EtatCivil 2035</h1>
          <p style={{ color:'rgba(255,255,255,.35)', fontSize:12, marginTop:6 }}>République de Madagascar · Registre civil numérique</p>
        </div>

        <h2 style={{ color:'#fff', fontSize:18, fontWeight:600, marginBottom:20, fontFamily:'Sora,sans-serif' }}>Connexion</h2>

        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:11, padding:'11px 14px', color:'#f87171', fontSize:14, marginBottom:16 }}>
            <Icon name="error_outline" size={18} />
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:15 }}>
          <div className="field">
            <label style={{ color:'rgba(255,255,255,.55)' }}>Email</label>
            <div className="input-wrap">
              <Icon name="mail_outline" size={18} className="input-icon" />
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre@email.mg" required style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'#fff' }} />
            </div>
          </div>

          <div className="field">
            <label style={{ color:'rgba(255,255,255,.55)' }}>Mot de passe</label>
            <div className="input-wrap">
              <Icon name="lock_outline" size={18} className="input-icon" />
              <input className="input" type={show ? 'text' : 'password'} value={mdp} onChange={e=>setMdp(e.target.value)} placeholder="••••••••" required style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'#fff', paddingRight:46 }} />
              <button type="button" onClick={()=>setShow(!show)} style={{ position:'absolute', right:12, background:'none', border:'none', cursor:'pointer', display:'flex', padding:4 }}>
                <Icon name={show ? 'visibility_off' : 'visibility'} size={18} style={{ color:'rgba(255,255,255,.35)' }} />
              </button>
            </div>
          </div>

          <div style={{ textAlign:'right', marginTop:-4 }}>
            <a href="/mot-de-passe-oublie" style={{ color:'#f0b429', fontSize:13, fontWeight:500, textDecoration:'none' }}>Mot de passe oublié ?</a>
          </div>

          <button className="btn btn-gold" type="submit" disabled={loading} style={{ width:'100%', padding:'14px', fontSize:15, marginTop:4, borderRadius:13 }}>
            {loading ? <span className="spinner" style={{ width:18, height:18, borderTopColor:'#0a1830', borderColor:'rgba(10,24,48,.2)' }} /> : <><Icon name="login" size={19} />Se connecter</>}
          </button>
        </form>

        <p style={{ textAlign:'center', color:'rgba(255,255,255,.35)', fontSize:13, marginTop:22 }}>
          Pas de compte ?{' '}
          <a href="/register" style={{ color:'#f0b429', fontWeight:600, textDecoration:'none' }}>S'inscrire</a>
        </p>
        <p style={{ textAlign:'center', color:'rgba(255,255,255,.15)', fontSize:11, marginTop:20 }}>Connexion chiffrée · v2.0 · © 2035</p>
      </div>
    </div>
  );
}
