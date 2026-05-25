/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/register.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Mail, Lock, Eye, EyeOff, User,
  UserPlus, FileText, Zap, AlertCircle,
} from 'lucide-react';
import { authService } from '../service/authService';
import type { Commune } from '../type';

export default function Register() {
  const navigate    = useNavigate();
  const { t, i18n } = useTranslation();

  const [nom,       setNom]       = useState('');
  const [prenom,    setPrenom]    = useState('');
  const [email,     setEmail]     = useState('');
  const [mdp,       setMdp]       = useState('');
  const [mdp2,      setMdp2]      = useState('');
  const [showMdp,   setShowMdp]   = useState(false);
  const [showMdp2,  setShowMdp2]  = useState(false);
  const [communes,  setCommunes]  = useState<Commune[]>([]);
  const [arronds,   setArronds]   = useState<any[]>([]);
  const [communeId, setCommuneId] = useState('');
  const [arrondId,  setArrondId]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const toggleLang = () => {
    const next = i18n.language === 'fr' ? 'mg' : 'fr';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  // ── Charger communes ──
  useEffect(() => {
    authService.getCommunes()
      .then(r => setCommunes(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const onCommuneChange = (id: string) => {
    setCommuneId(id);
    setArrondId('');
    const c = communes.find((c: any) => String(c.id_commune) === id);
    setArronds((c as any)?.arrondissements ?? []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mdp !== mdp2)    { setError(t('register.mdp_mismatch')); return; }
    if (mdp.length < 6)  { setError(t('register.mdp_court'));    return; }
    if (!communeId)      { setError(t('register.commune_req'));   return; }
    if (!arrondId)       { setError(t('register.arrond_req'));    return; }

    setLoading(true);
    try {
      await authService.register({
        nom_user        : nom,
        prenom_user     : prenom,
        email,
        mdp_user        : mdp,
        id_commune      : communeId,
        id_arondissement: arrondId,
      });
      navigate('/login');
    } catch (err: any) {
      const data = err?.response?.data;
      const msg  = data?.detail || data?.error || data?.email?.[0]
        || Object.values(data ?? {}).flat().join(' ') || t('register.erreur');
      setError(String(msg));
    } finally { setLoading(false); }
  };

  const features = [
    { icon: FileText, text: t('login.feature2') },
    { icon: Zap,      text: t('login.feature3') },
  ];

return (
    <div className="min-h-screen flex">

     {/* ══ Panneau gauche ══ */}
<div
  className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden"
  style={{ minHeight:'100vh' }}
>
  {/* ── Image de fond ── */}
  <img
    src="/logo1.png"
    alt=""
    className="absolute inset-0 w-full h-full object-cover"
    style={{  transform:'scale(1.05)' }}
  />

  {/* ── Overlay bleu transparent ── */}
  <div
    className="absolute inset-0"
    style={{ background:'linear-gradient(190deg,rgba(26,58,107,0.88) 0%,rgba(13,35,72,0.92) 100%)' }}
  />

  {/* ── Grille décorative ── */}
  <div
    className="absolute inset-0"
    style={{ backgroundImage:'radial-gradient(circle at 1px 1px,rgba(240,180,41,0.08) 1px,transparent 0)', backgroundSize:'40px 40px' }}
  />

  {/* ── Cercles lumineux ── */}
  <div className="absolute top-20 right-20 w-64 h-64 rounded-full"
    style={{ background:'radial-gradient(circle,rgba(240,180,41,0.1) 0%,transparent 70%)' }} />
  <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full"
    style={{ background:'radial-gradient(circle,rgba(240,180,41,0.07) 0%,transparent 70%)' }} />

  {/* ── Contenu centré ── */}
  <div className="relative z-10 flex flex-col items-center text-center px-12 w-full">

    {/* Logo avec anneau doré */}
    <div className="flex flex-col items-center mb-8">
      <div className="relative mb-5">
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background:'rgba(240,180,41,0.35)' }}
        />
        <div
          className="relative w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background : 'linear-gradient(145deg,rgba(240,180,41,0.15),rgba(240,180,41,0.03))',
            border     : '1px solid rgba(240,180,41,0.3)',
            boxShadow  : '0 0 40px rgba(240,180,41,0.2), inset 0 0 20px rgba(240,180,41,0.05)',
          }}
        >
          <img
            src="/logo4.png"
            alt="Armoiries Madagascar"
            className="w-24 h-24 object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </div>

    {/* Titre */}
    <h1
      className="text-5xl font-bold tracking-tight mb-2"
      style={{
        fontFamily           : 'Sora,sans-serif',
        background           : 'linear-gradient(180deg,#ffffff 0%,#e8c97a 100%)',
        WebkitBackgroundClip : 'text',
        WebkitTextFillColor  : 'transparent',
      }}
    >
      EaSy
    </h1>
    <p className="text-lg font-semibold mb-1" style={{ color:'#f0b429' }}>
      {t('login.republique')}
    </p>
    <p className="text-sm" style={{ color:'rgba(255,255,255,0.4)' }}>
      {t('login.registre')}
    </p>

    {/* Séparateur */}
    <div className="flex items-center gap-3 my-10 px-4 w-full">
      <div className="flex-1 h-px" style={{ background:'rgba(240,180,41,0.2)' }} />
      <div className="w-2 h-2 rounded-full" style={{ background:'#f0b429' }} />
      <div className="flex-1 h-px" style={{ background:'rgba(240,180,41,0.2)' }} />
    </div>

    {/* Features + logo armoiries */}
    <div className="flex flex-row items-center gap-12 w-full justify-center">
      <div className="flex flex-col gap-4 text-left">
        {features.map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:'rgba(240,180,41,0.12)', border:'1px solid rgba(240,180,41,0.2)' }}
            >
              <Icon size={17} style={{ color:'#f0b429' }} />
            </div>
            <span className="text-sm" style={{ color:'rgba(255,255,255,0.6)' }}>{text}</span>
          </div>
        ))}
      </div>

      
    </div>
  </div>
</div>
      {/* ══ Panneau droit ══ */}
      <div
        className="flex-1 flex items-start justify-center bg-white lg:max-w-xl relative overflow-y-auto"
        style={{ maxHeight:'100vh' }}
      >
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full" style={{ background:'rgba(26,58,107,0.04)' }} />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full" style={{ background:'rgba(240,180,41,0.06)' }} />

        <div className="w-full max-w-sm relative z-10 px-8 py-10 my-auto">

          {/* Toggle langue */}
          <div className="flex justify-end mb-4">
            <button onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all"
              style={{
                background : i18n.language === 'mg' ? 'rgba(240,180,41,0.15)' : 'rgba(26,58,107,0.08)',
                color      : i18n.language === 'mg' ? '#b45309' : '#1a3a6b',
                border     : `1px solid ${i18n.language === 'mg' ? 'rgba(240,180,41,0.3)' : 'rgba(26,58,107,0.15)'}`,
                fontFamily : 'Sora,sans-serif',
              }}>
              {i18n.language === 'fr' ? '🇲🇬 MG' : '🇫🇷 FR'}
            </button>
          </div>

          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <div className="font-bold text-base" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>e-EtatCivil 2035</div>
              <div className="text-xs" style={{ color:'#f0b429' }}>{t('login.republique')}</div>
            </div>
          </div>

          {/* Titre */}
          <div className="mb-5">
            <div className="h-1 w-12 rounded-full mb-4" style={{ background:'linear-gradient(90deg,#f0b429,#fcd34d)' }} />
            <h2 className="text-3xl font-bold mb-1" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
              {t('register.titre')}
            </h2>
            <p className="text-sm" style={{ color:'#94a3b8' }}>{t('register.sous_titre')}</p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl border"
              style={{ background:'rgba(239,68,68,0.05)', borderColor:'rgba(239,68,68,0.2)' }}>
              <AlertCircle size={16} style={{ color:'#ef4444', flexShrink:0 }} />
              <span className="text-sm" style={{ color:'#ef4444' }}>{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('personne.prenom'), val: prenom, set: setPrenom, ph:'Jean'   },
                { label: t('personne.nom'),    val: nom,    set: setNom,    ph:'Rakoto' },
              ].map(({ label, val, set, ph }) => (
                <div className="form-control gap-1" key={label}>
                  <label className="label py-0">
                    <span className="label-text text-xs font-semibold" style={{ color:'#1a3a6b' }}>{label} *</span>
                  </label>
                  <label className="input flex items-center gap-2 border-2 bg-gray-50 rounded-2xl" style={{ borderColor:'#e2e8f0' }}>
                    <User size={14} style={{ color:'#94a3b8', flexShrink:0 }} />
                    <input type="text" value={val} onChange={e => set(e.target.value)}
                      placeholder={ph} required
                      className="grow bg-transparent outline-none text-sm" style={{ color:'#1a3a6b' }} />
                  </label>
                </div>
              ))}
            </div>

            {/* Email */}
            <div className="form-control gap-1">
              <label className="label py-0">
                <span className="label-text text-sm font-semibold" style={{ color:'#1a3a6b' }}>{t('auth.email')} *</span>
              </label>
              <label className="input flex items-center gap-3 border-2 bg-gray-50 rounded-2xl focus-within:bg-white transition-all" style={{ borderColor:'#e2e8f0' }}>
                <Mail size={17} style={{ color:'#94a3b8', flexShrink:0 }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.mg" required
                  className="grow bg-transparent outline-none text-sm" style={{ color:'#1a3a6b' }} />
              </label>
            </div>

            {/* Commune + Arrondissement */}
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control gap-1">
                <label className="label py-0">
                  <span className="label-text text-xs font-semibold" style={{ color:'#1a3a6b' }}>{t('demande.commune')} *</span>
                </label>
                <select className="select border-2 rounded-2xl text-sm w-full"
                  style={{ borderColor:'#e2e8f0', background:'#f8fafc', color:'#334155', height:44 }}
                  value={communeId} onChange={e => onCommuneChange(e.target.value)} required>
                  <option value="">{t('demande.choisir_commune')}</option>
                  {communes.map((c: any) => (
                    <option key={c.id_commune} value={c.id_commune}>{c.nom_commune}</option>
                  ))}
                </select>
              </div>
              <div className="form-control gap-1">
                <label className="label py-0">
                  <span className="label-text text-xs font-semibold" style={{ color:'#1a3a6b' }}>{t('demande.arrondissement')} *</span>
                </label>
                <select className="select border-2 rounded-2xl text-sm w-full"
                  style={{ borderColor:'#e2e8f0', background:'#f8fafc', color:'#334155', height:44, opacity: communeId ? 1 : 0.5 }}
                  value={arrondId} onChange={e => setArrondId(e.target.value)}
                  disabled={!communeId || arronds.length === 0} required>
                  <option value="">{t('demande.choisir_arrond')}</option>
                  {arronds.map((a: any) => (
                    <option key={a.id_arondissement} value={a.id_arondissement}>{a.nom_arondissement}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mot de passe */}
            <div className="form-control gap-1">
              <label className="label py-0">
                <span className="label-text text-sm font-semibold" style={{ color:'#1a3a6b' }}>{t('auth.mot_de_passe')} *</span>
              </label>
              <label className="input flex items-center gap-3 border-2 bg-gray-50 rounded-2xl" style={{ borderColor:'#e2e8f0' }}>
                <Lock size={17} style={{ color:'#94a3b8', flexShrink:0 }} />
                <input type={showMdp ? 'text' : 'password'} value={mdp} onChange={e => setMdp(e.target.value)}
                  placeholder="••••••••" required
                  className="grow bg-transparent outline-none text-sm" style={{ color:'#1a3a6b' }} />
                <button type="button" onClick={() => setShowMdp(!showMdp)}
                  className="btn btn-ghost btn-xs p-1" style={{ color:'#94a3b8' }}>
                  {showMdp ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </label>
            </div>

            {/* Confirmer mot de passe */}
            <div className="form-control gap-1">
              <label className="label py-0">
                <span className="label-text text-sm font-semibold" style={{ color:'#1a3a6b' }}>{t('register.confirmer_mdp')} *</span>
              </label>
              <label className="input flex items-center gap-3 border-2 bg-gray-50 rounded-2xl"
                style={{ borderColor: mdp2 && mdp !== mdp2 ? '#ef4444' : '#e2e8f0' }}>
                <Lock size={17} style={{ color:'#94a3b8', flexShrink:0 }} />
                <input type={showMdp2 ? 'text' : 'password'} value={mdp2} onChange={e => setMdp2(e.target.value)}
                  placeholder="••••••••" required
                  className="grow bg-transparent outline-none text-sm" style={{ color:'#1a3a6b' }} />
                <button type="button" onClick={() => setShowMdp2(!showMdp2)}
                  className="btn btn-ghost btn-xs p-1" style={{ color:'#94a3b8' }}>
                  {showMdp2 ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </label>
              {mdp2 && mdp !== mdp2 && (
                <p className="text-xs mt-1" style={{ color:'#ef4444' }}>{t('register.mdp_mismatch')}</p>
              )}
            </div>

            {/* Bouton créer */}
            <button type="submit" disabled={loading}
              className="btn w-full mt-1 border-0 text-base font-bold gap-2 rounded-2xl"
              style={{ background:'linear-gradient(135deg,#1a3a6b,#2456a0)', color:'#fff', height:52, fontFamily:'Sora,sans-serif', boxShadow:'0 4px 24px rgba(26,58,107,0.35)' }}>
              {loading
                ? <span className="loading loading-spinner loading-sm" />
                : <><UserPlus size={19}/>{t('register.creer_btn')}</>
              }
            </button>

            <div className="h-px w-full" style={{ background:'linear-gradient(90deg,transparent,#e2e8f0,transparent)' }} />

            <Link to="/login"
              className="btn w-full border-2 bg-transparent font-semibold gap-2 rounded-2xl"
              style={{ borderColor:'#f0b429', color:'#f0b429', height:48, fontFamily:'Sora,sans-serif' }}>
              {t('register.deja_compte')}
            </Link>
          </form>

          <p className="text-center mt-5 text-xs" style={{ color:'#cbd5e1' }}>
            {t('login.footer')}
          </p>
        </div>
      </div>
    </div>
  );
}