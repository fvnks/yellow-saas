'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select } from '@yellow-erp/ui';
import { X, Save, User } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { AFP_FUNDS } from '@/lib/payroll';

interface Props {
  employee: Record<string, any> | null;
  onClose: () => void;
  onSave: () => void;
}

const defaultForm = {
  first_name: '',
  last_name: '',
  rut: '',
  email: '',
  phone: '',
  address: '',
  position: '',
  department: '',
  contract_type: 'indefinido',
  base_salary: 0,
  hire_date: new Date().toISOString().split('T')[0],
  afp_fund: 'AFP Habitat',
  afp_rate: 10.58,
  afp_commission: 0.60,
  health_type: 'fonasa',
  health_amount: 0,
  mutual_type: 'achs',
  mutual_rate: 0.93,
  apv_amount: 0,
  bank_name: '',
  bank_account: '',
  emergency_contact: '',
  emergency_phone: '',
  notes: '',
  status: 'active',
};

export default function EmployeeFormModal({ employee, onClose, onSave }: Props) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employee) {
      setForm({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        rut: employee.rut || '',
        email: employee.email || '',
        phone: employee.phone || '',
        address: employee.address || '',
        position: employee.position || '',
        department: employee.department || '',
        contract_type: employee.contract_type || 'indefinido',
        base_salary: employee.base_salary || 0,
        hire_date: employee.hire_date || new Date().toISOString().split('T')[0],
        afp_fund: employee.afp_fund || 'AFP Habitat',
        afp_rate: employee.afp_rate || 10.58,
        afp_commission: employee.afp_commission || 0.60,
        health_type: employee.health_type || 'fonasa',
        health_amount: employee.health_amount || 0,
        mutual_type: employee.mutual_type || 'achs',
        mutual_rate: employee.mutual_rate || 0.93,
        apv_amount: employee.apv_amount || 0,
        bank_name: employee.bank_name || '',
        bank_account: employee.bank_account || '',
        emergency_contact: employee.emergency_contact || '',
        emergency_phone: employee.emergency_phone || '',
        notes: employee.notes || '',
        status: employee.status || 'active',
      });
    }
  }, [employee]);

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.rut.trim()) {
      setError('Nombre, apellido y RUT son obligatorios');
      return;
    }
    setSaving(true);
    setError('');
    const api = getApiClient();
    try {
      if (employee) {
        await api.updateEmployee(employee.id, form as any);
      } else {
        await api.createEmployee(form as any);
      }
      onSave();
    } catch (e: any) {
      setError(e?.message || 'Error al guardar');
    }
    setSaving(false);
  };

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-slate-900">
            {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">{error}</div>
          )}

          {/* Datos Personales */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Datos Personales</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre *" value={form.first_name} onChange={(e: any) => update('first_name', e.target.value)} placeholder="Juan" />
              <Input label="Apellido *" value={form.last_name} onChange={(e: any) => update('last_name', e.target.value)} placeholder="Pérez" />
              <Input label="RUT *" value={form.rut} onChange={(e: any) => update('rut', e.target.value)} placeholder="12.345.678-9" />
              <Input label="Email" type="email" value={form.email} onChange={(e: any) => update('email', e.target.value)} placeholder="juan@empresa.cl" />
              <Input label="Teléfono" value={form.phone} onChange={(e: any) => update('phone', e.target.value)} placeholder="+56 9 1234 5678" />
              <Input label="Dirección" value={form.address} onChange={(e: any) => update('address', e.target.value)} placeholder="Av. Principal 1234" />
              <Input label="Contacto de Emergencia" value={form.emergency_contact} onChange={(e: any) => update('emergency_contact', e.target.value)} placeholder="María Pérez" />
              <Input label="Tel. Emergencia" value={form.emergency_phone} onChange={(e: any) => update('emergency_phone', e.target.value)} placeholder="+56 9 8765 4321" />
            </div>
          </div>

          {/* Datos Laborales */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Datos Laborales</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Cargo" value={form.position} onChange={(e: any) => update('position', e.target.value)} placeholder="Gerente" />
              <Input label="Departamento" value={form.department} onChange={(e: any) => update('department', e.target.value)} placeholder="Ventas" />
              <Select
                label="Tipo de Contrato"
                value={form.contract_type}
                onChange={(e: any) => update('contract_type', e.target.value)}
                options={[
                  { value: 'indefinido', label: 'Indefinido' },
                  { value: 'plazo_fijo', label: 'Plazo Fijo' },
                  { value: 'part_time', label: 'Medio Tiempo' },
                  { value: 'temporada', label: 'Temporada' },
                  { value: 'boleta_7a', label: 'Boleta 7a' },
                ]}
              />
              <Input label="Fecha de Ingreso" type="date" value={form.hire_date} onChange={(e: any) => update('hire_date', e.target.value)} />
              <Input label="Sueldo Base (CLP)" type="number" value={form.base_salary} onChange={(e: any) => update('base_salary', parseFloat(e.target.value) || 0)} />
              <Select
                label="Estado"
                value={form.status}
                onChange={(e: any) => update('status', e.target.value)}
                options={[
                  { value: 'active', label: 'Activo' },
                  { value: 'on_leave', label: 'En Permiso' },
                  { value: 'terminated', label: 'Retirado' },
                ]}
              />
            </div>
          </div>

          {/* Prevision */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Previsión Social</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="AFP"
                value={form.afp_fund}
                onChange={(e: any) => {
                  const fund = AFP_FUNDS[e.target.value];
                  update('afp_fund', e.target.value);
                  if (fund) {
                    update('afp_rate', fund.si);
                    update('afp_commission', fund.commission);
                  }
                }}
                options={Object.keys(AFP_FUNDS).map(f => ({ value: f, label: f }))}
              />
              <Input label="Tasa AFP (%)" type="number" value={form.afp_rate} onChange={(e: any) => update('afp_rate', parseFloat(e.target.value) || 0)} />
              <Select
                label="Tipo de Salud"
                value={form.health_type}
                onChange={(e: any) => update('health_type', e.target.value)}
                options={[
                  { value: 'fonasa', label: 'FONASA (7%)' },
                  { value: 'isapre', label: 'Isapre (monto fijo)' },
                ]}
              />
              {form.health_type === 'isapre' && (
                <Input label="Monto Isapre (CLP)" type="number" value={form.health_amount} onChange={(e: any) => update('health_amount', parseFloat(e.target.value) || 0)} />
              )}
              <Select
                label="Mutual de Seguridad"
                value={form.mutual_type}
                onChange={(e: any) => update('mutual_type', e.target.value)}
                options={[
                  { value: 'achs', label: 'ACHS' },
                  { value: 'masisa', label: 'Masisa' },
                  { value: 'sseg', label: 'SSEG' },
                ]}
              />
              <Input label="Tasa Mutual (%)" type="number" value={form.mutual_rate} onChange={(e: any) => update('mutual_rate', parseFloat(e.target.value) || 0)} />
              <Input label="APV Mensual (CLP)" type="number" value={form.apv_amount} onChange={(e: any) => update('apv_amount', parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          {/* Datos Bancarios */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Datos Bancarios</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Banco" value={form.bank_name} onChange={(e: any) => update('bank_name', e.target.value)} placeholder="Banco Estado" />
              <Input label="Cuenta" value={form.bank_account} onChange={(e: any) => update('bank_account', e.target.value)} placeholder="12345678" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e: any) => update('notes', e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Notas adicionales..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
