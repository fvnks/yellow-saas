'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION, SECONDARY_ACTION } from '@/components/educacion/button-classes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Check, X, Clock, Loader2 } from 'lucide-react';
import { Matricula } from '@/types/educacion';
import { Modal } from '@/components/educacion/Modal';

export default function MatriculasPage() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnio, setSelectedAnio] = useState(2026);

  // Modal de nueva matrícula
  const [modalOpen, setModalOpen] = useState(false);
  const [estudiantes, setEstudiantes] = useState<{ id: string; nombres: string; apellido_paterno: string; rut: string }[]>([]);
  const [cursos, setCursos] = useState<{ id: string; nombre: string; anio_lectivo: number }[]>([]);
  const [estudianteId, setEstudianteId] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [anioLectivo, setAnioLectivo] = useState(2026);
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Detalle de matrícula
  const [matriculaVer, setMatriculaVer] = useState<Matricula | null>(null);

  useEffect(() => {
    fetchMatriculas();
  }, [selectedAnio]);

  const abrirModal = async () => {
    setModalError('');
    setModalOpen(true);
    try {
      const [estRes, curRes] = await Promise.all([
        fetch('/api/educacion/estudiantes?limit=200').then((r) => r.json()),
        fetch('/api/educacion/cursos').then((r) => r.json()),
      ]);
      setEstudiantes(estRes.data || []);
      setCursos(curRes.data || []);
    } catch (err) {
      console.error('Error cargando opciones:', err);
    }
  };

  const crearMatricula = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setSaving(true);

    try {
      const res = await fetch('/api/educacion/matriculas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudianteId,
          curso_id: cursoId,
          anio_lectivo: anioLectivo,
          observaciones: observaciones || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo crear la matrícula');

      setEstudianteId('');
      setCursoId('');
      setObservaciones('');
      setModalOpen(false);
      fetchMatriculas();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'No se pudo crear la matrícula');
    } finally {
      setSaving(false);
    }
  };

  const fetchMatriculas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('anio_lectivo', selectedAnio.toString());

      const res = await fetch(`/api/educacion/matriculas?${params}`);
      const data = await res.json();
      setMatriculas(data.data || []);
    } catch (error) {
      console.error('Error fetching matriculas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'cancelada':
        return <X className="h-4 w-4 text-red-600" />;
      case 'traspasada':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Matrículas</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de matrículas anuales</p>
        </div>
        <Button className={PRIMARY_ACTION} onClick={abrirModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Matrícula
        </Button>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Matrícula">
        <form onSubmit={crearMatricula} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{modalError}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="estudiante" className="text-sm font-medium">Estudiante *</label>
            <select
              id="estudiante"
              value={estudianteId}
              onChange={(e) => setEstudianteId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
            >
              <option value="">Selecciona un estudiante</option>
              {estudiantes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombres} {e.apellido_paterno} ({e.rut})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="curso" className="text-sm font-medium">Curso *</label>
            <select
              id="curso"
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
            >
              <option value="">Selecciona un curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.anio_lectivo})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="anio" className="text-sm font-medium">Año lectivo *</label>
            <input
              id="anio"
              type="number"
              value={anioLectivo}
              onChange={(e) => setAnioLectivo(parseInt(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="obs" className="text-sm font-medium">Observaciones</label>
            <textarea
              id="obs"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className={SECONDARY_ACTION} onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className={PRIMARY_ACTION} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear matrícula
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!matriculaVer}
        onClose={() => setMatriculaVer(null)}
        title="Detalle de Matrícula"
      >
        {matriculaVer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Estudiante</label>
                <p className="text-ink">
                  {matriculaVer.estudiante_nombres} {matriculaVer.estudiante_apellido}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">RUT</label>
                <p className="text-ink">{matriculaVer.estudiante_rut || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Curso</label>
                <p className="text-ink">{matriculaVer.curso_nombre || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Año Lectivo</label>
                <p className="text-ink">{matriculaVer.anio_lectivo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Fecha de Matrícula</label>
                <p className="text-ink">
                  {new Date(matriculaVer.fecha_matricula).toLocaleDateString('es-CL')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Estado</label>
                <p className="capitalize text-ink">{matriculaVer.estado}</p>
              </div>
            </div>
            {matriculaVer.observaciones && (
              <div>
                <label className="text-sm font-medium text-slate-500">Observaciones</label>
                <p className="text-ink">{matriculaVer.observaciones}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                className={SECONDARY_ACTION}
                onClick={() => setMatriculaVer(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Matrículas</CardTitle>
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(parseInt(e.target.value))}
              className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Estudiante</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">RUT</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Curso</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Fecha Matrícula</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Estado</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {matriculas.map((matricula) => (
                    <tr key={matricula.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        {matricula.estudiante_nombres} {matricula.estudiante_apellido}
                      </td>
                      <td className="py-3 px-4">{matricula.estudiante_rut}</td>
                      <td className="py-3 px-4">{matricula.curso_nombre}</td>
                      <td className="py-3 px-4">
                        {new Date(matricula.fecha_matricula).toLocaleDateString('es-CL')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(matricula.estado)}
                          <span className="capitalize">{matricula.estado}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className={SECONDARY_ACTION}
                          onClick={() => setMatriculaVer(matricula)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
