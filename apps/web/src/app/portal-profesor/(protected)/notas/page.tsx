'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfesorNotasPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Notas</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-gray-600 text-center">Selecciona un curso y asignatura para ver notas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
