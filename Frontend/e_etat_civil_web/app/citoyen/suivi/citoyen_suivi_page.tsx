'use client';

import { useEffect, useState } from 'react';
import api from '@/app/api';

interface Demande {
  id_demande: number;
  num_demande: string;
  type_acte: string;
  statut_demande: string;
  date_demande: string;
  url_pdf?: string;
}

const STATUT_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  'EN ATTENTE': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: 'hourglass_empty',     label: 'En attente' },
  'VALIDER':    { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: 'check_circle_outline', label: 'Validée' },
  'REFUSER':    { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: 'cancel',               label: 'Refusée' },
  'TERMINER':   { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: 'task_alt',             label: 'Terminée' },
};

export default function SuiviDemandes() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/dashboard/demandes/citoyen/')
      .then(r => setDemandes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const telechargerPDF = async (id: number) => {
    try {
      const res = await api.get(`/dashboard/demandes/${id}/pdf/`);
      window.open(res.data.url_pdf, '_blank');
    } catch { alert('PDF non disponible.'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <span className="material-icons-round spin" style={{ fontSize: '36px', color: '#f0b429' }}>sync</span>
    </div>
  );

  return (
    <div className="fade-up">
      {demandes.length === 0 ? (
        <div style={styles.vide}>
          <span className="material-icons-round" style={{ fontSize: '56px', color: '#cbd5e1' }}>inbox</span>
          <p style={styles.videText}>Aucune demande pour le moment</p>
          <a href="/citoyen/demande" style={styles.videLink}>Faire une nouvelle demande</a>
        </div>
      ) : (
        <div style={styles.liste}>
          {demandes.map((d, i) => {
            const st = STATUT_CONFIG[d.statut_demande] ?? { color: '#64748b', bg: '#f1f5f9', icon: 'help_outline', label: d.statut_demande };
            return (
              <div key={d.id_demande} style={styles.card} className={`fade-up-${Math.min(i+1,5)}`}>
                <div style={styles.cardLeft}>
                  <div style={{ ...styles.iconWrap, background: st.bg }}>
                    <span className="material-icons-round" style={{ fontSize: '22px', color: st.color }}>{st.icon}</span>
                  </div>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.numRow}>
                    <span style={styles.num}>{d.num_demande}</span>
                    <span style={{ ...styles.badge, background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <div style={styles.type}>{d.type_acte}</div>
                  <div style={styles.date}>
                    <span className="material-icons-round" style={{ fontSize: '14px', color: '#94a3b8' }}>calendar_today</span>
                    {new Date(d.date_demande).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                {d.statut_demande === 'TERMINER' && (
                  <button onClick={() => telechargerPDF(d.id_demande)} style={styles.btnPDF}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>download</span>
                    PDF
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  liste: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { background: '#fff', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  cardLeft: { flexShrink: 0 },
  iconWrap: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  numRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  num: { fontWeight: 700, color: '#f0b429', fontSize: '15px', fontFamily: 'Sora, sans-serif' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
  type: { fontSize: '14px', color: '#0f172a', fontWeight: 500 },
  date: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8' },
  btnPDF: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff',
    fontSize: '13px', fontWeight: 600, flexShrink: 0,
  },
  vide: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '12px' },
  videText: { color: '#94a3b8', fontSize: '16px' },
  videLink: { color: '#f0b429', fontWeight: 600, textDecoration: 'none', fontSize: '14px' },
};
