'use client';

import { useState, useEffect } from 'react';
import { Button, Badge, Input, Select } from '@yellow-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Contract {
  id: string;
  employee_name: string;
  employee_rut: string;
  contract_type: string;
  position: string;
  department: string;
  start_date: string;
  end_date: string | null;
  base_salary: number;
  status: string;
  created_at: string;
}

const contractTypeLabels: Record<string, string> = {
  indefinido: 'Indefinido',
  plazo_fijo: 'Plazo Fijo',
  part_time: 'Medio Tiempo',
  temporada: 'Temporada',
  boleta_7a: 'Boleta 7a',
};

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  active: { label: 'Vigente', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  terminated: { label: 'Terminado', variant: 'danger' },
  expired: { label: 'Vencido', variant: 'danger' },
};

export default function ContractsTab() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    employee_id: '', contract_type: 'indefinido', position: '', department: '',
    start_date: '', end_date: '', base_salary: '', status: 'active',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const companyId = localStorage.getItem('company_id');
      const [contractsRes, employeesRes] = await Promise.all([
        fetch(`/api/companies/${companyId}/hr/contracts`).then(r => r.json()).catch(() => ({ data: [] })),
        api.getEmployees({ limit: '200' }).catch(() => ({ data: [] })),
      ]);
      setContracts(contractsRes.data || []);
      setEmployees(employeesRes.data || []);
    } catch { toast.error('Error al cargar contratos'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!form.employee_id || !form.start_date) { toast.error('Empleado y fecha de inicio son requeridos'); return; }
    setSaving(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/api/companies/${companyId}/hr/contracts/${editingId}`
        : `/api/companies/${companyId}/hr/contracts`;
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setShowForm(false); setEditingId(null);
      setForm({ employee_id: '', contract_type: 'indefinido', position: '', department: '', start_date: '', end_date: '', base_salary: '', status: 'active' });
      loadData();
      toast.success(editingId ? 'Contrato actualizado' : 'Contrato creado');
    } catch { toast.error('Error al guardar'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este contrato?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/hr/contracts/${id}`, { method: 'DELETE' });
      loadData(); toast.success('Contrato eliminado');
    } catch { toast.error('Error al eliminar'); }
  };

  const filtered = contracts.filter(c =>
    c.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.employee_rut?.includes(search) ||
    c.position?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Input placeholder="Buscar contrato..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" icon={Search} />
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({ employee_id: '', contract_type: 'indefinido', position: '', department: '', start_date: '', end_date: '', base_salary: '', status: 'active' }); }}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Contrato
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Editar Contrato' : 'Nuevo Contrato'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Empleado</label>
                <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Seleccionar...</option>
                  {employees.map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Tipo de Contrato</label>
                <select value={form.contract_type} onChange={e => setForm({ ...form, contract_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  {Object.entries(contractTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <Input label="Cargo" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="Ej: Analista" />
              <Input label="Departamento" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Ej: Ventas" />
              <Input label="Fecha Inicio" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
              <Input label="Fecha Fin (opcional)" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              <Input label="Salario Base (CLP)" type="number" value={form.base_salary} onChange={e => setForm({ ...form, base_salary: e.target.value })} placeholder="0" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Depto</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Salario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-sm text-slate-400">Cargando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-sm text-slate-400">Sin contratos registrados</TableCell></TableRow>
              ) : filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="text-xs font-medium text-slate-900">{c.employee_name}</p>
                    <p className="text-[10px] text-slate-400">{c.employee_rut}</p>
                  </TableCell>
                  <TableCell><span className="text-xs">{contractTypeLabels[c.contract_type] || c.contract_type}</span></TableCell>
                  <TableCell className="text-xs">{c.position || '—'}</TableCell>
                  <TableCell className="text-xs">{c.department || '—'}</TableCell>
                  <TableCell className="text-xs">{c.start_date}</TableCell>
                  <TableCell className="text-xs">{c.end_date || 'Indefinido'}</TableCell>
                  <TableCell className="text-xs">${Number(c.base_salary || 0).toLocaleString('es-CL')}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[c.status]?.variant || 'neutral'}>
                      {statusConfig[c.status]?.label || c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingId(c.id); setForm({ employee_id: '', contract_type: c.contract_type, position: c.position || '', department: c.department || '', start_date: c.start_date, end_date: c.end_date || '', base_salary: String(c.base_salary || ''), status: c.status }); setShowForm(true); }} className="p-1 hover:bg-slate-100 rounded"><Edit className="w-3.5 h-3.5 text-slate-500" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
