/**
 * Devuelve el secreto JWT desde el entorno, codificado como Uint8Array para `jose`.
 * Falla explícitamente si la variable de entorno no está configurada,
 * en lugar de usar un valor hardcodeado inseguro.
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'La variable de entorno JWT_SECRET es requerida. Configúrala antes de iniciar la aplicación.'
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Devuelve la lista de variables de entorno requeridas que faltan.
 */
export function getMissingEnvVars(required: readonly string[]): string[] {
  return required.filter((name) => !process.env[name]);
}

/**
 * Valida las variables de entorno requeridas y lanza un error explícito
 * si falta alguna. En producción exige además DATABASE_URL y
 * NEXT_PUBLIC_APP_URL, que son indispensables para operar.
 */
export function validateEnvVars(): void {
  const required: string[] = ['JWT_SECRET'];

  if (process.env.NODE_ENV === 'production') {
    required.push('DATABASE_URL', 'NEXT_PUBLIC_APP_URL');
  }

  const missing = getMissingEnvVars(required);
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${missing.join(', ')}. ` +
        'Revisa la configuración del entorno antes de iniciar la aplicación.'
    );
  }
}
