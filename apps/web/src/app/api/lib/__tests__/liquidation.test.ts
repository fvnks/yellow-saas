import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setUFValue } from '@/lib/payroll/index';

// Mock the db module
const mockQuery = vi.fn();
vi.mock('@/api/lib/db', () => ({
  query: (...args: any[]) => mockQuery(...args),
}));

import {
  calculateTermination,
  type TerminationInput,
} from '@/lib/payroll/liquidation';

const COMPANY_ID = 'comp-001';
const EMPLOYEE_ID = 'emp-001';

const EMPLOYEE_ROW = {
  id: EMPLOYEE_ID,
  first_name: 'Juan',
  last_name: 'Pérez',
  rut: '12.345.678-9',
  position: 'Analista',
  department: 'TI',
  contract_type: 'indefinido',
  hire_date: '2020-01-01',
  base_salary: 1_000_000,
};

const EMPTY_VAC_BALANCE = {
  days_earned: 0,
  days_used: 0,
  days_available: 0,
  days_pending: 0,
};

function setupMocks(overrides?: {
  employee?: typeof EMPLOYEE_ROW | null;
  vacBalance?: Record<string, any>;
}) {
  const emp = overrides && 'employee' in overrides ? overrides.employee : EMPLOYEE_ROW;
  const vac = overrides?.vacBalance ?? EMPTY_VAC_BALANCE;

  mockQuery.mockImplementation(async (sql: string, params: any[]) => {
    if (sql.includes('FROM vacation_balances')) {
      return { rows: vac.days_earned !== undefined ? [vac] : [] };
    }
    if (sql.includes('FROM employees WHERE')) {
      return { rows: emp ? [emp] : [] };
    }
    return { rows: [] };
  });
}

describe('cálculos de liquidación laboral chilena', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setUFValue(100_000); // High UF so caps don't interfere with basic tests
  });

  describe('despido sin causa (Art. 161)', () => {
    it('calcula sueldo proporcional del mes', async () => {
      setupMocks();
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-15',
      });

      const sueldoItem = result.items.find(i => i.code === 'LIQ-SUELDO');
      expect(sueldoItem).toBeDefined();
      expect(sueldoItem!.amount).toBe(500_000);
    });

    it('no genera sueldo proporcional si trabaja todo el mes', async () => {
      setupMocks();
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-30',
      });

      expect(result.items.find(i => i.code === 'LIQ-SUELDO')).toBeUndefined();
    });

    it('calcula indemnización por antigüedad', async () => {
      setupMocks({ employee: { ...EMPLOYEE_ROW, hire_date: '2020-01-01' } });
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-30',
      });

      const indItem = result.items.find(i => i.code === 'LIQ-IND-ANT');
      expect(indItem).toBeDefined();
      expect(indItem!.amount).toBe(5_000_000);
      expect(indItem!.taxable).toBe(false);
    });

    it('indemnización se topea a 11 meses', async () => {
      setupMocks({ employee: { ...EMPLOYEE_ROW, hire_date: '2010-01-01', base_salary: 500_000 } });
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-30',
      });

      // 15 años → cap 11 meses × $500_000 = $5_500_000 (under 9M UF cap)
      expect(result.items.find(i => i.code === 'LIQ-IND-ANT')!.amount).toBe(5_500_000);
    });

    it('indemnización se topea a 90 UF', async () => {
      setupMocks({ employee: { ...EMPLOYEE_ROW, hire_date: '2015-01-01', base_salary: 10_000_000 } });
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-30',
      });

      // 10 años × 10M = 100M, pero cap 90 UF × 100K = 9M
      expect(result.items.find(i => i.code === 'LIQ-IND-ANT')!.amount).toBe(9_000_000);
    });

    it('incluye aviso previo si no se dio', async () => {
      setupMocks();
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-30',
        notice_given: false,
      });

      expect(result.items.find(i => i.code === 'LIQ-AVISO')!.amount).toBe(1_000_000);
      expect(result.items.find(i => i.code === 'LIQ-PEN-AVISO')!.amount).toBe(250_000);
    });

    it('no incluye aviso previo si se dio', async () => {
      setupMocks();
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-30',
        notice_given: true,
      });

      expect(result.items.find(i => i.code === 'LIQ-AVISO')).toBeUndefined();
    });
  });

  describe('mutuo acuerdo (Art. 172)', () => {
    it('calcula 50% de la antigüedad', async () => {
      setupMocks({ employee: { ...EMPLOYEE_ROW, hire_date: '2020-01-01' } });
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'mutuo_acuerdo',
        termination_date: '2025-06-30',
      });

      expect(result.items.find(i => i.code === 'LIQ-MUT-ANT')!.amount).toBe(2_500_000);
    });

    it('incluye caja de compensación', async () => {
      setupMocks();
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'mutuo_acuerdo',
        termination_date: '2025-06-30',
      });

      expect(result.items.find(i => i.code === 'LIQ-CAJA')).toBeDefined();
    });
  });

  describe('despido con causa (Art. 159)', () => {
    it('no genera gratificación ni aguinaldo', async () => {
      setupMocks();
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_con_causa',
        termination_date: '2025-06-30',
      });

      expect(result.items.find(i => i.code === 'LIQ-GRAT')).toBeUndefined();
      expect(result.items.find(i => i.code === 'LIQ-AGUINALDO')).toBeUndefined();
    });

    it('no genera indemnización', async () => {
      setupMocks({ employee: { ...EMPLOYEE_ROW, hire_date: '2010-01-01' } });
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_con_causa',
        termination_date: '2025-06-30',
      });

      expect(result.items.find(i => i.code === 'LIQ-IND-ANT')).toBeUndefined();
    });
  });

  describe('gratificación proporcional', () => {
    it('calcula 25% proporcional', async () => {
      setupMocks({ employee: { ...EMPLOYEE_ROW, hire_date: '2025-01-01' } });
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-30',
      });

      // monthsBetween + 1 = 7 months worked this year
      expect(result.items.find(i => i.code === 'LIQ-GRAT')!.amount).toBe(1_750_000);
    });

    it('se topea a 4.75 IMM', async () => {
      setupMocks({ employee: { ...EMPLOYEE_ROW, base_salary: 20_000_000, hire_date: '2025-01-01' } });
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-30',
      });

      // 7 months × 4.75 IMM × 500K = 16_625_000
      expect(result.items.find(i => i.code === 'LIQ-GRAT')!.amount).toBe(16_625_000);
    });
  });

  describe('vacaciones', () => {
    it('calcula vacaciones proporcionales', async () => {
      setupMocks({
        employee: { ...EMPLOYEE_ROW, hire_date: '2025-01-01' },
        vacBalance: { days_earned: 15, days_used: 5, days_available: 10, days_pending: 5 },
      });
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-30',
      });

      expect(result.items.find(i => i.code === 'LIQ-VAC-PROP')!.amount).toBe(500_000);
    });

    it('incluye vacaciones pendientes', async () => {
      setupMocks({
        employee: { ...EMPLOYEE_ROW, hire_date: '2025-01-01' },
        vacBalance: { days_earned: 15, days_used: 5, days_available: 10, days_pending: 5 },
      });
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-30',
      });

      expect(result.items.find(i => i.code === 'LIQ-VAC-PEND')!.amount).toBe(166_667);
    });
  });

  describe('errores', () => {
    it('lanza error si empleado no existe', async () => {
      setupMocks({ employee: null });
      await expect(
        calculateTermination(COMPANY_ID, {
          employee_id: EMPLOYEE_ID,
          termination_type: 'despido_sin_causa',
          termination_date: '2025-06-30',
        })
      ).rejects.toThrow('Empleado no encontrado');
    });
  });

  describe('totales', () => {
    it('suma correctamente earnings, severance, notice', async () => {
      setupMocks({ employee: { ...EMPLOYEE_ROW, hire_date: '2020-01-01' } });
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-30',
        notice_given: false,
      });

      expect(result.totals.earnings).toBeGreaterThan(0);
      expect(result.totals.severance).toBe(5_000_000); // 5 años × 1M
      expect(result.totals.notice).toBe(1_250_000); // 1M + 250K
      expect(result.totals.net_total).toBe(
        result.totals.earnings + result.totals.severance + result.totals.compensation + result.totals.notice - result.totals.deductions
      );
    });
  });

  describe('campos del resultado', () => {
    it('retorna metadatos del empleado correctamente', async () => {
      setupMocks();
      const result = await calculateTermination(COMPANY_ID, {
        employee_id: EMPLOYEE_ID,
        termination_type: 'despido_sin_causa',
        termination_date: '2025-06-30',
      });

      expect(result.employee_name).toBe('Juan Pérez');
      expect(result.employee_rut).toBe('12.345.678-9');
      expect(result.position).toBe('Analista');
      expect(result.department).toBe('TI');
      expect(result.contract_type).toBe('indefinido');
      expect(result.base_salary).toBe(1_000_000);
      expect(result.termination_type).toBe('despido_sin_causa');
      expect(result.termination_date).toBe('2025-06-30');
      expect(result.years_of_service).toBeGreaterThan(4);
    });
  });
});
