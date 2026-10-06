'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION, ICON_ACTION } from '@/components/educacion/button-classes';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Apoderado, ApoderadoCreate, ApoderadoUpdate } from '@/types/educacion';
import { Modal } from '@/components/educacion/Modal';
import { ApoderadoForm } from '@/components/educacion/ApoderadoForm';

export default function ApoderadosPage() {
  const [apoderados, setApoderados] = useState<Apoderado[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApoderado, setEditingApoderado] = useState<Apoderado | undefined>();
  const [viewingApoderado, setViewingApoderado] = useState<Apoderado | null>(null);

  useEffect(() => {
    fetchApoderados();
  }, [search]);

  const fetchApoderados = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(`/api/educacion/apoderados?${params}`);
      const data = await res.json();
      setApoderados(data.data || []);
    } catch (error) {
      console.error('Error fetching apoderados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: ApoderadoCreate) => {
    try {
      const res = await fetch('/api/educacion/apoderados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchApoderados();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al crear apoderado');
      }
    } catch (error) {
      console.error('Error creating apoderado:', error);
    }
  };

  const handleUpdate = async (data: ApoderadoUpdate) => {
    if (!editingApoderado) return;

    try {
      const res = await fetch(`/api/educacion/apoderados/${editingApoderado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingApoderado(undefined);
        fetchApoderados();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al actualizar apoderado');
      }
    } catch (error) {
      console.error('Error updating apoderado:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este apoderado?')) return;

    try {
      const res = await fetch(`/api/educacion/apoderados/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setApoderados(apoderados.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting apoderado:', error);
    }
  };

  const openCreateModal = () => {
    setEditingApoderado(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (apoderado: Apoderado) => {
    setEditingApoderado(apoderado);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Apoderados</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de apoderados y tutores</p>
        </div>
        <Button className={PRIMARY_ACTION} onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Apoderado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Apoderados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o RUT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">RUT</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Teléfono</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Email</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {apoderados.map((ap) => (
                    <tr key={ap.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">{ap.rut}</td>
                      <td className="py-3 px-4">
                        {ap.nombres} {ap.apellido_paterno} {ap.apellido_materno}
                      </td>
                      <td className="py-3 px-4">{ap.telefono || '-'}</td>
                      <td className="py-3 px-4">{ap.email || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            className={ICON_ACTION}
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingApoderado(ap)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            className={ICON_ACTION}
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(ap)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            className={ICON_ACTION}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ap.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApoderado(undefined);
        }}
        title={editingApoderado ? 'Editar Apoderado' : 'Nuevo Apoderado'}
        size="lg"
      >
        <ApoderadoForm
          apoderado={editingApoderado}
          onSave={async (data) => {
            if (editingApoderado) {
              await handleUpdate(data as ApoderadoUpdate);
            } else {
              await handleCreate(data as ApoderadoCreate);
            }
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingApoderado(undefined);
          }}
        />
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal
        isOpen={!!viewingApoderado}
        onClose={() => setViewingApoderado(null)}
        title="Detalle del Apoderado"
        size="lg"
      >
        {viewingApoderado && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500">RUT</label>
                <p className="text-ink">{viewingApoderado.rut}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Nombre Completo</label>
                <p className="text-ink">
                  {viewingApoderado.nombres} {viewingApoderado.apellido_paterno} {viewingApoderado.apellido_materno}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Teléfono</label>
                <p className="text-ink">{viewingApoderado.telefono || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Email</label>
                <p className="text-ink">{viewingApoderado.email || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-500">Dirección</label>
                <p className="text-ink">{viewingApoderado.direccion || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Ocupación</label>
                <p className="text-ink">{viewingApoderado.ocupacion || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
