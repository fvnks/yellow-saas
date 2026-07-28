'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, MoreVertical, Trash2, Copy } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { PROJECT_STATUS_CONFIG } from '@/lib/constants';
import SummaryTab from '../components/SummaryTab';
import ProjectTasks from '../components/ProjectTasks';
import ProjectMembers from '../components/ProjectMembers';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Tab = 'summary' | 'tasks' | 'members';

const TABS: { id: Tab; label: string }[] = [
  { id: 'summary', label: 'Resumen' },
  { id: 'tasks', label: 'Tareas' },
  { id: 'members', label: 'Miembros' },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const api = getApiClient();
      const [proj, tks, mem, exp, cst] = await Promise.all([
        api.getProject(projectId),
        api.getProjectTasks(projectId),
        api.getProjectMembers(projectId),
        api.getProjectExpenses(projectId),
        api.getProjectCosts(projectId),
      ]);
      setProject(proj);
      setTasks(Array.isArray(tks) ? tks : []);
      setMembers(Array.isArray(mem) ? mem : []);
      setExpenses(Array.isArray(exp) ? exp : []);
      setCosts(Array.isArray(cst) ? cst : []);
    } catch (err) {
      toast.error('Error al cargar proyecto');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { if (projectId) loadData(); }, [projectId]);

  const handleDelete = async () => {
    if (!confirm('Eliminar este proyecto? Esta accion no se puede deshacer.')) return;
    setDeleting(true);
    try {
      const api = getApiClient();
      await api.deleteProject(projectId);
      toast.success('Proyecto eliminado');
      router.push('/projects');
    } catch (err) {
      toast.error('Error al eliminar proyecto');
    }
    setDeleting(false);
  };

  const handleClone = async () => {
    try {
      const api = getApiClient();
      await api.cloneProject(projectId, { name: `${project.name} (Copia)` });
      toast.success('Proyecto clonado');
      router.push('/projects');
    } catch (err) {
      toast.error('Error al clonar proyecto');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-500">Proyecto no encontrado</p>
        <Link href="/projects" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">Volver a proyectos</Link>
      </div>
    );
  }

  const statusCfg = PROJECT_STATUS_CONFIG[project.status] || { label: project.status, variant: 'neutral' };
  const variantColors: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${variantColors[statusCfg.variant]}`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              <span className="font-mono text-xs text-slate-400">{project.code}</span>
              {project.customer_name && <span className="ml-2">· {project.customer_name}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/projects/${projectId}/edit`}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
            <Edit className="w-3.5 h-3.5" /> Editar
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleClone}>
                <Copy className="w-4 h-4 mr-2 text-slate-500" /> Clonar Proyecto
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} disabled={deleting} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> {deleting ? 'Eliminando...' : 'Eliminar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.id === 'tasks' && tasks.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-500 rounded-full">{tasks.length}</span>
              )}
              {tab.id === 'members' && members.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-500 rounded-full">{members.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <SummaryTab project={project} tasks={tasks} members={members} expenses={expenses} costs={costs} />
      )}
      {activeTab === 'tasks' && (
        <ProjectTasks projectId={projectId} tasks={tasks} members={members} onRefresh={loadData} />
      )}
      {activeTab === 'members' && (
        <ProjectMembers projectId={projectId} members={members} onRefresh={loadData} />
      )}
    </div>
  );
}
