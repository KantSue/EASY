import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, ArrowLeft, MailCheck, AlertCircle } from 'lucide-react';
import { authService } from '../service/authService';

export default function MotDePasseOublie() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authService.motDePasseOublie(email);
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Email introuvable.');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(26,58,107,0.4), transparent 60%), linear-gradient(160deg, #020c1b, #060f1e 40%, #0a1830)',
      }}
    >
      <div
        className="w-full flex flex-col items-center text-center gap-5"
        style={{
          maxWidth       : 420,
          background     : 'rgba(255,255,255,0.04)',
          backdropFilter : 'blur(24px)',
          border         : '1px solid rgba(255,255,255,0.09)',
          borderRadius   : 24,
          padding        : '40px 36px',
        }}
      >
        {/* Icône */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background : 'linear-gradient(135deg, #f0b429, #fcd34d)',
            boxShadow  : '0 8px 28px rgba(240,180,41,0.35)',
          }}
        >
          <Mail size={28} style={{ color: '#0a1830' }} />
        </div>

        {done ? (
          <>
            <MailCheck size={52} style={{ color: '#10b981' }} />
            <div>
              <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                Email envoyé !
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                Un nouveau mot de passe a été envoyé à{' '}
                <strong style={{ color: '#f0b429' }}>{email}</strong>.
              </p>
            </div>
            <Link
              to="/login"
              className="btn border-0 gap-2 font-bold w-full"
              style={{
                background   : 'linear-gradient(135deg, #f0b429, #fcd34d)',
                color        : '#0a1830',
                borderRadius : 12,
                height       : 50,
                fontFamily   : 'Sora, sans-serif',
              }}
            >
              <ArrowLeft size={18} />
              Retour à la connexion
            </Link>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                Mot de passe oublié
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                Entrez votre email — nous vous enverrons un nouveau mot de passe.
              </p>
            </div>

            {error && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl w-full text-left"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <AlertCircle size={17} style={{ color: '#f87171', flexShrink: 0 }} />
                <span className="text-sm" style={{ color: '#f87171' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full text-left">
              <div className="form-control gap-2">
                <label className="label py-0">
                  <span className="label-text text-sm font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Adresse email
                  </span>
                </label>
                <label
                  className="input flex items-center gap-3 border"
                  style={{
                    background   : 'rgba(255,255,255,0.06)',
                    borderColor  : 'rgba(255,255,255,0.12)',
                    borderRadius : 12,
                  }}
                >
                  <Mail size={17} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.mg"
                    required
                    className="grow bg-transparent outline-none text-sm placeholder:opacity-30"
                    style={{ color: '#fff' }}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn border-0 gap-2 font-bold w-full"
                style={{
                  background   : 'linear-gradient(135deg, #f0b429, #fcd34d)',
                  color        : '#0a1830',
                  borderRadius : 12,
                  height       : 50,
                  fontFamily   : 'Sora, sans-serif',
                  boxShadow    : '0 4px 20px rgba(240,180,41,0.4)',
                }}
              >
                {loading
                  ? <span className="loading loading-spinner loading-sm" style={{ borderTopColor: '#0a1830' }} />
                  : <><Send size={17} />Envoyer</>
                }
              </button>
            </form>

            <Link
              to="/login"
              className="flex items-center gap-2 text-sm"
              style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
            >
              <ArrowLeft size={15} />
              Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}