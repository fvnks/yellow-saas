import {
  Building,
  LayoutGrid,
  Receipt,
  CreditCard,
  FileSpreadsheet,
  MessageSquare,
  Users,
  PieChart,
  Settings,
} from 'lucide-react';

export const condominioSidebarItems = [
  {
    title: 'Navegación Principal',
    items: [
      {
        title: 'Layout & Unidades',
        url: '/condominio',
        icon: LayoutGrid,
        badge: 'Interactivo',
      },
      {
        title: 'Gastos Comunes',
        url: '/condominio/gastos-comunes',
        icon: Receipt,
      },
      {
        title: 'Pagos & Conciliación',
        url: '/condominio/pagos',
        icon: CreditCard,
      },
      {
        title: 'Importar Planillas',
        url: '/condominio/importar',
        icon: FileSpreadsheet,
      },
      {
        title: 'Comunicaciones',
        url: '/condominio/comunicaciones',
        icon: MessageSquare,
      },
      {
        title: 'Portal Residentes',
        url: '/condominio/portal',
        icon: Users,
      },
    ],
  },
];