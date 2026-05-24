// src/pages/citoyens/Accueil.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PlusCircle, Search, MapPin,
  FileText, Clock, CheckCircle, XCircle,
} from 'lucide-react';
import SharedLayout from '../../components/SharedLayout';
import { authService }    from '../../service/authService';
import { demandeService } from '../../service/demandeService';
import type { Utilisateur } from '../../type';
import ProfilingImg from '../../assets/porfil.svg';

export default function CitoyenAccueil() {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const [profil,   setProfil]   = useState<Utilisateur | null>(null);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      authService.getProfil(),
      demandeService.getMesDemandes(),
    ]).then(([p, d]) => {
      if (cancelled) return;
      setProfil(p.data);
      setDemandes(Array.isArray(d.data) ? d.data : []);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const stats = {
    total     : demandes.length,
    en_attente: demandes.filter(d => d.statut_demande === 'EN ATTENTE').length,
    valider   : demandes.filter(d => d.statut_demande === 'VALIDER').length,
    terminer  : demandes.filter(d => d.statut_demande === 'TERMINER').length,
  };

  const STATUT_CFG: Record<string, { bg: string; color: string; label: string }> = {
    'EN ATTENTE': { bg:'rgba(245,158,11,0.1)',  color:'#b45309', label: t('statut.en_attente') },
    'VALIDER'   : { bg:'rgba(16,185,129,0.1)',  color:'#047857', label: t('statut.valider')    },
    'REFUSER'   : { bg:'rgba(239,68,68,0.1)',   color:'#b91c1c', label: t('statut.refuser')    },
    'TERMINER'  : { bg:'rgba(139,92,246,0.1)',  color:'#6d28d9', label: t('statut.terminer')   },
  };

  const dernieres = demandes.slice(0, 3);

  if (loading) return (
    <SharedLayout>
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg" style={{ color:'#1a3a6b' }} />
      </div>
    </SharedLayout>
  );

  return (
    <SharedLayout>
      <div className="flex flex-col gap-6">

        {/* ══ Bannière ══ */}
        <div
          className="rounded-2xl relative overflow-hidden"
          style={{ background:'#0e2f76', minHeight:180 }}
        >
          <div className="absolute rounded-full pointer-events-none"
            style={{ background:'rgba(255,255,255,0.05)', width:320, height:320, top:'-40%', left:'-5%' }} />
          <div className="absolute rounded-full pointer-events-none"
            style={{ background:'rgba(240,180,41,0.08)', width:200, height:200, bottom:'-50%', left:'25%' }} />

          <div className="relative z-10 flex items-center justify-between px-8 py-7">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color:'rgba(255,255,255,0.5)' }}>
                  {t('accueil.bonjour')}
                </p>
                <h1 className="text-3xl font-bold"
                  style={{ color:'#fff', fontFamily:'Sora,sans-serif', lineHeight:1.2 }}>
                  {profil?.nom_user} {profil?.prenom_user}
                </h1>
              </div>
              {(profil?.nom_commune || profil?.nom_arondissement) && (
                <p className="text-sm flex items-center gap-1.5" style={{ color:'rgba(255,255,255,0.4)' }}>
                  <MapPin size={13} style={{ color:'rgba(255,255,255,0.4)' }} />
                  {profil?.nom_commune}
                  {profil?.nom_arondissement ? ` · ${profil.nom_arondissement}` : ''}
                </p>
              )}
              <span className="badge font-semibold px-3 py-2 w-fit mt-1"
                style={{ background:'rgba(240,180,41,0.18)', color:'#f0b429', border:'1px solid rgba(240,180,41,0.3)', borderRadius:8, fontSize:12 }}>
                {profil?.role}
              </span>
            </div>

            <div className="flex-shrink-0 relative" style={{ width:260, height:180 }}>
              <img src={ProfilingImg} alt="illustration"
                style={{ position:'absolute', bottom:0, right:-16, height:210, width:'auto', objectFit:'contain' }} />
            </div>
          </div>
        </div>

        {/* ══ Stats ══ */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: t('accueil.total'),      val:stats.total,      icon:<FileText    size={20}/>, color:'#1a3a6b', bg:'rgba(26,58,107,0.1)',  border:'#1a3a6b' },
            { label: t('accueil.en_attente'), val:stats.en_attente, icon:<Clock       size={20}/>, color:'#b45309', bg:'rgba(245,158,11,0.1)', border:'#f59e0b' },
            { label: t('accueil.validees'),   val:stats.valider,    icon:<CheckCircle size={20}/>, color:'#047857', bg:'rgba(16,185,129,0.1)', border:'#10b981' },
            { label: t('accueil.terminees'),  val:stats.terminer,   icon:<XCircle     size={20}/>, color:'#6d28d9', bg:'rgba(139,92,246,0.1)', border:'#8b5cf6' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-3"
              style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9', borderLeft:`4px solid ${s.border}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:s.bg, color:s.color }}>
                {s.icon}
              </div>
              <div>
                <div className="font-bold text-xl" style={{ color:s.color, fontFamily:'Sora,sans-serif', lineHeight:1.1 }}>
                  {s.val}
                </div>
                <div className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ══ Actions rapides ══ */}
        <div>
          <h2 className="font-bold text-base mb-4" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
            {t('accueil.que_faire')}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                icon  : <PlusCircle size={28} />,
                titre : t('common.nouvelle_dem'),
                sous  : t('accueil.nouvelle_sous'),
                href  : '/citoyen/demande',
                bg    : 'linear-gradient(135deg,#1a3a6b,#2456a0)',
                shadow: 'rgba(26,58,107,0.35)',
                dark  : false,
              },
              {
                icon  : <Search size={28} />,
                titre : t('common.suivi'),
                sous  : t('accueil.suivi_sous'),
                href  : '/citoyen/suivi',
                bg    : 'linear-gradient(135deg,#10b981,#059669)',
                shadow: 'rgba(16,185,129,0.35)',
                dark  : false,
              },
              {
                icon  : <MapPin size={28} />,
                titre : t('common.arrondissements'),
                sous  : t('accueil.arrond_sous'),
                href  : '/citoyen/arrondissements',
                bg    : 'linear-gradient(135deg,#f0b429,#fcd34d)',
                shadow: 'rgba(240,180,41,0.35)',
                dark  : true,
              },
            ].map((a, i) => (
              <button key={i} onClick={() => navigate(a.href)}
                className="rounded-2xl p-6 flex flex-col items-start gap-3 text-left transition-all hover:scale-105"
                style={{ background:a.bg, boxShadow:`0 8px 24px ${a.shadow}`, border:'none', cursor:'pointer' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(255,255,255,0.2)', color: a.dark ? '#0a1830' : '#fff' }}>
                  {a.icon}
                </div>
                <div>
                  <div className="font-bold text-base"
                    style={{ color: a.dark ? '#0a1830' : '#fff', fontFamily:'Sora,sans-serif' }}>
                    {a.titre}
                  </div>
                  <div className="text-xs mt-1"
                    style={{ color: a.dark ? 'rgba(10,24,48,0.6)' : 'rgba(255,255,255,0.7)' }}>
                    {a.sous}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ══ Dernières demandes ══ */}
        {dernieres.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                {t('accueil.dernieres_dem')}
              </h2>
              <button onClick={() => navigate('/citoyen/suivi')}
                className="btn btn-ghost btn-sm gap-1 text-sm font-semibold"
                style={{ color:'#1a3a6b' }}>
                {t('common.voir_tout')}
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {dernieres.map((d: any, i: number) => {
                const st = STATUT_CFG[d.statut_demande] ?? { bg:'#f1f5f9', color:'#64748b', label:d.statut_demande };
                return (
                  <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-4"
                    style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background:'rgba(26,58,107,0.1)' }}>
                      <FileText size={18} style={{ color:'#1a3a6b' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm" style={{ color:'#f0b429', fontFamily:'Sora,sans-serif' }}>
                        {d.num_demande}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>{d.type_acte}</div>
                    </div>
                    <span className="badge font-semibold px-3 py-2 flex-shrink-0"
                      style={{ background:st.bg, color:st.color, border:'none', borderRadius:8 }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ height:16 }} />
      </div>
    </SharedLayout>
  );
}