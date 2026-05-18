// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Shield, FileText, Zap } from 'lucide-react';
import { authService } from '../service/authService';

export default function Login() {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState('');
  const [mdp,     setMdp]     = useState('');
  const [showMdp, setShowMdp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await authService.login(email, mdp);
      localStorage.setItem('token', r.data.token);
      localStorage.setItem('role',  r.data.role);
      const role = r.data.role.toLowerCase();
      if      (role === 'citoyen')        navigate('/citoyen/accueil');
      else if (role === 'agent')          navigate('/agent/file-attente');
      else if (role === 'administrateur') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Email ou mot de passe incorrect.');
    } finally { setLoading(false); }
  };

  
  const features = [
    { icon: Shield,   text: 'Connexion sécurisée JWT'    },
    { icon: FileText, text: 'Actes civils numérisés'     },
    { icon: Zap,      text: 'Service rapide et fiable'   },
  ];
  return (
    <div className="min-h-screen flex">

      {/* ══════════════════════════════════════════
          PANNEAU GAUCHE — bleu marine
      ══════════════════════════════════════════ */}
     <div
        className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a3a6b 0%, #0d2348 100%)' }}
      >
        {/* Grille décorative */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(240,180,41,0.08) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Cercles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(240,180,41,0.1) 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(240,180,41,0.07) 0%, transparent 70%)' }} />

        <div className="relative z-10 text-center px-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/logo.png"
              alt="Armoiries Madagascar"
              className="w-36 h-36 object-contain drop-shadow-2xl"
            />
          </div>

          <h1
            className="text-4xl font-bold text-white mb-3"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            e-EtatCivil 2035
          </h1>

          <p className="text-lg font-semibold mb-1" style={{ color: '#f0b429' }}>
            République de Madagascar
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Registre civil numérique officiel
          </p>

          {/* Séparateur */}
          <div className="flex items-center gap-3 my-10 px-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(240,180,41,0.2)' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#f0b429' }} />
            <div className="flex-1 h-px" style={{ background: 'rgba(240,180,41,0.2)' }} />
          </div>

          {/* Features */}
          <div className="flex flex-col gap-4 text-left">
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.2)' }}
                >
                  <Icon size={17} style={{ color: '#f0b429' }} />
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ══════════════════════════════════════════
          PANNEAU DROIT — blanc
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center bg-white p-8 lg:max-w-xl relative overflow-hidden">

        {/* Vague décorative haut gauche */}
        <div
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full"
          style={{ background: 'rgba(26,58,107,0.04)' }}
        />
        {/* Vague décorative bas droite */}
        <div
          className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full"
          style={{ background: 'rgba(240,180,41,0.06)' }}
        />

        <div className="w-full max-w-sm relative z-10">

          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <div className="font-bold text-base" style={{ color: '#1a3a6b', fontFamily: 'Sora, sans-serif' }}>
                e-EtatCivil 2035
              </div>
              <div className="text-xs" style={{ color: '#f0b429' }}>République de Madagascar</div>
            </div>
          </div>

          {/* Titre formulaire */}
          <div className="mb-8">
            {/* Bande or top */}
            <div
              className="h-1 w-12 rounded-full mb-5"
              style={{ background: 'linear-gradient(90deg, #f0b429, #fcd34d)' }}
            />
            <h2
              className="text-3xl font-bold mb-2"
              style={{ color: '#1a3a6b', fontFamily: 'Sora, sans-serif' }}
            >
              Connexion
            </h2>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Accédez à votre espace personnel
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div
              className="flex items-center gap-3 mb-6 p-4 rounded-2xl border"
              style={{
                background: 'rgba(239,68,68,0.05)',
                borderColor: 'rgba(239,68,68,0.2)',
              }}
            >
              <Shield size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div className="form-control gap-2">
              <label className="label py-0">
                <span
                  className="label-text text-sm font-semibold"
                  style={{ color: '#1a3a6b' }}
                >
                  Adresse email
                </span>
              </label>
              <label
                className="input flex items-center gap-3 border-2 bg-gray-50 rounded-2xl transition-all focus-within:bg-white"
                style={{ borderColor: '#e2e8f0' }}
                onFocus={() => {}}
              >
                <Mail size={17} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.mg"
                  required
                  className="grow bg-transparent outline-none text-sm"
                  style={{ color: '#1a3a6b' }}
                />
              </label>
            </div>

            {/* Mot de passe */}
            <div className="form-control gap-2">
              <label className="label py-0">
                <span
                  className="label-text text-sm font-semibold"
                  style={{ color: '#1a3a6b' }}
                >
                  Mot de passe
                </span>
              </label>
              <label
                className="input flex items-center gap-3 border-2 bg-gray-50 rounded-2xl"
                style={{ borderColor: '#e2e8f0' }}
              >
                <Lock size={17} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <input
                  type={showMdp ? 'text' : 'password'}
                  value={mdp}
                  onChange={e => setMdp(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="grow bg-transparent outline-none text-sm"
                  style={{ color: '#1a3a6b' }}
                />
                <button
                  type="button"
                  onClick={() => setShowMdp(!showMdp)}
                  className="btn btn-ghost btn-xs p-1"
                  style={{ color: '#94a3b8' }}
                >
                  {showMdp ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>

              <div className="text-right mt-1">
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-xs font-semibold hover:underline"
                  style={{ color: '#f0b429' }}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="btn w-full mt-3 border-0 text-base font-bold gap-2 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #1a3a6b, #2456a0)',
                color: '#fff',
                height: 52,
                fontFamily: 'Sora, sans-serif',
                boxShadow: '0 4px 24px rgba(26,58,107,0.35)',
              }}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <LogIn size={19} />
                  Se connecter
                </>
              )}
            </button>

            {/* Bouton or secondaire */}
            <div
              className="h-px w-full"
              style={{ background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)' }}
            />

            <Link
              to="/register"
              className="btn w-full border-2 bg-transparent font-semibold gap-2 rounded-2xl"
              style={{
                borderColor: '#f0b429',
                color: '#f0b429',
                height: 48,
                fontFamily: 'Sora, sans-serif',
              }}
            >
              Créer un compte citoyen
            </Link>
          </form>

          {/* Footer */}
          <p
            className="text-center mt-8 text-xs"
            style={{ color: '#cbd5e1' }}
          >
            Connexion chiffrée · v2.0 · © 2035
          </p>
        </div>
      </div>
    </div>
  );
}