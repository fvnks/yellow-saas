'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Search, ExternalLink, Users, Calendar, Plus, X, FlaskConical, Package, FolderKanban, UsersRound, CreditCard } from 'lucide-react';

interface Company {
 id: string;
 name: string;
 slug: string;
 plan: string;
 status: string;
 created_at: string;
 trial_ends_at: string;
 user_count: number;
}

const MODULE_OPTIONS = [
 { id: 'erp', label: 'ERP Core', icon: Package, color: 'text-violet-600 bg-violet-50 border-violet-200' },
 { id: 'mi-cuenta', label: 'Mi Cuenta', icon: CreditCard, color: 'text-blue-700 bg-blue-50 border-blue-200' },
 { id: 'advanced_crm', label: 'CRM Avanzado', icon: Users, color: 'text-orange-600 bg-orange-50 border-orange-200' },
 { id: 'hr_premium', label: 'RRHH Premium', icon: UsersRound, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
 { id: 'pos_plus', label: 'POS Plus', icon: Package, color: 'text-pink-600 bg-pink-50 border-pink-200' },
 { id: 'accounting_pro', label: 'Contabilidad Pro', icon: Package, color: 'text-monday-violet bg-peach/30 border-peach' },
 { id: 'inventory_plus', label: 'Inventario Plus', icon: Package, color: 'text-teal-600 bg-teal-50 border-teal-200' },
 { id: 'projects_pro', label: 'Proyectos Pro', icon: FolderKanban, color: 'text-purple-600 bg-purple-50 border-purple-200' },
 { id: 'support_chat', label: 'Soporte en Vivo', icon: Users, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
 { id: 'api_access', label: 'Acceso API', icon: Package, color: 'text-slate-600 bg-slate-50 border-slate-200' },
 { id: 'veterinaria', label: 'Veterinaria', icon: FlaskConical, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
 { id: 'auto-talleres', label: 'Talleres Auto', icon: Package, color: 'text-orange-600 bg-orange-50 border-orange-200' },
 { id: 'restaurant', label: 'Restaurante', icon: Package, color: 'text-monday-violet bg-peach/30 border-peach' },
 { id: 'recetas', label: 'Recetas BOM', icon: FlaskConical, color: 'text-orange-600 bg-orange-50 border-orange-200' },
 { id: 'condominiums', label: 'Condominios', icon: Package, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
 { id: 'expense_management', label: 'Gestión de Gastos', icon: Package, color: 'text-rose-600 bg-rose-50 border-rose-200' },
 { id: 'documentos_recibidos', label: 'Documentos Recibidos', icon: Package, color: 'text-blue-600 bg-blue-50 border-blue-200' },
];

const statusColors: Record<string, string> = {
 active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
 trial: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
 suspended: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
 cancelled: 'bg-slate-500/10 text-muted-foreground border-border/20',
};

const planColors: Record<string, string> = {
 free: 'bg-slate-500/10 text-muted-foreground border-border/20',
 starter: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
 professional: 'bg-blue-600/10 text-blue-500 border-blue-500/20',
 enterprise: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

export default function AdminCompaniesPage() {
 const [companies, setCompanies] = useState<Company[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState('all');
 const [showCreate, setShowCreate] = useState(false);
 const [creating, setCreating] = useState(false);
 const [form, setForm] = useState({ name: '', slug: '', email: '', password: '', plan: 'professional' });
 const [selectedModules, setSelectedModules] = useState<string[]>(['mi-cuenta']);

 useEffect(() => { fetchCompanies(); }, []);

 const fetchCompanies = async () => {
 try {
 const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
 const res = await fetch('/api/super-admin/companies', { headers: { Authorization: `Bearer ${token}` } });
 const data = await res.json();
 if (data.success) setCompanies(data.data);
 } catch (err) { console.error('Failed to load companies:', err); }
 setLoading(false);
 };

 const handleCreate = async () => {
 if (!form.name || !form.slug || !form.email || !form.password) return;
 setCreating(true);
 try {
 const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
 const res = await fetch('/api/super-admin/companies', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
 body: JSON.stringify({ ...form, modules: selectedModules }),
 });
 const data = await res.json();
 if (data.success) {
 setShowCreate(false);
 setForm({ name: '', slug: '', email: '', password: '', plan: 'professional' });
 setSelectedModules(['mi-cuenta']);
 fetchCompanies();
 }
 } catch (err) { console.error('Failed to create company:', err); }
 setCreating(false);
 };

 const toggleModule = (id: string) => {
 setSelectedModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
 };

 const filtered = companies.filter(c => {
 const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase());
 const matchStatus = statusFilter === 'all' || c.status === statusFilter;
 return matchSearch && matchStatus;
 });

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-ink">Empresas</h1>
 <p className="text-sm text-muted-foreground mt-1">Gestiona todas las empresas de la plataforma</p>
 </div>
 <button onClick={() => setShowCreate(true)}
 className="bg-cloud hover:bg-mist text-ink px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-mist">
 <Plus className="w-4 h-4" /> Nueva Empresa
 </button>
 </div>

 <div className="bg-cloud border border-mist rounded-xl p-4 flex items-center gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <input type="text" placeholder="Buscar empresa..." value={search} onChange={e => setSearch(e.target.value)}
 className="w-full bg-white border border-mist rounded-lg pl-10 pr-4 py-2 text-sm text-ink placeholder:text-iron focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/50" />
 </div>
 <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
 className="bg-white border border-mist rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/50">
 <option value="all">Todos los estados</option>
 <option value="active">Activas</option>
 <option value="trial">En prueba</option>
 <option value="suspended">Suspendidas</option>
 <option value="cancelled">Canceladas</option>
 </select>
 </div>

 <div className="bg-cloud border border-mist rounded-xl overflow-hidden">
 <table className="w-full">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Empresa</th>
 <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Plan</th>
 <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
 <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Usuarios</th>
 <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Creada</th>
 <th className="text-left px-6 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Acciones</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 Array.from({ length: 5 }).map((_, i) => (
 <tr key={i} className="border-b border-border/50">
 <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-card rounded animate-pulse" /></td>
 </tr>
 ))
 ) : filtered.length === 0 ? (
 <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">No se encontraron empresas</td></tr>
 ) : (
 filtered.map(company => (
 <tr key={company.id} className="border-b border-border/50 hover:bg-cloud/60 transition-colors">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 bg-card rounded-lg flex items-center justify-center">
 <Building2 className="w-4 h-4 text-muted-foreground" />
 </div>
 <div>
 <p className="text-sm font-medium text-ink">{company.name}</p>
 <p className="text-xs text-muted-foreground">{company.slug}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${planColors[company.plan] || planColors.free}`}>{company.plan}</span>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusColors[company.status] || statusColors.active}`}>{company.status}</span>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-1.5 text-sm text-foreground"><Users className="w-3.5 h-3.5 text-muted-foreground" />{company.user_count}</div>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="w-3.5 h-3.5" />{new Date(company.created_at).toLocaleDateString('es-CL')}</div>
 </td>
 <td className="px-6 py-4">
 <Link href={`/admin/companies/${company.id}`}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cloud hover:bg-mist rounded-lg text-xs font-medium text-foreground hover:text-ink transition-colors">
 <ExternalLink className="w-3.5 h-3.5" /> Ver
 </Link>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>

 {showCreate && (
 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
 <div className="bg-cloud border border-mist rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
 <div className="px-6 py-4 border-b border-border flex items-center justify-between">
 <h2 className="text-lg font-semibold text-ink">Nueva Empresa</h2>
 <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-ink"><X className="w-5 h-5" /></button>
 </div>
 <div className="p-6 space-y-4">
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="block text-xs font-medium text-muted-foreground">Nombre *</label>
 <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
 className="w-full bg-white border border-mist rounded-lg px-3 py-2 text-sm text-ink placeholder:text-iron focus:outline-none focus:ring-1 focus:ring-violet-500/30"
 placeholder="Mi Empresa" autoFocus />
 </div>
 <div className="space-y-1">
 <label className="block text-xs font-medium text-muted-foreground">Slug *</label>
 <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
 className="w-full bg-white border border-mist rounded-lg px-3 py-2 text-sm text-ink placeholder:text-iron focus:outline-none focus:ring-1 focus:ring-violet-500/30 font-mono"
 placeholder="mi-empresa" />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="block text-xs font-medium text-muted-foreground">Email admin *</label>
 <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
 className="w-full bg-white border border-mist rounded-lg px-3 py-2 text-sm text-ink placeholder:text-iron focus:outline-none focus:ring-1 focus:ring-violet-500/30"
 placeholder="admin@empresa.cl" />
 </div>
 <div className="space-y-1">
 <label className="block text-xs font-medium text-muted-foreground">Password *</label>
 <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
 className="w-full bg-white border border-mist rounded-lg px-3 py-2 text-sm text-ink placeholder:text-iron focus:outline-none focus:ring-1 focus:ring-violet-500/30"
 placeholder="Minimo 8 caracteres" />
 </div>
 </div>
 <div className="space-y-1">
 <label className="block text-xs font-medium text-muted-foreground">Plan</label>
 <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
 className="w-full bg-white border border-mist rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/50">
 <option value="free">Free</option>
 <option value="starter">Starter</option>
 <option value="professional">Professional</option>
 <option value="enterprise">Enterprise</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="block text-xs font-medium text-muted-foreground">Modulos a activar</label>
 <div className="grid grid-cols-2 gap-2">
 {MODULE_OPTIONS.map(mod => {
 const Icon = mod.icon;
 const active = selectedModules.includes(mod.id);
 return (
 <button key={mod.id} onClick={() => toggleModule(mod.id)}
 className={`p-3 rounded-lg border-2 flex items-center gap-3 transition-all text-left ${
 active ? `${mod.color} border-current` : 'border-border text-muted-foreground hover:border-border'
 }`}>
 <Icon className="w-4 h-4" />
 <span className="text-xs font-medium">{mod.label}</span>
 </button>
 );
 })}
 </div>
 </div>
 </div>
 <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
 <button onClick={() => setShowCreate(false)}
 className="bg-cloud hover:bg-mist text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
 Cancelar
 </button>
 <button onClick={handleCreate} disabled={creating || !form.name || !form.slug || !form.email || !form.password}
 className="bg-cloud hover:bg-mist text-ink px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-mist disabled:opacity-50">
 <Plus className="w-4 h-4" /> {creating ? 'Creando...' : 'Crear Empresa'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
