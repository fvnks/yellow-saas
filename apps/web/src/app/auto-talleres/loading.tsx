import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-[#0F172A] to-orange-950 rounded-2xl h-32 animate-pulse" />
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-2xl h-96 animate-pulse" />
        <div className="space-y-4">
          <div className="bg-white rounded-2xl h-48 animate-pulse" />
          <div className="bg-white rounded-2xl h-64 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
