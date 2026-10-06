'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfesorDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'portal_profesor_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/portal-profesor');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Portal del Profesor</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenido al Portal del Profesor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Aquí podrás gestionar tus cursos, asistencia, calificaciones y más.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
