// src/pages/Archives.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, ChevronRight, Baby, Heart, Moon, Folder } from 'lucide-react';
import SharedLayout from '../components/SharedLayout';
import { acteService } from '../service/acteService';
import type { ActeDetail } from '../type';

// ─── Constantes ───────────────────────────────────────────────────────────────
const TYPE_ICON: Record<string, React.ReactNode> = {
  'acte naissance': <Baby  size={20} style={{ color: '#0891b2' }} />,
  'acte mariage'  : <Heart size={20} style={{ color: '#e11d48' }} />,
  'acte décès'    : <Moon  size={20} style={{ color: '#7c3aed' }} />,
};

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  'acte naissance': { bg: 'rgba(8,145,178,0.1)',  color: '#0891b2' },
  'acte mariage'  : { bg: 'rgba(225,29,72,0.1)',  color: '#e11d48' },
  'acte décès'    : { bg: 'rgba(124,58,237,0.1)', color: '#7c3aed' },
};

// ─── Composant ────────────────────────────────────────────────────────────────
export default function Archives() {
  const navigate = useNavigate();

  const [tousActes,   setTousActes]   = useState<ActeDetail[]>([]);
  const [actes,       setActes]       = useState<ActeDetail[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [q,           setQ]           = useState('');
  const [filtre,      setFiltre]      = useState('');
  const [suggestions, setSuggestions] = useState<ActeDetail[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Charger tous les actes au montage ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    acteService.getActes()
      .then(r => {
        if (!cancelled) {
          const data = r.data.actes ?? [];
          setTousActes(data);
          setActes(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTousActes([]);
          setActes([]);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Suggestions Trie ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (q.length < 2) {
      if (suggestions.length > 0) setSuggestions([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      acteService.getSuggestions(q)
        .then(r => {
          if (cancelled) return;
          const data = r.data;
          if (Array.isArray(data))                  setSuggestions(data);
          else if (Array.isArray(data.suggestions)) setSuggestions(data.suggestions);
          else                                      setSuggestions([]);
        })
        .catch(() => { if (!cancelled) setSuggestions([]); });
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  // ── Filtrer localement ───────────────────────────────────────────────────────
  const filtrer = (query: string, type: string, source: ActeDetail[]) => {
    let result = source;
    if (type)  result = result.filter(a => a.type_acte === type);
    if (query) result = result.filter(a =>
      a.num_acte.toLowerCase().includes(query.toLowerCase()) ||
      a.personnes?.some(p =>
        p.nom_personne.toLowerCase().includes(query.toLowerCase()) ||
        p.prenom_personne.toLowerCase().includes(query.toLowerCase())
      )
    );
    return result;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    setSuggestions([]);
    setActes(filtrer(q, filtre, tousActes));
  };

  const handleFiltre = (val: string) => {
    setFiltre(val);
    setActes(filtrer(q, val, tousActes));
  };

  const pickSugg = (acte: ActeDetail) => {
    setQ(acte.num_acte);
    setSuggestions([]);
    setActes(filtrer(acte.num_acte, filtre, tousActes));
  };

  const handleReset = () => {
    setQ('');
    setFiltre('');
    setSuggestions([]);
    setActes(tousActes);
    inputRef.current?.focus();
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SharedLayout>
      <div className="flex flex-col gap-6">

        {/* ══ Barre de recherche ══════════════════════════════════════════════ */}
        <div
          className="bg-white rounded-2xl p-5"
          style={{
            boxShadow : '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
            border    : '1px solid #f1f5f9',
          }}
        >
          <div className="flex gap-3 items-center flex-wrap">

            {/* Input recherche */}
            <div className="relative flex-1 min-w-48">
              <label
                className="input flex items-center gap-3 border-2"
                style={{ borderColor: '#e2e8f0', borderRadius: 12, background: '#f8fafc' }}
              >
                <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  className="grow bg-transparent outline-none text-sm"
                  style={{ color: '#334155' }}
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Rechercher un acte (KMP + Rabin-Karp)…"
                  aria-label="Rechercher un acte"
                />
                {q && (
                  <button
                    onClick={handleReset}
                    className="btn btn-ghost btn-xs p-0"
                    style={{ color: '#94a3b8' }}
                  >
                    ✕
                  </button>
                )}
              </label>

              {/* Dropdown suggestions */}
              {suggestions.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 bg-white z-50 overflow-hidden mt-1"
                  style={{
                    borderRadius : 12,
                    boxShadow    : '0 8px 32px rgba(0,0,0,0.12)',
                    border       : '1px solid #e2e8f0',
                  }}
                >
                  {suggestions.map((acte: ActeDetail, i: number) => {
                    const cfg = TYPE_COLOR[acte.type_acte] ?? { bg: 'rgba(26,58,107,0.08)', color: '#1a3a6b' };
                    return (
                      <button
                        key={acte.id_acte}
                        onClick={() => pickSugg(acte)}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                        style={{ borderBottom: i < suggestions.length - 1 ? '1px solid #f8fafc' : 'none' }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: cfg.bg }}
                        >
                          {TYPE_ICON[acte.type_acte] ?? <FileText size={15} style={{ color: '#1a3a6b' }} />}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold" style={{ color: '#1a3a6b' }}>
                            {acte.num_acte}
                          </span>
                          <span className="text-xs" style={{ color: '#94a3b8' }}>
                            {acte.type_acte}
                          </span>
                        </div>
                        <ChevronRight size={14} style={{ color: '#94a3b8' }} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Filtre type */}
            <select
              className="select border-2 rounded-xl text-sm"
              style={{
                borderColor : '#e2e8f0',
                background  : '#f8fafc',
                color       : '#334155',
                minWidth    : 170,
                height      : 48,
              }}
              value={filtre}
              aria-label="Filtrer par type d'acte"
              onChange={e => handleFiltre(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="acte naissance">Acte de naissance</option>
              <option value="acte mariage">Acte de mariage</option>
              <option value="acte décès">Acte de décès</option>
            </select>

            {/* Bouton rechercher */}
            <button
              onClick={handleSearch}
              className="btn border-0 gap-2 font-semibold"
              style={{
                background   : 'linear-gradient(135deg, #1a3a6b, #2456a0)',
                color        : '#fff',
                borderRadius : 12,
                height       : 48,
                boxShadow    : '0 4px 12px rgba(26,58,107,0.25)',
              }}
            >
              <Search size={17} />
              Rechercher
            </button>
          </div>

          {/* Résumé résultats */}
          {!loading && (
            <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <span className="text-sm" style={{ color: '#94a3b8' }}>
                {actes.length} acte{actes.length > 1 ? 's' : ''} trouvé{actes.length > 1 ? 's' : ''}
                {filtre && <> · <span style={{ color: '#1a3a6b', fontWeight: 600 }}>{filtre}</span></>}
                {q && <> · "<span style={{ color: '#1a3a6b', fontWeight: 600 }}>{q}</span>"</>}
              </span>
              {(q || filtre) && (
                <button
                  onClick={handleReset}
                  className="btn btn-ghost btn-xs"
                  style={{ color: '#94a3b8', fontSize: 12 }}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>

        {/* ══ Résultats ════════════════════════════════════════════════════════ */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <span
              className="loading loading-spinner loading-lg"
              style={{ color: '#1a3a6b' }}
            />
          </div>
        ) : actes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(26,58,107,0.08)' }}
            >
              <Folder size={28} style={{ color: '#1a3a6b' }} />
            </div>
            <div className="text-center">
              <p className="font-semibold" style={{ color: '#334155' }}>
                Aucun acte trouvé
              </p>
              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                Modifiez votre recherche ou réinitialisez les filtres
              </p>
            </div>
            <button
              onClick={handleReset}
              className="btn btn-ghost btn-sm"
              style={{ color: '#1a3a6b', fontWeight: 600 }}
            >
              Voir tous les actes
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {actes.map((acte: ActeDetail, i: number) => {
              const cfg = TYPE_COLOR[acte.type_acte] ?? { bg: 'rgba(26,58,107,0.08)', color: '#1a3a6b' };
              const personnesPrincipales = acte.personnes?.slice(0, 2) ?? [];

              return (
                <button
                  key={acte.id_acte}
                  onClick={() => navigate(`/archives/${acte.id_acte}`)}
                  className="bg-white rounded-2xl p-5 flex items-center gap-4 text-left w-full transition-all hover:shadow-md"
                  style={{
                    boxShadow : '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
                    border    : '1px solid #f1f5f9',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                    (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9';
                  }}
                >
                  {/* Icône type */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg }}
                  >
                    {TYPE_ICON[acte.type_acte] ?? <FileText size={20} style={{ color: '#1a3a6b' }} />}
                  </div>

                  {/* Infos principales */}
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="font-bold text-base"
                        style={{ color: '#f0b429', fontFamily: 'Sora, sans-serif' }}
                      >
                        {acte.num_acte}
                      </span>
                      <span
                        className="badge badge-sm font-medium"
                        style={{ background: cfg.bg, color: cfg.color, border: 'none' }}
                      >
                        {acte.type_acte}
                      </span>
                    </div>

                    {/* Personnes */}
                    {personnesPrincipales.length > 0 && (
                      <div className="flex items-center gap-2">
                        {personnesPrincipales.map((p, j) => (
                          <span key={j} className="text-sm" style={{ color: '#334155' }}>
                            {p.prenom_personne} {p.nom_personne}
                            {j < personnesPrincipales.length - 1 && (
                              <span style={{ color: '#94a3b8' }}> · </span>
                            )}
                          </span>
                        ))}
                        {(acte.personnes?.length ?? 0) > 2 && (
                          <span className="text-xs" style={{ color: '#94a3b8' }}>
                            +{(acte.personnes?.length ?? 0) - 2} autres
                          </span>
                        )}
                      </div>
                    )}

                    {/* Date */}
                    <span className="text-xs" style={{ color: '#94a3b8' }}>
                      {new Date(acte.date_acte).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                  </div>

                  <ChevronRight size={20} style={{ color: '#94a3b8', flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </SharedLayout>
  );
}