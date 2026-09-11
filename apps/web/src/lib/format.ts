export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatRUT(rut: string): string {
  if (!rut) return '';
  const clean = rut.replace(/[^0-9kK]/g, '');
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

export function parseRUT(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toLowerCase();
}
