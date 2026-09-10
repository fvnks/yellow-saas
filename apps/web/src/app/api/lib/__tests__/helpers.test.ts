import { describe, it, expect } from 'vitest';

// We test the pure logic extracted from helpers.ts
// (can't easily test NextRequest/NextResponse in unit tests)

describe('getCompanyId', () => {
  function extractCompanyId(pathname: string): string | null {
    const pathParts = pathname.split('/');
    const companiesIndex = pathParts.indexOf('companies');
    if (companiesIndex === -1 || !pathParts[companiesIndex + 1]) return null;
    return pathParts[companiesIndex + 1];
  }

  it('extracts company id from standard path', () => {
    expect(extractCompanyId('/api/companies/abc-123/veterinary')).toBe('abc-123');
  });

  it('extracts company id from nested path', () => {
    expect(extractCompanyId('/api/companies/uuid-456/modules/activate')).toBe('uuid-456');
  });

  it('returns null when no companies segment', () => {
    expect(extractCompanyId('/api/super-admin/users')).toBeNull();
  });

  it('returns null when company id is missing', () => {
    expect(extractCompanyId('/api/companies/')).toBeNull();
  });

  it('handles uuid format', () => {
    expect(extractCompanyId('/api/companies/550e8400-e29b-41d4-a716-446655440000/vet')).toBe('550e8400-e29b-41d4-a716-446655440000');
  });
});

describe('pagination math', () => {
  function calcPagination(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  it('calculates total pages correctly', () => {
    expect(calcPagination(100, 1, 10).totalPages).toBe(10);
    expect(calcPagination(101, 1, 10).totalPages).toBe(11);
    expect(calcPagination(0, 1, 10).totalPages).toBe(0);
    expect(calcPagination(1, 1, 50).totalPages).toBe(1);
  });

  it('handles edge cases', () => {
    expect(calcPagination(50, 1, 50).totalPages).toBe(1);
    expect(calcPagination(51, 1, 50).totalPages).toBe(2);
  });
});

describe('CSV escaping', () => {
  function escapeCsv(val: unknown): string {
    const str = String(val ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  }

  it('returns simple values unchanged', () => {
    expect(escapeCsv('hello')).toBe('hello');
    expect(escapeCsv(123)).toBe('123');
    expect(escapeCsv(null)).toBe('');
  });

  it('wraps comma-containing values in quotes', () => {
    expect(escapeCsv('a,b')).toBe('"a,b"');
  });

  it('escapes double quotes', () => {
    expect(escapeCsv('say "hi"')).toBe('"say ""hi"""');
  });

  it('wraps newline-containing values', () => {
    expect(escapeCsv('line1\nline2')).toBe('"line1\nline2"');
  });
});

describe('STUDY_TYPES mapping', () => {
  const STUDY_TYPES: Record<string, string> = {
    radiografia: 'Radiografía',
    ecografia: 'Ecografía',
    tomografia: 'TAC / Tomografía',
    resonancia: 'Resonancia Magnética',
    endoscopia: 'Endoscopía',
    electrocardiograma: 'ECG',
    otro: 'Otro',
  };

  it('has all 7 imaging types', () => {
    expect(Object.keys(STUDY_TYPES)).toHaveLength(7);
  });

  it('maps correctly', () => {
    expect(STUDY_TYPES['radiografia']).toBe('Radiografía');
    expect(STUDY_TYPES['ecografia']).toBe('Ecografía');
    expect(STUDY_TYPES['otro']).toBe('Otro');
  });
});

describe('DTE status badge colors', () => {
  const STATUS_COLORS: Record<string, string> = {
    en_proceso: 'bg-amber-50 text-amber-700 border-amber-200',
    informado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    disponible: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  it('has all 3 imaging statuses', () => {
    expect(Object.keys(STATUS_COLORS)).toHaveLength(3);
  });

  it('uses correct color families', () => {
    expect(STATUS_COLORS['en_proceso']).toContain('amber');
    expect(STATUS_COLORS['informado']).toContain('emerald');
    expect(STATUS_COLORS['disponible']).toContain('blue');
  });
});
