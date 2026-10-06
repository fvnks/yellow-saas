import { describe, it, expect } from 'vitest';
import { filasCsvCredenciales, nombreCompleto, CredencialApoderado } from '../credenciales-csv';

const base: CredencialApoderado = {
  nombres: 'María José',
  apellido_paterno: 'González',
  apellido_materno: 'Pérez',
  rut: '12.345.678-5',
  email: 'maria.gonzalez@correo.cl',
  clave: 'Abc7xK2mQ9',
};

describe('nombreCompleto', () => {
  it('une nombres y apellidos', () => {
    expect(nombreCompleto(base)).toBe('María José González Pérez');
  });

  it('funciona sin apellido materno', () => {
    expect(nombreCompleto({ ...base, apellido_materno: null })).toBe('María José González');
  });
});

describe('filasCsvCredenciales', () => {
  it('produce filas con los encabezados Nombre, RUT, Correo, Clave en ese orden', () => {
    const filas = filasCsvCredenciales([base]);
    expect(filas).toHaveLength(1);
    expect(Object.keys(filas[0])).toEqual(['Nombre', 'RUT', 'Correo', 'Clave']);
    expect(filas[0]).toEqual({
      Nombre: 'María José González Pérez',
      RUT: '12.345.678-5',
      Correo: 'maria.gonzalez@correo.cl',
      Clave: 'Abc7xK2mQ9',
    });
  });

  it('usa "-" cuando el apoderado no tiene correo (ingresa con RUT o nombre)', () => {
    const filas = filasCsvCredenciales([{ ...base, email: null }]);
    expect(filas[0].Correo).toBe('-');
  });

  it('procesa varias credenciales en el mismo orden', () => {
    const otra: CredencialApoderado = {
      ...base,
      nombres: 'Juan',
      apellido_paterno: 'Soto',
      apellido_materno: undefined,
      rut: '9.876.543-1',
      email: null,
      clave: 'Zz4nR8pL2w',
    };
    const filas = filasCsvCredenciales([base, otra]);
    expect(filas).toHaveLength(2);
    expect(filas[1].Nombre).toBe('Juan Soto');
    expect(filas[1].Clave).toBe('Zz4nR8pL2w');
  });
});
