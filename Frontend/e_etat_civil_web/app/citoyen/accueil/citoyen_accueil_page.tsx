'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/api';

interface StatDemande { statut_demande: string; }

export default function AccueilCitoyen() {
  const router = useRouter();
  const [demandes, setDemandes] = useState<StatDemande[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/dashboard/demandes/citoyen/')
      .then(r => setDemandes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const count = (s: string) => demandes.filter(d => d.statut_demande === s).length;

  const cards = [
    { icon: 'add_circle_outline', label: 'Nouvelle demande',  desc: 'Soumettre un acte',      color: '#1a3a6b', href: '/citoyen/demande' },
    { icon: 'track_changes',      label: 'Suivi demandes',    desc: 'Voir mes demandes',       color: '#0891b2', href: '/citoyen/suivi' },
    { icon: 'location_city',      label: 'Arrondissements',   desc: 'Disponibilité & proximité', color: '#7c3aed', href: '/citoyen/arrondissements' },
    { icon: 'person_outline',     label: 'Mon profil',        desc: 'Gérer mes informations',  color: '#059669', href: '/profil' },
  ];

  return (
    <div className="fade-up">
      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total demandes', value: demandes.length, icon: 'folder_open', color: '#1a3a6b' },
          { label: 'En attente',     value: count('EN ATTENTE'), icon: 'hourglass_empty', color: '#f59e0b' },
          { label: 'Validées',       value: count('VALIDER'),    icon: 'check_circle_outline', color: '#10b981' },
          { label: 'Terminées',      value: count('TERMINER'),   icon: 'task_alt', color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} style={styles.statCard} className={`fade-up-${i + 1}`}>
            <div style={{ ...styles.statIconWrap, background: s.color + '18' }}>
              <span className="material-icons-round" style={{ fontSize: '22px', color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <div style={styles.statValue}>{loading ? '—' : s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <h2 style={styles.sectionTitle}>Que souhaitez-vous faire ?</h2>
      <div style={styles.cardsGrid}>
        {cards.map((c, i) => (
          <button key={i} onClick={() => router.push(c.href)} style={styles.actionCard} className={`fade-up-${i + 1}`}>
            <div style={{ ...styles.actionIconWrap, background: c.color }}>
              <span className="material-icons-round" style={{ fontSize: '28px', color: '#fff' }}>{c.icon}</span>
            </div>
            <div style={styles.actionLabel}>{c.label}</div>
            <div style={styles.actionDesc}>{c.desc}</div>
            <div style={styles.actionArrow}>
              <span className="material-icons-round" style={{ fontSize: '18px', color: '#94a3b8' }}>arrow_forward</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '32px' },
  statCard: { background: '#fff', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  statIconWrap: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: '28px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif', lineHeight: 1.1 },
  statLabel: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  sectionTitle: { fontSize: '18px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif', marginBottom: '18px' },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' },
  actionCard: {
    background: '#fff', borderRadius: '20px', padding: '24px',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px',
    border: 'none', cursor: 'pointer', textAlign: 'left',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    transition: 'transform 0.18s, box-shadow 0.18s',
    position: 'relative',
  },
  actionIconWrap: { width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' },
  actionLabel: { fontSize: '16px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif' },
  actionDesc: { fontSize: '13px', color: '#64748b' },
  actionArrow: { position: 'absolute', bottom: '20px', right: '20px' },
};
