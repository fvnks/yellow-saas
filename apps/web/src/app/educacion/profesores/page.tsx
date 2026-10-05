'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Profesor, ProfesorCreate, ProfesorUpdate } from '@/types/educacion';
import { Modal } from '@/components/educacion/Modal';
import { ProfesorForm } from '@/components/educacion/ProfesorForm';

export default function ProfesoresPage() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfesor, setEditingProfesor] = useState<Profesor | undefined>();
  const [viewingProfesor, setViewingProfesor] = useState<Profesor | null>(null);

  useEffect(() => {
    fetchProfesores();
  }, [search]);

  const fetchProfesores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(`/api/educacion/profesores?${params}`);
      const data = await res.json();
      setProfesores(data.data || []);
    } catch (error) {
      console.error('Error fetching profesores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: ProfesorCreate) => {
    try {
      const res = await fetch('/api/educacion/profesores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProfesores();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al crear profesor');
      }
    } catch (error) {
      console.error('Error creating profesor:', error);
    }
  };

  const handleUpdate = async (data: ProfesorUpdate) => {
    if (!editingProfesor) return;

    try {
      const res = await fetch(`/api/educacion/profesores/${editingProfesor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingProfesor(undefined);
        fetchProfesores();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al actualizar profesor');
      }
    } catch (error) {
      console.error('Error updating profesor:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este profesor?')) return;

    try {
      const res = await fetch(`/api/educacion/profesores/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProfesores(profesores.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting profesor:', error);
    }
  };

  const openCreateModal = () => {
    setEditingProfesor(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (profesor: Profesor) => {
    setEditingProfesor(profesor);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profesores</h1>
          <p className="text-gray-600">Gestión del cuerpo docente</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Profesor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Profesores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o RUT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">RUT</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Especialidad</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {profesores.map((prof) => (
                    <tr key={prof.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{prof.rut}</td>
                      <td className="py-3 px-4">
                        {prof.nombres} {prof.apellido_paterno} {prof.apellido_materno}
                      </td>
                      <td className="py-3 px-4">{prof.especialidad || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          prof.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {prof.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingProfesor(prof)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(prof)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(prof.id)}
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
          setEditingProfesor(undefined);
        }}
        title={editingProfesor ? 'Editar Profesor' : 'Nuevo Profesor'}
        size="lg"
      >
        <ProfesorForm
          profesor={editingProfesor}
          onSave={editingProfesor ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProfesor(undefined);
          }}
        />
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal
        isOpen={!!viewingProfesor}
        onClose={() => setViewingProfesor(null)}
        title="Detalle del Profesor"
        size="lg"
      >
        {viewingProfesor && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">RUT</label>
                <p className="text-gray-900">{viewingProfesor.rut}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                <p className="text-gray-900">
                  {viewingProfesor.nombres} {viewingProfesor.apellido_paterno} {viewingProfesor.apellido_materno}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{viewingProfesor.email || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <p className="text-gray-900">{viewingProfesor.telefono || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Especialidad</label>
                <p className="text-gray-900">{viewingProfesor.especialidad || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Título</label>
                <p className="text-gray-900">{viewingProfesor.titulo || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Ingreso</label>
                <p className="text-gray-900">
                  {viewingProfesor.fecha_ingreso
                    ? new Date(viewingProfesor.fecha_ingreso).toLocaleDateString('es-CL')
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Cursos como Jefe</label>
                <p className="text-gray-900">{viewingProfesor.cursos_jefe || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Asignaturas</label>
                <p className="text-gray-900">{viewingProfesor.asignaturas || 0}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
