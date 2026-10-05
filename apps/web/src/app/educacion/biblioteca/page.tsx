'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, BookOpen, Edit, Trash2, Eye, BookMarked } from 'lucide-react';
import { Libro } from '@/types/educacion';

export default function BibliotecaPage() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLibros();
  }, [search]);

  const fetchLibros = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(`/api/educacion/libros?${params}`);
      const data = await res.json();
      setLibros(data.data || []);
    } catch (error) {
      console.error('Error fetching libros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este libro?')) return;

    try {
      const res = await fetch(`/api/educacion/libros/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setLibros(libros.filter((l) => l.id !== id));
      }
    } catch (error) {
      console.error('Error deleting libro:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca</h1>
          <p className="text-gray-600">Gestión de libros y préstamos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BookMarked className="h-4 w-4 mr-2" />
            Préstamos
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Libro
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Libros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, autor o ISBN..."
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Título</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Autor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ISBN</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Cantidad</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Disponible</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Ubicación</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {libros.map((libro) => (
                    <tr key={libro.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{libro.titulo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{libro.autor || '-'}</td>
                      <td className="py-3 px-4">{libro.isbn || '-'}</td>
                      <td className="py-3 px-4">{libro.cantidad_total}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          libro.cantidad_disponible > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {libro.cantidad_disponible}
                        </span>
                      </td>
                      <td className="py-3 px-4">{libro.ubicacion || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(libro.id)}
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
    </div>
  );
}
