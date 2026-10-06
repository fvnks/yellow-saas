/**
 * Filas del CSV de credenciales que el colegio reparte a los apoderados.
 * El texto plano de las claves solo existe en el momento de generarlas
 * (el servidor solo conserva el hash); este módulo arma las filas para
 * exportarlas desde el cliente.
 */

export interface CredencialApoderado {
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  rut: string;
  email?: string | null;
  clave: string;
}

/** Nombre completo del apoderado en una sola línea. */
export function nombreCompleto(credencial: CredencialApoderado): string {
  return [credencial.nombres, credencial.apellido_paterno, credencial.apellido_materno]
    .filter(Boolean)
    .join(' ');
}

/**
 * Convierte las credenciales en filas con encabezados legibles, en el
 * orden en que se exportan: Nombre, RUT, Correo, Clave.
 * Sin correo se exporta `-` (esos apoderados ingresan con RUT o nombre).
 */
export function filasCsvCredenciales(
  credenciales: CredencialApoderado[]
): Array<Record<string, string>> {
  return credenciales.map((credencial) => ({
    Nombre: nombreCompleto(credencial),
    RUT: credencial.rut,
    Correo: credencial.email || '-',
    Clave: credencial.clave,
  }));
}
