// src/components/Topbar.tsx
import { useTranslation } from 'react-i18next';

interface Props { titre: string; nom: string; role: string; }

export default function Topbar({ titre, nom, role }: Props) {
  const { i18n } = useTranslation();
  const initiales = nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const toggleLang = () => {
    const next = i18n.language === 'fr' ? 'mg' : 'fr';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  return (
    <div
      className="flex items-center justify-between px-8 py-4 sticky top-0 z-40"
      style={{
        background   : '#fff',
        borderBottom : '1px solid #eaeff6',
        boxShadow    : '0 1px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Titre ── */}
      <div>
        <img
            src="/back.png"
            alt="Logo secondaire"
            className="w-10 h-10 object-contain drop-shadow-2xl"
          />
        <h1
          className="text-2xl font-bold"
          style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}
        >
          {titre}
        </h1>
      </div>

      {/* ── Droite ── */}
      <div className="flex items-center gap-3">

        {/* Toggle langue */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all"
          style={{
            background : i18n.language === 'mg'
              ? 'rgba(240,180,41,0.15)'
              : 'rgba(26,58,107,0.08)',
            color      : i18n.language === 'mg' ? '#b45309' : '#1a3a6b',
            border     : `1px solid ${i18n.language === 'mg'
              ? 'rgba(240,180,41,0.3)'
              : 'rgba(26,58,107,0.15)'}`,
            fontFamily : 'Sora,sans-serif',
          }}
        >
          {i18n.language === 'fr' ? '🇲🇬 MG' : '🇫🇷 FR'}
        </button>

        {/* Cloche */}
        

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background : 'linear-gradient(135deg,#1a3a6b,#2456a0)',
              color      : '#fff',
              fontFamily : 'Sora,sans-serif',
              boxShadow  : '0 2px 8px rgba(26,58,107,0.25)',
            }}
          >
            {initiales}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold" style={{ color:'#1a3a6b' }}>
              {nom || '…'}
            </div>
            <div className="text-xs" style={{ color:'#f0b429' }}>{role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}