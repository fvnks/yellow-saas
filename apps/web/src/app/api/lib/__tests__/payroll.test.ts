import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateEmployeePayroll,
  calculatePayroll,
  getPayrollSummary,
  setUFValue,
  getUFValue,
  AFP_FUNDS,
  FONASA_RATE,
  SIS_RATE,
  AFC_EMPLOYEE_INDEFINITE,
  AFC_EMPLOYEE_FIXED,
  AFC_EMPLOYER_INDEFINITE,
  AFC_EMPLOYER_FIXED,
  GRATIFICATION_MONTHLY_UF_CAP,
  AGUINALDO_RATE,
  AGUINALDO_UF_CAP,
  TAX_BRACKETS,
  type Employee,
} from '@/lib/payroll/index';

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 'emp-001',
    first_name: 'Juan',
    last_name: 'Pérez',
    rut: '12.345.678-9',
    base_salary: 1_000_000,
    contract_type: 'indefinido',
    afp_fund: 'AFP Habitat',
    afp_rate: 10.58,
    afp_commission: 0.60,
    health_type: 'fonasa',
    health_amount: 0,
    mutual_type: 'achs',
    mutual_rate: 0.93,
    apv_amount: 0,
    hire_date: '2023-01-01',
    status: 'active',
    ...overrides,
  };
}

const PERIOD_START = new Date('2025-06-01');
const PERIOD_END = new Date('2025-06-30');

describe('cálculos de nómina chilena', () => {
  beforeEach(() => {
    setUFValue(38_500);
  });

  describe('netPay = totalEarnings - totalDeductions', () => {
    it('calcula net pay correctamente para sueldo base sin deducciones manuales', () => {
      const emp = makeEmployee();
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      expect(result.net_pay).toBe(result.total_earnings - result.total_deductions);
    });

    it('net pay es menor que bruto cuando hay deducciones', () => {
      const emp = makeEmployee({ base_salary: 1_500_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      expect(result.net_pay).toBeLessThan(result.total_earnings);
      expect(result.total_deductions).toBeGreaterThan(0);
    });

    it('net pay se reduce con deducciones manuales', () => {
      const emp = makeEmployee();
      const sinExtras = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);
      const conExtras = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END, {
        deductions: [{ concept: 'Anticipo', amount: 100_000 }],
      });

      expect(conExtras.net_pay).toBe(sinExtras.net_pay - 100_000);
    });
  });

  describe('IMP-2C (Impuesto Único de Segunda Categoría)', () => {
    it('no se aplica impuesto en tramo exento (menos de 921.1 UF mensuales)', () => {
      const emp = makeEmployee({ base_salary: 500_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const taxItem = result.items.find(i => i.code === 'IMP-2C');
      expect(taxItem).toBeUndefined();
      expect(result.total_tax).toBe(0);
    });

    it('se aplica impuesto para sueldo alto (tramo 4%)', () => {
      // 40M CLP / 38500 = ~1039 UF → inside 4% bracket (921.1-2062.5)
      const emp = makeEmployee({ base_salary: 40_000_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const taxItem = result.items.find(i => i.code === 'IMP-2C');
      expect(taxItem).toBeDefined();
      expect(taxItem!.amount).toBeGreaterThan(0);
      expect(result.total_tax).toBeGreaterThan(0);
    });

    it('el impuesto se aplica exactamente una vez', () => {
      const emp = makeEmployee({ base_salary: 40_000_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const taxItems = result.items.filter(i => i.code === 'IMP-2C');
      expect(taxItems).toHaveLength(1);
    });

    it('el impuesto se calcula sobre imponible bruto (antes de AFP/FONASA)', () => {
      const emp = makeEmployee({ base_salary: 40_000_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const imponibleUF = result.imponible_salary / getUFValue();
      const bracket = TAX_BRACKETS.find(
        b => imponibleUF > b.min && imponibleUF <= b.max
      )!;
      const expectedTax = Math.max(0, (imponibleUF * bracket.rate / 100) - bracket.deduction) * getUFValue();

      expect(result.total_tax).toBeCloseTo(expectedTax, -2);
    });

    it('sueldo bajo no genera impuesto', () => {
      const emp = makeEmployee({ base_salary: 1_000_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      expect(result.total_tax).toBe(0);
    });
  });

  describe('gratificación', () => {
    it('no aplica si trabajó menos de 25 días en el período', () => {
      const emp = makeEmployee({ hire_date: '2025-06-25' });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const gratItem = result.items.find(i => i.code === 'GRAT');
      expect(gratItem).toBeUndefined();
    });

    it('aplica gratificación si trabajó 25+ días', () => {
      const emp = makeEmployee({ hire_date: '2025-06-01' });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const gratItem = result.items.find(i => i.code === 'GRAT');
      expect(gratItem).toBeDefined();
      expect(gratItem!.amount).toBeGreaterThan(0);
    });

    it('gratificación es 25% de ganancias anuales, tope 4.75 UF mensual', () => {
      const emp = makeEmployee({ base_salary: 1_000_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const gratItem = result.items.find(i => i.code === 'GRAT');
      const annualSalary = emp.base_salary * 12;
      const expectedGrat = (annualSalary * 0.25) / 12;
      const capUf = GRATIFICATION_MONTHLY_UF_CAP * getUFValue();
      const expectedCapped = Math.min(expectedGrat, capUf);

      expect(gratItem!.amount).toBeCloseTo(expectedCapped, -2);
    });

    it('gratificación se topea a 4.75 UF para salaries altos', () => {
      const emp = makeEmployee({ base_salary: 10_000_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const gratItem = result.items.find(i => i.code === 'GRAT');
      const capMonthly = GRATIFICATION_MONTHLY_UF_CAP * getUFValue();

      expect(gratItem!.amount).toBeLessThanOrEqual(capMonthly + 1);
    });
  });

  describe('deducciones AFP', () => {
    it('AFP Habitat descuenta 10.58% de pensión', () => {
      const emp = makeEmployee({ afp_fund: 'AFP Habitat', afp_rate: 10.58, afp_commission: 0.60 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const afpItem = result.items.find(i => i.code === 'AFP');
      expect(afpItem).toBeDefined();
      expect(afpItem!.amount).toBeCloseTo(result.taxable_salary * 10.58 / 100, -2);
    });

    it('AFP descuenta comisión adicional', () => {
      const emp = makeEmployee({ afp_fund: 'AFP Habitat', afp_rate: 10.58, afp_commission: 0.60 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const afpCommItem = result.items.find(i => i.code === 'AFP-COM');
      expect(afpCommItem).toBeDefined();
      expect(afpCommItem!.amount).toBeCloseTo(result.taxable_salary * 0.60 / 100, -2);
    });

    it('AFP se calcula sobre imponible con tope de 80 UF', () => {
      const highSalary = 50_000_000;
      const emp = makeEmployee({ base_salary: highSalary, afp_fund: 'AFP Habitat', afp_rate: 10.58, afp_commission: 0.60 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const capUf = 80 * getUFValue();
      const expectedAfp = capUf * 10.58 / 100;
      const afpItem = result.items.find(i => i.code === 'AFP');

      expect(afpItem!.amount).toBeCloseTo(expectedAfp, -2);
    });

    it('todos los fondos AFP tienen tasas válidas', () => {
      for (const [name, fund] of Object.entries(AFP_FUNDS)) {
        expect(fund.si).toBeGreaterThan(0);
        expect(fund.si).toBeLessThan(20);
        expect(fund.commission).toBeGreaterThanOrEqual(0);
        expect(fund.commission).toBeLessThan(5);
      }
    });
  });

  describe('deducciones de salud', () => {
    it('FONASA descuenta 7% del imponible', () => {
      const emp = makeEmployee({ health_type: 'fonasa' });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const saludItem = result.items.find(i => i.code === 'SALUD');
      expect(saludItem).toBeDefined();
      expect(saludItem!.amount).toBeCloseTo(result.taxable_salary * FONASA_RATE / 100, -2);
    });

    it('Isapre usa monto fijo del empleado', () => {
      const emp = makeEmployee({ health_type: 'isapre', health_amount: 80_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const saludItem = result.items.find(i => i.code === 'SALUD');
      expect(saludItem).toBeDefined();
      expect(saludItem!.amount).toBe(80_000);
    });

    it('FONASA se calcula sobre imponible con tope de 80 UF', () => {
      const highSalary = 50_000_000;
      const emp = makeEmployee({ base_salary: highSalary, health_type: 'fonasa' });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const capUf = 80 * getUFValue();
      const expectedHealth = capUf * FONASA_RATE / 100;
      const saludItem = result.items.find(i => i.code === 'SALUD');

      expect(saludItem!.amount).toBeCloseTo(expectedHealth, -2);
    });
  });

  describe('AFC Cesantía', () => {
    it('contrato indefinido: empleado paga 0.6%', () => {
      const emp = makeEmployee({ contract_type: 'indefinido' });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const afcItem = result.items.find(i => i.code === 'AFC-E');
      expect(afcItem).toBeDefined();
      expect(afcItem!.amount).toBeCloseTo(result.taxable_salary * AFC_EMPLOYEE_INDEFINITE / 100, -2);
    });

    it('contrato plazo fijo: empleado paga 3.0%', () => {
      const emp = makeEmployee({ contract_type: 'plazo_fijo' });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const afcItem = result.items.find(i => i.code === 'AFC-E');
      expect(afcItem).toBeDefined();
      expect(afcItem!.amount).toBeCloseTo(result.taxable_salary * AFC_EMPLOYEE_FIXED / 100, -2);
    });

    it('empleador paga 0.6% indefinido, 2.8% plazo fijo', () => {
      const indefinido = calculateEmployeePayroll(makeEmployee({ contract_type: 'indefinido' }), PERIOD_START, PERIOD_END);
      const plazoFijo = calculateEmployeePayroll(makeEmployee({ contract_type: 'plazo_fijo' }), PERIOD_START, PERIOD_END);

      expect(indefinido.items.find(i => i.code === 'AFC-EM')!.amount).toBeCloseTo(indefinido.taxable_salary * AFC_EMPLOYER_INDEFINITE / 100, -2);
      expect(plazoFijo.items.find(i => i.code === 'AFC-EM')!.amount).toBeCloseTo(plazoFijo.taxable_salary * AFC_EMPLOYER_FIXED / 100, -2);
    });
  });

  describe('tope imponible (80 UF)', () => {
    it('salary bajo el tope no se ve afectado', () => {
      // 2.5M + gratificación (~184K) = ~2.68M < 3.08M (80 UF)
      const emp = makeEmployee({ base_salary: 2_500_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      expect(result.taxable_salary).toBe(result.imponible_salary);
    });

    it('salary sobre el tope se limita a 80 UF', () => {
      const emp = makeEmployee({ base_salary: 50_000_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      const capClp = 80 * getUFValue();
      expect(result.taxable_salary).toBe(capClp);
    });
  });

  describe('horas extras', () => {
    it('calcula las primeras 2 horas con recargo del 50%', () => {
      const emp = makeEmployee({ base_salary: 1_000_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END, { overtime_hours: 2 });

      const heItem = result.items.find(i => i.code === 'HE');
      expect(heItem).toBeDefined();

      const hourlyRate = emp.base_salary / 30 / 8;
      const expected = 2 * hourlyRate * 1.5;
      expect(heItem!.amount).toBeCloseTo(expected, -2);
    });

    it('horas beyond 2 tienen recargo del 100%', () => {
      const emp = makeEmployee({ base_salary: 1_000_000 });
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END, { overtime_hours: 4 });

      const heItem = result.items.find(i => i.code === 'HE');
      const hourlyRate = emp.base_salary / 30 / 8;
      const expected = (2 * hourlyRate * 1.5) + (2 * hourlyRate * 2);
      expect(heItem!.amount).toBeCloseTo(expected, -2);
    });

    it('sin horas extras no genera item HE', () => {
      const emp = makeEmployee();
      const result = calculateEmployeePayroll(emp, PERIOD_START, PERIOD_END);

      expect(result.items.find(i => i.code === 'HE')).toBeUndefined();
    });
  });

  describe('aguinaldo de navidad', () => {
    it('solo se paga en diciembre', () => {
      const emp = makeEmployee();
      const novResult = calculateEmployeePayroll(emp, new Date('2025-11-01'), new Date('2025-11-30'));
      const dicResult = calculateEmployeePayroll(emp, new Date('2025-12-01'), new Date('2025-12-31'));

      expect(novResult.items.find(i => i.code === 'AGUI')).toBeUndefined();
      expect(dicResult.items.find(i => i.code === 'AGUI')).toBeDefined();
    });

    it('es 30% del sueldo, tope 3 UF', () => {
      const emp = makeEmployee({ base_salary: 1_000_000 });
      const result = calculateEmployeePayroll(emp, new Date('2025-12-01'), new Date('2025-12-31'));

      const aguinaldo = result.items.find(i => i.code === 'AGUI');
      const expected = Math.min(emp.base_salary * AGUINALDO_RATE / getUFValue(), AGUINALDO_UF_CAP) * getUFValue();
      expect(aguinaldo!.amount).toBeCloseTo(expected, -2);
    });
  });

  describe('calculatePayroll (lote de empleados)', () => {
    it('solo procesa empleados activos', () => {
      const employees = [
        makeEmployee({ id: 'e1', status: 'active' }),
        makeEmployee({ id: 'e2', status: 'inactive' }),
        makeEmployee({ id: 'e3', status: 'active' }),
      ];

      const results = calculatePayroll(employees, PERIOD_START, PERIOD_END);
      expect(results).toHaveLength(2);
      expect(results.map(r => r.employee_id)).toEqual(['e1', 'e3']);
    });
  });

  describe('getPayrollSummary', () => {
    it('resume totales de múltiples empleados', () => {
      const employees = [
        makeEmployee({ id: 'e1', base_salary: 1_000_000 }),
        makeEmployee({ id: 'e2', base_salary: 2_000_000 }),
      ];
      const results = calculatePayroll(employees, PERIOD_START, PERIOD_END);
      const summary = getPayrollSummary(results);

      expect(summary.employee_count).toBe(2);
      expect(summary.gross_amount).toBe(results.reduce((s, r) => s + r.total_earnings, 0));
      expect(summary.net_amount).toBe(results.reduce((s, r) => s + r.net_pay, 0));
    });
  });
});
