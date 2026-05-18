'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Icon from '@/components/Icon';

const TYPE_ICONS: Record<string,string> = { 'acte naissance':'child_care','acte mariage':'favorite','acte décès':'sentiment_very_dissatisfied' };

export default function Archives() {
  const router = useRouter();
  const [actes,       setActes]       = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [q,           setQ]           = useState('');
  const [filtre,      setFiltre]      = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const ref = useRef<HTMLInputElement>(null);

  const load = (query='',type='') => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q',query);
    if (type)  params.set('type',type);
    api.get(`/dashboard/actes/?${params}`).then(r=>setActes(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  };

  useEffect(()=>{ load(); },[]);

  useEffect(()=>{
    if (q.length<2) { setSuggestions([]); return; }
    const t = setTimeout(()=>{
      api.get(`/dashboard/recherche/suggestions/?q=${q}`)
        .then(r=>{ const d=r.data; setSuggestions(Array.isArray(d)?d:Array.isArray(d.suggestions)?d.suggestions:[]); })
        .catch(()=>setSuggestions([]));
    },300);
    return ()=>clearTimeout(t);
  },[q]);

  const search = () => { setSuggestions([]); load(q,filtre); };
  const pickSugg = (s:string) => { setQ(s); setSuggestions([]); load(s,filtre); };

  return (
    <div>
      {/* Barre */}
      <div style={{ display:'flex',gap:12,marginBottom:22,alignItems:'center' }}>
        <div style={{ flex:1,position:'relative' }}>
          <div className="input-wrap">
            <Icon name="search" size={17} className="input-icon"/>
            <input ref={ref} className="input" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="Rechercher un acte (KMP + Rabin-Karp)…"/>
          </div>
          {suggestions.length>0&&(
            <div style={{ position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,boxShadow:'0 8px 24px rgba(0,0,0,.1)',zIndex:100,marginTop:4,overflow:'hidden' }}>
              {suggestions.map((s,i)=>(
                <button key={i} onClick={()=>pickSugg(s)} style={{ width:'100%',textAlign:'left',padding:'11px 14px',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:10,fontSize:13,color:'var(--text-1)',borderBottom:i<suggestions.length-1?'1px solid #f8fafc':'none',transition:'background .15s' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='#f8fafc')}
                  onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                  <Icon name="article" size={16} style={{ color:'#1a3a6b' }}/>{s}
                </button>
              ))}
            </div>
          )}
        </div>
        <select className="input select" style={{ maxWidth:180 }} value={filtre} onChange={e=>{ setFiltre(e.target.value); load(q,e.target.value); }}>
          <option value="">Tous types</option>
          <option value="acte naissance">Naissance</option>
          <option value="acte mariage">Mariage</option>
          <option value="acte décès">Décès</option>
        </select>
        <button className="btn btn-primary" onClick={search}><Icon name="search" size={17}/>Rechercher</button>
      </div>

      {loading ? (
        <div style={{ display:'flex',justifyContent:'center',padding:60 }}><span className="spinner-dark" style={{ width:36,height:36,borderWidth:3 }}/></div>
      ) : !actes.length ? (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'40vh',gap:14 }}>
          <Icon name="folder_open" size={56} style={{ color:'#cbd5e1' }}/>
          <p style={{ color:'var(--text-3)' }}>Aucun acte trouvé</p>
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:9 }}>
          {actes.map((a:any,i:number)=>(
            <button key={a.id_acte} onClick={()=>router.push(`/archives/${a.id_acte}`)} className={`card fu${Math.min(i+1,5)}`} style={{ display:'flex',alignItems:'center',gap:14,padding:'15px 20px',border:'none',cursor:'pointer',textAlign:'left',width:'100%',transition:'all .18s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 6px 24px rgba(0,0,0,.08)'; (e.currentTarget as HTMLElement).style.transform='translateX(2px)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow=''; (e.currentTarget as HTMLElement).style.transform='';}}>
              <div style={{ width:44,height:44,borderRadius:12,background:'rgba(26,58,107,.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <Icon name={TYPE_ICONS[a.type_acte]??'article'} size={22} style={{ color:'#1a3a6b' }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700,color:'#f0b429',fontSize:15,fontFamily:'Sora,sans-serif' }}>{a.num_acte}</div>
                <div style={{ fontSize:13,color:'var(--text-1)',fontWeight:500,marginTop:2 }}>{a.type_acte}</div>
                <div style={{ display:'flex',alignItems:'center',gap:4,fontSize:12,color:'var(--text-3)',marginTop:3 }}>
                  <Icon name="calendar_today" size:13/>{new Date(a.date_acte).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <Icon name="chevron_right" size={20} style={{ color:'var(--text-3)' }}/>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
