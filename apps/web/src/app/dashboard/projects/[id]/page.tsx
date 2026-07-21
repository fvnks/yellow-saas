'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@yellow-erp/ui';
import { ArrowLeft, Plus, Calendar, DollarSign, Users, CheckCircle2, Clock, Edit, Trash2, BarChart3, Flag, Receipt, FileText, TrendingUp, LayoutGrid, Copy, Download, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { downloadCSV, downloadExcel } from '@/lib/export-utils';
import { generateProjectReportPDF } from '@/lib/project-report-pdf';
import { generateProjectCalendarICS, downloadICS } from '@/lib/ical-utils';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';
import GanttChart from '../components/GanttChart';
import MilestonesTab from '../components/MilestonesTab';
import TimesheetsTab from '../components/TimesheetsTab';
import ExpensesTab from '../components/ExpensesTab';
import CostsTab from '../components/CostsTab';
import DocumentsTab from '../components/DocumentsTab';
import RentabilidadReport from '../components/RentabilidadReport';
import ActivityLog from '../components/ActivityLog';
import RisksTab from '../components/RisksTab';
import ChangeOrdersTab from '../components/ChangeOrdersTab';
import PortalTab from '../components/PortalTab';
import KanbanBoard from '../components/KanbanBoard';
import TemplatesTab from '../components/TemplatesTab';
import PhasesTab from '../components/PhasesTab';
import TimerWidget from '../components/TimerWidget';
import TaskComments from '../components/TaskComments';
import NotificationsPanel from '../components/NotificationsPanel';
import ResourceAllocation from '../components/ResourceAllocation';
import BudgetForecast from '../components/BudgetForecast';
import SubtaskProgress from '../components/SubtaskProgress';
import TagsManager, { TaskTagBadges } from '../components/TagsManager';
import AuditLog from '../components/AuditLog';
import ProjectMembers from '../components/ProjectMembers';
import ResourceAllocationForm from '../components/ResourceAllocationForm';

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  planning: { label: 'Planificacion', variant: 'info' },
  active: { label: 'Activo', variant: 'success' },
  on_hold: { label: 'En Pausa', variant: 'warning' },
  completed: { label: 'Completado', variant: 'neutral' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
};

const taskStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  todo: { label: 'Por Hacer', variant: 'neutral' },
  in_progress: { label: 'En Progreso', variant: 'info' },
  review: { label: 'En Revision', variant: 'warning' },
  done: { label: 'Completada', variant: 'success' },
};

const priorityConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  low: { label: 'Baja', variant: 'neutral' },
  medium: { label: 'Media', variant: 'info' },
  high: { label: 'Alta', variant: 'warning' },
  urgent: { label: 'Urgente', variant: 'danger' },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [costsData, setCostsData] = useState<any>({ costs: [], summary: [] });
  const [documents, setDocuments] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [changeOrders, setChangeOrders] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskForm, setTaskForm] = useState({
    name: '', description: '', assignee_id: '', status: 'todo', priority: 'medium',
    start_date: '', due_date: '', estimated_hours: '', parent_id: '',
    recurrence_type: 'none', recurrence_interval: '1', recurrence_end_date: '',
  });
  const [saving, setSaving] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [commentTaskId, setCommentTaskId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const [projectRes, tasksRes, milestonesRes, timesheetsRes, expensesRes, costsRes, docsRes, employeesRes, usersRes, risksRes, changeOrdersRes, depsRes, phasesRes] = await Promise.all([
        api.getProject(projectId),
        api.getProjectTasks(projectId),
        api.getProjectMilestones(projectId),
        api.getProjectTimesheets(projectId),
        api.getProjectExpenses(projectId),
        api.getProjectCosts(projectId),
        api.getProjectDocuments(projectId),
        api.getEmployees({ limit: '200' }),
        api.getUsers({ limit: 100 }),
        api.getProjectRisks(projectId),
        api.getProjectChangeOrders(projectId),
        api.getProjectDependencies(projectId).catch(() => []),
        api.getProjectPhases(projectId).catch(() => []),
      ]);
      setProject(projectRes);
      setTasks(Array.isArray(tasksRes) ? tasksRes : []);
      setMilestones(Array.isArray(milestonesRes) ? milestonesRes : []);
      setTimesheets(Array.isArray(timesheetsRes) ? timesheetsRes : []);
      setExpenses(Array.isArray(expensesRes) ? expensesRes : []);
      setCostsData(costsRes || { costs: [], summary: [] });
      setDocuments(Array.isArray(docsRes) ? docsRes : []);
      setEmployees(Array.isArray(employeesRes?.data) ? employeesRes.data : []);
      setUsers(usersRes?.data || []);
      setRisks(Array.isArray(risksRes) ? risksRes : []);
      setChangeOrders(Array.isArray(changeOrdersRes) ? changeOrdersRes : []);
      setDependencies(Array.isArray(depsRes) ? depsRes : []);
      setPhases(Array.isArray(phasesRes) ? phasesRes : []);
    } catch (err) { toast.error('Error al cargar proyecto'); }
    setLoading(false);
  };

  const handleSaveTask = async () => {
    if (!taskForm.name) return;
    setSaving(true);
    try {
      const api = getApiClient();
      const data = { ...taskForm, estimated_hours: taskForm.estimated_hours ? parseFloat(taskForm.estimated_hours) : null, assignee_id: taskForm.assignee_id || null, parent_id: taskForm.parent_id || null };
      let taskId: string;
      if (editingTask) { await api.updateProjectTask(projectId, editingTask.id, data); taskId = editingTask.id; }
      else { const res = await api.createProjectTask(projectId, data); taskId = res.id; }
      if (selectedTaskTags.length > 0) {
        await api.setTaskTags(projectId, taskId, selectedTaskTags);
      }
      setShowTaskForm(false); setEditingTask(null);
      setTaskForm({ name: '', description: '', assignee_id: '', status: 'todo', priority: 'medium', start_date: '', due_date: '', estimated_hours: '', parent_id: '', recurrence_type: 'none', recurrence_interval: '1', recurrence_end_date: '' });
      setSelectedTaskTags([]);
      loadData();
    } catch (err) { toast.error('Error al guardar tarea'); }
    setSaving(false);
  };

  const handleEditTask = (task: any) => {
    setTaskForm({ name: task.name || '', description: task.description || '', assignee_id: task.assignee_id || '', status: task.status || 'todo', priority: task.priority || 'medium', start_date: task.start_date || '', due_date: task.due_date || '', estimated_hours: task.estimated_hours || '', parent_id: task.parent_id || '', recurrence_type: task.recurrence_type || 'none', recurrence_interval: task.recurrence_interval || '1', recurrence_end_date: task.recurrence_end_date || '' });
    setEditingTask(task); setShowTaskForm(true);
  };

  const handleClone = async () => {
    if (!confirm(`Clonar "${project.name}"? Se creara una copia con tareas e hitos.`)) return;
    setCloning(true);
    try {
      const api = getApiClient();
      const res = await api.cloneProject(projectId, {
        name: `${project.name} (Copia)`,
        code: `${project.code}-COPY`,
      });
      router.push(`/dashboard/projects/${res.project.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Error al clonar');
      setCloning(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Eliminar esta tarea?')) return;
    try { const api = getApiClient(); await api.deleteProjectTask(projectId, taskId); loadData(); } catch (err) { toast.error('Error al eliminar tarea'); }
  };

  const handleUpdateTaskStatus = async (task: any, newStatus: string) => {
    try { const api = getApiClient(); await api.updateProjectTask(projectId, task.id, { ...task, status: newStatus }); loadData(); } catch (err) { toast.error('Error al actualizar tarea'); }
  };

  const handleUpdateProgress = async (progress: number) => {
    try { const api = getApiClient(); await api.updateProject(projectId, { ...project, progress }); setProject({ ...project, progress }); } catch (err) { toast.error('Error al actualizar progreso'); }
  };

  const handleAutoProgress = async () => {
    if (tasks.length === 0) return;
    const done = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const review = tasks.filter(t => t.status === 'review').length;
    const pct = Math.round(((done * 1 + inProgress * 0.5 + review * 0.75) / tasks.length) * 100);
    await handleUpdateProgress(pct);
  };

  const [taskTagsMap, setTaskTagsMap] = useState<Record<string, { name: string; color: string }[]>>({});
  const [selectedTaskTags, setSelectedTaskTags] = useState<string[]>([]);

  const handleSetTaskTags = async (taskId: string, tagIds: string[]) => {
    try {
      const api = getApiClient();
      const result = await api.setTaskTags(projectId, taskId, tagIds);
      setTaskTagsMap(prev => ({ ...prev, [taskId]: result || [] }));
      setSelectedTaskTags([]);
    } catch { toast.error('Error al guardar tags'); }
  };

  const [exportOpen, setExportOpen] = useState(false);

  const handleExport = (type: 'csv' | 'excel', dataset: string) => {
    let data: any[] = [];
    let filename = '';

    switch (dataset) {
      case 'tasks':
        data = tasks.map(t => ({
          Nombre: t.name, Descripcion: t.description, Estado: t.status, Prioridad: t.priority,
          'Fecha Inicio': t.start_date, 'Fecha Fin': t.due_date, 'Horas Estimadas': t.estimated_hours,
        }));
        filename = `${project?.code || 'proyecto'}_tareas`;
        break;
      case 'timesheets':
        data = timesheets.map(t => ({
          Fecha: t.date, Empleado: t.employee_name, Tarea: t.task_name,
          Horas: t.hours, Descripcion: t.description,
        }));
        filename = `${project?.code || 'proyecto'}_horas`;
        break;
      case 'expenses':
        data = expenses.map(e => ({
          Fecha: e.date, Tipo: e.type, Monto: e.amount, Descripcion: e.description,
        }));
        filename = `${project?.code || 'proyecto'}_gastos`;
        break;
      case 'milestones':
        data = milestones.map(m => ({
          Nombre: m.name, Estado: m.status, 'Fecha Limite': m.due_date,
        }));
        filename = `${project?.code || 'proyecto'}_hitos`;
        break;
    }

    if (data.length === 0) { toast.warning('No hay datos para exportar'); return; }
    if (type === 'csv') downloadCSV(data, filename);
    else downloadExcel(data, filename);
    setExportOpen(false);
    toast.success(`Exportado ${data.length} registros`);
  };

  const handleExportPDF = () => {
    const doc = generateProjectReportPDF({
      project, tasks, milestones, expenses, phases, timesheets,
    });
    doc.save(`${project?.code || 'proyecto'}_reporte.pdf`);
    setExportOpen(false);
    toast.success('PDF generado');
  };

  const handleExportCalendar = () => {
    const ics = generateProjectCalendarICS(milestones, tasks, project.name, project.code);
    downloadICS(ics, `${project?.code || 'proyecto'}_calendario`);
    setExportOpen(false);
    toast.success('Calendario exportado (.ics)');
  };

  const totalEstimated = tasks.reduce((sum, t) => sum + (parseFloat(t.estimated_hours) || 0), 0);
  const totalActual = tasks.reduce((sum, t) => sum + (parseFloat(t.actual_hours) || 0), 0);
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const totalCosts = (costsData.costs || []).reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0);
  const budget = parseFloat(project.budget) || 0;
  const budgetUsed = budget > 0 ? Math.round(((totalCosts + totalExpenses) / budget) * 100) : 0;

  const tabs = [
    { id: 'tasks', label: `Tareas (${tasks.length})` },
    { id: 'kanban', label: 'Kanban' },
    { id: 'gantt', label: 'Gantt' },
    { id: 'milestones', label: `Hitos (${milestones.length})` },
    { id: 'phases', label: `Fases (${phases.length})` },
    { id: 'templates', label: 'Plantillas' },
    { id: 'team', label: 'Equipo' },
    { id: 'resources', label: 'Recursos' },
    { id: 'forecast', label: 'Forecast' },
    { id: 'timesheets', label: `Horas (${timesheets.length})` },
    { id: 'expenses', label: `Gastos (${expenses.length})` },
    { id: 'costs', label: 'Centro Costos' },
    { id: 'risks', label: `Riesgos (${risks.length})` },
    { id: 'changes', label: `Cambios (${changeOrders.length})` },
    { id: 'documents', label: `Docs (${documents.length})` },
    { id: 'profit', label: 'Rentabilidad' },
    { id: 'activity', label: 'Actividad' },
    { id: 'audit', label: 'Historial' },
    { id: 'portal', label: 'Portal' },
    { id: 'info', label: 'Info' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}</div>
          <div className="h-12 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Proyecto no encontrado</p>
        <Link href="/dashboard/projects" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">Volver a Proyectos</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
            <Badge variant={statusConfig[project.status]?.variant || 'neutral'}>{statusConfig[project.status]?.label || project.status}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">{project.code} {project.customer_name ? `· ${project.customer_name}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationsPanel userId={users[0]?.id || ''} />
          <div className="relative">
            <button onClick={() => setExportOpen(!exportOpen)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" /> Exportar
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2">
                {[
                  { label: 'Tareas (CSV)', action: () => handleExport('csv', 'tasks') },
                  { label: 'Tareas (Excel)', action: () => handleExport('excel', 'tasks') },
                  { label: 'Horas (CSV)', action: () => handleExport('csv', 'timesheets') },
                  { label: 'Horas (Excel)', action: () => handleExport('excel', 'timesheets') },
                  { label: 'Gastos (CSV)', action: () => handleExport('csv', 'expenses') },
                  { label: 'Gastos (Excel)', action: () => handleExport('excel', 'expenses') },
                  { label: 'Hitos (CSV)', action: () => handleExport('csv', 'milestones') },
                  { label: 'Hitos (Excel)', action: () => handleExport('excel', 'milestones') },
                  { label: '─────────', action: () => {} },
                  { label: 'Reporte Completo (PDF)', action: handleExportPDF },
                  { label: 'Calendario (.ics)', action: handleExportCalendar },
                ].map((item, i) => (
                  <button key={i} onClick={item.action}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 transition-colors ${item.label.startsWith('─') ? 'text-slate-300 cursor-default' : 'text-slate-700'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleClone} disabled={cloning}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <Copy className="w-4 h-4" /> {cloning ? 'Clonando...' : 'Clonar'}
          </button>
          <Link href={`/dashboard/projects/${projectId}/edit`}>
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Edit className="w-4 h-4" /> Editar
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Presupuesto</p><p className="text-lg font-bold text-slate-900 mt-1">${budget > 0 ? (budget / 1000000).toFixed(1) + 'M' : '—'}</p></div>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-indigo-600" /></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Gastado</p><p className="text-lg font-bold text-slate-900 mt-1">{budgetUsed}%</p><p className="text-[10px] text-slate-500">${((totalCosts + totalExpenses) / 1000000).toFixed(1)}M</p></div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${budgetUsed > 90 ? 'bg-red-50' : budgetUsed > 70 ? 'bg-amber-50' : 'bg-emerald-50'}`}><DollarSign className={`w-5 h-5 ${budgetUsed > 90 ? 'text-red-600' : budgetUsed > 70 ? 'text-amber-600' : 'text-emerald-600'}`} /></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tareas</p><p className="text-lg font-bold text-slate-900 mt-1">{completedTasks}/{tasks.length}</p></div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Horas</p><p className="text-lg font-bold text-slate-900 mt-1">{totalActual.toFixed(1)}/{totalEstimated.toFixed(1)}</p></div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-amber-600" /></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Progreso</p><p className="text-lg font-bold text-slate-900 mt-1">{project.progress || 0}%</p></div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><BarChart3 className="w-5 h-5 text-blue-600" /></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500">Progreso del proyecto</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-900">{project.progress || 0}%</span>
            {tasks.length > 0 && (
              <button onClick={handleAutoProgress} className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors">
                Auto-calculcar
              </button>
            )}
          </div>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${project.progress || 0}%` }} />
        </div>
        <div className="flex gap-2 mt-3">
          {[0, 25, 50, 75, 100].map(p => (
            <button key={p} onClick={() => handleUpdateProgress(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${project.progress === p ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {p}%
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <ContinuousTabs tabs={tabs} defaultActiveId={activeTab} onChange={(id) => setActiveTab(id)} />
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Tareas del Proyecto</h2>
            <button onClick={() => { setShowTaskForm(true); setEditingTask(null); setTaskForm({ name: '', description: '', assignee_id: '', status: 'todo', priority: 'medium', start_date: '', due_date: '', estimated_hours: '', parent_id: '', recurrence_type: 'none', recurrence_interval: '1', recurrence_end_date: '' }); }}
              className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Nueva Tarea
            </button>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No hay tareas creadas</p>
              <button onClick={() => setShowTaskForm(true)} className="text-indigo-600 hover:underline text-sm mt-2">Crear primera tarea</button>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.filter(t => !t.parent_id).map(task => {
                const subtasks = tasks.filter(t => t.parent_id === task.id);
                return (
                <div key={task.id}>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-slate-900">{task.name}</h3>
                        <Badge variant={taskStatusConfig[task.status]?.variant || 'neutral'}>{taskStatusConfig[task.status]?.label}</Badge>
                        <Badge variant={priorityConfig[task.priority]?.variant || 'neutral'}>{priorityConfig[task.priority]?.label}</Badge>
                      </div>
                      {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
                      <TaskTagBadges tags={taskTagsMap[task.id] || []} />
                      <SubtaskProgress tasks={tasks} parentId={task.id} />
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        {task.assignee_name && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{task.assignee_name}</span>}
                        {task.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.due_date}</span>}
                        {task.estimated_hours && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.estimated_hours}h</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.status !== 'done' && (
                        <TimerWidget projectId={projectId} taskId={task.id} employeeId={task.assignee_id} onTimerUpdate={loadData} />
                      )}
                      <div className="flex items-center gap-1">
                        {task.status !== 'done' && (
                          <button onClick={() => { const next = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'review' : 'done'; handleUpdateTaskStatus(task, next); }}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium hover:bg-emerald-100 transition-colors">
                            {task.status === 'todo' ? 'Iniciar' : task.status === 'in_progress' ? 'Revisar' : 'Completar'}
                          </button>
                        )}
                        <button onClick={() => setCommentTaskId(task.id)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><MessageCircle className="w-3.5 h-3.5 text-slate-500" /></button>
                        <button onClick={() => { setTaskForm({ ...taskForm, parent_id: task.id }); setShowTaskForm(true); }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Plus className="w-3.5 h-3.5 text-slate-500" /></button>
                        <button onClick={() => handleEditTask(task)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Edit className="w-3.5 h-3.5 text-slate-500" /></button>
                        <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                      </div>
                    </div>
                  </div>
                </div>
                {subtasks.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {subtasks.map(sub => (
                      <div key={sub.id} className="bg-white border border-slate-100 rounded-lg p-3 hover:shadow-sm transition-shadow flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-xs font-medium text-slate-900">{sub.name}</span>
                          <Badge variant={taskStatusConfig[sub.status]?.variant || 'neutral'}>{taskStatusConfig[sub.status]?.label}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {sub.status !== 'done' && (
                            <button onClick={() => { const next = sub.status === 'todo' ? 'in_progress' : sub.status === 'in_progress' ? 'review' : 'done'; handleUpdateTaskStatus(sub, next); }}
                              className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium hover:bg-emerald-100 transition-colors">
                              {sub.status === 'todo' ? 'Iniciar' : sub.status === 'in_progress' ? 'Revisar' : 'Completar'}
                            </button>
                          )}
                          <button onClick={() => handleEditTask(sub)} className="p-1 hover:bg-slate-100 rounded transition-colors"><Edit className="w-3 h-3 text-slate-400" /></button>
                          <button onClick={() => handleDeleteTask(sub.id)} className="p-1 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3 h-3 text-red-400" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              )})}
            </div>
          )}
        </div>
      )}

      {activeTab === 'gantt' && <GanttChart tasks={tasks} dependencies={dependencies} />}

      {activeTab === 'kanban' && (
        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleUpdateTaskStatus}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onAddTask={(status) => {
            setTaskForm({ name: '', description: '', assignee_id: '', status, priority: 'medium', start_date: '', due_date: '', estimated_hours: '', parent_id: '', recurrence_type: 'none', recurrence_interval: '1', recurrence_end_date: '' });
            setShowTaskForm(true);
          }}
        />
      )}
      {activeTab === 'milestones' && <MilestonesTab projectId={projectId} milestones={milestones} onRefresh={loadData} />}
      {activeTab === 'templates' && <TemplatesTab onApply={loadData} />}
      {activeTab === 'team' && <ProjectMembers projectId={projectId} users={users} />}
      {activeTab === 'resources' && <ResourceAllocationForm projectId={projectId} employees={employees} />}
      {activeTab === 'forecast' && <BudgetForecast projectId={projectId} />}
      {activeTab === 'phases' && <PhasesTab projectId={projectId} phases={phases} onRefresh={loadData} />}
      {activeTab === 'timesheets' && <TimesheetsTab projectId={projectId} timesheets={timesheets} tasks={tasks} employees={employees} onRefresh={loadData} />}
      {activeTab === 'expenses' && <ExpensesTab projectId={projectId} expenses={expenses} onRefresh={loadData} />}
      {activeTab === 'costs' && <CostsTab costs={costsData.costs || []} budget={project.budget} />}
      {activeTab === 'risks' && <RisksTab projectId={projectId} risks={risks} employees={employees} onRefresh={loadData} />}
      {activeTab === 'changes' && <ChangeOrdersTab projectId={projectId} changeOrders={changeOrders} onRefresh={loadData} />}
      {activeTab === 'documents' && <DocumentsTab projectId={projectId} documents={documents} onRefresh={loadData} />}
      {activeTab === 'profit' && <RentabilidadReport project={project} costs={costsData.costs || []} expenses={expenses} timesheets={timesheets} />}
      {activeTab === 'activity' && <ActivityLog projectId={projectId} />}
      {activeTab === 'audit' && <AuditLog projectId={projectId} />}
      {activeTab === 'portal' && <PortalTab projectId={projectId} project={project} onRefresh={loadData} />}

      {activeTab === 'info' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Informacion del Proyecto</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</p><p className="text-sm text-slate-900 mt-1">{project.name}</p></div>
              <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Codigo</p><p className="text-sm text-slate-900 mt-1">{project.code}</p></div>
              <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</p><p className="text-sm text-slate-900 mt-1">{project.customer_name || '—'}</p></div>
              <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Gerente</p><p className="text-sm text-slate-900 mt-1">{project.project_manager_name || '—'}</p></div>
              <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Creado por</p><p className="text-sm text-slate-900 mt-1">{project.created_by_name || '—'}</p></div>
            </div>
            <div className="space-y-4">
              <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Inicio</p><p className="text-sm text-slate-900 mt-1">{project.start_date || '—'}</p></div>
              <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Fin</p><p className="text-sm text-slate-900 mt-1">{project.end_date || '—'}</p></div>
              <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Presupuesto</p><p className="text-sm text-slate-900 mt-1">${(parseFloat(project.budget) || 0).toLocaleString('es-CL')} CLP</p></div>
              <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</p><p className="text-sm text-slate-900 mt-1"><Badge variant={statusConfig[project.status]?.variant || 'neutral'}>{statusConfig[project.status]?.label || project.status}</Badge></p></div>
              <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripcion</p><p className="text-sm text-slate-900 mt-1">{project.description || '—'}</p></div>
              <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Creado</p><p className="text-sm text-slate-900 mt-1">{project.created_at?.split('T')[0] || '—'}</p></div>
              <div><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Ultima Actualizacion</p><p className="text-sm text-slate-900 mt-1">{project.updated_at?.split('T')[0] || '—'}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* TASK MODAL */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
              <button onClick={() => { setShowTaskForm(false); setEditingTask(null); }} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Nombre *</label>
                <input type="text" value={taskForm.name} onChange={e => setTaskForm({ ...taskForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripcion</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Asignado a</label>
                  <select value={taskForm.assignee_id} onChange={e => setTaskForm({ ...taskForm, assignee_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Sin asignar</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Prioridad</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Inicio</label>
                  <input type="date" value={taskForm.start_date} onChange={e => setTaskForm({ ...taskForm, start_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Limite</label>
                  <input type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Horas Est.</label>
                  <input type="number" step="0.5" value={taskForm.estimated_hours} onChange={e => setTaskForm({ ...taskForm, estimated_hours: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Tarea Padre</label>
                <select value={taskForm.parent_id} onChange={e => setTaskForm({ ...taskForm, parent_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Sin tarea padre</option>
                  {tasks.filter((t: any) => !t.parent_id && (!editingTask || t.id !== editingTask.id)).map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Etiquetas</label>
                <TagsManager selectedTagIds={selectedTaskTags} onChange={setSelectedTaskTags} />
              </div>
              <div className="border-t border-slate-100 pt-3 mt-1">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Recurrencia</label>
                <div className="grid grid-cols-3 gap-2">
                  <select value={taskForm.recurrence_type} onChange={e => setTaskForm({ ...taskForm, recurrence_type: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="none">Sin recurrencia</option>
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                  {taskForm.recurrence_type !== 'none' && (
                    <>
                      <input type="number" min="1" value={taskForm.recurrence_interval} onChange={e => setTaskForm({ ...taskForm, recurrence_interval: e.target.value })}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Cada..." />
                      <input type="date" value={taskForm.recurrence_end_date} onChange={e => setTaskForm({ ...taskForm, recurrence_end_date: e.target.value })}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => { setShowTaskForm(false); setEditingTask(null); }}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSaveTask} disabled={saving || !taskForm.name}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : editingTask ? 'Actualizar' : 'Crear Tarea'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS MODAL */}
      {commentTaskId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Comentarios</h2>
              <button onClick={() => setCommentTaskId(null)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <div className="p-4">
              <TaskComments projectId={projectId} taskId={commentTaskId} currentUserId={users[0]?.id || ''} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
