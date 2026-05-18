// src/pages/DetailActe.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, FileText, Baby, Heart, Moon,
  User, MapPin, Briefcase, Calendar, Mail,
  CheckCircle, Clock, XCircle,
} from 'lucide-react';
import SharedLayout from '../components/SharedLayout';
import { acteService } from '../service/acteService';
import type { ActeDetail, PersonneActe } from '../type/acte';

// ─── Constantes ───────────────────────────────────────────────────────────────
const ROLE_LABEL: Record<string, string> = {
  enfant      : 'Enfant',
  pere        : 'Père',
  mere        : 'Mère',
  epoux1      : 'Époux',
  epoux2      : 'Épouse',
  defunt      : 'Défunt(e)',
  temoin      : 'Témoin 1',
  temoin2     : 'Témoin 2',
  pere_epoux1 : 'Père époux',
  mere_epoux1 : 'Mère époux',
  pere_epoux2 : 'Père épouse',
  mere_epoux2 : 'Mère épouse',
  pere_defunt : 'Père défunt',
  mere_defunt : 'Mère défunt',
};

const ROLE_COLOR: Record<string, { bg: string; color: string }> = {
  enfant      : { bg: 'rgba(8,145,178,0.1)',   color: '#0891b2' },
  defunt      : { bg: 'rgba(124,58,237,0.1)',  color: '#7c3aed' },
  epoux1      : { bg: 'rgba(225,29,72,0.1)',   color: '#e11d48' },
  epoux2      : { bg: 'rgba(225,29,72,0.1)',   color: '#e11d48' },
  temoin      : { bg: 'rgba(245,158,11,0.1)',  color: '#b45309' },
  temoin2     : { bg: 'rgba(245,158,11,0.1)',  color: '#b45309' },
  pere        : { bg: 'rgba(26,58,107,0.1)',   color: '#1a3a6b' },
  mere        : { bg: 'rgba(26,58,107,0.1)',   color: '#1a3a6b' },
  pere_defunt : { bg: 'rgba(26,58,107,0.1)',   color: '#1a3a6b' },
  mere_defunt : { bg: 'rgba(26,58,107,0.1)',   color: '#1a3a6b' },
  pere_epoux1 : { bg: 'rgba(26,58,107,0.1)',   color: '#1a3a6b' },
  mere_epoux1 : { bg: 'rgba(26,58,107,0.1)',   color: '#1a3a6b' },
  pere_epoux2 : { bg: 'rgba(26,58,107,0.1)',   color: '#1a3a6b' },
  mere_epoux2 : { bg: 'rgba(26,58,107,0.1)',   color: '#1a3a6b' },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  'acte naissance': <Baby  size={24} style={{ color: '#0891b2' }} />,
  'acte mariage'  : <Heart size={24} style={{ color: '#e11d48' }} />,
  'acte décès'    : <Moon  size={24} style={{ color: '#7c3aed' }} />,
};

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  'acte naissance': { bg: 'rgba(8,145,178,0.1)',  color: '#0891b2' },
  'acte mariage'  : { bg: 'rgba(225,29,72,0.1)',  color: '#e11d48' },
  'acte décès'    : { bg: 'rgba(124,58,237,0.1)', color: '#7c3aed' },
};

const STATUT_CFG: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  'EN ATTENTE': { bg: 'rgba(245,158,11,0.1)',  color: '#b45309', label: 'En attente', icon: <Clock      size={14} /> },
  'VALIDER'   : { bg: 'rgba(16,185,129,0.1)',  color: '#047857', label: 'Validée',    icon: <CheckCircle size={14} /> },
  'REFUSER'   : { bg: 'rgba(239,68,68,0.1)',   color: '#b91c1c', label: 'Refusée',    icon: <XCircle    size={14} /> },
  'TERMINER'  : { bg: 'rgba(139,92,246,0.1)',  color: '#6d28d9', label: 'Terminée',   icon: <CheckCircle size={14} /> },
};

// ─── Composant ────────────────────────────────────────────────────────────────
export default function DetailActe() {
  const navigate          = useNavigate();
  const { id }            = useParams<{ id: string }>();
  const [acte,  setActe]  = useState<ActeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    acteService.getDetail(Number(id))
      .then(r => setActe(r.data))
      .catch(() => setActe(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <SharedLayout>
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg" style={{ color: '#1a3a6b' }} />
      </div>
    </SharedLayout>
  );

  if (!acte) return (
    <SharedLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <FileText size={48} style={{ color: '#e2e8f0' }} />
        <p className="font-medium" style={{ color: '#64748b' }}>Acte introuvable.</p>
        <button
          onClick={() => navigate('/archives')}
          className="btn btn-ghost btn-sm"
          style={{ color: '#1a3a6b' }}
        >
          Retour aux archives
        </button>
      </div>
    </SharedLayout>
  );

  const typeCfg  = TYPE_COLOR[acte.type_acte]  ?? { bg: 'rgba(26,58,107,0.1)', color: '#1a3a6b' };
  const statutCfg = acte.statut_demande
    ? STATUT_CFG[acte.statut_demande] ?? { bg: '#f1f5f9', color: '#64748b', label: acte.statut_demande, icon: null }
    : null;

  return (
    <SharedLayout>
      <div style={{ maxWidth: 820 }}>

        {/* ══ Header ══════════════════════════════════════════════════════════ */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/archives')}
              className="btn btn-ghost btn-sm gap-2"
              style={{ color: '#64748b' }}
            >
              <ArrowLeft size={16} />
              Archives
            </button>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: '#1a3a6b', fontFamily: 'Sora, sans-serif' }}
              >
                {acte.num_acte}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
                Détail de l'acte civil
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            <span
              className="badge font-semibold px-3 py-3 gap-2"
              style={{ background: typeCfg.bg, color: typeCfg.color, border: 'none', borderRadius: 10 }}
            >
              {TYPE_ICON[acte.type_acte]}
              {acte.type_acte}
            </span>
            {statutCfg && (
              <span
                className="badge font-semibold px-3 py-3 gap-2"
                style={{ background: statutCfg.bg, color: statutCfg.color, border: 'none', borderRadius: 10 }}
              >
                {statutCfg.icon}
                {statutCfg.label}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ════════════════════════════════════════════════════════════════
              COL GAUCHE — Infos acte
          ════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-5">

            {/* Card — Acte */}
            <div
              className="bg-white  p-6"
              style={{
                boxShadow : '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                border    : '1px solid #f1f5f9',
              }}
            >
              {/* Icône type */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: typeCfg.bg }}
              >
                {TYPE_ICON[acte.type_acte] ?? <FileText size={24} style={{ color: '#1a3a6b' }} />}
              </div>

              <h3
                className="font-bold text-base mb-4"
                style={{ color: '#1a3a6b', fontFamily: 'Sora, sans-serif' }}
              >
                Informations acte
              </h3>

              <div className="flex flex-col gap-0">
                {([
                  {
                    icon  : <FileText size={15} style={{ color: '#94a3b8' }} />,
                    label : 'Numéro',
                    value : acte.num_acte,
                    bold  : true,
                  },
                  {
                    icon  : <Calendar size={15} style={{ color: '#94a3b8' }} />,
                    label : 'Date',
                    value : new Date(acte.date_acte).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    }),
                  },
                  {
                    icon  : <FileText size={15} style={{ color: '#94a3b8' }} />,
                    label : 'Type',
                    value : acte.type_acte,
                  },
                ] as { icon: React.ReactNode; label: string; value: string; bold?: boolean }[]).map((row, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 py-3"
                    style={{ borderBottom: '1px solid #f8fafc' }}
                  >
                    <div className="mt-0.5 flex-shrink-0">{row.icon}</div>
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className="text-xs" style={{ color: '#94a3b8' }}>{row.label}</span>
                      <span
                        className="text-sm"
                        style={{ color: row.bold ? '#f0b429' : '#334155', fontWeight: row.bold ? 700 : 500 }}
                      >
                        {row.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card — Demande liée */}
            {acte.id_demande && (
              <div
                className="bg-white rounded-2xl p-6"
                style={{
                  boxShadow : '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                  border    : '1px solid #f1f5f9',
                }}
              >
                <h3
                  className="font-bold text-base mb-4"
                  style={{ color: '#1a3a6b', fontFamily: 'Sora, sans-serif' }}
                >
                  Demande liée
                </h3>

                <div className="flex flex-col gap-0">
                  {([
                    {
                      icon  : <FileText size={15} style={{ color: '#94a3b8' }} />,
                      label : 'N° demande',
                      value : `#${acte.id_demande}`,
                    },
                    ...(acte.email_citoyen ? [{
                      icon  : <Mail size={15} style={{ color: '#94a3b8' }} />,
                      label : 'Email citoyen',
                      value : acte.email_citoyen,
                    }] : []),
                    ...(acte.paiement_ok !== undefined ? [{
                      icon  : <CheckCircle size={15} style={{ color: acte.paiement_ok ? '#10b981' : '#94a3b8' }} />,
                      label : 'Paiement',
                      value : acte.paiement_ok ? 'Confirmé' : 'En attente',
                      color : acte.paiement_ok ? '#047857' : '#94a3b8',
                    }] : []),
                  ] as { icon: React.ReactNode; label: string; value: string; color?: string }[]).map((row, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 py-3"
                      style={{ borderBottom: '1px solid #f8fafc' }}
                    >
                      <div className="mt-0.5 flex-shrink-0">{row.icon}</div>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <span className="text-xs" style={{ color: '#94a3b8' }}>{row.label}</span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: row.color ?? '#334155' }}
                        >
                          {row.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════
              COL DROITE — Personnes (2 colonnes)
          ════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-2">
            <div
              className="bg-white  p-6"
              style={{
                boxShadow : '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                border    : '1px solid #f1f5f9',
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(26,58,107,0.1)' }}
                >
                  <User size={18} style={{ color: '#1a3a6b' }} />
                </div>
                <div>
                  <h3
                    className="font-bold text-base"
                    style={{ color: '#1a3a6b', fontFamily: 'Sora, sans-serif' }}
                  >
                    Personnes concernées
                  </h3>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    {acte.personnes?.length ?? 0} personne{(acte.personnes?.length ?? 0) > 1 ? 's' : ''} enregistrée{(acte.personnes?.length ?? 0) > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {acte.personnes?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <User size={36} style={{ color: '#e2e8f0' }} />
                  <p className="text-sm" style={{ color: '#94a3b8' }}>
                    Aucune personne enregistrée
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {acte.personnes?.map((p: PersonneActe, i: number) => {
                    const roleCfg = ROLE_COLOR[p.role] ?? { bg: 'rgba(26,58,107,0.08)', color: '#1a3a6b' };
                    return (
                      <div
                        key={i}
                        className="rounded-2xl p-4 flex flex-col gap-3"
                        style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                      >
                        {/* Role badge */}
                        <div className="flex items-center justify-between">
                          <span
                            className="badge badge-sm font-semibold px-3 py-2"
                            style={{
                              background  : roleCfg.bg,
                              color       : roleCfg.color,
                              border      : 'none',
                              borderRadius: 8,
                            }}
                          >
                            {ROLE_LABEL[p.role] || p.role}
                          </span>
                          <span className="text-xs" style={{ color: '#94a3b8' }}>
                            {p.sexe === 'M' ? 'Masculin' : 'Féminin'}
                          </span>
                        </div>

                        {/* Nom complet */}
                        <div>
                          <div
                            className="font-bold text-base"
                            style={{ color: '#1a3a6b', fontFamily: 'Sora, sans-serif' }}
                          >
                            {p.prenom_personne} {p.nom_personne}
                          </div>
                        </div>

                        {/* Détails */}
                        <div className="flex flex-col gap-2">
                          {p.date_naissance && (
                            <div className="flex items-center gap-2">
                              <Calendar size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                              <span className="text-xs" style={{ color: '#64748b' }}>
                                Né(e) le {p.date_naissance.split(' ')[0]}
                              </span>
                            </div>
                          )}
                          {p.lieu_naiss && (
                            <div className="flex items-center gap-2">
                              <MapPin size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                              <span className="text-xs" style={{ color: '#64748b' }}>
                                {p.lieu_naiss}
                              </span>
                            </div>
                          )}
                          {p.profession && (
                            <div className="flex items-center gap-2">
                              <Briefcase size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                              <span className="text-xs" style={{ color: '#64748b' }}>
                                {p.profession}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}