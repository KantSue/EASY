'use client';

import { useEffect, useState } from 'react';
import api from '@/app/api';

interface Arrond {
  id_arondissement: number;
  nom_arondissement: string;
  statut: string;
  nom_commune?: string;
}

export default function Arrondissements() {
  const [arronds, setArronds] = useState<Arrond[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/arrondissements/public/')
      .then(r => setArronds(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dispo    = arronds.filter(a => a.statut === 'disponible');
  const indispo  = arronds.filter(a => a.statut === 'indisponible');

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <span className="material-icons-round spin" style={{ fontSize: '36px', color: '#f0b429' }}>sync</span>
    </div>
  );

  return (
    <div className="fade-up">
      {/* Summary */}
      <div style={styles.summaryRow}>
        <div style={{ ...styles.summaryCard, borderLeft: '4px solid #10b981' }}>
          <span className="material-icons-round" style={{ fontSize: '24px', color: '#10b981' }}>check_circle</span>
          <div>
            <div style={styles.summaryValue}>{dispo.length}</div>
            <div style={styles.summaryLabel}>Disponibles</div>
          </div>
        </div>
        <div style={{ ...styles.summaryCard, borderLeft: '4px solid #ef4444' }}>
          <span className="material-icons-round" style={{ fontSize: '24px', color: '#ef4444' }}>cancel</span>
          <div>
            <div style={styles.summaryValue}>{indispo.length}</div>
            <div style={styles.summaryLabel}>Indisponibles</div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {arronds.map((a, i) => {
          const ok = a.statut === 'disponible';
          return (
            <div key={a.id_arondissement} style={styles.card} className={`fade-up-${Math.min(i+1,5)}`}>
              <div style={{ ...styles.iconWrap, background: ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                <span className="material-icons-round" style={{ fontSize: '22px', color: ok ? '#10b981' : '#ef4444' }}>
                  {ok ? 'location_on' : 'location_off'}
                </span>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.arrondNom}>{a.nom_arondissement}</div>
                {a.nom_commune && <div style={styles.commune}>{a.nom_commune}</div>}
              </div>
              <span style={{ ...styles.badge, background: ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: ok ? '#10b981' : '#ef4444' }}>
                {ok ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  summaryRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  summaryCard: { background: '#fff', borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  summaryValue: { fontSize: '26px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif' },
  summaryLabel: { fontSize: '13px', color: '#64748b' },
  grid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { background: '#fff', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  iconWrap: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardBody: { flex: 1 },
  arrondNom: { fontWeight: 600, color: '#0f172a', fontSize: '15px' },
  commune: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, flexShrink: 0 },
};
