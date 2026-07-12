'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@yellow-erp/ui';
import { ArrowLeft, Save, Plus, Trash2, Maximize2, Grid } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../../../lib/api-client';

interface Position {
  id: string;
  name: string;
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
  current_stock: number;
  sort_order: number;
  product?: { id: string; name: string; sku: string } | null;
  shelf_id?: string | null;
}

interface Shelf {
  id: string;
  name: string;
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sort_order: number;
}

interface Zone {
  id: string;
  name: string;
  code: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sort_order: number;
  shelves: Shelf[];
  positions: Position[];
}

const ZONE_COLORS = [
  '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4',
];

export default function WarehouseLayoutPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'zone' | 'position' | 'resize-zone' | 'resize-position' | null>(null);
  const [dragTarget, setDragTarget] = useState<{ zoneId: string; positionId?: string } | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneColor, setNewZoneColor] = useState(ZONE_COLORS[1]);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPosName, setNewPosName] = useState('');
  const [newPosCapacity, setNewPosCapacity] = useState(100);
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);

  useEffect(() => {
    const api = getApiClient('demo-company-id');
    api.getWarehouseLayout(id)
      .then((data) => {
        setZones((data as unknown as { zones: Zone[] }).zones || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const api = getApiClient('demo-company-id');
    await api.saveWarehouseLayout(id, { zones });
    setSaving(false);
  };

  const addZone = () => {
    if (!newZoneName.trim()) return;
    setZones([...zones, {
      id: `z_${Date.now()}`,
      name: newZoneName.trim(),
      code: newZoneName.trim().substring(0, 3).toUpperCase(),
      color: newZoneColor,
      x: 20 + zones.length * 20,
      y: 20,
      width: 300,
      height: 250,
      sort_order: zones.length,
      shelves: [],
      positions: [],
    }]);
    setNewZoneName('');
    setShowAddZone(false);
  };

  const addPosition = (zoneId: string) => {
    if (!newPosName.trim()) return;
    setZones(zones.map(z => z.id === zoneId ? {
      ...z,
      positions: [...z.positions, {
        id: `p_${Date.now()}`,
        name: newPosName.trim(),
        code: newPosName.trim().substring(0, 6).toUpperCase(),
        x: 20,
        y: 20 + z.positions.length * 70,
        width: 80,
        height: 60,
        capacity: newPosCapacity,
        current_stock: 0,
        sort_order: z.positions.length,
        product: null,
      }],
    } : z));
    setNewPosName('');
    setNewPosCapacity(100);
    setShowAddPosition(false);
  };

  const removeZone = (zoneId: string) => {
    setZones(zones.filter(z => z.id !== zoneId));
    setSelectedZone(null);
    setSelectedPosition(null);
    setSelectedShelfId(null);
  };

  const removePosition = (zoneId: string, positionId: string) => {
    setZones(zones.map(z => z.id === zoneId ? { ...z, positions: z.positions.filter(p => p.id !== positionId) } : z));
    setSelectedPosition(null);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'zone' | 'position' | 'resize-zone' | 'resize-position', zoneId: string, positionId?: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    setDragTarget({ zoneId, positionId });
    setDragStart({ x: e.clientX, y: e.clientY });
    if (type === 'zone' || type === 'resize-zone') setSelectedZone(zoneId);
    if (type === 'position' || type === 'resize-position') { setSelectedZone(zoneId); setSelectedPosition(positionId || null); }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragType || !dragTarget) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setZones(prev => prev.map(z => {
      if (dragType === 'zone' && z.id === dragTarget.zoneId) {
        return { ...z, x: Math.max(0, z.x + dx), y: Math.max(0, z.y + dy) };
      }
      if (dragType === 'resize-zone' && z.id === dragTarget.zoneId) {
        return { ...z, width: Math.max(120, z.width + dx), height: Math.max(80, z.height + dy) };
      }
      if ((dragType === 'position' || dragType === 'resize-position') && z.id === dragTarget.zoneId) {
        return {
          ...z,
          positions: z.positions.map(p => {
            if (p.id !== dragTarget.positionId) return p;
            if (dragType === 'position') {
              return { ...p, x: Math.max(0, Math.min(z.width - p.width, p.x + dx)), y: Math.max(0, Math.min(z.height - p.height, p.y + dy)) };
            }
            return { ...p, width: Math.max(30, p.width + dx), height: Math.max(30, p.height + dy) };
          }),
        };
      }
      return z;
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragType, dragTarget, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
    setDragTarget(null);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4"><div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse" /><div className="h-6 w-48 bg-slate-200 rounded animate-pulse" /></div>
        <Card><CardContent><div className="h-96 bg-slate-100 rounded animate-pulse" /></CardContent></Card>
      </div>
    );
  }

  const selZone = zones.find(z => z.id === selectedZone);
  const selPos = selZone?.positions.find(p => p.id === selectedPosition);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bodega" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Layout de Bodega</h1>
          <p className="text-sm text-slate-500 mt-1">Arrastra y redimensiona zonas y posiciones</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Herramientas</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="secondary" className="w-full justify-start" onClick={() => setShowAddZone(true)}>
                <Plus className="w-4 h-4 mr-2" /> Agregar Zona
              </Button>
              {selectedZone && (
                <Button variant="secondary" className="w-full justify-start" onClick={() => setShowAddPosition(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Agregar Posición
                </Button>
              )}
            </CardContent>
          </Card>

          {showAddZone && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Nueva Zona</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <input type="text" value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} placeholder="Nombre" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                <div className="flex flex-wrap gap-2">
                  {ZONE_COLORS.map(c => (
                    <button key={c} onClick={() => setNewZoneColor(c)} className={`w-6 h-6 rounded-full border-2 ${newZoneColor === c ? 'border-slate-900' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addZone}>Crear</Button>
                  <Button size="sm" variant="secondary" onClick={() => setShowAddZone(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showAddPosition && selectedZone && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Nueva Posición</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <input type="text" value={newPosName} onChange={(e) => setNewPosName(e.target.value)} placeholder="Nombre (A1, B2...)" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                <input type="number" value={newPosCapacity} onChange={(e) => setNewPosCapacity(parseInt(e.target.value) || 0)} placeholder="Capacidad" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => addPosition(selectedZone)}>Crear</Button>
                  <Button size="sm" variant="secondary" onClick={() => setShowAddPosition(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selZone && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Zona Seleccionada</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium">{selZone.name}</p>
                <p className="text-xs text-slate-500">{selZone.positions.length} posiciones</p>
                <Button size="sm" variant="secondary" className="w-full text-rose-600 hover:bg-rose-50" onClick={() => removeZone(selZone.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar Zona
                </Button>
              </CardContent>
            </Card>
          )}

          {selPos && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Posición Seleccionada</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium">{selPos.name}</p>
                <p className="text-xs text-slate-500">Cap: {selPos.capacity}</p>
                {selPos.product && <p className="text-xs text-indigo-600 font-medium">{selPos.product.name}</p>}
                <p className="text-[9px] text-slate-400">{Math.round(selPos.width)}x{Math.round(selPos.height)}px</p>
                <Button size="sm" variant="secondary" className="w-full text-rose-600 hover:bg-rose-50" onClick={() => removePosition(selZone!.id, selPos.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar Posición
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-sm">Leyenda</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-4 h-4 rounded bg-indigo-500" />
                <span>Zona</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-4 h-3 rounded bg-slate-300" />
                <span>Estante</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-4 h-4 rounded bg-white border border-slate-300" />
                <span>Libre</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-4 h-4 rounded bg-indigo-50 border border-indigo-300" />
                <span>Con producto</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content: Canvas + Product list */}
        <div className="flex-1 space-y-6">
          {/* Canvas */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div
                className="relative bg-slate-50 overflow-auto cursor-crosshair"
                style={{ minHeight: '700px', backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => { setSelectedZone(null); setSelectedPosition(null); setSelectedShelfId(null); }}
              >
                {zones.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Grid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">Haz clic en &quot;Agregar Zona&quot; para comenzar</p>
                    </div>
                  </div>
                )}

                {zones.map(zone => (
                  <div
                    key={zone.id}
                    className={`absolute border-2 rounded-lg cursor-move transition-shadow ${selectedZone === zone.id ? 'shadow-lg ring-2 ring-indigo-500' : 'hover:shadow-md'}`}
                    style={{ left: zone.x, top: zone.y, width: zone.width, height: zone.height, backgroundColor: `${zone.color}15`, borderColor: zone.color }}
                    onMouseDown={(e) => handleMouseDown(e, 'zone', zone.id)}
                    onClick={(e) => { e.stopPropagation(); setSelectedZone(zone.id); setSelectedPosition(null); setSelectedShelfId(null); }}
                  >
                    {/* Zone label */}
                    <div className="absolute -top-6 left-0 flex items-center gap-1">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: zone.color, color: 'white' }}>{zone.name}</span>
                      {zone.code && <span className="text-[9px] font-mono text-slate-500">{zone.code}</span>}
                    </div>

                    {/* Resize handle */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10" onMouseDown={(e) => handleMouseDown(e, 'resize-zone', zone.id)}>
                      <Maximize2 className="w-3 h-3 text-slate-400" />
                    </div>

                    {/* Shelves (clickable) */}
                    {zone.shelves.map(shelf => (
                      <div
                        key={shelf.id}
                        className={`absolute border rounded cursor-pointer transition-all ${selectedShelfId === shelf.id ? 'bg-slate-300 border-slate-500 ring-1 ring-slate-400 opacity-90' : 'bg-slate-200 border-slate-300 opacity-60 hover:opacity-80 hover:border-slate-400'}`}
                        style={{ left: shelf.x, top: shelf.y, width: shelf.width, height: shelf.height }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); setSelectedZone(zone.id); setSelectedShelfId(shelf.id); setSelectedPosition(null); }}
                      >
                        <span className="absolute -top-4 left-0 text-[9px] font-semibold text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">{shelf.name}</span>
                      </div>
                    ))}

                    {/* Positions (draggable, resizable) */}
                    {zone.positions.map(pos => (
                      <div
                        key={pos.id}
                        className={`absolute border-2 rounded cursor-move flex flex-col items-center justify-center transition-shadow ${selectedPosition === pos.id ? 'shadow-lg ring-2 ring-indigo-500 z-20' : 'hover:shadow-md z-10'} ${pos.product ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-300 hover:border-indigo-300'}`}
                        style={{ left: pos.x, top: pos.y, width: pos.width, height: pos.height }}
                        onMouseDown={(e) => handleMouseDown(e, 'position', zone.id, pos.id)}
                        onClick={(e) => { e.stopPropagation(); setSelectedZone(zone.id); setSelectedPosition(pos.id); setSelectedShelfId(null); }}
                      >
                        <span className="text-[9px] font-bold text-slate-700 leading-none">{pos.code || pos.name}</span>
                        <span className="text-[7px] text-slate-400 leading-none mt-1">Cap: {pos.capacity}</span>

                        {/* Position resize handle */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-30" onMouseDown={(e) => handleMouseDown(e, 'resize-position', zone.id, pos.id)}>
                          <Maximize2 className="w-2.5 h-2.5 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product list below canvas */}
          {selectedZone && (() => {
            const zone = zones.find(z => z.id === selectedZone);
            if (!zone) return null;

            let filteredPositions = zone.positions;
            let label = zone.name;

            if (selectedPosition) {
              filteredPositions = zone.positions.filter(p => p.id === selectedPosition);
              const pos = zone.positions.find(p => p.id === selectedPosition);
              label = pos?.code || pos?.name || zone.name;
            } else if (selectedShelfId) {
              filteredPositions = zone.positions.filter(p => p.shelf_id === selectedShelfId);
              const shelf = zone.shelves.find(s => s.id === selectedShelfId);
              label = shelf?.name || zone.name;
            }

            const productsToShow = filteredPositions.filter(p => p.product);
            if (productsToShow.length === 0) return null;

            return (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                  <span className="text-sm font-semibold text-slate-900 truncate">{label}</span>
                  <span className="text-xs text-slate-400 ml-auto shrink-0">{productsToShow.length} producto{productsToShow.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-6 py-2.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Posicion</th>
                        <th className="text-left px-6 py-2.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                        <th className="text-left px-6 py-2.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsToShow.map(pos => (
                        <tr key={pos.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-2.5 text-xs font-mono text-slate-600">{pos.code || pos.name}</td>
                          <td className="px-6 py-2.5 text-xs text-slate-900">{pos.product!.name}</td>
                          <td className="px-6 py-2.5 text-xs font-mono text-slate-500">{pos.product!.sku}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
