"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { getApiClient } from "@/lib/api-client";

const segmentTranslations: Record<string, string> = {
  dashboard: "Inicio",
  inventory: "Inventario",
  products: "Productos",
  product: "Producto",
  new: "Nuevo",
  edit: "Editar",
  sales: "Ventas",
  orders: "Ordenes",
  order: "Orden",
  quotations: "Cotizaciones",
  quotation: "Cotizacion",
  invoices: "Facturas",
  invoice: "Factura",
  "delivery-guides": "Guias de Despacho",
  delivery: "Despacho",
  "customer-returns": "Devoluciones",
  returns: "Devoluciones",
  purchases: "Compras",
  purchase: "Compra",
  receipts: "Recepciones",
  receipt: "Recepcion",
  suppliers: "Proveedores",
  supplier: "Proveedor",
  customers: "Clientes",
  customer: "Cliente",
  warehouses: "Bodegas",
  warehouse: "Bodega",
  bodega: "Bodega",
  layout: "Layout",
  transfers: "Transferencias",
  transfer: "Transferencia",
  settings: "Configuracion",
  users: "Usuarios",
  user: "Usuario",
  roles: "Roles",
  role: "Rol",
  reports: "Reportes",
  report: "Reporte",
  payroll: "Remuneraciones",
  accounting: "Contabilidad",
  billing: "Facturacion",
  audit: "Auditoria",
  crm: "CRM",
  pos: "POS",
  projects: "Proyectos",
  tags: "Etiquetas",
  tag: "Etiqueta",
  pedidos: "Pedidos",
  taxes: "Impuestos",
  tax: "Impuesto",
  categories: "Categorias",
  category: "Categoria",
  batches: "Lotes",
  batch: "Lote",
  serials: "Series",
  serial: "Serie",
  variants: "Variantes",
  variant: "Variante",
  relations: "Relaciones",
  relation: "Relacion",
  counts: "Conteos",
  count: "Conteo",
  adjustments: "Ajustes",
  adjustment: "Ajuste",
  reservations: "Reservas",
  reservation: "Reserva",
  valuation: "Valoracion",
  "label-designer": "Diseno de Etiquetas",
  import: "Importar",
  uom: "Unidades de Medida",
  config: "Configuracion",
  "stock-report": "Reporte de Stock",
  "price-lists": "Listas de Precios",
  "price-list": "Lista de Precios",
  "journal-entries": "Asientos Contables",
  "journal-entry": "Asiento Contable",
  alerts: "Alertas",
  webhooks: "Webhooks",
  orderid: "Detalle del Pedido",
};

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const entityResolvers: Record<string, (id: string) => Promise<string>> = {
  inventory: (id) =>
    getApiClient()
      .getProduct(id)
      .then((d: any) => d?.data?.name || d?.name || id)
      .catch(() => id),
  bodega: (id) =>
    getApiClient()
      .getWarehouse(id)
      .then((d: any) => d?.data?.name || d?.name || id)
      .catch(() => id),
  warehouses: (id) =>
    getApiClient()
      .getWarehouse(id)
      .then((d: any) => d?.data?.name || d?.name || id)
      .catch(() => id),
  customers: (id) =>
    getApiClient()
      .getCustomer(id)
      .then((d: any) => d?.data?.name || d?.name || id)
      .catch(() => id),
  suppliers: (id) =>
    getApiClient()
      .getSupplier(id)
      .then((d: any) => d?.data?.name || d?.name || id)
      .catch(() => id),
  sales: (id) =>
    getApiClient()
      .getSalesOrder(id)
      .then((d: any) => d?.data?.order_number || d?.order_number || id)
      .catch(() => id),
  orders: (id) =>
    getApiClient()
      .getSalesOrder(id)
      .then((d: any) => d?.data?.order_number || d?.order_number || id)
      .catch(() => id),
  invoices: (id) =>
    getApiClient()
      .getInvoice(id)
      .then((d: any) => d?.data?.invoice_number || d?.invoice_number || id)
      .catch(() => id),
  "delivery-guides": (id) =>
    getApiClient()
      .getDeliveryGuide(id)
      .then((d: any) => d?.data?.guide_number || d?.guide_number || id)
      .catch(() => id),
  delivery: (id) =>
    getApiClient()
      .getDeliveryGuide(id)
      .then((d: any) => d?.data?.guide_number || d?.guide_number || id)
      .catch(() => id),
  quotations: (id) =>
    getApiClient()
      .getSalesQuotation(id)
      .then((d: any) => d?.data?.quotation_number || d?.quotation_number || id)
      .catch(() => id),
  quotation: (id) =>
    getApiClient()
      .getSalesQuotation(id)
      .then((d: any) => d?.data?.quotation_number || d?.quotation_number || id)
      .catch(() => id),
  "customer-returns": (id) =>
    getApiClient()
      .getCustomerReturn(id)
      .then((d: any) => d?.data?.return_number || d?.return_number || id)
      .catch(() => id),
  returns: (id) =>
    getApiClient()
      .getCustomerReturn(id)
      .then((d: any) => d?.data?.return_number || d?.return_number || id)
      .catch(() => id),
  purchases: (id) =>
    getApiClient()
      .getPurchaseOrder(id)
      .then((d: any) => d?.data?.number || d?.number || id)
      .catch(() => id),
  purchase: (id) =>
    getApiClient()
      .getPurchaseOrder(id)
      .then((d: any) => d?.data?.number || d?.number || id)
      .catch(() => id),
  receipts: (id) =>
    getApiClient()
      .getStockTransfer(id)
      .then((d: any) => d?.data?.transfer_number || d?.transfer_number || id)
      .catch(() => id),
  transfers: (id) =>
    getApiClient()
      .getStockTransfer(id)
      .then((d: any) => d?.data?.transfer_number || d?.transfer_number || id)
      .catch(() => id),
  counts: (id) =>
    getApiClient()
      .getInventoryCount(id)
      .then((d: any) => d?.data?.count_number || d?.count_number || id)
      .catch(() => id),
  users: (id) =>
    getApiClient()
      .getEmployee(id)
      .then((d: any) => d?.data?.name || d?.name || id)
      .catch(() => id),
};

function translateSegment(segment: string): string {
  return segmentTranslations[segment] || segment;
}

function resolveParentSegment(segments: string[], uuidIndex: number): string | null {
  if (uuidIndex < 1) return null;
  for (let i = uuidIndex - 1; i >= 0; i--) {
    if (!isUUID(segments[i])) return segments[i];
  }
  return null;
}

export default function SidebarBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const api = getApiClient();
    const uuidSegments = segments.filter((s) => isUUID(s));
    if (uuidSegments.length === 0) {
      setResolvedNames({});
      return;
    }

    let cancelled = false;
    const resolveAll = async () => {
      const results: Record<string, string> = {};
      await Promise.all(
        segments.map(async (segment, index) => {
          if (!isUUID(segment)) return;
          const parent = resolveParentSegment(segments, index);
          if (!parent || !entityResolvers[parent]) {
            results[segment] = segment.slice(0, 8);
            return;
          }
          try {
            const name = await entityResolvers[parent](segment);
            results[segment] = name;
          } catch {
            results[segment] = segment.slice(0, 8);
          }
        })
      );
      if (!cancelled) setResolvedNames(results);
    };
    resolveAll();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const formatLabel = (segment: string): string => {
    if (isUUID(segment)) {
      return resolvedNames[segment] || segment.slice(0, 8) + "...";
    }
    return translateSegment(segment);
  };

  const segmentPath = (segments: string[], index: number) => {
    return "/" + segments.slice(0, index + 1).join("/");
  };

  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto">
      <a
        href="/dashboard"
        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors shrink-0"
      >
        <Home className="h-4 w-4" />
      </a>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const label = formatLabel(segment);

        return (
          <span key={`${segment}-${index}`} className="flex items-center gap-1 shrink-0">
            <ChevronRight className="h-3 w-3 text-slate-400" />
            {isLast ? (
              <span className="font-medium text-slate-900">{label}</span>
            ) : (
              <a
                href={segmentPath(segments, index)}
                className="text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap"
              >
                {label}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}
