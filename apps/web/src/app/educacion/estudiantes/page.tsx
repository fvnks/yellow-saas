'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION, ICON_ACTION } from '@/components/educacion/button-classes';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Estudiante, EstudianteCreate, EstudianteUpdate } from '@/types/educacion';
import { Modal } from '@/components/educacion/Modal';
import { EstudianteForm } from '@/components/educacion/EstudianteForm';
import { StudentCard } from '@/components/educacion/StudentCard';

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [cursos, setCursos] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cursoFilter, setCursoFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEstudiante, setEditingEstudiante] = useState<Estudiante | undefined>();
  const [viewingEstudiante, setViewingEstudiante] = useState<Estudiante | null>(null);

  useEffect(() => {
    fetchEstudiantes();
    fetchCursos();
  }, [search, cursoFilter]);

  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (cursoFilter) params.append('curso_id', cursoFilter);

      const res = await fetch(`/api/educacion/estudiantes?${params}`);
      const data = await res.json();
      setEstudiantes(data.data || []);
    } catch (error) {
      console.error('Error fetching estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCursos = async () => {
    try {
      const res = await fetch('/api/educacion/cursos');
      const data = await res.json();
      setCursos(data.data || []);
    } catch (error) {
      console.error('Error fetching cursos:', error);
    }
  };

  const handleCreate = async (data: EstudianteCreate) => {
    try {
      const res = await fetch('/api/educacion/estudiantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchEstudiantes();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al crear estudiante');
      }
    } catch (error) {
      console.error('Error creating estudiante:', error);
    }
  };

  const handleUpdate = async (data: EstudianteUpdate) => {
    if (!editingEstudiante) return;

    try {
      const res = await fetch(`/api/educacion/estudiantes/${editingEstudiante.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingEstudiante(undefined);
        fetchEstudiantes();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al actualizar estudiante');
      }
    } catch (error) {
      console.error('Error updating estudiante:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este estudiante?')) return;

    try {
      const res = await fetch(`/api/educacion/estudiantes/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setEstudiantes(estudiantes.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error('Error deleting estudiante:', error);
    }
  };

  const openCreateModal = () => {
    setEditingEstudiante(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (estudiante: Estudiante) => {
    setEditingEstudiante(estudiante);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Estudiantes</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de estudiantes del establecimiento</p>
        </div>
        <Button className={PRIMARY_ACTION} onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Estudiante
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
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
            <select
              value={cursoFilter}
              onChange={(e) => setCursoFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
            >
              <option value="">Todos los cursos</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre}
                </option>
              ))}
            </select>
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
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Curso</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Estado</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantes.map((est) => (
                    <tr key={est.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">{est.rut}</td>
                      <td className="py-3 px-4">
                        {est.nombres} {est.apellido_paterno} {est.apellido_materno}
                      </td>
                      <td className="py-3 px-4">{est.curso_id || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          est.estado === 'activo' ? 'bg-green-100 text-green-800' :
                          est.estado === 'suspendido' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {est.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            className={ICON_ACTION}
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingEstudiante(est)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            className={ICON_ACTION}
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(est)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            className={ICON_ACTION}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(est.id)}
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
          setEditingEstudiante(undefined);
        }}
        title={editingEstudiante ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        size="lg"
      >
        <EstudianteForm
          estudiante={editingEstudiante}
          cursos={cursos}
          onSave={async (data) => {
            if (editingEstudiante) {
              await handleUpdate(data as EstudianteUpdate);
            } else {
              await handleCreate(data as EstudianteCreate);
            }
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingEstudiante(undefined);
          }}
        />
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal
        isOpen={!!viewingEstudiante}
        onClose={() => setViewingEstudiante(null)}
        title="Detalle del Estudiante"
        size="lg"
      >
        {viewingEstudiante && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500">RUT</label>
                <p className="text-ink">{viewingEstudiante.rut}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Nombre Completo</label>
                <p className="text-ink">
                  {viewingEstudiante.nombres} {viewingEstudiante.apellido_paterno} {viewingEstudiante.apellido_materno}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Fecha de Nacimiento</label>
                <p className="text-ink">
                  {new Date(viewingEstudiante.fecha_nacimiento).toLocaleDateString('es-CL')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Género</label>
                <p className="text-ink capitalize">{viewingEstudiante.genero || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Teléfono</label>
                <p className="text-ink">{viewingEstudiante.telefono || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Email</label>
                <p className="text-ink">{viewingEstudiante.email || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-500">Dirección</label>
                <p className="text-ink">{viewingEstudiante.direccion || '-'}</p>
              </div>
            </div>
            {viewingEstudiante.observaciones && (
              <div>
                <label className="text-sm font-medium text-slate-500">Observaciones</label>
                <p className="text-ink">{viewingEstudiante.observaciones}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
