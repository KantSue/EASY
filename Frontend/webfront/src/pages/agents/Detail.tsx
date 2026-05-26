/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/agents/Detail.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, User, FileText, Search,
  CheckCircle, XCircle, Mail, Download,
  AlertCircle, ChevronRight, Unlock, X,
} from 'lucide-react';
import AgentLayout from '../../components/AgentLayout';
import { demandeService } from '../../service/demandeService';
import { acteService }    from '../../service/acteService';
import { authService }    from '../../service/authService';
import type { DemandeDetail, ActeDetail, PersonneActe, ActePersonne } from '../../type';

export default function Detail() {
  const navigate   = useNavigate();
  const { t }      = useTranslation();
  const [params]   = useSearchParams();
  const id         = params.get('id');

  const [idAgent,      setIdAgent]      = useState<number | null>(null);
  const [demande,      setDemande]      = useState<DemandeDetail | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [recherche,    setRecherche]    = useState('');
  const [suggestions,  setSuggestions]  = useState<ActeDetail[]>([]);
  const [actePreview,  setActePreview]  = useState<ActeDetail | null>(null);
  const [acteLoading,  setActeLoading]  = useState(false);
  const [acteConfirme, setActeConfirme] = useState<ActeDetail | null>(null);
  const [motif,        setMotif]        = useState('');
  const [showRefus,    setShowRefus]    = useState(false);
  const [acting,       setActing]       = useState(false);
  const [email,        setEmail]        = useState('');
  const [msg,          setMsg]          = useState<{ type:'ok'|'err'; text:string } | null>(null);

  const ROLE_LABEL: Record<string, string> = {
    enfant      : t('personne.enfant'),
    pere        : t('personne.pere'),
    mere        : t('personne.mere'),
    epoux1      : t('personne.epoux'),
    epoux2      : t('personne.epouse'),
    defunt      : t('personne.defunt'),
    temoin      : 'Témoin 1',
    temoin2     : 'Témoin 2',
    pere_epoux1 : 'Père époux',
    mere_epoux1 : 'Mère époux',
    pere_epoux2 : 'Père épouse',
    mere_epoux2 : 'Mère épouse',
    pere_defunt : 'Père défunt',
    mere_defunt : 'Mère défunt',
  };

  const STATUT_CFG: Record<string, { bg: string; color: string; label: string }> = {
    'EN ATTENTE': { bg:'rgba(245,158,11,0.1)',  color:'#b45309', label: t('statut.en_attente') },
    'VALIDER'   : { bg:'rgba(16,185,129,0.1)',  color:'#047857', label: t('statut.valider')    },
    'REFUSER'   : { bg:'rgba(239,68,68,0.1)',   color:'#b91c1c', label: t('statut.refuser')    },
    'TERMINER'  : { bg:'rgba(139,92,246,0.1)',  color:'#6d28d9', label: t('statut.terminer')   },
  };

  useEffect(() => {
    authService.getProfil()
      .then(r => setIdAgent(r.data.id_user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    demandeService.getDetail(Number(id))
      .then(async r => {
        setDemande(r.data);
        setEmail(r.data.email_citoyen || '');
        setRecherche(r.data.num_acte  || '');
        if (r.data.id_acte) {
          try {
            const acteRes = await acteService.getDetail(r.data.id_acte, Number(id));
            setActePreview(acteRes.data);
          } catch {}
        }
      })
      .catch(() => setMsg({ type:'err', text: t('detail.erreur_chargement') }))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (recherche.length < 2) { setSuggestions([]); return; }
      acteService.getSuggestions(recherche)
        .then(r => {
          const data = r.data;
          if (Array.isArray(data))                  setSuggestions(data);
          else if (Array.isArray(data.suggestions)) setSuggestions(data.suggestions);
          else                                      setSuggestions([]);
        })
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [recherche]);

  const clickSugg = async (acte: ActeDetail) => {
    setSuggestions([]);
    setRecherche(acte.num_acte);
    setActeLoading(true);
    try {
      const det = await acteService.getDetail(acte.id_acte, Number(id));
      setActePreview(det.data);
    } catch {
      setMsg({ type:'err', text: t('detail.erreur_acte') });
    } finally { setActeLoading(false); }
  };

  const confirmer = () => {
    setActeConfirme(actePreview);
    setActePreview(null);
    setMsg({ type:'ok', text: `${t('agent.acte_confirme')} : ${actePreview?.num_acte}` });
  };

  const valider = async () => {
    if (!demande || !idAgent) return;
    setActing(true);
    try {
      await demandeService.valider(idAgent, Number(id));
      setDemande(p => p ? { ...p, statut_demande:'VALIDER' } : p);
      setMsg({ type:'ok', text: t('detail.valide_ok') });
    } catch (err: any) {
      const msgBackend = err?.response?.data?.detail || err?.response?.data?.error
        || Object.values(err?.response?.data ?? {})[0] || t('detail.valide_err');
      setMsg({ type:'err', text: String(msgBackend) });
    } finally { setActing(false); }
  };

  const refuser = async () => {
    if (!demande || !motif.trim() || !idAgent) return;
    setActing(true);
    try {
      await demandeService.refuser(idAgent, Number(id), motif);
      setDemande(p => p ? { ...p, statut_demande:'REFUSER' } : p);
      setShowRefus(false);
      setMsg({ type:'err', text: t('detail.refuse_ok') });
    } catch (err: any) {
      const msgBackend = err?.response?.data?.detail || err?.response?.data?.error
        || Object.values(err?.response?.data ?? {})[0] || t('detail.refuse_err');
      setMsg({ type:'err', text: String(msgBackend) });
    } finally { setActing(false); }
  };

  const genPDF = async () => {
    try {
      const r = await demandeService.genererPDF(Number(id));
      if (r.data?.url_pdf) {
        const base = import.meta.env.VITE_API_URL.replace(/\/$/, '');
        const url  = r.data.url_pdf.startsWith('http') ? r.data.url_pdf : `${base}${r.data.url_pdf}`;
        window.open(url, '_blank');
        setMsg({ type:'ok', text: t('detail.pdf_ouvert') });
        return;
      }
      window.open(URL.createObjectURL(new Blob([r.data], { type:'application/pdf' })), '_blank');
      setMsg({ type:'ok', text: t('detail.pdf_genere') });
    } catch (err: any) {
      setMsg({ type:'err', text: err?.response?.data?.error || err?.response?.data?.detail || t('detail.pdf_err') });
    }
  };

  const envoyerEmail = async () => {
    try {
      await demandeService.envoyerPDF(Number(id));
      setMsg({ type:'ok', text: t('detail.email_ok') });
    } catch (err: any) {
      setMsg({ type:'err', text: err?.response?.data?.error || t('detail.email_err') });
    }
  };

  if (loading) return (
    <AgentLayout>
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg" style={{ color:'#1a3a6b' }} />
      </div>
    </AgentLayout>
  );

  if (!demande) return (
    <AgentLayout>
      <div className="flex items-center justify-center h-64" style={{ color:'#ef4444' }}>
        {t('detail.introuvable')}
      </div>
    </AgentLayout>
  );

  const st     = STATUT_CFG[demande.statut_demande] ?? { bg:'#f1f5f9', color:'#64748b', label:demande.statut_demande };
  const canPDF = demande.statut_demande === 'VALIDER' || demande.statut_demande === 'TERMINER';

  return (
    <AgentLayout>
      <div className="flex flex-col gap-6">

        {/* ══ Header ══ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/agent/file-attente')}
              className="btn btn-ghost btn-sm gap-2" style={{ color:'#64748b' }}>
              <ArrowLeft size={16} />
              {t('common.retour')}
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                {t('detail.demande')} {demande.num_demande}
              </h1>
              <p className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>
                {t('detail.detail_traitement')}
              </p>
            </div>
          </div>
          <span className="badge font-semibold px-4 py-3 text-sm"
            style={{ background:st.bg, color:st.color, border:'none', borderRadius:12 }}>
            {st.label}
          </span>
        </div>

        {/* ══ Message flash ══ */}
        {msg && (
          <div className="flex items-center gap-3 p-4 rounded-2xl"
            style={{
              background : msg.type === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border     : `1px solid ${msg.type === 'ok' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
            {msg.type === 'ok'
              ? <CheckCircle size={18} style={{ color:'#10b981', flexShrink:0 }} />
              : <AlertCircle size={18} style={{ color:'#ef4444', flexShrink:0 }} />
            }
            <span className="text-sm font-medium flex-1"
              style={{ color: msg.type === 'ok' ? '#047857' : '#b91c1c' }}>
              {msg.text}
            </span>
            <button onClick={() => setMsg(null)} className="btn btn-ghost btn-xs">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ══ 2 colonnes ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ════ COLONNE GAUCHE ════ */}
          <div className="flex flex-col gap-5">

            {/* Infos citoyen */}
            <div className="bg-white rounded-2xl p-6"
              style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(26,58,107,0.1)' }}>
                  <User size={18} style={{ color:'#1a3a6b' }} />
                </div>
                <h3 className="font-bold text-base" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                  {t('agent.infos_citoyen')}
                </h3>
              </div>
              <div className="flex flex-col">
                {([
                  { label: t('detail.nom_complet'),  value: demande.citoyen },
                  // { label: 'Email',                  value: demande.email_citoyen },
                  { label: t('detail.type_acte'),    value: demande.type_acte },
                  { label: t('demande.arrondissement'), value: demande.arrondissement },
                  { label: t('demande.commune'),     value: demande.commune },
                  { label: t('suivi.date_depot'),    value: new Date(demande.date_depot).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }) },
                  { label: t('suivi.num_acte'),      value: demande.num_acte },
                ] as { label: string; value: string | undefined }[]).map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-3"
                    style={{ borderBottom:'1px solid #f8fafc' }}>
                    <span className="text-sm" style={{ color:'#94a3b8' }}>{row.label}</span>
                    <span className="text-sm font-semibold" style={{ color:'#334155', textAlign:'right', maxWidth:'60%' }}>
                      {row.value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personnes concernées */}
            <div className="bg-white rounded-2xl p-6"
              style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(26,58,107,0.1)' }}>
                  <User size={18} style={{ color:'#1a3a6b' }} />
                </div>
                <h3 className="font-bold text-base" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                  {t('personne.personnes_conc')}
                </h3>
              </div>

              {demande.personnes && demande.personnes.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {demande.personnes.map((p: PersonneActe, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background:'#f8fafc' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background:'rgba(26,58,107,0.12)', color:'#1a3a6b' }}>
                        {i + 1}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold" style={{ color:'#1a3a6b' }}>
                          {ROLE_LABEL[p.role] || p.role}
                        </span>
                        <span className="text-sm font-semibold" style={{ color:'#334155' }}>
                          {p.personne.prenom_personne} {p.personne.nom_personne}
                        </span>
                        <span className="text-xs" style={{ color:'#94a3b8' }}>
                          {p.personne.sexe === 'M' ? t('personne.masculin') : t('personne.feminin')} · {p.personne.profession}
                        </span>
                        {p.personne.date_naissance && (
                          <span className="text-xs" style={{ color:'#94a3b8' }}>
                            {t('detail.ne_le')} {p.personne.date_naissance.split(' ')[0]}
                            {p.personne.lieu_naiss ? ` ${t('detail.a')} ${p.personne.lieu_naiss}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <User size={32} style={{ color:'#e2e8f0' }} />
                  <p className="text-sm" style={{ color:'#94a3b8' }}>{t('detail.aucune_personne')}</p>
                </div>
              )}
            </div>

            {/* Photo CIN */}
            {demande.photo_cin && (
              <div className="bg-white rounded-2xl p-6"
                style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background:'rgba(26,58,107,0.1)' }}>
                    <FileText size={18} style={{ color:'#1a3a6b' }} />
                  </div>
                  <h3 className="font-bold text-base" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                    {t('agent.photo_cin')}
                  </h3>
                </div>
                <img src={demande.photo_cin} alt="CIN"
                  className="w-full rounded-xl object-cover" style={{ maxHeight:220 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>

          {/* ════ COLONNE DROITE ════ */}
          <div className="flex flex-col gap-5">

            {/* Recherche acte */}
            <div className="bg-white rounded-2xl p-6"
              style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(240,180,41,0.12)' }}>
                  <Search size={18} style={{ color:'#f0b429' }} />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                    {t('agent.recherche_acte')}
                  </h3>
                  <p className="text-xs" style={{ color:'#94a3b8' }}>{t('agent.trie_desc')}</p>
                </div>
              </div>

              <div className="relative">
                <label className="input flex items-center gap-3 border-2"
                  style={{ borderColor:'#e2e8f0', borderRadius:12, background:'#f8fafc' }}>
                  <Search size={16} style={{ color:'#94a3b8', flexShrink:0 }} />
                  <input
                    className="grow bg-transparent outline-none text-sm"
                    style={{ color:'#334155' }}
                    value={recherche}
                    onChange={e => setRecherche(e.target.value)}
                    placeholder="N° acte (ex: NAISS-2024-001)"
                  />
                </label>

                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white z-50 overflow-hidden mt-1"
                    style={{ borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', border:'1px solid #e2e8f0' }}>
                    {suggestions.map((acte: ActeDetail, i: number) => (
                      <button key={acte.id_acte} onClick={() => clickSugg(acte)}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                        style={{ borderBottom: i < suggestions.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                        <FileText size={14} style={{ color:'#1a3a6b', flexShrink:0 }} />
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold" style={{ color:'#1a3a6b' }}>{acte.num_acte}</span>
                          <span className="text-xs" style={{ color:'#94a3b8' }}>{acte.type_acte}</span>
                        </div>
                        <ChevronRight size={14} style={{ color:'#94a3b8' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {acteLoading && (
                <div className="flex items-center gap-3 mt-4 p-3 rounded-xl" style={{ background:'#f8fafc' }}>
                  <span className="loading loading-spinner loading-sm" style={{ color:'#f0b429' }} />
                  <span className="text-sm" style={{ color:'#64748b' }}>{t('detail.chargement_acte')}</span>
                </div>
              )}

              {actePreview && !acteLoading && (
                <div className="mt-4 overflow-hidden rounded-2xl border-2" style={{ borderColor:'#1a3a6b' }}>
                  <div className="flex items-center justify-between px-4 py-3"
                    style={{ background:'linear-gradient(135deg,#1a3a6b,#0d2348)' }}>
                    <div>
                      <div className="font-bold text-sm" style={{ color:'#f0b429' }}>{actePreview.num_acte}</div>
                      <div className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.55)' }}>
                        {actePreview.type_acte} · {new Date(actePreview.date_acte).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <button onClick={() => setActePreview(null)} className="btn btn-ghost btn-xs"
                      style={{ color:'rgba(255,255,255,0.6)' }}>
                      <X size={16} />
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 max-h-64 overflow-y-auto flex flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color:'#94a3b8' }}>
                      {t('detail.personnes_enregistrees')}
                    </p>
                    {!actePreview.personnes || actePreview.personnes.length === 0 ? (
                      <p className="text-sm text-center py-2" style={{ color:'#94a3b8' }}>{t('detail.aucune_personne')}</p>
                    ) : (
                      actePreview.personnes.map((p: ActePersonne, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl"
                          style={{ border:'1px solid #f1f5f9' }}>
                          <span className="text-xs font-bold" style={{ color:'#1a3a6b', minWidth:90, flexShrink:0 }}>
                            {ROLE_LABEL[p.role] || p.role}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold" style={{ color:'#334155' }}>
                              {p.prenom_personne} {p.nom_personne}
                            </span>
                            {p.date_naissance && (
                              <span className="text-xs" style={{ color:'#94a3b8' }}>
                                {p.date_naissance.split(' ')[0]}
                                {p.lieu_naiss ? ` · ${p.lieu_naiss}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-3 p-4 bg-white" style={{ borderTop:'1px solid #f1f5f9' }}>
                    <button onClick={confirmer}
                      className="btn btn-sm flex-1 border-0 gap-2 font-semibold"
                      style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', borderRadius:10, boxShadow:'0 4px 12px rgba(16,185,129,0.3)' }}>
                      <CheckCircle size={15} />
                      {t('agent.bon_acte')}
                    </button>
                    <button onClick={() => setActePreview(null)} className="btn btn-sm border-0"
                      style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444', borderRadius:10 }}>
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )}

              {acteConfirme && (
                <div className="flex items-center justify-between mt-4 p-4 rounded-2xl"
                  style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)' }}>
                  <div className="flex items-center gap-3">
                    <CheckCircle size={18} style={{ color:'#10b981' }} />
                    <div>
                      <div className="text-sm font-bold" style={{ color:'#047857' }}>{t('agent.acte_confirme')}</div>
                      <div className="text-xs mt-0.5" style={{ color:'#10b981' }}>{acteConfirme.num_acte}</div>
                    </div>
                  </div>
                  <button onClick={() => setActeConfirme(null)} className="btn btn-ghost btn-xs" style={{ color:'#94a3b8' }}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            {demande.statut_demande === 'EN ATTENTE' && (
              <div className="bg-white rounded-2xl p-6"
                style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background:'rgba(26,58,107,0.1)' }}>
                    <Unlock size={18} style={{ color:'#1a3a6b' }} />
                  </div>
                  <h3 className="font-bold text-base" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                    Actions
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={valider} disabled={acting}
                    className="btn border-0 gap-2 font-semibold w-full"
                    style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', borderRadius:12, height:48, boxShadow:'0 4px 12px rgba(16,185,129,0.3)' }}>
                    {acting
                      ? <span className="loading loading-spinner loading-sm" />
                      : <><CheckCircle size={17}/>{t('agent.valider_dem')}</>
                    }
                  </button>
                  <button onClick={() => setShowRefus(true)} disabled={acting}
                    className="btn border-0 gap-2 font-semibold w-full"
                    style={{ background:'rgba(239,68,68,0.08)', color:'#ef4444', borderRadius:12, height:48, border:'1px solid rgba(239,68,68,0.2)' }}>
                    <XCircle size={17}/>{t('agent.refuser_dem')}
                  </button>
                </div>
              </div>
            )}

            {/* PDF */}
            {canPDF && (
              <div className="bg-white rounded-2xl p-6"
                style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background:'rgba(139,92,246,0.1)' }}>
                    <Download size={18} style={{ color:'#8b5cf6' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                      {t('agent.doc_pdf')}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>
                      {demande.url_pdf
                        ? <>{t('detail.pdf_dispo')} · <span style={{ color:'#10b981', fontWeight:600 }}>{t('agent.deja_genere')}</span></>
                        : t('agent.generer_pour')
                      }
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={genPDF} className="btn border-0 gap-2 font-semibold w-full"
                    style={{
                      background   : demande.url_pdf ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
                      color        : '#fff',
                      borderRadius : 12,
                      height       : 48,
                      boxShadow    : demande.url_pdf ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(139,92,246,0.3)',
                    }}>
                    <Download size={17}/>
                    {demande.url_pdf ? t('common.ouvrir_pdf') : t('common.generer_pdf')}
                  </button>

                  {demande.url_pdf && (
                    <button onClick={envoyerEmail} className="btn border-0 gap-2 font-semibold w-full"
                      style={{ background:'rgba(26,58,107,0.08)', color:'#1a3a6b', borderRadius:12, height:48, border:'1px solid rgba(26,58,107,0.15)' }}>
                      <Mail size={17}/>
                      {t('common.envoyer_citoyen')} · <span style={{ color:'#f0b429', fontSize:11 }}>{demande.email_citoyen}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Refus */}
      {showRefus && (
        <div className="modal modal-open">
          <div className="modal-box rounded-2xl p-7" style={{ maxWidth:440 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:'rgba(239,68,68,0.1)' }}>
                <XCircle size={20} style={{ color:'#ef4444' }} />
              </div>
              <h3 className="font-bold text-lg" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                {t('agent.motif_refus')}
              </h3>
            </div>
            <textarea
              value={motif}
              onChange={e => setMotif(e.target.value)}
              placeholder={t('agent.motif_ph')}
              rows={4}
              className="textarea w-full border-2 rounded-xl text-sm"
              style={{ borderColor:'#e2e8f0', background:'#f8fafc', color:'#334155', resize:'vertical' }}
            />
            <div className="flex gap-3 mt-5">
              <button onClick={refuser} disabled={!motif.trim() || acting}
                className="btn flex-1 border-0 gap-2 font-semibold"
                style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444', borderRadius:12 }}>
                {t('agent.confirmer_refus')}
              </button>
              <button onClick={() => setShowRefus(false)}
                className="btn flex-1 border-0 font-semibold"
                style={{ background:'#f8fafc', color:'#64748b', borderRadius:12, border:'1px solid #e2e8f0' }}>
                {t('common.annuler')}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowRefus(false)} />
        </div>
      )}
    </AgentLayout>
  );
}