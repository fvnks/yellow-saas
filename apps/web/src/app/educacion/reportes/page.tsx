'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION } from '@/components/educacion/button-classes';
import { FileText, Download, Calendar, Users, TrendingUp, DollarSign, Loader2 } from 'lucide-react';

export default function ReportesPage() {
  const [cursos, setCursos] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState('');
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(new Date().getFullYear());
  const [selectedPeriodo, setSelectedPeriodo] = useState(1);

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      const res = await fetch('/api/educacion/cursos');
      const data = await res.json();
      setCursos(data.data || []);
    } catch (error) {
      console.error('Error fetching cursos:', error);
    }
  };

  const reportes = [
    {
      id: 'asistencia',
      titulo: 'Reporte de Asistencia',
      descripcion: 'Reporte detallado de asistencia por curso y período',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'calificaciones',
      titulo: 'Reporte de Calificaciones',
      descripcion: 'Reporte de calificaciones por curso y asignatura',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      id: 'morosidad',
      titulo: 'Reporte de Morosidad',
      descripcion: 'Reporte de pensiones pendientes y vencidas',
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      id: 'mineduc',
      titulo: 'Exportación Mineduc',
      descripcion: 'Exportación de datos para el Ministerio de Educación',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const handleDescargar = async (reporteId: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('formato', 'csv');
      
      if (selectedCurso) params.append('curso_id', selectedCurso);
      if (selectedMes) params.append('mes', selectedMes.toString());
      if (selectedAnio) params.append('anio', selectedAnio.toString());
      if (selectedPeriodo) params.append('periodo', selectedPeriodo.toString());

      const res = await fetch(`/api/educacion/reportes/${reporteId}?${params}`);
      
      if (!res.ok) {
        throw new Error('Error al generar reporte');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${reporteId}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading reporte:', error);
      alert('Error al descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-ink">Reportes</h1>
        <p className="text-sm text-slate-500 mt-1">Generación de reportes y exportaciones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportes.map((reporte) => (
              <Card
                key={reporte.id}
                className={`cursor-pointer transition-all ${
                  selectedReporte === reporte.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedReporte(reporte.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${reporte.bgColor}`}>
                      <reporte.icon className={`h-5 w-5 ${reporte.color}`} />
                    </div>
                    <CardTitle className="text-lg">{reporte.titulo}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{reporte.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Curso</label>
                <select
                  value={selectedCurso}
                  onChange={(e) => setSelectedCurso(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
                >
                  <option value="">Todos los cursos</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Mes</label>
                <select
                  value={selectedMes}
                  onChange={(e) => setSelectedMes(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('es-CL', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Año</label>
                <select
                  value={selectedAnio}
                  onChange={(e) => setSelectedAnio(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              {selectedReporte === 'calificaciones' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Período</label>
                  <select
                    value={selectedPeriodo}
                    onChange={(e) => setSelectedPeriodo(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
                  >
                    <option value={1}>1° Trimestre</option>
                    <option value={2}>2° Trimestre</option>
                    <option value={3}>3° Trimestre</option>
                  </select>
                </div>
              )}

              <Button
                className={`${PRIMARY_ACTION} w-full`}
                disabled={!selectedReporte || loading}
                onClick={() => handleDescargar(selectedReporte)}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Descargar CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
