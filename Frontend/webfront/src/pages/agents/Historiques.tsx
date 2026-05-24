// src/pages/agents/Historiques.tsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, User, Calendar, FileText, Info } from 'lucide-react';
import AgentLayout from '../../components/AgentLayout';
import { demandeService } from '../../service/demandeService';
import type { JournalEntry } from '../../type';

export default function Historique() {
  const { t }                              = useTranslation();
  const [items,   setItems]   = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    demandeService.getHistorique()
      .then(r => { if (!cancelled) setItems(r.data.historique ?? []); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const itemsValides = items.filter(item =>
    item.action !== 'CONSULTER' &&
    item.horodatage !== 'None' &&
    item.num_demande !== 'N/A'
  );

  if (loading) return (
    <AgentLayout>
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg" style={{ color:'#1a3a6b' }} />
      </div>
    </AgentLayout>
  );

  return (
    <AgentLayout>
      <div className="flex flex-col gap-6">

        {/* ══ Stats ══ */}
        <div className="grid grid-cols-3 gap-5">
          {[
            {
              label : t('historique.total_actions'),
              value : itemsValides.length,
              icon  : <FileText size={22} />,
              color : '#1a3a6b',
              bg    : 'rgba(26,58,107,0.1)',
              border: '#1a3a6b',
            },
            {
              label : t('historique.validees'),
              value : itemsValides.filter(i => i.action === 'VALIDER').length,
              icon  : <CheckCircle size={22} />,
              color : '#047857',
              bg    : 'rgba(16,185,129,0.1)',
              border: '#10b981',
            },
            {
              label : t('historique.refusees'),
              value : itemsValides.filter(i => i.action === 'REFUSER').length,
              icon  : <XCircle size={22} />,
              color : '#b91c1c',
              bg    : 'rgba(239,68,68,0.1)',
              border: '#ef4444',
            },
          ].map((s, i) => (
            <div key={i} className="bg-white p-5 flex items-center gap-4"
              style={{
                boxShadow  : '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                border     : '1px solid #f1f5f9',
                borderLeft : `2px solid ${s.border}`,
                borderRight: `2px solid ${s.border}`,
              }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:s.bg, color:s.color }}>
                {s.icon}
              </div>
              <div>
                <div className="font-bold" style={{ fontSize:28, color:s.color, fontFamily:'Sora,sans-serif', lineHeight:1.1 }}>
                  {s.value}
                </div>
                <div className="text-xs mt-1" style={{ color:'#94a3b8' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ══ Liste ══ */}
        <div className="bg-white overflow-hidden"
          style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom:'1px solid #f1f5f9' }}>
            <div>
              <h2 className="font-bold text-lg" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                {t('historique.titre')}
              </h2>
              <p className="text-xs mt-1" style={{ color:'#94a3b8' }}>
                {t('historique.sous_titre')}
              </p>
            </div>
            <span className="badge badge-sm font-semibold px-3 py-3"
              style={{ background:'rgba(26,58,107,0.08)', color:'#1a3a6b', border:'none' }}>
              {itemsValides.length} {t('historique.action_s')}
            </span>
          </div>

          {/* Vide */}
          {itemsValides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background:'rgba(26,58,107,0.08)' }}>
                <FileText size={28} style={{ color:'#1a3a6b' }} />
              </div>
              <p className="font-medium" style={{ color:'#64748b' }}>{t('historique.aucune')}</p>
              <p className="text-sm" style={{ color:'#94a3b8' }}>{t('historique.aucune_desc')}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {itemsValides.map((item: JournalEntry, i: number) => {
                const ok     = item.action === 'VALIDER';
                const color  = ok ? '#047857' : '#b91c1c';
                const bg     = ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)';
                const border = ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)';

                return (
                  <div key={item.id_journal}
                    className="flex items-start gap-4 px-6 py-5 transition-colors hover:bg-gray-50"
                    style={{
                      borderBottom: i < itemsValides.length - 1 ? '1px solid #f8fafc' : 'none',
                      borderLeft  : `4px solid ${ok ? '#10b981' : '#ef4444'}`,
                    }}>

                    {/* Icône */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background:bg }}>
                      {ok
                        ? <CheckCircle size={18} style={{ color }} />
                        : <XCircle    size={18} style={{ color }} />
                      }
                    </div>

                    {/* Contenu */}
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-sm" style={{ color:'#f0b429', fontFamily:'Sora,sans-serif' }}>
                          {item.num_demande}
                        </span>
                        <span className="badge badge-sm font-semibold px-2 py-1.5"
                          style={{ background:bg, color, border:`1px solid ${border}`, borderRadius:8 }}>
                          {ok ? t('statut.valider') : t('statut.refuser')}
                        </span>
                        {item.type_acte && item.type_acte !== 'N/A' && (
                          <span className="badge badge-sm font-medium px-2 py-1.5"
                            style={{ background:'rgba(26,58,107,0.08)', color:'#1a3a6b', border:'none', borderRadius:8 }}>
                            {item.type_acte}
                          </span>
                        )}
                      </div>

                      {item.citoyen && item.citoyen !== 'N/A' && (
                        <div className="flex items-center gap-2">
                          <User size={13} style={{ color:'#94a3b8', flexShrink:0 }} />
                          <span className="text-sm" style={{ color:'#334155' }}>{item.citoyen}</span>
                        </div>
                      )}

                      {item.motif && item.motif.trim() !== '' && (
                        <div className="flex items-start gap-2 p-3 rounded-xl"
                          style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
                          <Info size={14} style={{ color:'#f59e0b', flexShrink:0, marginTop:1 }} />
                          <div>
                            <span className="text-xs font-semibold" style={{ color:'#b45309' }}>
                              {t('agent.motif_refus')}
                            </span>
                            <p className="text-xs mt-0.5" style={{ color:'#92400e' }}>{item.motif}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} style={{ color:'#94a3b8' }} />
                        <span className="text-xs" style={{ color:'#94a3b8' }}>
                          {new Date(item.horodatage).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color:'#cbd5e1' }}>
                        {new Date(item.horodatage).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}