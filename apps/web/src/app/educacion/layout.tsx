import { ReactNode } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';

export default function EducacionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
