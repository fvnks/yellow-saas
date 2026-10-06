import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Estudiante } from '@/types/educacion';
import { User, Mail, Phone, MapPin } from 'lucide-react';

interface StudentCardProps {
  estudiante: Estudiante;
  onClick?: () => void;
}

export function StudentCard({ estudiante, onClick }: StudentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base">
              {estudiante.nombres} {estudiante.apellido_paterno}
            </CardTitle>
            <p className="text-sm text-slate-500">RUT: {estudiante.rut}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-slate-600">
          {estudiante.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{estudiante.email}</span>
            </div>
          )}
          {estudiante.telefono && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{estudiante.telefono}</span>
            </div>
          )}
          {estudiante.direccion && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{estudiante.direccion}</span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <span className={`px-2 py-1 rounded-full text-xs ${
            estudiante.estado === 'activo' ? 'bg-green-100 text-green-800' :
            estudiante.estado === 'suspendido' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {estudiante.estado}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
