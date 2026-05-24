// src/pages/agents/file_attente.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Inbox, Flame, FileText, User,
  Calendar, ArrowRight, Lock, CheckCircle,
} from 'lucide-react';
import AgentLayout from '../../components/AgentLayout';
import { demandeService } from '../../service/demandeService';
import type { DemandeResume } from '../../type';

export default function FileAttente() {
  const navigate   = useNavigate();
  const { t }      = useTranslation();
  const [demandes, setDemandes] = useState<DemandeResume[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    demandeService.getFileAttente()
      .then(r => setDemandes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleClick = (d: DemandeResume, i: number) => {
    if (i === 0) navigate(`/agent/detail?id=${d.id_demande}`);
  };

  const stats = [
    {
      label    : t('file.total_attente'),
      value    : demandes.length,
      icon     : <Inbox size={22} />,
      iconBg   : 'rgba(26,58,107,0.12)',
      iconColor: '#1a3a6b',
      trend    : null,
    },
    {
      label     : t('file.demande_prio'),
      value     : demandes[0]?.num_demande || '—',
      icon      : <Flame size={22} />,
      iconBg    : 'rgba(239,68,68,0.1)',
      iconColor : '#ef4444',
      trend     : demandes.length > 0 ? t('file.en_cours') : null,
      trendColor: '#ef4444',
    },
    {
      label    : t('file.type_prio'),
      value    : demandes[0]?.type_acte || '—',
      icon     : <FileText size={22} />,
      iconBg   : 'rgba(240,180,41,0.12)',
      iconColor: '#f0b429',
      trend    : null,
    },
  ];

  return (
    <AgentLayout>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg" style={{ color:'#1a3a6b' }} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* ══ Stat Cards ══ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stats.map((s, i) => (
              <div key={i} className="bg-white p-6 flex items-center gap-5"
                style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background:s.iconBg, color:s.iconColor }}>
                  {s.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium" style={{ color:'#64748b' }}>{s.label}</span>
                  <span className="font-bold leading-tight"
                    style={{ fontSize: typeof s.value === 'number' ? 32 : 18, color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                    {s.value}
                  </span>
                  {s.trend && (
                    <span className="text-xs font-semibold" style={{ color: s.trendColor }}>
                      {s.trend}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ══ Table ══ */}
          <div className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom:'1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                  {t('nav.file_attente')}
                </h2>
                <p className="text-xs mt-1" style={{ color:'#94a3b8' }}>
                  {t('file.description')}
                </p>
              </div>
              <div className="badge badge-sm font-semibold px-3 py-3"
                style={{ background:'rgba(26,58,107,0.08)', color:'#1a3a6b', border:'none' }}>
                {demandes.length} {t('file.demande_s')}
              </div>
            </div>

            {/* Vide */}
            {!demandes.length ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background:'rgba(16,185,129,0.1)' }}>
                  <CheckCircle size={32} style={{ color:'#10b981' }} />
                </div>
                <p className="font-medium" style={{ color:'#64748b' }}>{t('file.aucune')}</p>
                <p className="text-sm" style={{ color:'#94a3b8' }}>{t('file.toutes_traitees')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr style={{ background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
                      {['#', t('file.col_num'), t('file.col_type'), t('file.col_citoyen'), t('file.col_date'), t('file.col_action')].map((h, i) => (
                        <th key={i} className="text-xs font-bold uppercase tracking-wide py-4 px-5"
                          style={{ color:'#94a3b8', background:'transparent', borderBottom:'none' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {demandes.map((d, i) => (
                      <tr key={d.id_demande} className="transition-colors"
                        style={{
                          borderLeft  : i === 0 ? '4px solid #ef4444' : '4px solid transparent',
                          background  : i === 0 ? '#fff' : '#fafbfc',
                          opacity     : i === 0 ? 1 : 0.6,
                          borderBottom: '1px solid #f8fafc',
                        }}>
                        {/* Rang */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: i === 0 ? 'linear-gradient(135deg,#ef4444,#ff6b6b)' : '#e2e8f0', color: i === 0 ? '#fff' : '#94a3b8' }}>
                              {i + 1}
                            </div>
                            {i === 0 && <Flame size={14} style={{ color:'#ef4444' }} />}
                          </div>
                        </td>

                        {/* Numéro */}
                        <td className="px-5 py-4">
                          <span className="font-bold text-sm" style={{ color:'#f0b429', fontFamily:'Sora,sans-serif' }}>
                            {d.num_demande}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-4">
                          <div className="badge badge-sm font-medium px-3 py-2"
                            style={{ background:'rgba(26,58,107,0.08)', color:'#1a3a6b', border:'none', borderRadius:8 }}>
                            {d.type_acte}
                          </div>
                        </td>

                        {/* Citoyen */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background:'rgba(26,58,107,0.1)', color:'#1a3a6b' }}>
                              <User size={13} />
                            </div>
                            <span className="text-sm font-medium" style={{ color:'#334155' }}>
                              {(d as DemandeResume).citoyen || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={13} style={{ color:'#94a3b8' }} />
                            <span className="text-sm" style={{ color:'#64748b' }}>
                              {(d as DemandeResume).date_depot?.split('T')[0] || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleClick(d, i)}
                            disabled={i !== 0}
                            className="btn btn-sm gap-2 border-0 font-semibold"
                            style={{
                              background  : i === 0 ? 'linear-gradient(135deg,#1a3a6b,#2456a0)' : '#f1f5f9',
                              color       : i === 0 ? '#fff' : '#94a3b8',
                              borderRadius: 10,
                              cursor      : i === 0 ? 'pointer' : 'not-allowed',
                              boxShadow   : i === 0 ? '0 4px 12px rgba(26,58,107,0.3)' : 'none',
                            }}
                          >
                            {i === 0
                              ? <><ArrowRight size={14}/>{t('agent.traiter')}</>
                              : <><Lock size={14}/>{t('file.bloque')}</>
                            }
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AgentLayout>
  );
}