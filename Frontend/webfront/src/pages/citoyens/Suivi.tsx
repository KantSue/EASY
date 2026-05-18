// src/pages/citoyen/Suivi.tsx
import { useEffect, useState } from 'react';
import {
  FileText, Download, Clock,
  CheckCircle, XCircle, Award, AlertCircle,
} from 'lucide-react';
import SharedLayout from '../../components/SharedLayout';
import { demandeService } from '../../service/demandeService';

const STATUT_CFG: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  'EN ATTENTE': { bg:'rgba(245,158,11,0.1)',  color:'#b45309', label:'En attente', icon:<Clock       size={14}/> },
  'VALIDER'   : { bg:'rgba(16,185,129,0.1)',  color:'#047857', label:'Validée',    icon:<CheckCircle size={14}/> },
  'REFUSER'   : { bg:'rgba(239,68,68,0.1)',   color:'#b91c1c', label:'Refusée',    icon:<XCircle     size={14}/> },
  'TERMINER'  : { bg:'rgba(139,92,246,0.1)',  color:'#6d28d9', label:'Terminée',   icon:<Award       size={14}/> },
};

const TYPE_COLOR: Record<string, string> = {
  'acte naissance': '#0891b2',
  'acte mariage'  : '#e11d48',
  'acte décès'    : '#7c3aed',
};

export default function CitoyenSuivi() {
  const [demandes,    setDemandes]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [filtre,      setFiltre]      = useState('');
  const [msg,         setMsg]         = useState<{ type:'ok'|'err'; text:string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    demandeService.getMesDemandes()
      .then(r => { if (!cancelled) setDemandes(Array.isArray(r.data) ? r.data : []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

 const telecharger = async (id: number) => {
  setDownloading(id);
  try {
    const r   = await demandeService.getPDFCitoyen(id);
    const url = r.data?.url_pdf;
    if (!url) { setMsg({ type:'err', text:'PDF non disponible.' }); return; }

    // Ouvrir dans un nouvel onglet
    window.open(url, '_blank');
    setMsg({ type:'ok', text:'PDF ouvert dans un nouvel onglet.' });
  } catch (err: any) {
    const msgErr = err?.response?.data?.error
      || err?.response?.data?.detail
      || 'Impossible de télécharger le PDF.';
    setMsg({ type:'err', text: String(msgErr) });
  } finally { setDownloading(null); }
};

  const filtrees = filtre
    ? demandes.filter(d => d.statut_demande === filtre)
    : demandes;

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

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
              Mes demandes
            </h1>
            <p className="text-sm mt-0.5" style={{ color:'#94a3b8' }}>
              {demandes.length} demande{demandes.length > 1 ? 's' : ''} au total
            </p>
          </div>

          {/* Filtre statut */}
          <select
            className="select border-2 rounded-xl text-sm"
            style={{ borderColor:'#e2e8f0', background:'#f8fafc', color:'#334155', height:44 }}
            value={filtre}
            onChange={e => setFiltre(e.target.value)}
            aria-label="Filtrer par statut"
          >
            <option value="">Tous les statuts</option>
            <option value="EN ATTENTE">En attente</option>
            <option value="VALIDER">Validées</option>
            <option value="REFUSER">Refusées</option>
            <option value="TERMINER">Terminées</option>
          </select>
        </div>

        {/* Message */}
        {msg && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{
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
            <button onClick={() => setMsg(null)} className="btn btn-ghost btn-xs">✕</button>
          </div>
        )}

        {/* Liste */}
        {filtrees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background:'rgba(26,58,107,0.08)' }}>
              <FileText size={28} style={{ color:'#1a3a6b' }} />
            </div>
            <p className="font-medium" style={{ color:'#64748b' }}>Aucune demande</p>
            <p className="text-sm" style={{ color:'#94a3b8' }}>
              {filtre ? 'Aucune demande avec ce statut' : 'Vous n\'avez pas encore déposé de demande'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtrees.map((d: any, i: number) => {
              const st    = STATUT_CFG[d.statut_demande] ?? { bg:'#f1f5f9', color:'#64748b', label:d.statut_demande, icon:null };
              const tcol  = TYPE_COLOR[d.type_acte] ?? '#1a3a6b';

              return (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5"
                  style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}
                >
                  {/* Header card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${tcol}18` }}>
                        <FileText size={18} style={{ color:tcol }} />
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color:'#f0b429', fontFamily:'Sora,sans-serif' }}>
                          {d.num_demande}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>{d.type_acte}</div>
                      </div>
                    </div>
                    <span
                      className="badge font-semibold px-3 py-2 gap-1.5"
                      style={{ background:st.bg, color:st.color, border:'none', borderRadius:8 }}
                    >
                      {st.icon}{st.label}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="flex items-center gap-6 py-3" style={{ borderTop:'1px solid #f8fafc', borderBottom: d.motif_refus || d.statut_demande === 'TERMINER' ? '1px solid #f8fafc' : 'none' }}>
                    <div>
                      <div className="text-xs" style={{ color:'#94a3b8' }}>Date dépôt</div>
                      <div className="text-sm font-medium mt-0.5" style={{ color:'#334155' }}>
                        {new Date(d.date_depot).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}
                      </div>
                    </div>
                    {d.num_acte && (
                      <div>
                        <div className="text-xs" style={{ color:'#94a3b8' }}>N° acte</div>
                        <div className="text-sm font-medium mt-0.5" style={{ color:'#334155' }}>{d.num_acte}</div>
                      </div>
                    )}
                  </div>

                  {/* Motif refus */}
                  {d.motif_refus && (
                    <div
                      className="flex items-start gap-2 p-3 rounded-xl mt-3"
                      style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}
                    >
                      <AlertCircle size={14} style={{ color:'#f59e0b', flexShrink:0, marginTop:1 }} />
                      <div>
                        <div className="text-xs font-semibold" style={{ color:'#b45309' }}>Motif de refus</div>
                        <div className="text-xs mt-0.5" style={{ color:'#92400e' }}>{d.motif_refus}</div>
                      </div>
                    </div>
                  )}

                  {/* Bouton PDF si TERMINER */}
                  {d.statut_demande === 'TERMINER' && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => telecharger(d.id_demande)}
                        disabled={downloading === d.id_demande}
                        className="btn border-0 gap-2 font-semibold flex-1"
                        style={{ background:'linear-gradient(135deg,#8b5cf6,#7c3aed)', color:'#fff', borderRadius:10, height:44, boxShadow:'0 4px 12px rgba(139,92,246,0.3)' }}
                      >
                        {downloading === d.id_demande
                          ? <span className="loading loading-spinner loading-sm"/>
                          : <><Download size={16}/>Télécharger mon acte</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SharedLayout>
  );
}