import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Search, History, UserCircle, LogOut, Menu, X, Plus, ExternalLink, AlertTriangle, CheckCircle2, HelpCircle, Scale } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';

export function Shell({ children }) {
  const { user, logout } = useAuth(); const [open,setOpen] = useState(false); const navigate=useNavigate();
  const links=[['/app','Overview',LayoutDashboard],['/app/new','Verify information',Search],['/app/history','History',History],['/app/profile','Profile',UserCircle]];
  return <div className="min-h-screen bg-[#f5f7fb]">
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-5 lg:px-9 sticky top-0 z-20">
      <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-ink"><span className="bg-blue-600 text-white rounded-xl p-2"><ShieldCheck size={20}/></span>TrustLens</Link>
      <button className="md:hidden p-2" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
      <div className="hidden md:flex items-center gap-4"><span className="text-sm text-slate-600">{user?.name}</span><button onClick={()=>{logout();navigate('/login')}} className="text-slate-500 hover:text-red-600"><LogOut size={18}/></button></div>
    </header>
    <div className="max-w-[1440px] mx-auto flex">
      <aside className={`${open?'block':'hidden'} md:block w-64 shrink-0 p-5 md:min-h-[calc(100vh-64px)]`}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">Workspace</p>
        <nav className="space-y-1">{links.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==='/app'} onClick={()=>setOpen(false)} className={({isActive})=>`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold ${isActive?'bg-blue-50 text-blue-700':'text-slate-600 hover:bg-white'}`}><Icon size={18}/>{label}</NavLink>)}
        {user?.role==='ADMIN'&&<NavLink to="/app/admin" className={({isActive})=>`block px-3 py-3 rounded-xl text-sm font-semibold ${isActive?'bg-blue-50 text-blue-700':'text-slate-600'}`}>Admin console</NavLink>}</nav>
        <div className="panel p-4 mt-10"><div className="text-sm font-bold">Verify thoughtfully</div><p className="text-xs text-slate-500 mt-2 leading-5">TrustLens provides evidence-based signals, not absolute proof. Always review the original sources.</p></div>
      </aside>
      <main className="min-w-0 flex-1 p-5 lg:p-9">{children}</main>
    </div>
  </div>;
}
export function PageTitle({eyebrow,title,description,action}) { return <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7"><div>{eyebrow&&<p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">{eyebrow}</p>}<h1 className="text-2xl md:text-3xl font-extrabold text-ink">{title}</h1>{description&&<p className="text-slate-500 mt-2 text-sm">{description}</p>}</div>{action}</div>; }
export function Notice({error}) { return error?<div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm mb-4">{error}</div>:null; }
export function Assessment({value}) {
  const map={SUPPORTED:['Supported','bg-emerald-50 text-emerald-700',CheckCircle2],LIKELY_SUPPORTED:['Likely supported','bg-emerald-50 text-emerald-700',CheckCircle2],MIXED_EVIDENCE:['Mixed evidence','bg-amber-50 text-amber-800',Scale],LIKELY_FALSE:['Likely false','bg-rose-50 text-rose-700',AlertTriangle],FALSE:['False','bg-rose-50 text-rose-700',AlertTriangle],INSUFFICIENT_EVIDENCE:['Insufficient evidence','bg-slate-100 text-slate-700',HelpCircle]};
  const [label,style,Icon]=map[value]||map.INSUFFICIENT_EVIDENCE;
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${style}`}><Icon size={14}/>{label}</span>;
}
export function Loading() { return <div className="py-16 text-center text-slate-500 text-sm">Loading TrustLens…</div>; }
export function Empty({title,body,action}) { return <div className="panel p-10 text-center"><div className="mx-auto bg-blue-50 text-blue-600 rounded-2xl w-12 h-12 flex items-center justify-center"><Search/></div><h3 className="font-bold mt-4">{title}</h3><p className="text-sm text-slate-500 mt-2">{body}</p>{action&&<div className="mt-5">{action}</div>}</div>; }
