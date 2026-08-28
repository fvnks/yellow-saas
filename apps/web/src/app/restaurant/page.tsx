'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRestaurantRole } from './lib/role-context';

export default function RestaurantPage() {
  const router = useRouter();
  const { currentRole } = useRestaurantRole();

  useEffect(() => {
    const routeByRole: Record<string, string> = {
      owner: '/restaurant/dashboard',
      admin: '/restaurant/dashboard',
      cashier: '/restaurant/cashier',
      waiter: '/restaurant/waiter',
      kitchen: '/restaurant/kitchen',
      bar: '/restaurant/bar',
    };
    router.replace(routeByRole[currentRole] || '/restaurant/waiter');
  }, [currentRole, router]);

  return (
    <div className="flex items-center justify-center py-24 text-slate-400">
      Redirigiendo a la sección correspondiente a tu rol...
    </div>
  );
}
