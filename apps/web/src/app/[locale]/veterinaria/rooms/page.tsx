'use client';

import React, { useState } from 'react';
import {
 Plus,
 Edit,
 Trash2,
 DoorOpen,
 Loader2,
 Search,
 Wrench,
 CheckCircle2,
 XCircle,
} from 'lucide-react';
import { useRooms } from '@/app/veterinaria/hooks/use-rooms';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const ROOM_TYPES = [
 { value: 'box', label: 'Box' },
 { value: 'quirofano', label: 'Quirófano' },
 { value: 'hospitalizacion', label: 'Hospitalización' },
 { value: 'laboratorio', label: 'Laboratorio' },
 { value: 'peluqueria', label: 'Peluquería' },
];

function getTypeLabel(type: string) {
 return ROOM_TYPES.find((t) => t.value === type)?.label || type;
}

const roomTypeBadges: Record<string, string> = {
 box: 'bg-blue-100 text-blue-800 border-blue-200',
 quirofano: 'bg-rose-100 text-rose-800 border-rose-200',
 hospitalizacion: 'bg-amber-100 text-amber-800 border-amber-200',
 laboratorio: 'bg-emerald-100 text-emerald-800 border-emerald-200',
 peluqueria: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
 active: { label: 'Disponible', color: 'text-emerald-600', icon: <CheckCircle2 className="w-3 h-3" /> },
 maintenance: { label: 'Mantenimiento', color: 'text-monday-violet', icon: <Wrench className="w-3 h-3" /> },
 inactive: { label: 'Inactivo', color: 'text-slate-400', icon: <XCircle className="w-3 h-3" /> },
};

export default function RoomsPage() {
 const { data: rooms, loading, refresh } = useRooms();
 const [search, setSearch] = useState('');
 const [showModal, setShowModal] = useState(false);
 const [editingId, setEditingId] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);

 const [formData, setFormData] = useState({
 name: '',
 type: 'box',
 capacity: 1,
 status: 'active' as string,
 });

 const resetForm = () => {
 setFormData({ name: '', type: 'box', capacity: 1, status: 'active' });
 setEditingId(null);
 };

 const filteredRooms = rooms.filter((r) =>
 r.name.toLowerCase().includes(search.toLowerCase()) ||
 r.type.toLowerCase().includes(search.toLowerCase())
 );

 const openCreate = () => {
 resetForm();
 setShowModal(true);
 };

 const openEdit = (room: any) => {
 setEditingId(room.id);
 setFormData({
 name: room.name || '',
 type: room.type || 'box',
 capacity: room.capacity || 1,
 status: room.status || 'active',
 });
 setShowModal(true);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.name) return;
 setSaving(true);
 try {
 const api = getApiClient();
 if (editingId) {
 await api.updateVetRoom(editingId, { ...formData });
 toast.success('Sala actualizada correctamente');
 } else {
 await api.createVetRoom({ ...formData });
 toast.success('Sala creada correctamente');
 }
 await refresh();
 setShowModal(false);
 resetForm();
 } catch (err: any) {
 toast.error(err.message || 'Error al guardar la sala');
 } finally {
 setSaving(false);
 }
 };

 const handleDelete = async (id: string, name: string) => {
 if (!confirm(`¿Eliminar la sala "${name}"? Esta acción no se puede deshacer.`)) return;
 try {
 const api = getApiClient();
 await api.deleteVetRoom(id);
 await refresh();
 toast.success('Sala eliminada');
 } catch (err: any) {
 toast.error(err.message || 'Error al eliminar la sala');
 }
 };

 const availableCount = rooms.filter((r) => r.status === 'active').length;
 const maintenanceCount = rooms.filter((r) => r.status === 'maintenance').length;

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
 <DoorOpen className="w-7 h-7 text-emerald-600" />
 Salas & Boxes Clínicos
 </h1>
 <p className="text-slate-500 text-sm mt-0.5">
 Gestión de espacios: boxes de atención, quirófanos, hospitalización, laboratorio y peluquería.
 </p>
 </div>

 <button
 onClick={openCreate}
 className="bg-monday-violet hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
 >
 <Plus className="w-4 h-4" />
 Nueva Sala
 </button>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
 <CheckCircle2 className="w-5 h-5" />
 </div>
 <div>
 <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Disponibles</div>
 <div className="text-xl font-black text-slate-900">{availableCount}</div>
 </div>
 </div>
 <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
 <Wrench className="w-5 h-5" />
 </div>
 <div>
 <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Mantenimiento</div>
 <div className="text-xl font-black text-slate-900">{maintenanceCount}</div>
 </div>
 </div>
 <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
 <DoorOpen className="w-5 h-5" />
 </div>
 <div>
 <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Salas</div>
 <div className="text-xl font-black text-slate-900">{rooms.length}</div>
 </div>
 </div>
 </div>

 {/* Search */}
 <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Buscar por nombre de sala o tipo..."
 className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl">
 {filteredRooms.length} Salas
 </span>
 </div>

 {/* Room Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {loading ? (
 [...Array(3)].map((_, i) => (
 <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
 ))
 ) : filteredRooms.length === 0 ? (
 <div className="col-span-3 text-center py-12">
 <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
 <p className="text-sm text-slate-500">No se encontraron salas.</p>
 </div>
 ) : filteredRooms.map((room) => (
 <div
 key={room.id}
 className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-emerald-300 transition-all"
 >
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
 <DoorOpen className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-bold text-slate-900 text-sm">{room.name}</h3>
 <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border inline-flex items-center gap-1 mt-1 ${roomTypeBadges[room.type] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
 {getTypeLabel(room.type)}
 </span>
 </div>
 </div>
 <div className="flex items-center gap-1 text-xs">
 {statusConfig[room.status]?.icon}
 <span className={`font-bold ${statusConfig[room.status]?.color}`}>
 {statusConfig[room.status]?.label}
 </span>
 </div>
 </div>

 <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 mb-3">
 Capacidad: <strong className="text-slate-700">{room.capacity} {room.capacity === 1 ? 'paciente' : 'pacientes'}</strong>
 </div>

 <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
 <button
 onClick={() => openEdit(room)}
 className="text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 flex items-center gap-1"
 >
 <Edit className="w-3 h-3" /> Editar
 </button>
 <button
 onClick={() => handleDelete(room.id, room.name)}
 className="text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl hover:bg-rose-100 flex items-center gap-1"
 >
 <Trash2 className="w-3 h-3" /> Eliminar
 </button>
 </div>
 </div>
 ))}
 </div>

 {/* Modal Crear / Editar Sala */}
 {showModal && (
 <div className="fixed inset-0 z-50 bg-cloud backdrop-blur-xs flex items-center justify-center p-4">
 <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
 <DoorOpen className="w-5 h-5 text-emerald-600" />
 {editingId ? 'Editar Sala' : 'Nueva Sala / Box'}
 </h3>
 <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
 ✕
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre de la Sala *</label>
 <input
 type="text"
 required
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 placeholder="Ej. Box 1, Quirófano A, Sala de Peluquería"
 className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Sala *</label>
 <select
 value={formData.type}
 onChange={(e) => setFormData({ ...formData, type: e.target.value })}
 className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
 >
 {ROOM_TYPES.map((t) => (
 <option key={t.value} value={t.value}>{t.label}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Capacidad</label>
 <input
 type="number"
 min={1}
 value={formData.capacity}
 onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
 className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estado</label>
 <select
 value={formData.status}
 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
 className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
 >
 <option value="active">Disponible</option>
 <option value="maintenance">Mantenimiento</option>
 <option value="inactive">Inactivo</option>
 </select>
 </div>

 <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={() => { setShowModal(false); resetForm(); }}
 className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={saving}
 className="bg-monday-violet hover:bg-monday-violet-hover text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm flex items-center gap-2 disabled:opacity-50"
 >
 {saving && <Loader2 className="w-4 h-4 animate-spin" />}
 {editingId ? 'Actualizar Sala' : 'Guardar Sala'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
