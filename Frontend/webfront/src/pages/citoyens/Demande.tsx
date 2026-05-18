// src/pages/citoyen/Demande.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, CheckCircle, AlertCircle,
  ChevronRight, Minus, Plus, MapPin,
} from 'lucide-react';
import SharedLayout from '../../components/SharedLayout';
import { authService }           from '../../service/authService';
import { arrondissementService } from '../../service/arrondissementService';
import type { Commune, DijkstraResult } from '../../type';

// ─── Types locaux ─────────────────────────────────────────────────────────────
interface PersonneForm {
  nom: string; prenom: string; date_naissance: string;
  lieu_naiss: string; sexe: string; profession: string;
}

const PERSONNE_VIDE = (sexe = 'M'): PersonneForm =>
  ({ nom:'', prenom:'', date_naissance:'', lieu_naiss:'', sexe, profession:'' });

const TYPES_ACTES = [
  {
    id   : 1, label:'Acte de naissance', sous:'Certificat de naissance officiel',
    color:'#0891b2', bg:'rgba(8,145,178,0.08)',
    svg  : (
      <svg viewBox="0 0 120 100" width="120" height="100">
        <ellipse cx="60" cy="75" rx="35" ry="8" fill="rgba(8,145,178,0.1)"/>
        <rect x="38" y="50" width="44" height="28" rx="14" fill="#0891b2"/>
        <circle cx="60" cy="40" r="16" fill="#fcd34d"/>
        <circle cx="54" cy="38" r="2.5" fill="#1a3a6b"/>
        <circle cx="66" cy="38" r="2.5" fill="#1a3a6b"/>
        <path d="M54 45 Q60 50 66 45" stroke="#1a3a6b" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <text x="20" y="30" fontSize="14" fill="#f0b429">★</text>
        <text x="88" y="25" fontSize="10" fill="#f0b429">★</text>
        <rect x="72" y="55" width="22" height="28" rx="3" fill="#fff" stroke="#0891b2" strokeWidth="1.5"/>
        <line x1="76" y1="62" x2="90" y2="62" stroke="#0891b2" strokeWidth="1.5"/>
        <line x1="76" y1="67" x2="90" y2="67" stroke="#0891b2" strokeWidth="1"/>
        <line x1="76" y1="72" x2="86" y2="72" stroke="#0891b2" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id   : 2, label:'Acte de décès', sous:'Certificat de décès officiel',
    color:'#7c3aed', bg:'rgba(124,58,237,0.08)',
    svg  : (
      <svg viewBox="0 0 120 100" width="120" height="100">
        <ellipse cx="60" cy="82" rx="35" ry="7" fill="rgba(124,58,237,0.1)"/>
        <rect x="52" y="18" width="16" height="48" rx="4" fill="#7c3aed"/>
        <rect x="38" y="30" width="44" height="16" rx="4" fill="#7c3aed"/>
        <circle cx="25" cy="25" r="3" fill="rgba(124,58,237,0.3)"/>
        <circle cx="95" cy="20" r="4" fill="rgba(124,58,237,0.3)"/>
        <rect x="30" y="60" width="60" height="25" rx="4" fill="#fff" stroke="#7c3aed" strokeWidth="1.5"/>
        <line x1="38" y1="68" x2="82" y2="68" stroke="#7c3aed" strokeWidth="1.5"/>
        <line x1="38" y1="74" x2="75" y2="74" stroke="#7c3aed" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id   : 3, label:'Acte de mariage', sous:'Certificat de mariage officiel',
    color:'#e11d48', bg:'rgba(225,29,72,0.08)',
    svg  : (
      <svg viewBox="0 0 120 100" width="120" height="100">
        <ellipse cx="60" cy="85" rx="38" ry="7" fill="rgba(225,29,72,0.1)"/>
        <circle cx="38" cy="32" r="12" fill="#fcd34d"/>
        <rect x="26" y="46" width="24" height="30" rx="8" fill="#1a3a6b"/>
        <circle cx="82" cy="32" r="12" fill="#fcd34d"/>
        <path d="M68 58 Q82 52 96 58 L100 76 Q82 80 64 76 Z" fill="#e11d48"/>
        <path d="M53 42 C53 38 47 35 44 39 C41 35 35 38 35 42 C35 48 44 55 44 55 C44 55 53 48 53 42 Z"
          fill="#e11d48" transform="translate(16,-4) scale(0.85)"/>
        <circle cx="60" cy="50" r="5" fill="none" stroke="#f0b429" strokeWidth="2.5"/>
      </svg>
    ),
  },
];

const STEPS = ["Type d'acte", 'Informations', 'Paiement'];

const isDateValide = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

// ─── Composant principal ──────────────────────────────────────────────────────
export default function CitoyenDemande() {
  const navigate = useNavigate();

  const [step,       setStep]       = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [msg,        setMsg]        = useState<{ type:'ok'|'err'; text:string } | null>(null);
  const [idCitoyen,  setIdCitoyen]  = useState<number | null>(null);

  const [typeActe,   setTypeActe]   = useState(1);
  const [numActe,    setNumActe]    = useState('');
  const [photo,      setPhoto]      = useState<File | null>(null);
  const [photoUrl,   setPhotoUrl]   = useState('');
  const [communes,   setCommunes]   = useState<Commune[]>([]);
  const [arronds,    setArronds]    = useState<any[]>([]);
  const [communeId,  setCommuneId]  = useState('');
  const [arrondId,   setArrondId]   = useState('');
  const [dijkstra,   setDijkstra]   = useState<DijkstraResult | null>(null);
  const [checkDispo, setCheckDispo] = useState(false);
  const [tel,        setTel]        = useState('');
  const [nbEx,       setNbEx]       = useState(1);
  const montant = nbEx * 1000;

  const [enfant, setEnfant] = useState<PersonneForm>(PERSONNE_VIDE('F'));
  const [pere,   setPere]   = useState<PersonneForm>(PERSONNE_VIDE('M'));
  const [mere,   setMere]   = useState<PersonneForm>(PERSONNE_VIDE('F'));
  const [defunt, setDefunt] = useState<PersonneForm>(PERSONNE_VIDE('M'));
  const [epoux1, setEpoux1] = useState<PersonneForm>(PERSONNE_VIDE('M'));
  const [epoux2, setEpoux2] = useState<PersonneForm>(PERSONNE_VIDE('F'));

  // ── Chargement initial ──
  useEffect(() => {
    authService.getProfil()
      .then(r => setIdCitoyen(r.data.id_user))
      .catch(() => {});
    authService.getCommunes()
      .then(r => setCommunes(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  // ── Handlers ──
  const onCommuneChange = (id: string) => {
    setCommuneId(id);
    setArrondId('');
    setDijkstra(null);
    const c = communes.find((c: any) => String(c.id_commune) === id);
    setArronds((c as any)?.arrondissements ?? []);
  };

  const onArrondChange = async (id: string) => {
    setArrondId(id);
    setDijkstra(null);
    if (!id) return;
    setCheckDispo(true);
    try {
      const r = await arrondissementService.verifier(Number(id));
      setDijkstra(r.data);
    } catch {} finally { setCheckDispo(false); }
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPhotoUrl(URL.createObjectURL(f));
  };

  // ── Validation étape 2 ──
  const validerEtape2 = () => {
    if (!numActe.trim()) { setMsg({ type:'err', text:"Le numéro d'acte est obligatoire." }); return; }
    if (!photo)          { setMsg({ type:'err', text:"La photo CIN est obligatoire." }); return; }
    if (!communeId)      { setMsg({ type:'err', text:"Sélectionnez une commune." }); return; }

    if (typeActe === 1) {
      if (!enfant.nom || !enfant.prenom || !enfant.date_naissance || !pere.nom || !mere.nom) {
        setMsg({ type:'err', text:"Remplissez toutes les informations de l'enfant, père et mère." }); return;
      }
      if (!isDateValide(enfant.date_naissance)) {
        setMsg({ type:'err', text:"Date naissance enfant invalide — format : AAAA-MM-JJ" }); return;
      }
    }
    if (typeActe === 2) {
      if (!defunt.nom || !defunt.prenom || !defunt.date_naissance) {
        setMsg({ type:'err', text:"Remplissez les informations du défunt." }); return;
      }
      if (!isDateValide(defunt.date_naissance)) {
        setMsg({ type:'err', text:"Date naissance défunt invalide — format : AAAA-MM-JJ" }); return;
      }
    }
    if (typeActe === 3) {
      if (!epoux1.nom || !epoux2.nom) {
        setMsg({ type:'err', text:"Remplissez les informations des deux époux." }); return;
      }
    }
    setMsg(null);
    setStep(3);
  };

  

  // ── Soumission ──
 const handleSoumettre = async () => {
  if (!tel.trim()) { setMsg({ type:'err', text:'Entrez votre numéro MVola.' }); return; }
  if (!photo)      { setMsg({ type:'err', text:'La photo CIN est obligatoire.' }); return; }
  setLoading(true); setMsg(null);
  try {
    const base  = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('numero_tel',     tel);
    formData.append('id_type_acte',   String(typeActe));
    formData.append('num_acte',       numActe);
    formData.append('id_commune',     communeId);
    formData.append('nb_exemplaires', String(nbEx));
    formData.append('photo_ci',       photo);

    if (arrondId) formData.append('id_arrondissement', arrondId);

    // Personnes — strings JSON dans FormData
    const buildP = (p: PersonneForm) => JSON.stringify({
      nom_personne    : p.nom,
      prenom_personne : p.prenom,
      date_naissance  : `${p.date_naissance} 00:00:00`,
      lieu_naiss      : p.lieu_naiss,
      sexe            : p.sexe,
      profession      : p.profession || 'Neant',
    });

    if (typeActe === 1) {
      formData.append('enfant', buildP(enfant));
      formData.append('pere',   buildP(pere));
      formData.append('mere',   buildP(mere));
    } else if (typeActe === 2) {
      formData.append('defunt', buildP(defunt));
    } else if (typeActe === 3) {
      formData.append('epoux1', buildP(epoux1));
      formData.append('epoux2', buildP(epoux2));
    }

    console.log('ENVOI →');
    formData.forEach((v, k) => console.log(k, ':', v));

    const res  = await fetch(`${base}/dashboard/paiements/`, {
      method  : 'POST',
      headers : { Authorization: `Bearer ${token}` },
      body    : formData,
    });

    const json = await res.json();
    console.log('RÉPONSE →', json);

    if (!res.ok) throw new Error(
      json.error || json.detail ||
      Object.entries(json).map(([k, v]) => `${k}: ${v}`).join(' | ')
    );

    setMsg({ type:'ok', text:'Demande soumise avec succès !' });
    setTimeout(() => navigate('/citoyen/suivi'), 1500);
  } catch (err: any) {
    setMsg({ type:'err', text: err?.message || 'Erreur lors de la soumission.' });
  } finally { setLoading(false); }
};

  return (
    <SharedLayout>
      <div className="flex flex-col items-center w-full gap-6">

        {/* ── Stepper ── */}
        <div className="w-full flex justify-center">
          <div className="flex items-center w-full" style={{ maxWidth:500 }}>
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background : step > i+1 ? '#10b981' : step === i+1 ? 'linear-gradient(135deg,#1a3a6b,#2456a0)' : '#f1f5f9',
                      color      : step >= i+1 ? '#fff' : '#94a3b8',
                    }}
                  >
                    {step > i+1 ? <CheckCircle size={16}/> : i+1}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: step === i+1 ? '#1a3a6b' : '#94a3b8' }}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length-1 && (
                  <div className="flex-1 h-0.5 mx-3" style={{ background: step > i+1 ? '#10b981' : '#f1f5f9' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Message flash ── */}
        {msg && (
          <div className="w-full flex justify-center">
            <div
              className="flex items-center gap-3 p-4 rounded-xl w-full"
              style={{
                maxWidth   : 720,
                background : msg.type === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border     : `1px solid ${msg.type === 'ok' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}
            >
              {msg.type === 'ok'
                ? <CheckCircle size={18} style={{ color:'#10b981', flexShrink:0 }} />
                : <AlertCircle size={18} style={{ color:'#ef4444', flexShrink:0 }} />
              }
              <span className="text-sm font-medium flex-1" style={{ color: msg.type === 'ok' ? '#047857' : '#b91c1c' }}>
                {msg.text}
              </span>
            </div>
          </div>
        )}

        {/* ══════════ ÉTAPE 1 ══════════ */}
        {step === 1 && (
          <div
            className="flex flex-col items-center justify-center gap-10 w-full"
            style={{ minHeight:'calc(100vh - 220px)' }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                Choisissez votre acte
              </h2>
              <p className="text-sm" style={{ color:'#94a3b8' }}>
                Sélectionnez le type d'acte que vous souhaitez demander
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 flex-wrap">
              {TYPES_ACTES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTypeActe(t.id)}
                  className="flex flex-col items-center justify-center gap-5 relative"
                  style={{
                    width        : 200,
                    height       : 240,
                    background   : typeActe === t.id ? t.bg : '#fff',
                    border       : `2px solid ${typeActe === t.id ? t.color : '#e2e8f0'}`,
                    borderRadius : 20,
                    boxShadow    : typeActe === t.id ? `0 12px 40px ${t.color}30` : '0 2px 12px rgba(0,0,0,0.06)',
                    transform    : typeActe === t.id ? 'translateY(-6px)' : 'none',
                    transition   : 'all 0.25s ease',
                    cursor       : 'pointer',
                    padding      : '24px 20px',
                  }}
                >
                  {typeActe === t.id && (
                    <div
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background:t.color }}
                    >
                      <CheckCircle size={14} style={{ color:'#fff' }} />
                    </div>
                  )}
                  <div className="flex items-center justify-center">{t.svg}</div>
                  <div className="text-center">
                    <div className="font-bold text-sm" style={{ color: typeActe === t.id ? t.color : '#334155', fontFamily:'Sora,sans-serif' }}>
                      {t.label}
                    </div>
                    <div className="text-xs mt-1" style={{ color:'#94a3b8' }}>{t.sous}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2">
              {[1,2,3].map(i => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width      : typeActe === i ? 28 : 8,
                    height     : 8,
                    background : typeActe === i ? (i===1?'#0891b2':i===2?'#7c3aed':'#e11d48') : '#e2e8f0',
                    transition : 'all 0.25s ease',
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="btn border-0 font-bold"
              style={{
                background   : 'linear-gradient(135deg,#1a3a6b,#2456a0)',
                color        : '#fff',
                borderRadius : 14,
                height       : 52,
                minWidth     : 200,
                fontSize     : 15,
                fontFamily   : 'Sora,sans-serif',
                boxShadow    : '0 6px 20px rgba(26,58,107,0.35)',
              }}
            >
              Suivant →
            </button>
          </div>
        )}

        {/* ══════════ ÉTAPE 2 ══════════ */}
        {step === 2 && (
          <div className="flex flex-col gap-5 w-full" style={{ maxWidth:720 }}>

            {/* N° acte + Photo */}
            <div className="bg-white rounded-xl p-6" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9' }}>
              <h2 className="font-bold text-base mb-5" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                Étape 2 — Informations
              </h2>

              <div className="form-control gap-2 mb-4">
                <label className="label py-0">
                  <span className="label-text text-sm font-semibold" style={{ color:'#64748b' }}>Numéro de l'acte *</span>
                </label>
                <input
                  className="input border-2 rounded-xl text-sm w-full"
                  style={{ borderColor:'#e2e8f0', background:'#f8fafc', color:'#334155', height:46 }}
                  value={numActe}
                  onChange={e => setNumActe(e.target.value)}
                  placeholder="ex: NAISS-2024-001"
                  aria-label="Numéro de l'acte"
                />
              </div>

              <div className="form-control gap-2">
                <label className="label py-0">
                  <span className="label-text text-sm font-semibold" style={{ color:'#64748b' }}>Photo CIN *</span>
                </label>
                {photoUrl ? (
                  <div className="relative">
                    <img src={photoUrl} alt="CIN" className="w-full rounded-xl object-cover" style={{ maxHeight:160 }} />
                    <button
                      onClick={() => { setPhoto(null); setPhotoUrl(''); }}
                      className="absolute top-2 right-2 btn btn-sm border-0 rounded-full w-8 h-8 p-0"
                      style={{ background:'rgba(239,68,68,0.9)', color:'#fff' }}
                    >
                      <X size={14}/>
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer"
                    style={{ border:'2px dashed #1a3a6b', background:'rgba(26,58,107,0.04)' }}
                  >
                    <Upload size={28} style={{ color:'#1a3a6b' }} />
                    <span className="text-sm font-semibold" style={{ color:'#1a3a6b' }}>Cliquez pour choisir une photo</span>
                    <span className="text-xs" style={{ color:'#94a3b8' }}>JPG, PNG — max 5 MB</span>
                    <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Localisation */}
            <div className="bg-white rounded-xl p-6" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9' }}>
              <h3 className="font-bold text-sm mb-4" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                Localisation
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control gap-2">
                  <label className="label py-0">
                    <span className="label-text text-sm font-semibold" style={{ color:'#64748b' }}>Commune *</span>
                  </label>
                  <select
                    className="select border-2 rounded-xl text-sm w-full"
                    style={{ borderColor:'#e2e8f0', background:'#f8fafc', color:'#334155', height:46 }}
                    value={communeId}
                    onChange={e => onCommuneChange(e.target.value)}
                    aria-label="Commune"
                    required
                  >
                    <option value="">Choisir une commune</option>
                    {communes.map((c: any) => (
                      <option key={c.id_commune} value={c.id_commune}>{c.nom_commune}</option>
                    ))}
                  </select>
                </div>
                <div className="form-control gap-2">
                  <label className="label py-0">
                    <span className="label-text text-sm font-semibold" style={{ color:'#64748b' }}>Arrondissement</span>
                  </label>
                  <select
                    className="select border-2 rounded-xl text-sm w-full"
                    style={{ borderColor:'#e2e8f0', background:'#f8fafc', color:'#334155', height:46, opacity: communeId ? 1 : 0.5 }}
                    value={arrondId}
                    onChange={e => onArrondChange(e.target.value)}
                    disabled={!communeId || arronds.length === 0}
                    aria-label="Arrondissement"
                  >
                    <option value="">Choisir</option>
                    {arronds.map((a: any) => (
                      <option key={a.id_arondissement} value={a.id_arondissement}>{a.nom_arondissement}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chargement Dijkstra */}
              {checkDispo && (
                <div className="flex items-center gap-2 mt-3 p-3 rounded-xl" style={{ background:'#f8fafc' }}>
                  <span className="loading loading-spinner loading-sm" style={{ color:'#1a3a6b' }} />
                  <span className="text-sm" style={{ color:'#64748b' }}>Vérification disponibilité…</span>
                </div>
              )}

              {/* Résultat Dijkstra */}
              {dijkstra && !checkDispo && (
                <div
                  className="mt-3 p-4 rounded-xl"
                  style={{
                    background : dijkstra.disponible ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                    border     : `1px solid ${dijkstra.disponible ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                  }}
                >
                  {dijkstra.disponible ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} style={{ color:'#10b981' }} />
                      <span className="text-sm font-semibold" style={{ color:'#047857' }}>
                        {dijkstra.message}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {/* Message fermeture */}
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} style={{ color:'#f59e0b' }} />
                        <span className="text-sm font-semibold" style={{ color:'#b45309' }}>
                          {dijkstra.message}
                        </span>
                      </div>

                      {/* Alternative suggérée */}
                      {dijkstra.redirection && (
                        <div
                          className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background:'rgba(26,58,107,0.06)', border:'1px solid rgba(26,58,107,0.12)' }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background:'rgba(26,58,107,0.1)' }}
                            >
                              <MapPin size={16} style={{ color:'#1a3a6b' }} />
                            </div>
                            <div>
                              <div className="text-sm font-bold" style={{ color:'#1a3a6b' }}>
                                {dijkstra.redirection.arrondissement}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>
                                {dijkstra.redirection.commune} · {dijkstra.redirection.distance_km} km
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const alt = arronds.find(
                                (a: any) => a.nom_arondissement === dijkstra.redirection?.arrondissement
                              );
                              if (alt) setArrondId(String(alt.id_arondissement));
                            }}
                            className="btn btn-sm border-0 font-semibold"
                            style={{
                              background   : 'linear-gradient(135deg,#1a3a6b,#2456a0)',
                              color        : '#fff',
                              borderRadius : 8,
                              height       : 36,
                            }}
                          >
                            Utiliser
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Personnes */}
            <SectionPersonnes
              typeActe={typeActe}
              enfant={enfant} setEnfant={setEnfant}
              pere={pere}     setPere={setPere}
              mere={mere}     setMere={setMere}
              defunt={defunt} setDefunt={setDefunt}
              epoux1={epoux1} setEpoux1={setEpoux1}
              epoux2={epoux2} setEpoux2={setEpoux2}
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setStep(1); setMsg(null); }}
                className="btn border-0 font-semibold flex-1"
                style={{ background:'#f1f5f9', color:'#64748b', borderRadius:12, height:50 }}
              >
                ← Retour
              </button>
              <button
                onClick={validerEtape2}
                className="btn border-0 gap-2 font-bold flex-1"
                style={{ background:'linear-gradient(135deg,#1a3a6b,#2456a0)', color:'#fff', borderRadius:12, height:50, boxShadow:'0 4px 14px rgba(26,58,107,0.35)' }}
              >
                Suivant <ChevronRight size={18}/>
              </button>
            </div>
          </div>
        )}

        {/* ══════════ ÉTAPE 3 ══════════ */}
        {step === 3 && (
          <div className="flex flex-col gap-5 w-full" style={{ maxWidth:720 }}>
            <div className="bg-white rounded-xl p-6" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9' }}>
              <h2 className="font-bold text-base mb-4" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                Étape 3 — Paiement
              </h2>

              {/* Résumé */}
              <div className="rounded-xl p-4 mb-5" style={{ background:'rgba(26,58,107,0.04)', border:'1px solid #e2e8f0' }}>
                <p className="text-xs font-semibold mb-2" style={{ color:'#94a3b8' }}>RÉSUMÉ</p>
                {[
                  { label:'Type',      value: TYPES_ACTES.find(t => t.id === typeActe)?.label },
                  { label:"N° acte",   value: numActe },
                  { label:'Commune',   value: communes.find((c: any) => String(c.id_commune) === communeId)?.nom_commune },
                  { label:'Photo CIN', value: photo ? '✅ Jointe' : '—' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom:'1px solid #f1f5f9' }}>
                    <span className="text-xs" style={{ color:'#94a3b8' }}>{r.label}</span>
                    <span className="text-sm font-semibold" style={{ color:'#334155' }}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Nombre d'exemplaires */}
              <div className="mb-5">
                <p className="text-sm font-semibold mb-3" style={{ color:'#64748b' }}>Nombre d'exemplaires</p>
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => setNbEx(Math.max(1, nbEx-1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center border-0"
                    style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}
                  >
                    <Minus size={18}/>
                  </button>
                  <span className="font-bold text-3xl" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif', minWidth:48, textAlign:'center' }}>
                    {nbEx}
                  </span>
                  <button
                    onClick={() => setNbEx(Math.min(10, nbEx+1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center border-0"
                    style={{ background:'rgba(16,185,129,0.1)', color:'#10b981' }}
                  >
                    <Plus size={18}/>
                  </button>
                </div>
              </div>

              {/* Montant */}
              <div
                className="flex flex-col items-center py-6 rounded-xl mb-5"
                style={{ background:'linear-gradient(135deg,#1a3a6b,#0d2348)' }}
              >
                <p className="text-sm mb-2" style={{ color:'rgba(255,255,255,0.5)' }}>
                  {nbEx} exemplaire{nbEx > 1 ? 's' : ''} × 1 000 Ar
                </p>
                <p className="font-bold" style={{ fontSize:40, color:'#f0b429', fontFamily:'Sora,sans-serif', lineHeight:1 }}>
                  {montant.toLocaleString()} Ar
                </p>
              </div>

              {/* MVola */}
              <div className="form-control gap-2">
                <label className="label py-0">
                  <span className="label-text text-sm font-semibold" style={{ color:'#64748b' }}>Numéro MVola *</span>
                </label>
                <input
                  type="tel"
                  className="input border-2 rounded-xl text-sm w-full"
                  style={{ borderColor:'#e2e8f0', background:'#f8fafc', color:'#334155', height:46 }}
                  value={tel}
                  onChange={e => setTel(e.target.value)}
                  placeholder="034XXXXXXX"
                  aria-label="Numéro MVola"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStep(2); setMsg(null); }}
                className="btn border-0 font-semibold flex-1"
                style={{ background:'#f1f5f9', color:'#64748b', borderRadius:12, height:50 }}
              >
                ← Retour
              </button>
              <button
                onClick={handleSoumettre}
                disabled={loading}
                className="btn border-0 gap-2 font-bold flex-1"
                style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', borderRadius:12, height:50, boxShadow:'0 4px 14px rgba(16,185,129,0.35)' }}
              >
                {loading
                  ? <span className="loading loading-spinner loading-sm"/>
                  : <>Payer et soumettre ✓</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </SharedLayout>
  );
}

// ─── Composants personnes ─────────────────────────────────────────────────────
interface PersonneProps {
  titre    : string;
  data     : PersonneForm;
  onChange : React.Dispatch<React.SetStateAction<PersonneForm>>;
  showSexe?: boolean;
}

function ChampPersonne({ titre, data, onChange, showSexe = false }: PersonneProps) {
  const set = (k: keyof PersonneForm, v: string) =>
    onChange(p => ({ ...p, [k]: v }));

  return (
    <div className="p-4 rounded-xl" style={{ background:'#f8fafc', border:'1px solid #f1f5f9' }}>
      <p className="text-sm font-bold mb-3" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>{titre}</p>
      <div className="grid grid-cols-2 gap-3">
        {([
          { key:'prenom',         label:'Prénom',         ph:'Jean',         type:'text' },
          { key:'nom',            label:'Nom',            ph:'Rakoto',       type:'text' },
          { key:'date_naissance', label:'Date naissance', ph:'',             type:'date' },
          { key:'lieu_naiss',     label:'Lieu naissance', ph:'Antananarivo', type:'text' },
          { key:'profession',     label:'Profession',     ph:'Étudiant',     type:'text' },
        ] as { key: keyof PersonneForm; label: string; ph: string; type: string }[]).map(({ key, label, ph, type }) => (
          <div className="form-control gap-1" key={key}>
            <span className="text-xs font-medium" style={{ color:'#64748b' }}>{label}</span>
            <input
              type={type}
              className="input input-sm border rounded-lg text-xs w-full"
              style={{ borderColor:'#e2e8f0', background:'#fff', color:'#334155', height:38 }}
              value={(data as any)[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={ph}
              aria-label={label}
            />
          </div>
        ))}
        {showSexe && (
          <div className="form-control gap-1">
            <span className="text-xs font-medium" style={{ color:'#64748b' }}>Sexe</span>
            <select
              className="select select-sm border rounded-lg text-xs w-full"
              style={{ borderColor:'#e2e8f0', background:'#fff', color:'#334155', height:38 }}
              value={data.sexe}
              onChange={e => set('sexe', e.target.value)}
              aria-label="Sexe"
            >
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

interface SectionPersonnesProps {
  typeActe : number;
  enfant   : PersonneForm; setEnfant : React.Dispatch<React.SetStateAction<PersonneForm>>;
  pere     : PersonneForm; setPere   : React.Dispatch<React.SetStateAction<PersonneForm>>;
  mere     : PersonneForm; setMere   : React.Dispatch<React.SetStateAction<PersonneForm>>;
  defunt   : PersonneForm; setDefunt : React.Dispatch<React.SetStateAction<PersonneForm>>;
  epoux1   : PersonneForm; setEpoux1 : React.Dispatch<React.SetStateAction<PersonneForm>>;
  epoux2   : PersonneForm; setEpoux2 : React.Dispatch<React.SetStateAction<PersonneForm>>;
}

function SectionPersonnes({
  typeActe, enfant, setEnfant, pere, setPere, mere, setMere,
  defunt, setDefunt, epoux1, setEpoux1, epoux2, setEpoux2,
}: SectionPersonnesProps) {
  return (
    <div className="bg-white rounded-xl p-6" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9' }}>
      <h3 className="font-bold text-sm mb-4" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
        Personnes concernées
      </h3>
      <div className="flex flex-col gap-4">
        {typeActe === 1 && (
          <>
            <ChampPersonne titre="Enfant"    data={enfant} onChange={setEnfant} showSexe />
            <ChampPersonne titre="Père"      data={pere}   onChange={setPere}            />
            <ChampPersonne titre="Mère"      data={mere}   onChange={setMere}            />
          </>
        )}
        {typeActe === 2 && (
          <ChampPersonne titre="Défunt(e)" data={defunt} onChange={setDefunt} showSexe />
        )}
        {typeActe === 3 && (
          <>
            <ChampPersonne titre="Époux"  data={epoux1} onChange={setEpoux1} />
            <ChampPersonne titre="Épouse" data={epoux2} onChange={setEpoux2} />
          </>
        )}
      </div>
    </div>
  );
}