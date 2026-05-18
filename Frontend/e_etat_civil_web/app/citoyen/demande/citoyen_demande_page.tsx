'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Personne {
  role: string;
  nom_personne: string;
  prenom_personne: string;
  date_naissance: string;
  lieu_naiss: string;
  sexe: string;
  profession: string;
}

interface Arrond {
  id_arondissement: number;
  nom_arondissement: string;
  statut: string;
}

interface DijkstraResult {
  id_arondissement: number;
  nom_arondissement: string;
  distance_km: number;
  statut: string;
}

// ─── Rôles requis par type d'acte ─────────────────────────────────────────────
const ROLES_PAR_TYPE: Record<string, { role: string; label: string; icon: string }[]> = {
  'acte naissance': [
    { role: 'enfant',  label: 'Enfant',  icon: 'child_care' },
    { role: 'pere',    label: 'Père',    icon: 'man' },
    { role: 'mere',    label: 'Mère',    icon: 'woman' },
  ],
  'acte mariage': [
    { role: 'epoux1',      label: 'Époux',        icon: 'man' },
    { role: 'epoux2',      label: 'Épouse',        icon: 'woman' },
    { role: 'temoin',      label: 'Témoin 1',      icon: 'person' },
    { role: 'temoin2',     label: 'Témoin 2',      icon: 'person' },
    { role: 'pere_epoux1', label: 'Père époux',    icon: 'man' },
    { role: 'mere_epoux1', label: 'Mère époux',    icon: 'woman' },
    { role: 'pere_epoux2', label: 'Père épouse',   icon: 'man' },
    { role: 'mere_epoux2', label: 'Mère épouse',   icon: 'woman' },
  ],
  'acte décès': [
    { role: 'defunt',      label: 'Défunt(e)',     icon: 'sentiment_very_dissatisfied' },
    { role: 'pere_defunt', label: 'Père défunt',   icon: 'man' },
    { role: 'mere_defunt', label: 'Mère défunt',   icon: 'woman' },
    { role: 'temoin',      label: 'Témoin 1',      icon: 'person' },
    { role: 'temoin2',     label: 'Témoin 2',      icon: 'person' },
  ],
};

const TYPE_CONFIG = [
  { type: 'acte naissance', label: 'Acte de naissance', icon: 'child_care',                    color: '#0891b2', desc: 'Enregistrement d\'une naissance' },
  { type: 'acte mariage',   label: 'Acte de mariage',   icon: 'favorite',                      color: '#e11d48', desc: 'Enregistrement d\'un mariage' },
  { type: 'acte décès',     label: 'Acte de décès',     icon: 'sentiment_very_dissatisfied',   color: '#6366f1', desc: 'Enregistrement d\'un décès' },
];

const SEXE_OPTIONS = ['Masculin', 'Féminin'];

function makePersonne(role: string): Personne {
  return { role, nom_personne: '', prenom_personne: '', date_naissance: '', lieu_naiss: '', sexe: 'Masculin', profession: '' };
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function NouvelleDemandeContent() {
  const router = useRouter();

  // ── Étapes ──
  const [etape,         setEtape]         = useState(1);
  const [typeActe,      setTypeActe]      = useState('');
  const [personnes,     setPersonnes]     = useState<Personne[]>([]);
  const [activeRole,    setActiveRole]    = useState(0);
  const [nbExemplaires, setNbExemplaires] = useState(1);
  const [numActe,       setNumActe]       = useState('');

  // ── Arrondissement / Dijkstra ──
  const [arronds,       setArronds]       = useState<Arrond[]>([]);
  const [selectedArr,   setSelectedArr]   = useState<number | null>(null);
  const [dijkstra,      setDijkstra]      = useState<DijkstraResult | null>(null);
  const [dijkstraLoading, setDijkstraLoading] = useState(false);
  const [arrondIndispo, setArrondIndispo] = useState(false);

  // ── Paiement ──
  const [refTransaction, setRefTransaction] = useState('');
  const [submitLoading,  setSubmitLoading]  = useState(false);
  const [error,          setError]          = useState('');

  // Charger arrondissements du citoyen
  useEffect(() => {
    api.get('/dashboard/arrondissements/public/')
      .then(r => {
        setArronds(r.data);
        // Pré-sélectionner le premier disponible
        const dispo = r.data.find((a: Arrond) => a.statut === 'disponible');
        if (dispo) setSelectedArr(dispo.id_arondissement);
      })
      .catch(() => {});
  }, []);

  // Quand on change de type → initialiser les personnes
  const choisirType = (type: string) => {
    setTypeActe(type);
    const roles = ROLES_PAR_TYPE[type] ?? [];
    setPersonnes(roles.map(r => makePersonne(r.role)));
    setActiveRole(0);
    setEtape(2);
  };

  // Vérifier arrondissement via Dijkstra
  const verifierArrond = async (id: number) => {
    setSelectedArr(id);
    const arrond = arronds.find(a => a.id_arondissement === id);
    if (!arrond) return;

    if (arrond.statut === 'disponible') {
      setDijkstra(null);
      setArrondIndispo(false);
      return;
    }

    // Indisponible → Dijkstra
    setArrondIndispo(true);
    setDijkstraLoading(true);
    setDijkstra(null);
    try {
      const res = await api.get(`/dashboard/arrondissements/${id}/verifier/`);
      setDijkstra(res.data);
      if (res.data?.id_arondissement) {
        setSelectedArr(res.data.id_arondissement);
        setArrondIndispo(false);
      }
    } catch {
      setError('Impossible de trouver un arrondissement disponible.');
    } finally {
      setDijkstraLoading(false);
    }
  };

  // Mettre à jour une personne
  const updatePersonne = (index: number, field: keyof Personne, value: string) => {
    setPersonnes(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  // Montant total
  const montant = nbExemplaires * 1000;

  // Soumettre demande + paiement
  const soumettre = async () => {
    if (!selectedArr) { setError('Veuillez sélectionner un arrondissement.'); return; }
    setSubmitLoading(true); setError('');
    try {
      await api.post('/dashboard/paiements/', {
        type_acte:        typeActe,
        id_arrondissement: selectedArr,
        personnes,
        nb_exemplaires:   nbExemplaires,
        num_acte:         numActe || undefined,
        montant,
        ref_transaction:  refTransaction || `MVola-${Date.now()}`,
      });
      router.push('/citoyen/suivi');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Erreur lors de la soumission.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const roles = ROLES_PAR_TYPE[typeActe] ?? [];
  const personneActuelle = personnes[activeRole];

  return (
    <div className="fade-up" style={{ maxWidth: '760px' }}>

      {/* ── Stepper ── */}
      <div style={styles.stepper}>
        {[
          { n: 1, label: 'Type d\'acte',  icon: 'description' },
          { n: 2, label: 'Informations',  icon: 'group' },
          { n: 3, label: 'Paiement',      icon: 'payment' },
        ].map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={styles.stepItem}>
              <div style={{
                ...styles.stepCircle,
                background: etape > s.n ? '#10b981' : etape === s.n ? 'linear-gradient(135deg, #1a3a6b, #2456a0)' : '#e2e8f0',
                color: etape >= s.n ? '#fff' : '#94a3b8',
              }}>
                {etape > s.n
                  ? <span className="material-icons-round" style={{ fontSize: '18px' }}>check</span>
                  : <span className="material-icons-round" style={{ fontSize: '18px' }}>{s.icon}</span>
                }
              </div>
              <span style={{ ...styles.stepLabel, color: etape >= s.n ? '#0f172a' : '#94a3b8', fontWeight: etape === s.n ? 700 : 400 }}>
                {s.label}
              </span>
            </div>
            {i < 2 && <div style={{ ...styles.stepLine, background: etape > s.n ? '#10b981' : '#e2e8f0' }} />}
          </div>
        ))}
      </div>

      {/* ── Message erreur ── */}
      {error && (
        <div style={styles.errorBox}>
          <span className="material-icons-round" style={{ fontSize: '18px' }}>error_outline</span>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          ÉTAPE 1 — Choisir le type d'acte
      ════════════════════════════════════════════════════════════════════ */}
      {etape === 1 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span className="material-icons-round" style={{ fontSize: '22px', color: '#1a3a6b' }}>description</span>
           {" Quel type d'acte souhaitez-vous demander ?"}
          </h2>
          <div style={styles.typeGrid}>
            {TYPE_CONFIG.map(t => (
              <button key={t.type} onClick={() => choisirType(t.type)} style={styles.typeCard}>
                <div style={{ ...styles.typeIcon, background: t.color + '15' }}>
                  <span className="material-icons-round" style={{ fontSize: '32px', color: t.color }}>{t.icon}</span>
                </div>
                <div style={styles.typeLabel}>{t.label}</div>
                <div style={styles.typeDesc}>{t.desc}</div>
                <div style={styles.typeArrow}>
                  <span className="material-icons-round" style={{ fontSize: '20px', color: '#94a3b8' }}>arrow_forward</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          ÉTAPE 2 — Informations personnes + arrondissement
      ════════════════════════════════════════════════════════════════════ */}
      {etape === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Sélecteur de rôle (onglets latéraux) */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span className="material-icons-round" style={{ fontSize: '22px', color: '#1a3a6b' }}>group</span>
              {TYPE_CONFIG.find(t => t.type === typeActe)?.label}
            </h2>

            <div style={styles.rolesLayout}>
              {/* Onglets rôles */}
              <div style={styles.rolesTabs}>
                {roles.map((r, i) => {
                  const p = personnes[i];
                  const rempli = p?.nom_personne && p?.prenom_personne;
                  return (
                    <button key={r.role} onClick={() => setActiveRole(i)} style={{
                      ...styles.roleTab,
                      background: activeRole === i ? 'linear-gradient(135deg, #1a3a6b, #2456a0)' : '#f8fafc',
                      color: activeRole === i ? '#fff' : '#64748b',
                      border: activeRole === i ? 'none' : '1.5px solid #e2e8f0',
                    }}>
                      <span className="material-icons-round" style={{ fontSize: '16px' }}>{r.icon}</span>
                      <span style={{ flex: 1, textAlign: 'left' }}>{r.label}</span>
                      {rempli && (
                        <span className="material-icons-round" style={{ fontSize: '14px', color: activeRole === i ? '#86efac' : '#10b981' }}>check_circle</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Formulaire personne */}
              {personneActuelle && (
                <div style={styles.personneForm}>
                  <div style={styles.personneHeader}>
                    <span className="material-icons-round" style={{ fontSize: '20px', color: '#1a3a6b' }}>{roles[activeRole]?.icon}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif' }}>{roles[activeRole]?.label}</span>
                  </div>

                  <div style={styles.formGrid}>
                    <FormField label="Prénom" value={personneActuelle.prenom_personne} onChange={v => updatePersonne(activeRole, 'prenom_personne', v)} placeholder="Prénom" />
                    <FormField label="Nom"    value={personneActuelle.nom_personne}    onChange={v => updatePersonne(activeRole, 'nom_personne', v)} placeholder="Nom de famille" />
                    <FormField label="Date de naissance" value={personneActuelle.date_naissance} onChange={v => updatePersonne(activeRole, 'date_naissance', v)} type="date" />
                    <FormField label="Lieu de naissance" value={personneActuelle.lieu_naiss} onChange={v => updatePersonne(activeRole, 'lieu_naiss', v)} placeholder="Antananarivo" />

                    {/* Sexe */}
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Sexe</label>
                      <div style={styles.sexeRow}>
                        {SEXE_OPTIONS.map(s => (
                          <button key={s} type="button" onClick={() => updatePersonne(activeRole, 'sexe', s)} style={{
                            ...styles.sexeBtn,
                            background: personneActuelle.sexe === s ? 'linear-gradient(135deg, #1a3a6b, #2456a0)' : '#f8fafc',
                            color: personneActuelle.sexe === s ? '#fff' : '#64748b',
                            border: personneActuelle.sexe === s ? 'none' : '1.5px solid #e2e8f0',
                          }}>
                            <span className="material-icons-round" style={{ fontSize: '16px' }}>{s === 'Masculin' ? 'man' : 'woman'}</span>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <FormField label="Profession" value={personneActuelle.profession} onChange={v => updatePersonne(activeRole, 'profession', v)} placeholder="Enseignant, Commerçant…" />
                  </div>

                  {/* Navigation entre rôles */}
                  <div style={styles.roleNav}>
                    {activeRole > 0 && (
                      <button onClick={() => setActiveRole(activeRole - 1)} style={styles.btnSecondary}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_back</span>
                        Précédent
                      </button>
                    )}
                    {activeRole < roles.length - 1 ? (
                      <button onClick={() => setActiveRole(activeRole + 1)} style={{ ...styles.btnPrimary, marginLeft: 'auto' }}>
                        Suivant
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_forward</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Arrondissement + Dijkstra */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span className="material-icons-round" style={{ fontSize: '22px', color: '#1a3a6b' }}>location_city</span>
              Arrondissement
            </h2>

            <div style={styles.arrondGrid}>
              {arronds.map(a => {
                const ok      = a.statut === 'disponible';
                const selected = selectedArr === a.id_arondissement;
                return (
                  <button key={a.id_arondissement} onClick={() => verifierArrond(a.id_arondissement)} style={{
                    ...styles.arrondCard,
                    border: selected ? '2px solid #1a3a6b' : '2px solid #e2e8f0',
                    background: selected ? 'rgba(26,58,107,0.04)' : '#fff',
                  }}>
                    <span className="material-icons-round" style={{ fontSize: '20px', color: ok ? '#10b981' : '#ef4444' }}>
                      {ok ? 'location_on' : 'location_off'}
                    </span>
                    <span style={{ flex: 1, textAlign: 'left', fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{a.nom_arondissement}</span>
                    <span style={{ ...styles.badge, background: ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: ok ? '#10b981' : '#ef4444' }}>
                      {ok ? 'Dispo' : 'Indispo'}
                    </span>
                    {selected && <span className="material-icons-round" style={{ fontSize: '18px', color: '#1a3a6b' }}>check_circle</span>}
                  </button>
                );
              })}
            </div>

            {/* Résultat Dijkstra */}
            {dijkstraLoading && (
              <div style={styles.dijkstraBox}>
                <span className="material-icons-round spin" style={{ fontSize: '20px', color: '#f0b429' }}>sync</span>
                Recherche de l'arrondissement disponible le plus proche…
              </div>
            )}
            {dijkstra && !dijkstraLoading && (
              <div style={{ ...styles.dijkstraBox, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#065f46' }}>
                <span className="material-icons-round" style={{ fontSize: '20px', color: '#10b981' }}>alt_route</span>
                <div>
                  <div style={{ fontWeight: 700 }}>Dijkstra — Redirection automatique</div>
                  <div style={{ fontSize: '13px', marginTop: '2px' }}>
                    Arrondissement le plus proche disponible : <strong>{dijkstra.nom_arondissement}</strong> ({dijkstra.distance_km} km)
                  </div>
                </div>
              </div>
            )}
            {arrondIndispo && !dijkstraLoading && !dijkstra && (
              <div style={{ ...styles.dijkstraBox, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#991b1b' }}>
                <span className="material-icons-round" style={{ fontSize: '20px', color: '#ef4444' }}>warning</span>
                Cet arrondissement est indisponible. Aucun arrondissement disponible trouvé à proximité.
              </div>
            )}
          </div>

          {/* Nb exemplaires */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span className="material-icons-round" style={{ fontSize: '22px', color: '#1a3a6b' }}>content_copy</span>
              Nombre d'exemplaires
            </h2>
            <div style={styles.exemplairesRow}>
              <button onClick={() => setNbExemplaires(Math.max(1, nbExemplaires - 1))} style={styles.counterBtn}>
                <span className="material-icons-round" style={{ fontSize: '20px' }}>remove</span>
              </button>
              <div style={styles.counterVal}>{nbExemplaires}</div>
              <button onClick={() => setNbExemplaires(nbExemplaires + 1)} style={styles.counterBtn}>
                <span className="material-icons-round" style={{ fontSize: '20px' }}>add</span>
              </button>
              <div style={styles.counterMontant}>
                = <strong style={{ color: '#f0b429', fontSize: '18px' }}>{(nbExemplaires * 1000).toLocaleString()} Ar</strong>
              </div>
            </div>
          </div>

          {/* Boutons étape 2 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setEtape(1)} style={styles.btnSecondary}>
              <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_back</span>
              Retour
            </button>
            <button
              onClick={() => {
                const manquant = personnes.find(p => !p.nom_personne || !p.prenom_personne);
                if (manquant) { setError('Veuillez remplir le prénom et nom pour toutes les personnes.'); return; }
                if (!selectedArr) { setError('Veuillez sélectionner un arrondissement.'); return; }
                setError(''); setEtape(3);
              }}
              style={{ ...styles.btnPrimary, flex: 1 }}
            >
              Continuer vers le paiement
              <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          ÉTAPE 3 — Récapitulatif + Paiement
      ════════════════════════════════════════════════════════════════════ */}
      {etape === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Récapitulatif */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span className="material-icons-round" style={{ fontSize: '22px', color: '#1a3a6b' }}>receipt_long</span>
              Récapitulatif
            </h2>

            <div style={styles.recapGrid}>
              <RecapRow icon="description" label="Type d'acte"       value={typeActe} />
              <RecapRow icon="location_city" label="Arrondissement"  value={arronds.find(a => a.id_arondissement === selectedArr)?.nom_arondissement ?? '—'} />
              <RecapRow icon="content_copy"  label="Nb exemplaires"  value={`${nbExemplaires} exemplaire(s)`} />
              <RecapRow icon="payments"      label="Montant total"   value={`${montant.toLocaleString()} Ar`} accent />
            </div>

            {/* Personnes */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Personnes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {personnes.map((p, i) => (
                  <div key={i} style={styles.personneRecap}>
                    <span className="material-icons-round" style={{ fontSize: '16px', color: '#1a3a6b' }}>{roles[i]?.icon ?? 'person'}</span>
                    <span style={{ fontWeight: 600, color: '#1a3a6b', fontSize: '13px', minWidth: '110px' }}>{roles[i]?.label}</span>
                    <span style={{ color: '#0f172a', fontSize: '14px' }}>{p.prenom_personne} {p.nom_personne}</span>
                    <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: 'auto' }}>{p.date_naissance} · {p.lieu_naiss}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Paiement MVola */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span className="material-icons-round" style={{ fontSize: '22px', color: '#10b981' }}>payment</span>
              Paiement MVola
            </h2>

            <div style={styles.mvolaBox}>
              <div style={styles.mvolaAmount}>{montant.toLocaleString()} Ar</div>
              <div style={styles.mvolaLabel}>Montant à payer</div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Référence de transaction MVola (optionnel)</label>
              <div style={styles.inputWrap}>
                <span className="material-icons-round" style={styles.inputIcon}>tag</span>
                <input
                  value={refTransaction}
                  onChange={e => setRefTransaction(e.target.value)}
                  placeholder="Ex: MVola-2035-XXXX"
                  style={styles.input}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                Laissez vide pour une référence automatique. Le paiement est simulé (succès automatique).
              </div>
            </div>
          </div>

          {/* Boutons étape 3 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setEtape(2)} style={styles.btnSecondary}>
              <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_back</span>
              Retour
            </button>
            <button onClick={soumettre} disabled={submitLoading} style={{ ...styles.btnSuccess, flex: 1 }}>
              {submitLoading
                ? <span className="material-icons-round spin" style={{ fontSize: '20px' }}>sync</span>
                : <><span className="material-icons-round" style={{ fontSize: '20px' }}>send</span> Soumettre la demande</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────
function FormField({ label, value, onChange, type = 'text', placeholder = '' }: any) {
  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} style={styles.input} />
    </div>
  );
}

function RecapRow({ icon, label, value, accent = false }: { icon: string; label: string; value: string; accent?: boolean }) {
  return (
    <div style={styles.recapRow}>
      <span className="material-icons-round" style={{ fontSize: '16px', color: '#94a3b8' }}>{icon}</span>
      <span style={{ color: '#64748b', fontSize: '13px', flex: 1 }}>{label}</span>
      <span style={{ fontWeight: 600, color: accent ? '#f0b429' : '#0f172a', fontSize: accent ? '16px' : '14px' }}>{value}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: { [k: string]: React.CSSProperties } = {
  stepper: { display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  stepCircle: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' },
  stepLabel: { fontSize: '12px', whiteSpace: 'nowrap', transition: 'all 0.3s' },
  stepLine: { flex: 1, height: '2px', margin: '0 8px', marginBottom: '20px', borderRadius: '2px', transition: 'background 0.3s' },

  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px', color: '#ef4444', fontSize: '14px', marginBottom: '12px' },

  card: { background: '#fff', borderRadius: '18px', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' },
  cardTitle: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif', margin: 0 },

  typeGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  typeCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '14px', background: '#f8fafc', border: '2px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left', position: 'relative' },
  typeIcon: { width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  typeLabel: { fontSize: '16px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif' },
  typeDesc: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  typeArrow: { marginLeft: 'auto' },

  rolesLayout: { display: 'grid', gridTemplateColumns: '180px 1fr', gap: '16px' },
  rolesTabs: { display: 'flex', flexDirection: 'column', gap: '4px' },
  roleTab: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.18s', width: '100%' },

  personneForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
  personneHeader: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(26,58,107,0.05)', borderRadius: '10px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', color: '#64748b', fontWeight: 500 },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '12px', fontSize: '18px', color: '#94a3b8', pointerEvents: 'none' },
  input: { width: '100%', padding: '11px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', color: '#0f172a', background: '#f8fafc', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' },

  sexeRow: { display: 'flex', gap: '8px' },
  sexeBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, flex: 1, justifyContent: 'center', transition: 'all 0.18s' },

  roleNav: { display: 'flex', gap: '10px', marginTop: '4px' },

  arrondGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  arrondCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.18s', width: '100%', background: '#fff' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },

  dijkstraBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.25)', color: '#92400e', fontSize: '14px' },

  exemplairesRow: { display: 'flex', alignItems: 'center', gap: '14px' },
  counterBtn: { width: '40px', height: '40px', borderRadius: '50%', background: '#f0f4f8', border: '1.5px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a6b', transition: 'all 0.18s' },
  counterVal: { fontSize: '28px', fontWeight: 800, color: '#0f172a', fontFamily: 'Sora, sans-serif', minWidth: '40px', textAlign: 'center' },
  counterMontant: { fontSize: '16px', color: '#64748b', marginLeft: '8px' },

  recapGrid: { display: 'flex', flexDirection: 'column', gap: '2px' },
  recapRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
  personneRecap: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', fontSize: '14px' },

  mvolaBox: { textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.04))', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.2)' },
  mvolaAmount: { fontSize: '36px', fontWeight: 800, color: '#10b981', fontFamily: 'Sora, sans-serif' },
  mvolaLabel: { fontSize: '13px', color: '#64748b', marginTop: '4px' },

  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #1a3a6b, #2456a0)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  btnSecondary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 20px', borderRadius: '12px', background: '#f0f4f8', border: '1.5px solid #e2e8f0', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  btnSuccess: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' },
};
