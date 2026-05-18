// src/pages/Profil.tsx
import { useState, useEffect } from 'react';
import { User, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';
import SharedLayout from '../components/SharedLayout';
import { authService } from '../service/authService';
import type { Utilisateur, UpdateProfilPayload } from '../type';

export default function Profil() {
  const [profil,  setProfil]  = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [msg,     setMsg]     = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [form, setForm] = useState({
    nom_user    : '',
    prenom_user : '',
    ancien_mdp  : '',
    nouveau_mdp : '',
    confirmer   : '',
  });

  useEffect(() => {
    authService.getProfil()
      .then(r => {
        setProfil(r.data);
        setForm(p => ({
          ...p,
          nom_user    : r.data.nom_user,
          prenom_user : r.data.prenom_user,
        }));
      })
      .catch(() => setMsg({ type: 'err', text: 'Impossible de charger le profil.' }))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nouveau_mdp && form.nouveau_mdp !== form.confirmer) {
      setMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    setSaving(true);
    try {
      const payload: UpdateProfilPayload = {
        nom_user    : form.nom_user,
        prenom_user : form.prenom_user,
      };
      if (form.nouveau_mdp) {
        payload.ancien_mdp = form.ancien_mdp;
        payload.mdp_user   = form.nouveau_mdp;
      }
      const r = await authService.updateProfil(payload);
      if (r.data.token) localStorage.setItem('token', r.data.token);
      setMsg({ type: 'ok', text: 'Profil mis à jour avec succès.' });
      setShowPwd(false);
      setForm(p => ({ ...p, ancien_mdp: '', nouveau_mdp: '', confirmer: '' }));
      setTimeout(() => { window.location.reload(); }, 1500);
    } catch (err: any) {
      const msgBackend = err?.response?.data?.error
        || err?.response?.data?.detail
        || 'Erreur lors de la mise à jour.';
      setMsg({ type: 'err', text: String(msgBackend) });
      setSaving(false);
    }
  };

  const initiales = profil
    ? `${profil.nom_user?.[0] ?? ''}${profil.prenom_user?.[0] ?? ''}`.toUpperCase()
    : '?';

  if (loading) return (
    <SharedLayout>
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg" style={{ color: '#1a3a6b' }} />
      </div>
    </SharedLayout>
  );

  return (
    <SharedLayout>
      {/* Centré + largeur maximale confortable */}
      <div className="flex flex-col items-center w-full">
        <div className="w-full" style={{ maxWidth: 700 }}>

          {/* ── Avatar card ─────────────────────────────────────────────────── */}
          <div
            className="bg-white rounded-2xl p-8 flex items-center gap-6 mb-6"
            style={{
              boxShadow  : '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
              border     : '1px solid #f1f5f9',
            }}
          >
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0"
              style={{
                background : 'linear-gradient(135deg, #f0b429, #fcd34d)',
                color      : '#0a1830',
                boxShadow  : '0 8px 24px rgba(240,180,41,0.3)',
              }}
            >
              {initiales}
            </div>

            {/* Infos */}
            <div className="flex flex-col gap-2">
              <h2
                className="text-2xl font-bold"
                style={{ color: '#1a3a6b', fontFamily: 'Sora, sans-serif' }}
              >
                {profil?.nom_user} {profil?.prenom_user}
              </h2>
              <p className="text-sm" style={{ color: '#94a3b8' }}>{profil?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="badge font-semibold px-3 py-2"
                  style={{ background: 'rgba(26,58,107,0.1)', color: '#1a3a6b', border: 'none', borderRadius: 8 }}
                >
                  {profil?.role}
                </span>
                {profil?.nom_commune && (
                  <span
                    className="badge font-medium px-3 py-2"
                    style={{ background: 'rgba(240,180,41,0.1)', color: '#b45309', border: 'none', borderRadius: 8 }}
                  >
                    {profil.nom_commune}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Message flash ───────────────────────────────────────────────── */}
          {msg && (
            <div
              className="flex items-center gap-3 p-4 rounded-2xl mb-6"
              style={{
                background : msg.type === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border     : `1px solid ${msg.type === 'ok' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}
            >
              {msg.type === 'ok'
                ? <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                : <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
              }
              <span
                className="text-sm font-medium"
                style={{ color: msg.type === 'ok' ? '#047857' : '#b91c1c' }}
              >
                {msg.text}
              </span>
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-6">

            {/* ── Informations personnelles ──────────────────────────────────── */}
            <div
              className="bg-white rounded-2xl p-8"
              style={{
                boxShadow : '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                border    : '1px solid #f1f5f9',
              }}
            >
              {/* Titre section */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(26,58,107,0.1)' }}
                >
                  <User size={18} style={{ color: '#1a3a6b' }} />
                </div>
                <h3
                  className="font-bold text-base"
                  style={{ color: '#1a3a6b', fontFamily: 'Sora, sans-serif' }}
                >
                  Informations personnelles
                </h3>
              </div>

              {/* Prénom + Nom */}
              <div className="grid grid-cols-2 gap-5 mb-5">
                {[
                  { key: 'prenom_user', label: 'Prénom', placeholder: 'Votre prénom' },
                  { key: 'nom_user',    label: 'Nom',    placeholder: 'Votre nom'    },
                ].map(({ key, label, placeholder }) => (
                  <div className="form-control gap-2" key={key}>
                    <label className="label py-0">
                      <span className="label-text text-sm font-semibold" style={{ color: '#64748b' }}>
                        {label}
                      </span>
                    </label>
                    <input
                      className="input border-2 rounded-xl text-sm w-full"
                      style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#334155', height: 46 }}
                      value={(form as any)[key]}
                      onChange={e => set(key, e.target.value)}
                      placeholder={placeholder}
                      aria-label={label}
                    />
                  </div>
                ))}
              </div>

              {/* Email */}
              <div className="form-control gap-2 mb-5">
                <label className="label py-0">
                  <span className="label-text text-sm font-semibold" style={{ color: '#64748b' }}>
                    Email (non modifiable)
                  </span>
                </label>
                <input
                  className="input border-2 rounded-xl text-sm w-full"
                  style={{ borderColor: '#e2e8f0', background: '#f1f5f9', color: '#94a3b8', height: 46 }}
                  value={profil?.email ?? ''}
                  placeholder="Email"
                  aria-label="Email"
                  disabled
                />
              </div>

              {/* Commune + Arrondissement */}
              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: 'Commune',         value: profil?.nom_commune      ?? '' },
                  { label: 'Arrondissement',  value: profil?.nom_arondissement ?? '' },
                ].map(({ label, value }) => (
                  <div className="form-control gap-2" key={label}>
                    <label className="label py-0">
                      <span className="label-text text-sm font-semibold" style={{ color: '#64748b' }}>
                        {label}
                      </span>
                    </label>
                    <input
                      className="input border-2 rounded-xl text-sm w-full"
                      style={{ borderColor: '#e2e8f0', background: '#f1f5f9', color: '#94a3b8', height: 46 }}
                      value={value}
                      placeholder={label}
                      aria-label={label}
                      disabled
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Mot de passe ───────────────────────────────────────────────── */}
            <div
              className="bg-white rounded-2xl p-8"
              style={{
                boxShadow : '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                border    : '1px solid #f1f5f9',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(26,58,107,0.1)' }}
                  >
                    <Lock size={18} style={{ color: '#1a3a6b' }} />
                  </div>
                  <h3
                    className="font-bold text-base"
                    style={{ color: '#1a3a6b', fontFamily: 'Sora, sans-serif' }}
                  >
                    Changer le mot de passe
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#1a3a6b', fontWeight: 600 }}
                >
                  {showPwd ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              {!showPwd && (
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Cliquez sur "Modifier" pour changer votre mot de passe.
                </p>
              )}

              {showPwd && (
                <div className="flex flex-col gap-5">
                  {[
                    { key: 'ancien_mdp',  label: 'Ancien mot de passe',  placeholder: 'Votre ancien mot de passe' },
                    { key: 'nouveau_mdp', label: 'Nouveau mot de passe',  placeholder: 'Votre nouveau mot de passe' },
                    { key: 'confirmer',   label: 'Confirmer le nouveau',  placeholder: 'Répétez le nouveau mot de passe' },
                  ].map(({ key, label, placeholder }) => (
                    <div className="form-control gap-2" key={key}>
                      <label className="label py-0">
                        <span className="label-text text-sm font-semibold" style={{ color: '#64748b' }}>
                          {label}
                        </span>
                      </label>
                      <label
                        className="input flex items-center gap-3 border-2"
                        style={{ borderColor: '#e2e8f0', borderRadius: 12, background: '#f8fafc', height: 46 }}
                      >
                        <Lock size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <input
                          type="password"
                          className="grow bg-transparent outline-none text-sm"
                          style={{ color: '#334155' }}
                          value={(form as any)[key]}
                          onChange={e => set(key, e.target.value)}
                          placeholder={placeholder}
                          aria-label={label}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Bouton save ────────────────────────────────────────────────── */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn border-0 gap-2 font-bold"
                style={{
                  background   : 'linear-gradient(135deg, #1a3a6b, #2456a0)',
                  color        : '#fff',
                  borderRadius : 12,
                  height       : 50,
                  minWidth     : 200,
                  fontFamily   : 'Sora, sans-serif',
                  boxShadow    : '0 4px 14px rgba(26,58,107,0.35)',
                }}
              >
                {saving
                  ? <span className="loading loading-spinner loading-sm" />
                  : <><Save size={18} />Enregistrer les modifications</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </SharedLayout>
  );
}