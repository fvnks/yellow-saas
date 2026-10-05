'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, BookOpen, Edit, Trash2, Eye } from 'lucide-react';
import { Curso, CursoCreate, CursoUpdate } from '@/types/educacion';
import { Modal } from '@/components/educacion/Modal';
import { CursoForm } from '@/components/educacion/CursoForm';

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [profesores, setProfesores] = useState<{ id: string; nombres: string; apellido_paterno: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | undefined>();
  const [viewingCurso, setViewingCurso] = useState<Curso | null>(null);

  useEffect(() => {
    fetchCursos();
    fetchProfesores();
  }, []);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/educacion/cursos');
      const data = await res.json();
      setCursos(data.data || []);
    } catch (error) {
      console.error('Error fetching cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfesores = async () => {
    try {
      const res = await fetch('/api/educacion/profesores');
      const data = await res.json();
      setProfesores(data.data || []);
    } catch (error) {
      console.error('Error fetching profesores:', error);
    }
  };

  const handleCreate = async (data: CursoCreate) => {
    try {
      const res = await fetch('/api/educacion/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchCursos();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al crear curso');
      }
    } catch (error) {
      console.error('Error creating curso:', error);
    }
  };

  const handleUpdate = async (data: CursoUpdate) => {
    if (!editingCurso) return;

    try {
      const res = await fetch(`/api/educacion/cursos/${editingCurso.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingCurso(undefined);
        fetchCursos();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al actualizar curso');
      }
    } catch (error) {
      console.error('Error updating curso:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return;

    try {
      const res = await fetch(`/api/educacion/cursos/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCursos(cursos.filter((c) => c.id !== id));
      } else {
        const error = await res.json();
        alert(error.error || 'Error al eliminar curso');
      }
    } catch (error) {
      console.error('Error deleting curso:', error);
    }
  };

  const openCreateModal = () => {
    setEditingCurso(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (curso: Curso) => {
    setEditingCurso(curso);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
          <p className="text-gray-600">Gestión de cursos y asignación de profesores</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Curso
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <Card key={curso.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{curso.nombre}</CardTitle>
                    <p className="text-sm text-gray-500 capitalize">{curso.nivel}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    curso.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {curso.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Profesor Jefe: {curso.profesor_jefe_nombres || 'Sin asignar'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>Año Lectivo: {curso.anio_lectivo}</span>
                  </div>
                  {curso.sala && (
                    <div className="text-sm text-gray-600">
                      Sala: {curso.sala}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewingCurso(curso)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(curso)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(curso.id)}
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
          setEditingCurso(undefined);
        }}
        title={editingCurso ? 'Editar Curso' : 'Nuevo Curso'}
        size="lg"
      >
        <CursoForm
          curso={editingCurso}
          profesores={profesores}
          onSave={editingCurso ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingCurso(undefined);
          }}
        />
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal
        isOpen={!!viewingCurso}
        onClose={() => setViewingCurso(null)}
        title="Detalle del Curso"
        size="lg"
      >
        {viewingCurso && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-gray-900">{viewingCurso.nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nivel</label>
                <p className="text-gray-900 capitalize">{viewingCurso.nivel}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Jornada</label>
                <p className="text-gray-900 capitalize">{viewingCurso.jornada || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Año Lectivo</label>
                <p className="text-gray-900">{viewingCurso.anio_lectivo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Profesor Jefe</label>
                <p className="text-gray-900">
                  {viewingCurso.profesor_jefe_nombres
                    ? `${viewingCurso.profesor_jefe_nombres} ${viewingCurso.profesor_jefe_apellido}`
                    : 'Sin asignar'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Sala</label>
                <p className="text-gray-900">{viewingCurso.sala || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Cupos</label>
                <p className="text-gray-900">{viewingCurso.cupo_maximo || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Estudiantes</label>
                <p className="text-gray-900">{viewingCurso.total_estudiantes || 0}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
