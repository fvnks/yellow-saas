'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION, SECONDARY_ACTION } from '@/components/educacion/button-classes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import { Asignatura, AsignaturaCreate, AsignaturaUpdate } from '@/types/educacion';
import { Modal } from '@/components/educacion/Modal';
import { AsignaturaForm } from '@/components/educacion/AsignaturaForm';

export default function AsignaturasPage() {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsignatura, setEditingAsignatura] = useState<Asignatura | undefined>();
  const [viewingAsignatura, setViewingAsignatura] = useState<Asignatura | null>(null);

  useEffect(() => {
    fetchAsignaturas();
  }, []);

  const fetchAsignaturas = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/educacion/asignaturas');
      const data = await res.json();
      setAsignaturas(data.data || []);
    } catch (error) {
      console.error('Error fetching asignaturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: AsignaturaCreate) => {
    try {
      const res = await fetch('/api/educacion/asignaturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchAsignaturas();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al crear asignatura');
      }
    } catch (error) {
      console.error('Error creating asignatura:', error);
    }
  };

  const handleUpdate = async (data: AsignaturaUpdate) => {
    if (!editingAsignatura) return;

    try {
      const res = await fetch(`/api/educacion/asignaturas/${editingAsignatura.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingAsignatura(undefined);
        fetchAsignaturas();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al actualizar asignatura');
      }
    } catch (error) {
      console.error('Error updating asignatura:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta asignatura?')) return;

    try {
      const res = await fetch(`/api/educacion/asignaturas/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAsignaturas(asignaturas.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting asignatura:', error);
    }
  };

  const openCreateModal = () => {
    setEditingAsignatura(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (asignatura: Asignatura) => {
    setEditingAsignatura(asignatura);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Asignaturas</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión del plan de estudios</p>
        </div>
        <Button className={PRIMARY_ACTION} onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Asignatura
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asignaturas.map((asignatura) => (
            <Card key={asignatura.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{asignatura.nombre}</CardTitle>
                    <p className="text-sm text-slate-500">
                      {asignatura.codigo ? `Código: ${asignatura.codigo}` : 'Sin código'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    asignatura.activo ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {asignatura.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BookOpen className="h-4 w-4" />
                    <span>Horas semanales: {asignatura.horas_semanales || 0}</span>
                  </div>
                  {asignatura.nivel && (
                    <div className="text-sm text-slate-600 capitalize">
                      Nivel: {asignatura.nivel}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${SECONDARY_ACTION} flex-1`}
                    onClick={() => setViewingAsignatura(asignatura)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${SECONDARY_ACTION} flex-1`}
                    onClick={() => openEditModal(asignatura)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    className={SECONDARY_ACTION}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(asignatura.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAsignatura(undefined);
        }}
        title={editingAsignatura ? 'Editar Asignatura' : 'Nueva Asignatura'}
        size="lg"
      >
        <AsignaturaForm
          asignatura={editingAsignatura}
          onSave={async (data) => {
            if (editingAsignatura) {
              await handleUpdate(data as AsignaturaUpdate);
            } else {
              await handleCreate(data as AsignaturaCreate);
            }
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingAsignatura(undefined);
          }}
        />
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal
        isOpen={!!viewingAsignatura}
        onClose={() => setViewingAsignatura(null)}
        title="Detalle de la Asignatura"
        size="lg"
      >
        {viewingAsignatura && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Nombre</label>
                <p className="text-ink">{viewingAsignatura.nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Código</label>
                <p className="text-ink">{viewingAsignatura.codigo || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Nivel</label>
                <p className="text-ink capitalize">{viewingAsignatura.nivel || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Horas Semanales</label>
                <p className="text-ink">{viewingAsignatura.horas_semanales || 0}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
