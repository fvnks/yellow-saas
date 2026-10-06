import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Calendar, FileText, Bell, Home, LogOut } from 'lucide-react';

async function verifySession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('portal_profesor_token')?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.tipo !== 'profesor') return null;
    if (typeof payload.id !== 'string') return null;
    return payload;
  } catch {
    return null;
  }
}

function Sidebar() {
  const menuItems = [
    { href: '/portal-profesor/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/portal-profesor/cursos', icon: BookOpen, label: 'Mis Cursos' },
    { href: '/portal-profesor/asistencia', icon: Calendar, label: 'Asistencia' },
    { href: '/portal-profesor/calificaciones', icon: FileText, label: 'Calificaciones' },
    { href: '/portal-profesor/comunicados', icon: Bell, label: 'Comunicados' },
  ];

  return (
    <div className="w-64 bg-white border-r h-screen overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-900">Portal Profesor</h2>
        <p className="text-xs text-gray-500">Gestión de Clases</p>
      </div>
      <nav className="px-2 flex-1">
        {menuItems.map((item) => {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors text-gray-700 hover:bg-gray-100"
            >
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default async function PortalProfesorProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await verifySession();

  if (!session) {
    redirect('/portal-profesor');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
