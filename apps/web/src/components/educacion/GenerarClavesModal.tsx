'use client';

import { useEffect, useState } from 'react';
import { Download, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION, SECONDARY_ACTION } from '@/components/educacion/button-classes';
import { Modal } from '@/components/educacion/Modal';
import { Apoderado } from '@/types/educacion';
import { downloadCSV } from '@/lib/export-utils';
import { filasCsvCredenciales, CredencialApoderado } from '@/lib/credenciales-csv';

interface GenerarClavesModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Lista actual (para contar cuántos siguen sin clave). */
  apoderados: Apoderado[];
  /** Se invoca cuando el servidor confirmó que generó claves. */
  onGeneradas: () => void;
}

type Modo = 'faltantes' | 'todas';

interface ResultadoGeneracion {
  generadas: number;
  credenciales: CredencialApoderado[];
}

/**
 * Modal de "Generar claves" del listado de apoderados: elegir alcance
 * (solo sin clave / todas), generar y descargar el CSV de reparto.
 * Las claves en claro solo se muestran en la sesión en que se generaron.
 */
export function GenerarClavesModal({ isOpen, onClose, apoderados, onGeneradas }: GenerarClavesModalProps) {
  const [modo, setModo] = useState<Modo>('faltantes');
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoGeneracion | null>(null);

  const sinClave = apoderados.filter((ap) => !ap.tiene_clave).length;
  const total = apoderados.length;

  // Al reabrir, siempre en el paso de configuración
  useEffect(() => {
    if (!isOpen) {
      setResultado(null);
      setModo('faltantes');
    }
  }, [isOpen]);

  const cerrar = () => {
    setResultado(null);
    setModo('faltantes');
    onClose();
  };

  const generar = async () => {
    try {
      setGenerando(true);
      const res = await fetch('/api/educacion/apoderados/generar-claves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al generar las claves');
        return;
      }
      setResultado({
        generadas: data.generadas || 0,
        credenciales: data.credenciales || [],
      });
      onGeneradas();
    } catch (error) {
      console.error('Error generando claves:', error);
      alert('Error al generar las claves');
    } finally {
      setGenerando(false);
    }
  };

  const descargarCSV = () => {
    if (!resultado) return;
    const hoy = new Date().toISOString().slice(0, 10);
    downloadCSV(
      filasCsvCredenciales(resultado.credenciales),
      `credenciales_apoderados_${hoy}`,
      ';'
    );
  };

  const opcionClase = (activa: boolean) =>
    `flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
      activa ? 'border-sunshine bg-sunshine/15' : 'border-slate-200 hover:bg-slate-50'
    }`;

  return (
    <Modal isOpen={isOpen} onClose={cerrar} title="Generar claves de acceso" size="lg">
      {!resultado ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Las claves permiten a los apoderados ingresar al portal. Se muestran <strong>una sola vez</strong>:
            descarga el CSV y entrégalo al colegio; después no se pueden recuperar.
          </p>

          <label className={opcionClase(modo === 'faltantes')}>
            <input
              type="radio"
              name="modo-generacion-claves"
              className="mt-1 accent-sunshine"
              checked={modo === 'faltantes'}
              onChange={() => setModo('faltantes')}
            />
            <span>
              <span className="block text-sm font-bold text-ink">
                Solo las que no tienen clave ({sinClave})
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">
                Ideal para el primer reparto: no toca a quienes ya ingresan.
              </span>
            </span>
          </label>

          <label className={opcionClase(modo === 'todas')}>
            <input
              type="radio"
              name="modo-generacion-claves"
              className="mt-1 accent-sunshine"
              checked={modo === 'todas'}
              onChange={() => setModo('todas')}
            />
            <span>
              <span className="block text-sm font-bold text-ink">
                Todas las cuentas ({total})
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">
                Se reemplazan las claves actuales: quien ya ingresaba deberá usar la nueva del CSV.
              </span>
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className={SECONDARY_ACTION} onClick={cerrar}>
              Cancelar
            </Button>
            <Button
              type="button"
              className={PRIMARY_ACTION}
              onClick={generar}
              disabled={generando || (modo === 'faltantes' && sinClave === 0)}
            >
              {generando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Generar claves
                </>
              )}
            </Button>
          </div>
        </div>
      ) : resultado.generadas === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">No hay apoderados sin clave: todos ya pueden ingresar.</p>
          <div className="flex justify-end">
            <Button type="button" variant="outline" className={SECONDARY_ACTION} onClick={cerrar}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-ink">
              {resultado.generadas} {resultado.generadas === 1 ? 'clave generada' : 'claves generadas'}
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
              Guarda el CSV ahora: por seguridad, estas claves no se vuelven a mostrar.
            </p>
          </div>

          <div className="border rounded-lg max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr className="border-b">
                  <th className="text-left px-3 py-2 font-medium text-slate-600">Nombre</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">Correo</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">Clave</th>
                </tr>
              </thead>
              <tbody>
                {resultado.credenciales.map((credencial, i) => (
                  <tr key={`${credencial.rut}-${i}`} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      {credencial.nombres} {credencial.apellido_paterno}{' '}
                      {credencial.apellido_materno || ''}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{credencial.email || '-'}</td>
                    <td className="px-3 py-2 font-mono font-bold text-ink select-all">{credencial.clave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className={SECONDARY_ACTION} onClick={cerrar}>
              Cerrar
            </Button>
            <Button type="button" className={PRIMARY_ACTION} onClick={descargarCSV}>
              <Download className="h-4 w-4 mr-2" />
              Descargar CSV
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
