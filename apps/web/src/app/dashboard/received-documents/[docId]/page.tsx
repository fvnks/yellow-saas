'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '@yellow-erp/ui';
import { ArrowLeft, Download, Trash2, CheckCircle, AlertTriangle, XCircle, Copy, Clock, FileText, RefreshCw, Calendar, MapPin, Hash, Building2 } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { formatCLP } from '@/lib/format';
import { toast } from 'sonner';

const DTE_TYPES: Record<string, string> = {
  '33': 'Factura Electrónica',
  '34': 'Factura Exenta',
  '39': 'Boleta Electrónica',
  '52': 'Guía Despacho',
  '56': 'Nota Débito',
  '61': 'Nota Crédito',
  '110': 'Factura de Compra',
  '111': 'Boleta de Compra',
  '112': 'Liquidación de Factura',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  valid: { label: 'Válido', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle },
  warning: { label: 'Con advertencias', color: 'bg-amber-50 text-amber-700 border border-amber-200', icon: AlertTriangle },
  rejected: { label: 'Rechazado', color: 'bg-rose-50 text-rose-700 border border-rose-200', icon: XCircle },
  duplicate: { label: 'Duplicado', color: 'bg-slate-50 text-slate-600 border border-slate-200', icon: Copy },
  received: { label: 'Recibido', color: 'bg-blue-50 text-blue-700 border border-blue-200', icon: Clock },
  processing: { label: 'Procesando', color: 'bg-purple-50 text-purple-700 border border-purple-200', icon: RefreshCw },
};

export default function ReceivedDocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.docId as string;
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) return;
    const api = getApiClient();
    api.getReceivedDocument(docId)
      .then(data => setDoc(data))
      .catch(() => toast.error('Error al cargar documento'))
      .finally(() => setLoading(false));
  }, [docId]);

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este documento de la bandeja?')) return;
    try {
      const api = getApiClient();
      await api.deleteReceivedDocument(docId);
      toast.success('Documento eliminado');
      router.push('/dashboard/received-documents');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/received-documents" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="animate-pulse bg-muted h-8 w-64 rounded" />
        </div>
        <div className="animate-pulse bg-muted h-64 rounded-2xl" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/received-documents" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" /> Volver a la bandeja
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Documento no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const st = STATUS_CONFIG[doc.status] || STATUS_CONFIG.received;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/received-documents" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">
            {DTE_TYPES[doc.document_type] || `DTE ${doc.document_type}`} — Folio {doc.folio}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Documento recibido de {doc.emitter_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${st.color}`}>
            <st.icon className="w-4 h-4" />
            {st.label}
          </span>
          <Button variant="secondary" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1" /> Eliminar
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Emisor */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-foreground">Emisor</h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{doc.emitter_name}</p>
              <p className="text-xs text-muted-foreground font-mono">{doc.emitter_rut}</p>
              {doc.emitter_trade_name && <p className="text-xs text-muted-foreground">{doc.emitter_trade_name}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Receptor */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-foreground">Receptor</h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{doc.receiver_name}</p>
              <p className="text-xs text-muted-foreground font-mono">{doc.receiver_rut}</p>
            </div>
          </CardContent>
        </Card>

        {/* Totales */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-foreground">Totales</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Neto</span>
                <span className="font-mono">{formatCLP(doc.net_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA</span>
                <span className="font-mono">{formatCLP(doc.vat_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exento</span>
                <span className="font-mono">{formatCLP(doc.exempt_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                <span>Total</span>
                <span className="font-mono">{formatCLP(doc.total_amount || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dates & Source */}
      <Card>
        <CardContent className="p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Fecha Emisión</p>
              <p className="text-sm mt-1">{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('es-CL') : '—'}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Fecha Recepción</p>
              <p className="text-sm mt-1">{doc.reception_date ? new Date(doc.reception_date).toLocaleString('es-CL') : '—'}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Fuente</p>
              <p className="text-sm mt-1">{doc.source === 'xml_upload' ? 'Carga XML' : doc.source === 'email' ? 'Correo' : doc.source}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Moneda</p>
              <p className="text-sm mt-1">{doc.currency || 'CLP'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      {doc.items && doc.items.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Detalle ({doc.items.length} ítems)</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead className="text-right">P. Unitario</TableHead>
                  <TableHead className="text-right">Descuento</TableHead>
                  <TableHead className="text-right">Total Línea</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doc.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">{item.line_number}</TableCell>
                    <TableCell className="text-sm font-medium">{item.product_name}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{item.product_code || '—'}</TableCell>
                    <TableCell className="text-sm text-right">{item.quantity}</TableCell>
                    <TableCell className="text-xs">{item.unit}</TableCell>
                    <TableCell className="text-sm text-right font-mono">{formatCLP(item.unit_price || 0)}</TableCell>
                    <TableCell className="text-sm text-right font-mono">{item.discount_amount ? `-${formatCLP(item.discount_amount)}` : '—'}</TableCell>
                    <TableCell className="text-sm text-right font-mono font-semibold">{formatCLP(item.line_total || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* References */}
      {doc.references && doc.references.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Referencias ({doc.references.length})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Folio</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Razón</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doc.references.map((ref: any) => (
                  <TableRow key={ref.id}>
                    <TableCell className="text-sm">{ref.reference_type}</TableCell>
                    <TableCell className="text-sm font-mono">{ref.reference_folio || '—'}</TableCell>
                    <TableCell className="text-sm">{ref.reference_date ? new Date(ref.reference_date).toLocaleDateString('es-CL') : '—'}</TableCell>
                    <TableCell className="text-sm">{ref.reference_code || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ref.reference_reason || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Processing Events */}
      {doc.events && doc.events.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Eventos de Procesamiento</h3>
            </div>
            <div className="p-4 space-y-2">
              {doc.events.map((event: any) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold mt-0.5 ${
                    event.status === 'success' ? 'bg-emerald-50 text-emerald-700' :
                    event.status === 'warning' ? 'bg-amber-50 text-amber-700' :
                    event.status === 'error' ? 'bg-rose-50 text-rose-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {event.stage}
                  </span>
                  <span className="text-foreground flex-1">{event.message}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(event.created_at).toLocaleString('es-CL')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors/Warnings */}
      {((doc.processing_errors && doc.processing_errors.length > 0) ||
        (doc.validation_warnings && doc.validation_warnings.length > 0)) && (
        <Card>
          <CardContent className="p-5">
            {doc.processing_errors && doc.processing_errors.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-rose-600">Errores</h3>
                {doc.processing_errors.map((err: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}
            {doc.validation_warnings && doc.validation_warnings.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-semibold text-amber-600">Advertencias</h3>
                {doc.validation_warnings.map((warn: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Metadatos</h3>
          <div className="grid gap-2 md:grid-cols-2 text-sm">
            <div><span className="text-muted-foreground">ID:</span> <span className="font-mono text-xs">{doc.id}</span></div>
            <div><span className="text-muted-foreground">SHA-256:</span> <span className="font-mono text-xs break-all">{doc.raw_xml_sha256 || '—'}</span></div>
            <div><span className="text-muted-foreground">Batch:</span> <span className="font-mono text-xs">{doc.import_batch_id || '—'}</span></div>
            <div><span className="text-muted-foreground">Importado por:</span> <span className="text-xs">{doc.imported_by || '—'}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
