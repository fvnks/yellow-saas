'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge } from '@yellow-erp/ui';
import { Plus, Trash2, Save, Download, Upload, Eye, Grid, Layers, ArrowUpDown, Copy, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { getApiClient } from '../../../../../lib/api-client';

interface LabelElement {
  id: string;
  type: 'text' | 'barcode' | 'qr' | 'image' | 'line' | 'rect' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  rotation?: number;
  zIndex: number;
  dynamicField?: string;
  barcodeFormat?: string;
  barcodeValue?: string;
  imageUrl?: string;
}

interface LabelTemplate {
  id: string;
  name: string;
  description?: string;
  width_mm: number;
  height_mm: number;
  margin_mm: number;
  background_color: string;
  template_json: any;
  is_default: boolean;
  is_active: boolean;
}

const MM_TO_PX = 3.7795275591;

const DEFAULT_TEMPLATE_JSON = {
  elements: [],
  settings: {
    gridSize: 5,
    snapToGrid: true,
    showGrid: true,
  },
};

export default function LabelDesignerPage() {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<LabelTemplate | null>(null);
  const [elements, setElements] = useState<LabelElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [gridSettings, setGridSettings] = useState({ size: 5, snap: true, show: true });
  const [tool, setTool] = useState<'select' | 'text' | 'barcode' | 'qr' | 'line' | 'rect' | 'circle'>('select');
  const [canvasRef, setCanvasRef] = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [dragState, setDragState] = useState<{ elementId: string; startX: number; startY: number; elementX: number; elementY: number } | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const res = await api.getLabelTemplates({ limit: '100', is_active: 'true' });
      setTemplates(res.data || []);
      const defaultTpl = res.data?.find((t: LabelTemplate) => t.is_default);
      if (defaultTpl) {
        setActiveTemplate(defaultTpl);
        loadTemplate(defaultTpl);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = useCallback(async (template: LabelTemplate) => {
    setActiveTemplate(template);
    if (template.template_json?.elements) {
      setElements(template.template_json.elements);
    } else {
      setElements([]);
    }
    if (template.template_json?.settings) {
      setGridSettings(template.template_json.settings);
    }
  }, []);

  const saveTemplate = async () => {
    if (!activeTemplate) return;
    setSaving(true);
    try {
      const api = getApiClient();
      const templateJson = {
        elements,
        settings: gridSettings,
      };
      await api.updateLabelTemplate(activeTemplate.id, { template_json: templateJson });
      alert('Plantilla guardada exitosamente');
    } catch (err) {
      console.error('Error saving template:', err);
      alert('Error al guardar la plantilla');
    } finally {
      setSaving(false);
    }
  };

  const createTemplate = async () => {
    const name = prompt('Nombre de la nueva plantilla:');
    if (!name) return;

    try {
      const api = getApiClient();
      const res = await api.createLabelTemplate({
        name,
        description: '',
        width_mm: 62,
        height_mm: 40,
        margin_mm: 2,
        background_color: '#FFFFFF',
        template_json: DEFAULT_TEMPLATE_JSON,
        is_default: false,
        is_active: true,
      });
      const newTemplate = res as LabelTemplate;
      setTemplates([...templates, newTemplate]);
      setActiveTemplate(newTemplate);
      setElements([]);
      setGridSettings({ size: 5, snap: true, show: true });
    } catch (err) {
      console.error('Error creating template:', err);
      alert('Error al crear plantilla');
    }
  };

  const duplicateTemplate = async () => {
    if (!activeTemplate) return;
    try {
      const api = getApiClient();
      const res = await api.createLabelTemplate({
        name: `${activeTemplate.name} (Copia)`,
        description: activeTemplate.description,
        width_mm: activeTemplate.width_mm,
        height_mm: activeTemplate.height_mm,
        margin_mm: activeTemplate.margin_mm,
        background_color: activeTemplate.background_color,
        template_json: { elements, settings: gridSettings },
        is_default: false,
        is_active: true,
      });
      const newTemplate = res as LabelTemplate;
      setTemplates([...templates, newTemplate]);
      setActiveTemplate(newTemplate);
    } catch (err) {
      console.error('Error duplicating template:', err);
    }
  };

  const deleteTemplate = async () => {
    if (!activeTemplate || !confirm('Eliminar esta plantilla?')) return;
    try {
      const api = getApiClient();
      await api.deleteLabelTemplate(activeTemplate.id);
      setTemplates(templates.filter(t => t.id !== activeTemplate.id));
      setActiveTemplate(null);
      setElements([]);
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const exportTemplate = () => {
    if (!activeTemplate) return;
    const data = {
      name: activeTemplate.name,
      width_mm: activeTemplate.width_mm,
      height_mm: activeTemplate.height_mm,
      margin_mm: activeTemplate.margin_mm,
      background_color: activeTemplate.background_color,
      elements,
      settings: gridSettings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTemplate.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const api = getApiClient();
        const res = await api.createLabelTemplate({
          name: data.name || 'Importada',
          width_mm: data.width_mm,
          height_mm: data.height_mm,
          margin_mm: data.margin_mm,
          background_color: data.background_color,
          template_json: { elements: data.elements, settings: data.settings },
          is_default: false,
          is_active: true,
        });
        const newTemplate = res as LabelTemplate;
        setTemplates([...templates, newTemplate]);
        setActiveTemplate(newTemplate);
        loadTemplate(newTemplate);
      } catch (err) {
        console.error('Error importing template:', err);
        alert('Error al importar plantilla');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const addElement = (type: LabelElement['type']) => {
    const newElement: LabelElement = {
      id: crypto.randomUUID(),
      type,
      x: 50,
      y: 50,
      width: 100,
      height: 30,
      zIndex: elements.length + 1,
    };

    switch (type) {
      case 'text':
        newElement.content = 'Texto';
        newElement.fontSize = 12;
        newElement.fontWeight = 'normal';
        newElement.color = '#000000';
        break;
      case 'barcode':
        newElement.barcodeFormat = 'CODE128';
        newElement.barcodeValue = '123456789';
        newElement.height = 40;
        break;
      case 'qr':
        newElement.content = 'https://example.com';
        newElement.width = 40;
        newElement.height = 40;
        break;
      case 'line':
        newElement.width = 100;
        newElement.height = 2;
        newElement.borderColor = '#000000';
        newElement.borderWidth = 1;
        break;
      case 'rect':
        newElement.borderColor = '#000000';
        newElement.borderWidth = 1;
        break;
      case 'circle':
        newElement.width = 40;
        newElement.height = 40;
        newElement.borderColor = '#000000';
        newElement.borderWidth = 1;
        break;
    }

    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<LabelElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const duplicateElement = (id: string) => {
    const element = elements.find(e => e.id === id);
    if (!element) return;
    const newElement = { ...element, id: crypto.randomUUID(), x: element.x + 10, y: element.y + 10, zIndex: elements.length + 1 };
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>, elementId?: string) => {
    if (tool !== 'select') return;
    if (!elementId) {
      setSelectedElementId(null);
      return;
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const el = elements.find(e => e.id === elementId);
    if (!el) return;
    setDragState({
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      elementX: el.x,
      elementY: el.y,
    });
    setSelectedElementId(elementId);
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState) return;
    const scale = zoom;
    const dx = (e.clientX - dragState.startX) / scale;
    const dy = (e.clientY - dragState.startY) / scale;
    let newX = dragState.elementX + dx;
    let newY = dragState.elementY + dy;

    if (gridSettings.snap) {
      const gridSize = gridSettings.size;
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    updateElement(dragState.elementId, { x: newX, y: newY });
  }, [dragState, zoom, gridSettings, elements]);

  const handleCanvasMouseUp = () => {
    setDragState(null);
  };

  const handleResize = (elementId: string, direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw', e: React.MouseEvent) => {
    e.stopPropagation();
    const scale = zoom;
    const dx = e.movementX / scale;
    const dy = e.movementY / scale;
    const el = elements.find(e => e.id === elementId);
    if (!el) return;

    let newX = el.x, newY = el.y, newWidth = el.width, newHeight = el.height;

    if (direction.includes('e')) newWidth = Math.max(10, el.width + dx);
    if (direction.includes('w')) { newWidth = Math.max(10, el.width - dx); newX = el.x + (el.width - newWidth); }
    if (direction.includes('s')) newHeight = Math.max(10, el.height + dy);
    if (direction.includes('n')) { newHeight = Math.max(10, el.height - dy); newY = el.y + (el.height - newHeight); }

    if (gridSettings.snap) {
      const gridSize = gridSettings.size;
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
      newWidth = Math.round(newWidth / gridSize) * gridSize;
      newHeight = Math.round(newHeight / gridSize) * gridSize;
    }

    updateElement(elementId, { x: newX, y: newY, width: newWidth, height: newHeight });
  };

  const selectedElement = elements.find(e => e.id === selectedElementId);

  const canvasWidth = activeTemplate ? activeTemplate.width_mm * MM_TO_PX : 234;
  const canvasHeight = activeTemplate ? activeTemplate.height_mm * MM_TO_PX : 151;
  const marginPx = activeTemplate ? activeTemplate.margin_mm * MM_TO_PX : 7.5;

  if (loading) return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-200 h-32 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Diseñador de Etiquetas</h1>
          <p className="text-sm text-slate-500 mt-1">Editor visual drag & drop para plantillas de etiquetas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={exportTemplate} disabled={!activeTemplate}><Download className="w-4 h-4 mr-2" /> Exportar</Button>
          <input type="file" accept=".json" onChange={importTemplate} className="hidden" id="import-file" ref={(e) => { if (e) (window as any).importFileInput = e; }} />
          <Button variant="secondary" size="sm" onClick={() => (window as any).importFileInput?.click()}><Upload className="w-4 h-4 mr-2" /> Importar</Button>
          <Button variant="secondary" size="sm" onClick={duplicateTemplate} disabled={!activeTemplate}><Copy className="w-4 h-4 mr-2" /> Duplicar</Button>
          <Button variant="secondary" size="sm" onClick={deleteTemplate} disabled={!activeTemplate} className="text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4 mr-2" /> Eliminar</Button>
          <Button onClick={createTemplate}><Plus className="w-4 h-4 mr-2" /> Nueva Plantilla</Button>
        </div>
      </div>

      {loading && <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
        {/* Sidebar: Templates & Elements */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="w-4 h-4" /> Plantillas</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => { setActiveTemplate(tpl); loadTemplate(tpl); }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    activeTemplate?.id === tpl.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-slate-900">{tpl.name}</p>
                      <p className="text-xs text-slate-500">{tpl.width_mm}×{tpl.height_mm}mm</p>
                    </div>
                    {tpl.is_default && <Badge variant="success" className="text-[9px]">Default</Badge>}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Grid className="w-4 h-4" /> Elementos</CardTitle>
              <select value={tool} onChange={e => setTool(e.target.value as any)} className="text-xs border border-slate-200 rounded px-2 py-1">
                <option value="select">Seleccionar</option>
                <option value="text">Texto</option>
                <option value="barcode">Código de barras</option>
                <option value="qr">Código QR</option>
                <option value="line">Línea</option>
                <option value="rect">Rectángulo</option>
                <option value="circle">Círculo</option>
              </select>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
              {elements.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-8">Sin elementos. Selecciona una herramienta para agregar.</p>
              ) : (
                elements.map(el => (
                  <div
                    key={el.id}
                    className={`flex items-center gap-2 p-2 rounded border ${
                      selectedElementId === el.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs text-slate-500 capitalize">{el.type}</span>
                    <span className="text-xs text-slate-400 flex-1 text-right">{Math.round(el.x)}×{Math.round(el.y)}</span>
                    <button onClick={() => duplicateElement(el.id)} className="p-1 hover:bg-slate-100 rounded" title="Duplicar"><Copy className="w-3 h-3" /></button>
                    <button onClick={() => deleteElement(el.id)} className="p-1 hover:bg-rose-50 rounded text-rose-500" title="Eliminar"><Trash2 className="w-3 h-3" /></button>
</div>
                )
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Eye className="w-4 h-4" /> Lienzo</CardTitle>
              <div className="flex items-center gap-2">
                <select value={zoom} onChange={e => setZoom(Number(e.target.value))} className="text-xs border border-slate-200 rounded px-2 py-1 w-20">
                  <option value={0.5}>50%</option>
                  <option value={0.75}>75%</option>
                  <option value={1}>100%</option>
                  <option value={1.25}>125%</option>
                  <option value={1.5}>150%</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-0 relative">
              <div
                ref={setCanvasRef}
                className="relative bg-white"
                style={{ width: canvasWidth * zoom, height: canvasHeight * zoom }}
                onMouseDown={e => handleCanvasMouseDown(e as any)}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              >
                {/* Background */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: activeTemplate?.background_color || '#FFFFFF',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                  }}
                />

                {/* Grid */}
                {gridSettings.show && (
                  <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <pattern id="grid" width={gridSettings.size * zoom} height={gridSettings.size * zoom} patternUnits="userSpaceOnUse">
                        <path d="M 0 0 L 0 ${gridSettings.size * zoom} M 0 0 L ${gridSettings.size * zoom} 0" stroke="#e2e8f0" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                )}

                {/* Margin guides */}
                <div className="absolute" style={{
                  left: marginPx * zoom,
                  top: marginPx * zoom,
                  right: marginPx * zoom,
                  bottom: marginPx * zoom,
                  border: '1px dashed #94a3b8',
                  borderRadius: '2px',
                }} />

                {/* Elements */}
                {elements.map(el => (
                  <LabelElementRenderer
                    key={el.id}
                    element={el}
                    isSelected={selectedElementId === el.id}
                    zoom={zoom}
                    onSelect={() => setSelectedElementId(el.id)}
                    onDragStart={(e) => handleCanvasMouseDown(e as any, el.id)}
                    onResize={(dir, e) => handleResize(el.id, dir, e as any)}
                    marginPx={marginPx}
                    gridSettings={gridSettings}
                    zoom={zoom}
                  />
                ))}

                {/* Add element on click when tool selected */}
                {tool !== 'select' && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    onClick={(e) => {
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      const x = (e.clientX - rect.left) / zoom;
                      const y = (e.clientY - rect.top) / zoom;
                      addElement(tool);
                      const newEl = elements[elements.length - 1];
                      if (newEl) {
                        updateElement(newEl.id, { x, y });
                        setSelectedElementId(newEl.id);
                      }
                      setTool('select');
                    }}
                    style={{ cursor: 'crosshair' }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-4 h-4" /> Propiedades</CardTitle></CardHeader>
            <CardContent className="space-y-4">
{activeTemplate && (
                  <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-medium text-sm text-slate-700">Plantilla</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Input label="Ancho (mm)" value={activeTemplate.width_mm} onChange={e => { if (activeTemplate) { activeTemplate.width_mm = Number(e.target.value); } }} />
                      <Input label="Alto (mm)" value={activeTemplate.height_mm} onChange={e => { if (activeTemplate) { activeTemplate.height_mm = Number(e.target.value); } }} />
                      <Input label="Margen (mm)" value={activeTemplate.margin_mm} onChange={e => { if (activeTemplate) { activeTemplate.margin_mm = Number(e.target.value); } }} />
                      <Input label="Color fondo" type="color" value={activeTemplate.background_color} onChange={e => { if (activeTemplate) { activeTemplate.background_color = e.target.value; } }} />
                    </div>
                  </div>
                )}

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-slate-700">Grid</h4>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={gridSettings.show} onChange={e => setGridSettings(s => ({ ...s, show: e.target.checked }))} className="rounded border-slate-300" />
                    Mostrar grid
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={gridSettings.snap} onChange={e => setGridSettings(s => ({ ...s, snap: e.target.checked }))} className="rounded border-slate-300" />
                    Snap to grid
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Tamaño:</label>
                  <Input type="number" min="1" max="50" value={gridSettings.size} onChange={e => setGridSettings(s => ({ ...s, size: Number(e.target.value) }))} className="w-20" />
                </div>
              </div>

              {selectedElement && (
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <h4 className="font-medium text-sm text-slate-700">Elemento: {selectedElement.type}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Input label="X" value={Math.round(selectedElement.x)} onChange={e => updateElement(selectedElement.id, { x: Number(e.target.value) })} />
                    <Input label="Y" value={Math.round(selectedElement.y)} onChange={e => updateElement(selectedElement.id, { y: Number(e.target.value) })} />
                    <Input label="Ancho" value={Math.round(selectedElement.width)} onChange={e => updateElement(selectedElement.id, { width: Number(e.target.value) })} />
                    <Input label="Alto" value={Math.round(selectedElement.height)} onChange={e => updateElement(selectedElement.id, { height: Number(e.target.value) })} />
                  </div>

                  {selectedElement.type === 'text' && (
                    <div className="space-y-2 text-xs">
                      <Input label="Contenido" value={selectedElement.content || ''} onChange={e => updateElement(selectedElement.id, { content: e.target.value })} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input label="Tamaño" type="number" value={selectedElement.fontSize || 12} onChange={e => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })} />
                        <Select value={selectedElement.fontWeight || 'normal'} onChange={e => updateElement(selectedElement.id, { fontWeight: e.target.value })} options={[{value:'normal',label:'Normal'},{value:'bold',label:'Negrita'},{value:'600',label:'Semi-bold'}]} />
                        <Input label="Color" type="color" value={selectedElement.color || '#000000'} onChange={e => updateElement(selectedElement.id, { color: e.target.value })} />
                        <Input label="Fondo" type="color" value={selectedElement.backgroundColor || 'transparent'} onChange={e => updateElement(selectedElement.id, { backgroundColor: e.target.value })} />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" checked={!!selectedElement.dynamicField} onChange={e => updateElement(selectedElement.id, { dynamicField: e.target.checked ? 'product.name' : undefined })} className="rounded border-slate-300" />
                          Campo dinámico
                        </label>
                      </div>
                    </div>
                  )}

                  {selectedElement.type === 'barcode' && (
                    <div className="space-y-2 text-xs">
                      <Select value={selectedElement.barcodeFormat || 'CODE128'} onChange={e => updateElement(selectedElement.id, { barcodeFormat: e.target.value })} options={['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPCA', 'UPCE']} />
                      <Input label="Valor" value={selectedElement.barcodeValue || ''} onChange={e => updateElement(selectedElement.id, { barcodeValue: e.target.value })} />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" checked={!!selectedElement.dynamicField} onChange={e => updateElement(selectedElement.id, { dynamicField: e.target.checked ? 'product.barcode' : undefined })} className="rounded border-slate-300" />
                          Valor dinámico (product.barcode)
                        </label>
                      </div>
                    </div>
                  )}

                  {selectedElement.type === 'qr' && (
                    <div className="space-y-2 text-xs">
                      <Input label="Contenido" value={selectedElement.content || ''} onChange={e => updateElement(selectedElement.id, { content: e.target.value })} />
                    </div>
                  )}

                  {['rect', 'circle', 'line'].includes(selectedElement.type) && (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <Input label="Borde color" type="color" value={selectedElement.borderColor || '#000000'} onChange={e => updateElement(selectedElement.id, { borderColor: e.target.value })} />
                        <Input label="Borde ancho" type="number" min="0.5" step="0.5" value={selectedElement.borderWidth || 1} onChange={e => updateElement(selectedElement.id, { borderWidth: Number(e.target.value) })} />
                      </div>
                      {selectedElement.type !== 'line' && (
                        <Input label="Radio" type="number" min="0" step="0.5" value={selectedElement.borderRadius || 0} onChange={e => updateElement(selectedElement.id, { borderRadius: Number(e.target.value) })} />
              )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <Button variant="secondary" size="sm" onClick={() => duplicateElement(selectedElement.id)}><Copy className="w-4 h-4 mr-1" /> Duplicar</Button>
                    <Button variant="secondary" size="sm" onClick={() => deleteElement(selectedElement.id)} className="text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4 mr-1" /> Eliminar</Button>
                  </div>
</div>
              )
            }

              {!selectedElement && !activeTemplate && (
                <p className="text-center text-slate-500 text-sm py-8">Selecciona una plantilla y un elemento para editar propiedades</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex justify-end gap-2 pt-0">
              <Button variant="secondary" onClick={saveTemplate} disabled={saving || !activeTemplate} className="w-full sm:w-auto">
                {saving ? 'Guardando...' : 'Guardar Plantilla'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LabelElementRenderer({
  element,
  isSelected,
  zoom,
  onSelect,
  onDragStart,
  onResize,
  marginPx,
  gridSettings,
  zoom: zoomLevel,
}: {
  element: LabelElement;
  isSelected: boolean;
  zoom: number;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onResize: (dir: string, e: React.MouseEvent) => void;
  marginPx: number;
  gridSettings: { size: number; snap: boolean };
  zoom: number;
}) {
  const scale = zoom;
  const style: React.CSSProperties = {
    position: 'absolute',
    left: (element.x + marginPx) * scale,
    top: (element.y + marginPx) * scale,
    width: element.width * scale,
    height: element.height * scale,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    transformOrigin: 'center center',
    cursor: isSelected ? 'move' : 'default',
    zIndex: element.zIndex,
    pointerEvents: 'auto',
  };

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '2px',
              fontSize: `${(element.fontSize || 12) * scale}px`,
              fontWeight: element.fontWeight || 'normal',
              fontFamily: element.fontFamily || 'inherit',
              color: element.color || '#000',
              backgroundColor: element.backgroundColor || 'transparent',
              borderRadius: `${(element.borderRadius || 0) * scale}px`,
              border: element.borderWidth ? `${element.borderWidth * scale}px solid ${element.borderColor}` : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {element.content || 'Texto'}
          </div>
        );
      case 'barcode':
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            <svg width="100%" height="80%">
              <g>
                {Array.from({ length: 40 }).map((_, i) => (
                  <rect
                    key={i}
                    x={i * 2.5}
                    y={0}
                    width={Math.random() > 0.5 ? 1 : 2}
                    height="100%"
                    fill="#000"
                  />
                ))}
              </g>
            </svg>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', fontSize: `${10 * scale}px`, fontFamily: 'monospace' }}>
              {element.barcodeValue}
            </div>
          </div>
        );
      case 'qr':
        return (
          <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="80%" height="80%">
              <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
              <rect x="0" y="0" width="20%" height="20%" fill="#000" />
              <rect x="80%" y="0" width="20%" height="20%" fill="#000" />
              <rect x="0" y="80%" width="20%" height="20%" fill="#000" />
            </svg>
          </div>
        );
      case 'line':
        return (
          <svg width="100%" height="100%">
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke={element.borderColor || '#000'} strokeWidth={element.borderWidth || 1} />
          </svg>
        );
      case 'rect':
        return (
          <div style={{
            width: '100%',
            height: '100%',
            border: `${(element.borderWidth || 1) * scale}px solid ${element.borderColor || '#000'}`,
            borderRadius: `${(element.borderRadius || 0) * scale}px`,
            backgroundColor: element.backgroundColor || 'transparent',
          }} />
        );
      case 'circle':
        return (
          <div style={{
            width: '100%',
            height: '100%',
            border: `${(element.borderWidth || 1) * scale}px solid ${element.borderColor || '#000'}`,
            borderRadius: '50%',
            backgroundColor: element.backgroundColor || 'transparent',
          }} />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={style}
      className={isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white' : ''}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onMouseDown={onDragStart}
    >
      {renderContent()}

      {isSelected && (
        <>
          {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(dir => (
            <div
              key={dir}
              className="absolute w-2 h-2 bg-white border border-indigo-500 rounded"
              style={{
                left: dir.includes('w') ? -4 : dir.includes('e') ? 'calc(100% - 4px)' : 'calc(50% - 4px)',
                top: dir.includes('n') ? -4 : dir.includes('s') ? 'calc(100% - 4px)' : 'calc(50% - 4px)',
                cursor: `${dir}-resize`,
              }}
              onMouseDown={(e) => { e.stopPropagation(); onResize(dir, e as any); }}
            />
          ))}
        </>
      )}
    </div>
  );
}