import { randomInt } from 'node:crypto';

/**
 * Generación de claves temporales para apoderados (educación → Apoderados).
 *
 * Criterios:
 * - Alfabeto sin caracteres ambiguos (0/O, 1/l/I) para que la clave se lea
 *   bien cuando el colegio la reparte impresa o por CSV.
 * - Siempre incluye mayúscula, minúscula y dígito.
 * - `crypto.randomInt` en lugar de `Math.random`: la clave es un secreto.
 */

const MAYUSCULAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sin I, O
const MINUSCULAS = 'abcdefghijkmnpqrstuvwxyz'; // sin l, o
const DIGITOS = '23456789'; // sin 0, 1
const ALFABETO = MAYUSCULAS + MINUSCULAS + DIGITOS;

/**
 * Genera una clave aleatoria de `longitud` caracteres (por defecto 10,
 * acotada entre 8 y 32) garantizando al menos una mayúscula, una minúscula
 * y un dígito, en orden aleatorio.
 */
export function generarClave(longitud = 10): string {
  const largo = Math.max(8, Math.min(32, Math.round(longitud)));

  const caracteres: string[] = [
    MAYUSCULAS[randomInt(MAYUSCULAS.length)],
    MINUSCULAS[randomInt(MINUSCULAS.length)],
    DIGITOS[randomInt(DIGITOS.length)],
  ];
  while (caracteres.length < largo) {
    caracteres.push(ALFABETO[randomInt(ALFABETO.length)]);
  }

  // Fisher–Yates con criptografía segura
  for (let i = caracteres.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const tmp = caracteres[i];
    caracteres[i] = caracteres[j];
    caracteres[j] = tmp;
  }

  return caracteres.join('');
}
