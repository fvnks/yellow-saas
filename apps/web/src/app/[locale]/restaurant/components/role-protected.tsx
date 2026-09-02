'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRestaurantRole } from '../lib/role-context';

type SectionKey =
  | 'dashboard'
  | 'pos'
  | 'kiosk'
  | 'kitchen'
  | 'bar'
  | 'sales'
  | 'reservations'
  | 'cashier'
  | 'reports'
  | 'users'
  | 'admin';

interface RoleProtectedProps {
  section: SectionKey;
  children: ReactNode;
}

export default function RoleProtected({ section, children }: RoleProtectedProps) {
  const { canAccess, currentUser, roleLabel } = useRestaurantRole();

  if (canAccess(section)) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8 text-amber-600" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">Acceso restringido</h2>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        Tu rol actual ({roleLabel}) no tiene permisos para ver esta sección.
        {currentUser && ` Inicie sesión con un usuario de mayor jerarquía para continuar.`}
      </p>
      <Link
        href="/restaurant/waiter"
        className="mt-5 inline-flex items-center gap-2 bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al POS
      </Link>
    </div>
  );
}
