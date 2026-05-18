// src/pages/citoyen/Arrondissements.tsx
import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, MapPin, Building2 } from 'lucide-react';
import SharedLayout from '../../components/SharedLayout';
import { arrondissementService } from '../../service/arrondissementService';
import type { Arrondissement } from '../../type';

export default function CitoyenArrondissements() {
  const [arronds,  setArronds]  = useState<Arrondissement[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');

  useEffect(() => {
    let cancelled = false;
    arrondissementService.getPublic()
      .then(r => { if (!cancelled) setArronds(Array.isArray(r.data) ? r.data : []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtres = arronds.filter(a =>
    a.nom_arondissement?.toLowerCase().includes(query.toLowerCase()) ||
    a.nom_commune?.toLowerCase().includes(query.toLowerCase())
  );

  const disponibles   = filtres.filter(a => a.statut === 'disponible');
  const indisponibles = filtres.filter(a => a.statut !== 'disponible');

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
        <div>
          <h1 className="text-xl font-bold" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
            Arrondissements
          </h1>
          <p className="text-sm mt-1" style={{ color:'#94a3b8' }}>
            {disponibles.length} disponible{disponibles.length > 1 ? 's' : ''} sur {arronds.length}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 flex items-center gap-4" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9', borderLeft:'4px solid #10b981' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:'rgba(16,185,129,0.1)' }}>
              <CheckCircle size={22} style={{ color:'#10b981' }} />
            </div>
            <div>
              <div className="font-bold text-2xl" style={{ color:'#10b981', fontFamily:'Sora,sans-serif' }}>{disponibles.length}</div>
              <div className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>Disponibles</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 flex items-center gap-4" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9', borderLeft:'4px solid #ef4444' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:'rgba(239,68,68,0.1)' }}>
              <XCircle size={22} style={{ color:'#ef4444' }} />
            </div>
            <div>
              <div className="font-bold text-2xl" style={{ color:'#ef4444', fontFamily:'Sora,sans-serif' }}>{indisponibles.length}</div>
              <div className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>Indisponibles</div>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-xl p-4" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9' }}>
          <label className="input flex items-center gap-3 border-2" style={{ borderColor:'#e2e8f0', borderRadius:12, background:'#f8fafc' }}>
            <Search size={16} style={{ color:'#94a3b8', flexShrink:0 }} />
            <input
              className="grow bg-transparent outline-none text-sm"
              style={{ color:'#334155' }}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher par nom ou commune…"
              aria-label="Rechercher un arrondissement"
            />
          </label>
        </div>

        {/* Disponibles */}
        <div>
          <h2 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color:'#047857', fontFamily:'Sora,sans-serif' }}>
            <CheckCircle size={18} style={{ color:'#10b981' }} />
            Disponibles ({disponibles.length})
          </h2>
          <div className="flex flex-col gap-3">
            {disponibles.map((a: Arrondissement, i: number) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 flex items-center gap-4"
                style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9', borderLeft:'4px solid #10b981' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'rgba(16,185,129,0.1)' }}>
                  <Building2 size={18} style={{ color:'#10b981' }} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                    {a.nom_arondissement}
                  </div>
                  {a.nom_commune && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={11} style={{ color:'#94a3b8' }} />
                      <span className="text-xs" style={{ color:'#94a3b8' }}>{a.nom_commune}</span>
                    </div>
                  )}
                </div>
                <span className="badge font-semibold px-3 py-2" style={{ background:'rgba(16,185,129,0.1)', color:'#047857', border:'none', borderRadius:8 }}>
                  Ouvert
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Indisponibles */}
        {indisponibles.length > 0 && (
          <div>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color:'#b91c1c', fontFamily:'Sora,sans-serif' }}>
              <XCircle size={18} style={{ color:'#ef4444' }} />
              Indisponibles ({indisponibles.length})
            </h2>
            <div className="flex flex-col gap-3">
              {indisponibles.map((a: Arrondissement, i: number) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 flex items-center gap-4 opacity-70"
                  style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9', borderLeft:'4px solid #ef4444' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'rgba(239,68,68,0.1)' }}>
                    <Building2 size={18} style={{ color:'#ef4444' }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm" style={{ color:'#64748b', fontFamily:'Sora,sans-serif' }}>
                      {a.nom_arondissement}
                    </div>
                    {a.nom_commune && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={11} style={{ color:'#94a3b8' }} />
                        <span className="text-xs" style={{ color:'#94a3b8' }}>{a.nom_commune}</span>
                      </div>
                    )}
                  </div>
                  <span className="badge font-semibold px-3 py-2" style={{ background:'rgba(239,68,68,0.1)', color:'#b91c1c', border:'none', borderRadius:8 }}>
                    Fermé
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SharedLayout>
  );
}