'use client';
import { useState } from 'react';
import api from '@/lib/api';
import Icon from '@/components/Icon';

export default function MotDePasseOublie() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await api.post('/accounts/mot-de-passe-oublie/', { email }); setDone(true); }
    catch { setError('Email introuvable.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="glass-card fu" style={{ width:'100%', maxWidth:400, padding:'40px 34px', display:'flex', flexDirection:'column', alignItems:'center', gap:18, textAlign:'center' }}>
        <div style={{ width:66, height:66, borderRadius:20, background:'linear-gradient(135deg,#f0b429,#fcd34d)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 28px rgba(240,180,41,.3)' }}>
          <Icon name="lock_reset" size={28} style={{ color:'#0a1830' }} />
        </div>

        {done ? (
          <>
            <Icon name="mark_email_read" size={52} style={{ color:'#10b981' }} />
            <h2 style={{ color:'#fff', fontSize:20, fontWeight:700, fontFamily:'Sora,sans-serif' }}>Email envoyé !</h2>
            <p style={{ color:'rgba(255,255,255,.45)', fontSize:14, lineHeight:1.6 }}>Un nouveau mot de passe a été envoyé à <strong style={{ color:'#f0b429' }}>{email}</strong>.</p>
            <a href="/login" className="btn btn-gold" style={{ marginTop:8, width:'100%', justifyContent:'center', borderRadius:12 }}>
              <Icon name="arrow_back" size={18} />Retour à la connexion
            </a>
          </>
        ) : (
          <>
            <div>
              <h2 style={{ color:'#fff', fontSize:20, fontWeight:700, fontFamily:'Sora,sans-serif' }}>Mot de passe oublié</h2>
              <p style={{ color:'rgba(255,255,255,.4)', fontSize:13, marginTop:6, lineHeight:1.6 }}>Entrez votre email — nous vous enverrons un nouveau mot de passe.</p>
            </div>
            {error && <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:11, padding:'11px 14px', color:'#f87171', fontSize:13, width:'100%' }}><Icon name="error_outline" size={17} />{error}</div>}
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14, width:'100%', textAlign:'left' }}>
              <div className="field">
                <label style={{ color:'rgba(255,255,255,.5)' }}>Adresse email</label>
                <div className="input-wrap">
                  <Icon name="mail_outline" size={17} className="input-icon" />
                  <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre@email.mg" required style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'#fff' }} />
                </div>
              </div>
              <button className="btn btn-gold" type="submit" disabled={loading} style={{ width:'100%', padding:'13px', borderRadius:12 }}>
                {loading ? <span className="spinner" style={{ width:17,height:17,borderTopColor:'#0a1830',borderColor:'rgba(10,24,48,.2)' }} /> : <><Icon name="send" size={18} />Envoyer</>}
              </button>
            </form>
            <a href="/login" style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,.3)', fontSize:13, textDecoration:'none', marginTop:4 }}>
              <Icon name="arrow_back" size={16} />Retour
            </a>
          </>
        )}
      </div>
    </div>
  );
}
