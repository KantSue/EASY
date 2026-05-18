'use client';
import Icon from './Icon';

interface Props { titre: string; nom: string; role: string; }

export default function Topbar({ titre, nom, role }: Props) {
  const initials = nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?';
  return (
    <div className="topbar">
      <div>
        <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:3 }}>
          Bienvenue, <span style={{ color:'#f0b429', fontWeight:600 }}>{nom || '…'}</span>
        </div>
        <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-1)', fontFamily:'Sora,sans-serif' }}>{titre}</h1>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <button style={{ position:'relative', width:38, height:38, borderRadius:'50%', background:'#f1f5f9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <Icon name="notifications_none" size={20} style={{ color:'var(--text-2)' }} />
          <span className="notif-dot" />
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:9, background:'#f1f5f9', borderRadius:12, padding:'7px 13px', cursor:'pointer' }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#f0b429,#fcd34d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#0a1830' }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)' }}>{nom || '…'}</div>
            <div style={{ fontSize:11, color:'#f0b429' }}>{role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
