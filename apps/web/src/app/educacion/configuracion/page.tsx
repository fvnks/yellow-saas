'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION } from '@/components/educacion/button-classes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, School, Calendar, Bell, DollarSign, Mail, AlertTriangle } from 'lucide-react';

export default function ConfiguracionPage() {
  const [configuracion, setConfiguracion] = useState({
    // Datos del establecimiento
    nombre: '',
    rut: '',
    direccion: '',
    telefono: '',
    email: '',
    
    // Año lectivo
    anio_lectivo: 2026,
    fecha_inicio: '',
    fecha_termino: '',
    periodos: '',
    
    // Pensiones
    monto_pension: 0,
    dia_vencimiento: 5,
    descuento_pronto_pago: 0,
    
    // Notificaciones
    notif_inasistencia: false,
    notif_inasistencia_umbral: 3,
    notif_nota_baja: false,
    notif_nota_baja_umbral: 4.0,
    notif_pago_vencido: false,
    notif_evento_proximo: false,
    notif_evento_dias: 7,
    
    // Email
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_from: '',
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [estado, setEstado] = useState<'idle' | 'ok' | 'error'>('idle');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const res = await fetch('/api/educacion/configuracion');
        const data = await res.json();
        if (!cancelado && data?.data?.datos) {
          setConfiguracion((prev) => ({ ...prev, ...data.data.datos }));
        }
      } catch (error) {
        console.error('Error cargando configuración:', error);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  const handleChange = (field: string, value: any) => {
    setConfiguracion((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setGuardando(true);
    setEstado('idle');

    try {
      // Evita que un input numérico vacío termine como NaN en el JSON.
      const datos = Object.fromEntries(
        Object.entries(configuracion).map(([k, v]) => [
          k,
          typeof v === 'number' && Number.isNaN(v) ? 0 : v,
        ])
      );

      const res = await fetch('/api/educacion/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');

      setEstado('ok');
      setMensaje('Configuración guardada correctamente.');
    } catch (error) {
      setEstado('error');
      setMensaje(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-ink">Configuración</h1>
        <p className="text-sm text-slate-500 mt-1">Configuración del módulo educativo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <School className="h-5 w-5 text-blue-600" />
              <CardTitle>Datos del Establecimiento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Establecimiento</Label>
              <Input
                id="nombre"
                value={configuracion.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                value={configuracion.rut}
                onChange={(e) => handleChange('rut', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={configuracion.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={configuracion.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={configuracion.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <CardTitle>Año Lectivo</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anio_lectivo">Año Lectivo Actual</Label>
              <Input
                id="anio_lectivo"
                type="number"
                value={configuracion.anio_lectivo}
                onChange={(e) => handleChange('anio_lectivo', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={configuracion.fecha_inicio}
                onChange={(e) => handleChange('fecha_inicio', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_termino">Fecha de Término</Label>
              <Input
                id="fecha_termino"
                type="date"
                value={configuracion.fecha_termino}
                onChange={(e) => handleChange('fecha_termino', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodos">Períodos de Evaluación</Label>
              <select
                id="periodos"
                value={configuracion.periodos}
                onChange={(e) => handleChange('periodos', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
              >
                <option value="semestral">Semestral (2 períodos)</option>
                <option value="trimestral">Trimestral (3 períodos)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <CardTitle>Configuración de Pensiones</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monto_pension">Monto de Pension Mensual</Label>
              <Input
                id="monto_pension"
                type="number"
                value={configuracion.monto_pension}
                onChange={(e) => handleChange('monto_pension', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dia_vencimiento">Día de Vencimiento</Label>
              <Input
                id="dia_vencimiento"
                type="number"
                value={configuracion.dia_vencimiento}
                onChange={(e) => handleChange('dia_vencimiento', parseInt(e.target.value))}
                min={1}
                max={28}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descuento_pronto_pago">Descuento por Pronto Pago (%)</Label>
              <Input
                id="descuento_pronto_pago"
                type="number"
                value={configuracion.descuento_pronto_pago}
                onChange={(e) => handleChange('descuento_pronto_pago', parseInt(e.target.value))}
                min={0}
                max={100}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-purple-600" />
              <CardTitle>Notificaciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Inasistencia</Label>
                <p className="text-sm text-slate-500">
                  Enviar alerta cuando un estudiante supere el límite de inasistencias
                </p>
              </div>
              <input
                type="checkbox"
                checked={configuracion.notif_inasistencia}
                onChange={(e) => handleChange('notif_inasistencia', e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            {configuracion.notif_inasistencia && (
              <div className="space-y-2 pl-4 border-l-2 border-purple-200">
                <Label htmlFor="notif_inasistencia_umbral">Umbral de inasistencias</Label>
                <Input
                  id="notif_inasistencia_umbral"
                  type="number"
                  value={configuracion.notif_inasistencia_umbral}
                  onChange={(e) => handleChange('notif_inasistencia_umbral', parseInt(e.target.value))}
                  min={1}
                  max={30}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Notas Bajas</Label>
                <p className="text-sm text-slate-500">
                  Enviar alerta cuando un estudiante tenga notas menores al umbral
                </p>
              </div>
              <input
                type="checkbox"
                checked={configuracion.notif_nota_baja}
                onChange={(e) => handleChange('notif_nota_baja', e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            {configuracion.notif_nota_baja && (
              <div className="space-y-2 pl-4 border-l-2 border-purple-200">
                <Label htmlFor="notif_nota_baja_umbral">Umbral de nota</Label>
                <Input
                  id="notif_nota_baja_umbral"
                  type="number"
                  step="0.1"
                  value={configuracion.notif_nota_baja_umbral}
                  onChange={(e) => handleChange('notif_nota_baja_umbral', parseFloat(e.target.value))}
                  min={1}
                  max={7}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Pagos Vencidos</Label>
                <p className="text-sm text-slate-500">
                  Enviar alerta cuando una pensión esté vencida
                </p>
              </div>
              <input
                type="checkbox"
                checked={configuracion.notif_pago_vencido}
                onChange={(e) => handleChange('notif_pago_vencido', e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Recordatorios de Eventos</Label>
                <p className="text-sm text-slate-500">
                  Enviar recordatorio días antes del evento
                </p>
              </div>
              <input
                type="checkbox"
                checked={configuracion.notif_evento_proximo}
                onChange={(e) => handleChange('notif_evento_proximo', e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            {configuracion.notif_evento_proximo && (
              <div className="space-y-2 pl-4 border-l-2 border-purple-200">
                <Label htmlFor="notif_evento_dias">Días de anticipación</Label>
                <Input
                  id="notif_evento_dias"
                  type="number"
                  value={configuracion.notif_evento_dias}
                  onChange={(e) => handleChange('notif_evento_dias', parseInt(e.target.value))}
                  min={1}
                  max={30}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-indigo-600" />
              <CardTitle>Configuración de Email (SMTP)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_host">Host SMTP</Label>
                <Input
                  id="smtp_host"
                  value={configuracion.smtp_host}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp_port">Puerto SMTP</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  value={configuracion.smtp_port}
                  onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_user">Usuario SMTP</Label>
                <Input
                  id="smtp_user"
                  value={configuracion.smtp_user}
                  onChange={(e) => handleChange('smtp_user', e.target.value)}
                  placeholder="tu-email@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp_password">Contraseña SMTP</Label>
                <Input
                  id="smtp_password"
                  type="password"
                  value={configuracion.smtp_password}
                  onChange={(e) => handleChange('smtp_password', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_from">Email Remitente</Label>
              <Input
                id="smtp_from"
                value={configuracion.smtp_from}
                onChange={(e) => handleChange('smtp_from', e.target.value)}
                placeholder="noreply@colegio.cl"
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <p className="text-sm">
                Para Gmail, necesitas generar una "Contraseña de aplicación" en la configuración de seguridad de tu cuenta.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-4">
        {mensaje && (
          <span className={estado === 'ok' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>
            {mensaje}
          </span>
        )}
        <Button className={PRIMARY_ACTION} onClick={handleSave} disabled={guardando || cargando}>
          <Save className="h-4 w-4 mr-2" />
          {guardando ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
  );
}
