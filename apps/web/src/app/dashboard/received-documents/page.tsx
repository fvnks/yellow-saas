'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { FileDown, Search, Upload, Eye, Trash2, RefreshCw, Download, Filter, X, Calendar, Hash, Building2, FileText, CheckCircle, AlertTriangle, XCircle, Copy, Clock } from 'lucide-react';
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

const SOURCE_LABELS: Record<string, string> = {
 xml_upload: 'Carga XML',
 email: 'Correo',
 provider: 'Proveedor',
 sii_certification: 'Certificación SII',
};

export default function ReceivedDocumentsPage() {
 const [documents, setDocuments] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });
 const [summary, setSummary] = useState<any>(null);
 const [showFilters, setShowFilters] = useState(false);
 const [importing, setImporting] = useState(false);

 // Filters
 const [filters, setFilters] = useState({
 search: '',
 document_type: '',
 status: '',
 emitter_name: '',
 date_from: '',
 date_to: '',
 });

 const loadDocuments = useCallback(async (page = 1) => {
 setLoading(true);
 try {
 const api = getApiClient();
 const params: Record<string, string> = { page: String(page), limit: '25' };
 if (filters.document_type) params.document_type = filters.document_type;
 if (filters.status) params.status = filters.status;
 if (filters.emitter_name) params.emitter_name = filters.emitter_name;
 if (filters.date_from) params.date_from = filters.date_from;
 if (filters.date_to) params.date_to = filters.date_to;
 if (filters.search) params.emitter_name = filters.search;

 const res = await api.getReceivedDocuments(params);
 setDocuments(res.data || []);
 setPagination(res.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 });
 } catch {
 setDocuments([]);
 }
 setLoading(false);
 }, [filters]);

 const loadSummary = useCallback(async () => {
 try {
 const api = getApiClient();
 const params: Record<string, string> = {};
 if (filters.date_from) params.date_from = filters.date_from;
 if (filters.date_to) params.date_to = filters.date_to;
 const res = await api.getReceivedDocumentsSummary(params);
 setSummary(res);
 } catch {}
 }, [filters]);

 useEffect(() => { loadDocuments(1); loadSummary(); }, [loadDocuments, loadSummary]);

 const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = e.target.files;
 if (!files || files.length === 0) return;
 setImporting(true);

 try {
 const api = getApiClient();
 const formData = new FormData();
 for (const file of Array.from(files)) {
 formData.append('files', file);
 }
 const result = await api.importReceivedDocumentsBulk(formData);

 const s = result.summary || {};
 const parts: string[] = [];
 if (s.valid) parts.push(`${s.valid} válidos`);
 if (s.warnings) parts.push(`${s.warnings} con advertencias`);
 if (s.duplicates) parts.push(`${s.duplicates} duplicados`);
 if (s.errors) parts.push(`${s.errors} con errores`);

 toast.success(`Importación completada: ${parts.join(', ')}`);
 loadDocuments(1);
 loadSummary();
 } catch (err: any) {
 toast.error(err.message || 'Error al importar');
 }
 setImporting(false);
 e.target.value = '';
 };

 const handleDelete = async (docId: string) => {
 if (!confirm('¿Eliminar este documento de la bandeja?')) return;
 try {
 const api = getApiClient();
 await api.deleteReceivedDocument(docId);
 toast.success('Documento eliminado');
 loadDocuments(pagination.page);
 loadSummary();
 } catch {
 toast.error('Error al eliminar');
 }
 };

 const clearFilters = () => {
 setFilters({ search: '', document_type: '', status: '', emitter_name: '', date_from: '', date_to: '' });
 };

 const hasFilters = Object.values(filters).some(v => v);

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
 <FileDown className="w-5 h-5 text-blue-600" />
 Documentos Recibidos
 </h1>
 <p className="text-sm text-muted-foreground mt-1">Bandeja de entrada de DTE recibidos</p>
 </div>
 <div className="flex items-center gap-2">
 <Button variant="secondary" size="sm" onClick={() => loadDocuments(pagination.page)}>
 <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
 </Button>
 <label className="cursor-pointer">
 <input type="file" className="hidden" accept=".xml,.zip" multiple onChange={handleImport} />
 <Button size="sm" disabled={importing}>
 <Upload className="w-4 h-4 mr-1" /> {importing ? 'Importando...' : 'Importar XML/ZIP'}
 </Button>
 </label>
 </div>
 </div>

 {/* KPI Cards */}
 {summary?.summary && (
 <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
 <Card>
 <CardContent className="p-4">
 <p className="text-[9px] font-semibold text-muted-foreground uppercase">Total Documentos</p>
 <p className="text-2xl font-bold text-foreground mt-1">{Number(summary.summary.total_documents || 0).toLocaleString('es-CL')}</p>
 </CardContent>
 </Card>
 <Card>
 <CardContent className="p-4">
 <p className="text-[9px] font-semibold text-muted-foreground uppercase">Monto Total</p>
 <p className="text-lg font-bold text-foreground mt-1">{formatCLP(Number(summary.summary.total_amount || 0))}</p>
 </CardContent>
 </Card>
 <Card>
 <CardContent className="p-4">
 <p className="text-[9px] font-semibold text-muted-foreground uppercase">Neto</p>
 <p className="text-lg font-bold text-emerald-600 mt-1">{formatCLP(Number(summary.summary.total_net || 0))}</p>
 </CardContent>
 </Card>
 <Card>
 <CardContent className="p-4">
 <p className="text-[9px] font-semibold text-muted-foreground uppercase">IVA</p>
 <p className="text-lg font-bold text-blue-600 mt-1">{formatCLP(Number(summary.summary.total_vat || 0))}</p>
 </CardContent>
 </Card>
 <Card>
 <CardContent className="p-4">
 <p className="text-[9px] font-semibold text-muted-foreground uppercase">Exento</p>
 <p className="text-lg font-bold text-monday-violet mt-1">{formatCLP(Number(summary.summary.total_exempt || 0))}</p>
 </CardContent>
 </Card>
 </div>
 )}

 {/* Filters */}
 <Card>
 <CardContent className="p-4">
 <div className="flex flex-col sm:flex-row gap-3">
 <div className="flex-1">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <input
 type="search"
 placeholder="Buscar por emisor..."
 value={filters.search}
 onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
 onKeyDown={e => e.key === 'Enter' && loadDocuments(1)}
 className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
 />
 </div>
 </div>
 <Select
 value={filters.document_type}
 onChange={e => setFilters(f => ({ ...f, document_type: e.target.value }))}
 options={[
 { value: '', label: 'Todos los tipos' },
 ...Object.entries(DTE_TYPES).map(([k, v]) => ({ value: k, label: v })),
 ]}
 />
 <Select
 value={filters.status}
 onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
 options={[
 { value: '', label: 'Todos los estados' },
 ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
 ]}
 />
 <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
 <Filter className="w-4 h-4 mr-1" /> Filtros
 </Button>
 {hasFilters && (
 <Button variant="secondary" size="sm" onClick={clearFilters}>
 <X className="w-4 h-4 mr-1" /> Limpiar
 </Button>
 )}
 </div>

 {showFilters && (
 <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-medium text-foreground">Fecha desde</label>
 <input type="date" value={filters.date_from}
 onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))}
 className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-medium text-foreground">Fecha hasta</label>
 <input type="date" value={filters.date_to}
 onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))}
 className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
 </div>
 <div className="flex items-end">
 <Button size="sm" onClick={() => { loadDocuments(1); loadSummary(); }}>
 <Search className="w-4 h-4 mr-1" /> Aplicar Filtros
 </Button>
 </div>
 </div>
 )}
 </CardContent>
 </Card>

 {/* Data Table */}
 <Card>
 <CardContent className="p-0">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Fecha</TableHead>
 <TableHead>Tipo</TableHead>
 <TableHead>Folio</TableHead>
 <TableHead>Emisor</TableHead>
 <TableHead>RUT</TableHead>
 <TableHead className="text-right">Neto</TableHead>
 <TableHead className="text-right">IVA</TableHead>
 <TableHead className="text-right">Total</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead>Fuente</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {loading ? (
 <TableRow>
 <TableCell colSpan={11} className="text-center py-8">
 <div className="animate-pulse text-muted-foreground text-sm">Cargando documentos...</div>
 </TableCell>
 </TableRow>
 ) : documents.length === 0 ? (
 <TableRow>
 <TableCell colSpan={11} className="text-center py-8">
 <FileDown className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
 <p className="text-sm text-muted-foreground">No hay documentos recibidos</p>
 <p className="text-xs text-muted-foreground mt-1">Importa XML de facturas, guías o notas de crédito/débito</p>
 </TableCell>
 </TableRow>
 ) : documents.map((doc) => {
 const st = STATUS_CONFIG[doc.status] || STATUS_CONFIG.received;
 return (
 <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors">
 <TableCell className="text-sm">{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('es-CL') : '—'}</TableCell>
 <TableCell>
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
 {DTE_TYPES[doc.document_type] || doc.document_type}
 </span>
 </TableCell>
 <TableCell className="text-sm font-mono">{doc.folio}</TableCell>
 <TableCell className="text-sm font-medium max-w-[200px] truncate">{doc.emitter_name}</TableCell>
 <TableCell className="text-sm font-mono text-muted-foreground">{doc.emitter_rut}</TableCell>
 <TableCell className="text-sm text-right font-mono">{formatCLP(doc.net_amount || 0)}</TableCell>
 <TableCell className="text-sm text-right font-mono">{formatCLP(doc.vat_amount || 0)}</TableCell>
 <TableCell className="text-sm text-right font-mono font-semibold">{formatCLP(doc.total_amount || 0)}</TableCell>
 <TableCell>
 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.color}`}>
 <st.icon className="w-3 h-3" />
 {st.label}
 </span>
 </TableCell>
 <TableCell className="text-xs text-muted-foreground">{SOURCE_LABELS[doc.source] || doc.source}</TableCell>
 <TableCell className="text-right">
 <div className="flex items-center justify-end gap-1">
 <Link href={`/dashboard/received-documents/${doc.id}`}
 className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
 <Eye className="w-4 h-4" />
 </Link>
 <button onClick={() => handleDelete(doc.id)}
 className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </TableCell>
 </TableRow>
 );
 })}
 </TableBody>
 </Table>

 {/* Pagination */}
 {pagination.totalPages > 1 && (
 <div className="px-4 py-3 border-t border-border flex items-center justify-between">
 <p className="text-xs text-muted-foreground">
 Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
 </p>
 <div className="flex items-center gap-1">
 <Button variant="secondary" size="sm" disabled={pagination.page <= 1}
 onClick={() => loadDocuments(pagination.page - 1)}>
 Anterior
 </Button>
 <span className="text-xs text-muted-foreground px-2">
 {pagination.page} / {pagination.totalPages}
 </span>
 <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.totalPages}
 onClick={() => loadDocuments(pagination.page + 1)}>
 Siguiente
 </Button>
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
