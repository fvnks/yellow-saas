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
  CalendarDays,
  Vote,
  Gauge,
  ShieldAlert,
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
        title: 'Asambleas & Votos',
        url: '/condominio/asambleas',
        icon: Vote,
        badge: 'Ley 21.442',
      },
      {
        title: 'Submedidores',
        url: '/condominio/medidores',
        icon: Gauge,
      },
      {
        title: 'Multas & Seguros',
        url: '/condominio/multas-seguros',
        icon: ShieldAlert,
      },
      {
        title: 'Espacios & Conserjería',
        url: '/condominio/espacios',
        icon: CalendarDays,
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