// src/pages/admin/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3, Users, BadgeCheck, Building2, FolderOpen,
  Clock, CheckCircle, XCircle, CreditCard, FileText,
  Trash2, Plus, X, ToggleLeft, ToggleRight, ChevronRight,
  TrendingUp, MapPin,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminService }          from '../../service/adminService';
import { authService }           from '../../service/authService';
import { arrondissementService } from '../../service/arrondissementService';
import type { Arrondissement, Commune, CreateAgentPayload } from '../../type';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatsBackend {
  demandes: {
    total     : number;
    en_attente: number;
    valider   : number;
    refuser   : number;
    terminer  : number;
  };
  par_type          : { libelle: string; total: number }[];
  par_commune       : { commune: string; total: number }[];
  delai_moyen_jours : number;
  paiements: {
    total_confirme: number;
    montant_total : number;
    total_echoue  : number;
  };
  journal_recent: {
    agent  : string;
    action : string;
    demande: number | null;
    motif  : string;
    date   : string;
  }[];
}

type Onglet = 'stats' | 'citoyens' | 'agents' | 'communes';

interface Props {
  defaultOnglet?: Onglet;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: <BarChart3  size={18} />, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: <Users      size={18} />, label: 'Citoyens',  href: '/admin/citoyens'  },
  { icon: <BadgeCheck size={18} />, label: 'Agents',    href: '/admin/agents'    },
  { icon: <Building2  size={18} />, label: 'Communes',  href: '/admin/communes'  },
  { icon: <FolderOpen size={18} />, label: 'Archives',  href: '/archives'        },
];

const TITRE_MAP: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/citoyens' : 'Citoyens',
  '/admin/agents'   : 'Agents',
  '/admin/communes' : 'Communes',
  '/archives'       : 'Archives',
  '/profil'         : 'Mon profil',
};

const ROUTE_ONGLET: Record<string, Onglet> = {
  '/admin/dashboard': 'stats',
  '/admin/citoyens' : 'citoyens',
  '/admin/agents'   : 'agents',
  '/admin/communes' : 'communes',
};

const ONGLET_ROUTE: Record<Onglet, string> = {
  stats    : '/admin/dashboard',
  citoyens : '/admin/citoyens',
  agents   : '/admin/agents',
  communes : '/admin/communes',
};

const ONGLETS: { key: Onglet; label: string; icon: React.ReactNode }[] = [
  { key: 'stats',    label: 'Statistiques', icon: <BarChart3  size={16} /> },
  { key: 'citoyens', label: 'Citoyens',     icon: <Users      size={16} /> },
  { key: 'agents',   label: 'Agents',       icon: <BadgeCheck size={16} /> },
  { key: 'communes', label: 'Communes',     icon: <Building2  size={16} /> },
];

const TYPE_COLORS = ['#0891b2', '#e11d48', '#7c3aed'];

// ─── Composant ────────────────────────────────────────────────────────────────
export default function AdminDashboard({ defaultOnglet = 'stats' }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const ongletFromRoute = ROUTE_ONGLET[location.pathname] ?? defaultOnglet;
  const [onglet,   setOnglet]   = useState<Onglet>(ongletFromRoute);
  const [stats,    setStats]    = useState<StatsBackend | null>(null);
  const [citoyens, setCitoyens] = useState<any[]>([]);
  const [agents,   setAgents]   = useState<any[]>([]);
  const [arronds,  setArronds]  = useState<Arrondissement[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [switchId, setSwitchId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [msg,      setMsg]      = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [form, setForm] = useState<CreateAgentPayload>({
    nom_user: '', prenom_user: '', email: '',
    matricule: '', id_commune: '', id_arondissement: '',
  });

  const set = (k: keyof CreateAgentPayload, v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  // ── Sync onglet avec URL ──
  useEffect(() => {
    const o = ROUTE_ONGLET[location.pathname];
    if (o) setOnglet(o);
  }, [location.pathname]);

  // ── Chargement ──
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminService.getStats(),
      adminService.getCitoyens(),
      adminService.getAgents(),
      arrondissementService.getAll(),
      authService.getCommunes(),
    ]).then(([s, c, a, arr, com]) => {
      if (cancelled) return;
      setStats(s.data as unknown as StatsBackend);
      setCitoyens(Array.isArray(c.data) ? c.data : (c.data as any).results ?? []);
      setAgents(Array.isArray(a.data) ? a.data : (a.data as any).results ?? []);
      setArronds(Array.isArray(arr.data) ? arr.data : []);
      setCommunes(Array.isArray(com.data) ? com.data : []);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Changer onglet + naviguer ──
  const changerOnglet = (o: Onglet) => {
    setOnglet(o);
    navigate(ONGLET_ROUTE[o]);
  };

  // ── Toggle arrondissement ──
  const toggleArr = async (a: Arrondissement) => {
    const ns = a.statut === 'disponible' ? 'indisponible' : 'disponible';
    setSwitchId(a.id_arondissement);
    try {
      await arrondissementService.updateStatut(a.id_arondissement, ns);
      setArronds(p => p.map(x =>
        x.id_arondissement === a.id_arondissement ? { ...x, statut: ns } : x
      ));
    } catch {} finally { setSwitchId(null); }
  };

  // ── Créer agent ──
  const creerAgent = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true); setMsg(null);
    try {
      await adminService.createAgent(form);
      setMsg({ type: 'ok', text: 'Agent créé — mot de passe envoyé par email.' });
      setForm({ nom_user:'', prenom_user:'', email:'', matricule:'', id_commune:'', id_arondissement:'' });
      setShowForm(false);
      const r = await adminService.getAgents();
      setAgents(Array.isArray(r.data) ? r.data : (r.data as any).results ?? []);
    } catch (err: any) {
      const data = err?.response?.data;
      const msgErreur = data?.detail || data?.error || data?.message
        || Object.entries(data ?? {})
            .map(([k, v]) => `${k} : ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ');
      setMsg({ type: 'err', text: String(msgErreur) });
    } finally { setCreating(false); }
  };

  // ── Supprimer agent ──
  const supprimerAgent = async (ag: any) => {
    const id = ag.id_user ?? ag.id_agent ?? ag.id;
    if (!id || !confirm('Supprimer cet agent ?')) return;
    try {
      await adminService.deleteAgent(id);
      setAgents(p => p.filter((a: any) =>
        a.id_user !== id && a.id_agent !== id && a.id !== id
      ));
      setMsg({ type: 'ok', text: 'Agent supprimé.' });
    } catch {
      setMsg({ type: 'err', text: 'Erreur lors de la suppression.' });
    }
  };

  if (loading) return (
    <DashboardLayout items={NAV_ITEMS} titreMap={TITRE_MAP} defaultTitre="Dashboard">
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg" style={{ color: '#1a3a6b' }} />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout items={NAV_ITEMS} titreMap={TITRE_MAP} defaultTitre="Dashboard">
      <div className="flex flex-col gap-6">

        {/* ══ Onglets ══ */}
        <div
          className="bg-white rounded-xl p-1.5 flex gap-1"
          style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9', width:'fit-content' }}
        >
          {ONGLETS.map(o => (
            <button
              key={o.key}
              onClick={() => changerOnglet(o.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background : onglet === o.key ? 'linear-gradient(135deg,#1a3a6b,#2456a0)' : 'transparent',
                color      : onglet === o.key ? '#fff' : '#64748b',
                boxShadow  : onglet === o.key ? '0 4px 12px rgba(26,58,107,0.3)' : 'none',
              }}
            >
              {o.icon}{o.label}
            </button>
          ))}
        </div>

        {/* ══ Message flash ══ */}
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
              : <XCircle     size={18} style={{ color:'#ef4444', flexShrink:0 }} />
            }
            <span className="text-sm font-medium flex-1" style={{ color: msg.type === 'ok' ? '#047857' : '#b91c1c' }}>
              {msg.text}
            </span>
            <button onClick={() => setMsg(null)} className="btn btn-ghost btn-xs"><X size={14}/></button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STATS
        ══════════════════════════════════════════════════════════════════ */}
        {onglet === 'stats' && stats && (
          <div className="flex flex-col gap-6">

            {/* Cards demandes */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label:'Total demandes',      val:stats.demandes.total,           icon:<FileText    size={22}/>, color:'#1a3a6b', bg:'rgba(26,58,107,0.1)',  border:'#1a3a6b' },
                { label:'En attente',          val:stats.demandes.en_attente,      icon:<Clock       size={22}/>, color:'#b45309', bg:'rgba(245,158,11,0.1)', border:'#f59e0b' },
                { label:'Validées',            val:stats.demandes.valider,         icon:<CheckCircle size={22}/>, color:'#047857', bg:'rgba(16,185,129,0.1)', border:'#10b981' },
                { label:'Refusées',            val:stats.demandes.refuser,         icon:<XCircle     size={22}/>, color:'#b91c1c', bg:'rgba(239,68,68,0.1)',  border:'#ef4444' },
                { label:'Terminées',           val:stats.demandes.terminer,        icon:<CheckCircle size={22}/>, color:'#6d28d9', bg:'rgba(139,92,246,0.1)', border:'#8b5cf6' },
                { label:'Paiements confirmés', val:stats.paiements.total_confirme, icon:<CreditCard  size={22}/>, color:'#0891b2', bg:'rgba(8,145,178,0.1)',  border:'#0891b2' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 flex items-center gap-4"
                  style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9', borderLeft:`4px solid ${s.border}` }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:s.bg, color:s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="font-bold" style={{ fontSize:28, color:s.color, fontFamily:'Sora,sans-serif', lineHeight:1.1 }}>{s.val}</div>
                    <div className="text-xs mt-1" style={{ color:'#94a3b8' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cards paiements + délai */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 flex items-center gap-4" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'rgba(240,180,41,0.1)' }}>
                  <TrendingUp size={22} style={{ color:'#f0b429' }} />
                </div>
                <div>
                  <div className="font-bold" style={{ fontSize:28, color:'#f0b429', fontFamily:'Sora,sans-serif', lineHeight:1.1 }}>
                    {stats.delai_moyen_jours}j
                  </div>
                  <div className="text-xs mt-1" style={{ color:'#94a3b8' }}>Délai moyen traitement</div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 flex items-center gap-4" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'rgba(16,185,129,0.1)' }}>
                  <CreditCard size={22} style={{ color:'#10b981' }} />
                </div>
                <div>
                  <div className="font-bold text-lg" style={{ color:'#10b981', fontFamily:'Sora,sans-serif', lineHeight:1.1 }}>
                    {(stats.paiements.montant_total ?? 0).toLocaleString()} Ar
                  </div>
                  <div className="text-xs mt-1" style={{ color:'#94a3b8' }}>Montant total confirmé</div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 flex items-center gap-4" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'rgba(239,68,68,0.1)' }}>
                  <XCircle size={22} style={{ color:'#ef4444' }} />
                </div>
                <div>
                  <div className="font-bold" style={{ fontSize:28, color:'#ef4444', fontFamily:'Sora,sans-serif', lineHeight:1.1 }}>
                    {stats.paiements.total_echoue}
                  </div>
                  <div className="text-xs mt-1" style={{ color:'#94a3b8' }}>Paiements échoués</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">

              {/* Par type + par commune */}
              <div className="bg-white rounded-xl p-6" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
                <h3 className="font-bold text-base mb-5" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                  Par type d'acte
                </h3>
                <div className="flex flex-col gap-4">
                  {stats.par_type.map((t, i) => {
                    const pct = stats.demandes.total > 0
                      ? Math.round((t.total / stats.demandes.total) * 100) : 0;
                    return (
                      <div key={i} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color:'#334155' }}>{t.libelle}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color:'#94a3b8' }}>{pct}%</span>
                            <span className="font-bold text-sm" style={{ color: TYPE_COLORS[i] ?? '#1a3a6b' }}>{t.total}</span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background:'#f1f5f9' }}>
                          <div className="h-2 rounded-full" style={{ width:`${pct}%`, background: TYPE_COLORS[i] ?? '#1a3a6b', transition:'width 0.5s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {stats.par_commune.length > 0 && (
                  <>
                    <h3 className="font-bold text-base mt-6 mb-4" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>Par commune</h3>
                    <div className="flex flex-col gap-0">
                      {stats.par_commune.map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom:'1px solid #f8fafc' }}>
                          <div className="flex items-center gap-2">
                            <MapPin size={13} style={{ color:'#94a3b8' }} />
                            <span className="text-sm" style={{ color:'#334155' }}>{c.commune}</span>
                          </div>
                          <span className="font-bold text-sm" style={{ color:'#1a3a6b' }}>{c.total}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Journal récent */}
              <div className="bg-white rounded-xl p-6" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
                <h3 className="font-bold text-base mb-5" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                  Actions récentes
                </h3>
                <div className="flex flex-col gap-0">
                  {stats.journal_recent.map((j, i) => {
                    const ok = j.action === 'VALIDER';
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 py-3 hover:bg-gray-50 transition-colors"
                        style={{ borderBottom: i < stats.journal_recent.length - 1 ? '1px solid #f8fafc' : 'none' }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                          {ok
                            ? <CheckCircle size={14} style={{ color:'#10b981' }} />
                            : <XCircle     size={14} style={{ color:'#ef4444' }} />
                          }
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-semibold truncate" style={{ color:'#334155' }}>{j.agent}</span>
                          <span className="text-xs" style={{ color:'#94a3b8' }}>
                            {j.action}{j.demande ? ` · #${j.demande}` : ''}
                          </span>
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color:'#cbd5e1' }}>{j.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            CITOYENS
        ══════════════════════════════════════════════════════════════════ */}
        {onglet === 'citoyens' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                Citoyens <span className="font-normal text-base" style={{ color:'#94a3b8' }}>({citoyens.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {citoyens.map((c: any, i: number) => {
                const nom    = c.nom_user    ?? c.id_user?.nom_user    ?? '';
                const prenom = c.prenom_user ?? c.id_user?.prenom_user ?? '';
                const email  = c.email       ?? c.id_user?.email       ?? '';
                const commune= c.nom_commune ?? c.commune              ?? '';
                const init   = `${nom[0] ?? ''}${prenom[0] ?? ''}`.toUpperCase();
                const dem    = c.demandes ?? {};
                return (
                  <div key={i} className="bg-white rounded-xl p-5" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background:'linear-gradient(135deg,#f0b429,#fcd34d)', color:'#0a1830' }}>
                        {init}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>{prenom} {nom}</div>
                        <div className="text-xs truncate" style={{ color:'#94a3b8' }}>{email}</div>
                        {commune && <div className="text-xs mt-0.5" style={{ color:'#64748b' }}>{commune}</div>}
                      </div>
                    </div>
                    <div className="flex justify-around pt-3" style={{ borderTop:'1px solid #f1f5f9' }}>
                      {[
                        { label:'Total',     val:dem.total      ?? 0, color:'#1a3a6b' },
                        { label:'Attente',   val:dem.en_attente ?? 0, color:'#f59e0b' },
                        { label:'Validées',  val:dem.valider    ?? 0, color:'#10b981' },
                        { label:'Terminées', val:dem.terminer   ?? 0, color:'#8b5cf6' },
                      ].map((s, j) => (
                        <div key={j} className="text-center">
                          <div className="font-bold text-lg" style={{ color:s.color, fontFamily:'Sora,sans-serif' }}>{s.val}</div>
                          <div className="text-xs" style={{ color:'#94a3b8' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            AGENTS
        ══════════════════════════════════════════════════════════════════ */}
        {onglet === 'agents' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                Agents <span className="font-normal text-base" style={{ color:'#94a3b8' }}>({agents.length})</span>
              </h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn border-0 gap-2 font-semibold"
                style={{ background: showForm ? '#f1f5f9' : 'linear-gradient(135deg,#f0b429,#fcd34d)', color: showForm ? '#64748b' : '#0a1830', borderRadius:10, height:40 }}
              >
                {showForm ? <><X size={16}/>Annuler</> : <><Plus size={16}/>Nouvel agent</>}
              </button>
            </div>

            {/* Formulaire */}
            {showForm && (
              <div className="bg-white rounded-xl p-6" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
                <h3 className="font-bold text-base mb-5" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                  Créer un agent
                </h3>
                <form onSubmit={creerAgent} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    {([
                      { key:'prenom_user', label:'Prénom',    ph:'Jean',           type:'text'  },
                      { key:'nom_user',    label:'Nom',       ph:'Rakoto',         type:'text'  },
                      { key:'email',       label:'Email',     ph:'agent@email.mg', type:'email' },
                      { key:'matricule',   label:'Matricule', ph:'12345',          type:'text'  },
                    ] as { key: keyof CreateAgentPayload; label: string; ph: string; type: string }[]).map(({ key, label, ph, type }) => (
                      <div className="form-control gap-2" key={key}>
                        <label className="label py-0">
                          <span className="label-text text-sm font-semibold" style={{ color:'#64748b' }}>{label}</span>
                        </label>
                        <input
                          type={type}
                          className="input border-2 rounded-xl text-sm w-full"
                          style={{ borderColor:'#e2e8f0', background:'#f8fafc', color:'#334155', height:44 }}
                          value={form[key]}
                          onChange={e => set(key, e.target.value)}
                          placeholder={ph}
                          aria-label={label}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control gap-2">
                      <label className="label py-0">
                        <span className="label-text text-sm font-semibold" style={{ color:'#64748b' }}>Commune</span>
                      </label>
                      <select
                        className="select border-2 rounded-xl text-sm w-full"
                        style={{ borderColor:'#e2e8f0', background:'#f8fafc', color:'#334155', height:44 }}
                        value={form.id_commune}
                        onChange={e => set('id_commune', e.target.value)}
                        aria-label="Commune"
                        required
                      >
                        <option value="">Choisir une commune</option>
                        {communes.map((c: Commune) => (
                          <option key={c.id_commune} value={c.id_commune}>{c.nom_commune}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-control gap-2">
                      <label className="label py-0">
                        <span className="label-text text-sm font-semibold" style={{ color:'#64748b' }}>Arrondissement</span>
                      </label>
                      <select
                        className="select border-2 rounded-xl text-sm w-full"
                        style={{ borderColor:'#e2e8f0', background:'#f8fafc', color:'#334155', height:44, opacity: form.id_commune ? 1 : 0.5 }}
                        value={form.id_arondissement}
                        onChange={e => set('id_arondissement', e.target.value)}
                        disabled={!form.id_commune}
                        aria-label="Arrondissement"
                      >
                        <option value="">Choisir</option>
                        {arronds.map(a => (
                          <option key={a.id_arondissement} value={a.id_arondissement}>
                            {a.nom_arondissement}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={creating}
                      className="btn border-0 gap-2 font-bold"
                      style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', borderRadius:10, height:44, minWidth:160, boxShadow:'0 4px 12px rgba(16,185,129,0.3)' }}
                    >
                      {creating
                        ? <span className="loading loading-spinner loading-sm"/>
                        : <><Plus size={16}/>Créer l'agent</>
                      }
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Liste */}
            <div className="grid grid-cols-2 gap-4">
              {agents.map((a: any, i: number) => {
                const nom    = a.nom_user    ?? '';
                const prenom = a.prenom_user ?? '';
                const email  = a.email       ?? '';
                const arr    = a.arrondissement ?? a.nom_arondissement ?? '';
                const com    = a.commune        ?? a.nom_commune       ?? '';
                const init   = `${nom[0] ?? ''}${prenom[0] ?? ''}`.toUpperCase();
                return (
                  <div key={i} className="bg-white rounded-xl p-5 flex items-center gap-4" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background:'linear-gradient(135deg,#1a3a6b,#2456a0)', color:'#fff' }}>
                      {init}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>{prenom} {nom}</div>
                      <div className="text-xs mt-0.5 truncate" style={{ color:'#94a3b8' }}>{email}</div>
                      {(arr || com) && (
                        <div className="text-xs mt-1" style={{ color:'#64748b' }}>
                          {arr}{arr && com ? ' · ' : ''}{com}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => supprimerAgent(a)}
                      className="btn btn-ghost btn-sm p-2 flex-shrink-0"
                      style={{ color:'#ef4444' }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            COMMUNES
        ══════════════════════════════════════════════════════════════════ */}
        {onglet === 'communes' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                  Arrondissements
                </h2>
                <p className="text-sm mt-1" style={{ color:'#94a3b8' }}>
                  Dijkstra redirige automatiquement vers le plus proche disponible
                </p>
              </div>
              <div className="flex gap-3">
                <span className="badge font-semibold px-3 py-3" style={{ background:'rgba(16,185,129,0.1)', color:'#047857', border:'none' }}>
                  {arronds.filter(a => a.statut === 'disponible').length} disponibles
                </span>
                <span className="badge font-semibold px-3 py-3" style={{ background:'rgba(239,68,68,0.1)', color:'#b91c1c', border:'none' }}>
                  {arronds.filter(a => a.statut !== 'disponible').length} indisponibles
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {arronds.map((a: Arrondissement) => {
                const ok  = a.statut === 'disponible';
                const lod = switchId === a.id_arondissement;
                return (
                  <div
                    key={a.id_arondissement}
                    className="bg-white rounded-xl p-5 flex items-center gap-4"
                    style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9', borderLeft:`4px solid ${ok ? '#10b981' : '#ef4444'}` }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                      {ok
                        ? <CheckCircle size={20} style={{ color:'#10b981' }} />
                        : <XCircle    size={20} style={{ color:'#ef4444' }} />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>
                        {a.nom_arondissement}
                      </div>
                      {a.nom_commune && (
                        <div className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>{a.nom_commune}</div>
                      )}
                    </div>
                    <span
                      className="badge font-semibold px-3 py-2.5"
                      style={{ background: ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: ok ? '#047857' : '#b91c1c', border:'none', borderRadius:8 }}
                    >
                      {ok ? 'Disponible' : 'Indisponible'}
                    </span>
                    {lod ? (
                      <span className="loading loading-spinner loading-sm" style={{ color:'#1a3a6b' }} />
                    ) : (
                      <button
                        onClick={() => toggleArr(a)}
                        style={{ background:'none', border:'none', cursor:'pointer' }}
                      >
                        {ok
                          ? <ToggleRight size={36} style={{ color:'#10b981' }} />
                          : <ToggleLeft  size={36} style={{ color:'#94a3b8' }} />
                        }
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate('/archives')}
              className="flex items-center justify-between bg-white rounded-xl p-5 w-full text-left hover:shadow-md transition-all mt-2"
              style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:'rgba(26,58,107,0.1)' }}>
                  <FolderOpen size={20} style={{ color:'#1a3a6b' }} />
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color:'#1a3a6b', fontFamily:'Sora,sans-serif' }}>Archives</div>
                  <div className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>Consulter tous les actes civils</div>
                </div>
              </div>
              <ChevronRight size={20} style={{ color:'#94a3b8' }} />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}