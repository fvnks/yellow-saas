/**
 * Chilean Payroll Calculation Engine
 * Based on 2024-2025 labor law rates
 */

export const UF_VALUE_CLP = 38500; // Approximate UF value in CLP (update periodically)

// ── AFP Rates ──
export const AFP_FUNDS: Record<string, { si: number; commission: number }> = {
  'AFP Habitat': { si: 10.58, commission: 0.60 },
  'AFP Cuprum': { si: 10.77, commission: 0.60 },
  'AFP ProVida': { si: 10.70, commission: 0.60 },
  'AFP Capital': { si: 11.14, commission: 0.60 },
  'AFP Modelo': { si: 10.59, commission: 0.49 },
  'AFP Uno': { si: 10.58, commission: 0.58 },
  'AFP Provida': { si: 10.70, commission: 0.60 },
};

// ── FONASA rates ──
export const FONASA_RATE = 7; // 7% of remuneration imponible

// ── Mutual de Seguridad ──
export const MUTUAL_RATES: Record<string, { base: number; overlay: number }> = {
  'achs': { base: 0.93, overlay: 0 },
  'masisa': { base: 0.93, overlay: 0 },
  'sseg': { base: 0.93, overlay: 0 },
  'sinistralidad_baja': { base: 0.93, overlay: 0 },
  'sinistralidad_media': { base: 0.93, overlay: 1.53 },
  'sinistralidad_alta': { base: 0.93, overlay: 2.10 },
};

// ── SIS rate ──
export const SIS_RATE = 1.53; // 1.53%

// ── AFC (Cesantía) ──
export const AFC_EMPLOYER_INDEFINITE = 0.6;  // 0.6% employer (indefinite)
export const AFC_EMPLOYEE_INDEFINITE = 0.6;  // 0.6% employee (indefinite)
export const AFC_EMPLOYER_FIXED = 2.8;       // 2.8% employer (fixed-term)
export const AFC_EMPLOYEE_FIXED = 3.0;       // 3.0% employee (fixed-term)

// ── Caja de Compensación ──
export const CAJA_COMPENSACION_RATE = 0.6; // 0.6%

// ── Impuesto Único de Segunda Categoría (2024) ──
export const TAX_BRACKETS = [
  { min: 0, max: 921.1, rate: 0, deduction: 0 },
  { min: 921.1, max: 2062.5, rate: 4, deduction: 36.84 },
  { min: 2062.5, max: 3437.5, rate: 8, deduction: 119.34 },
  { min: 3437.5, max: 4812.5, rate: 13.75, deduction: 316.09 },
  { min: 4812.5, max: 6187.5, rate: 20, deduction: 622.34 },
  { min: 6187.5, max: 8662.5, rate: 27, deduction: 1054.84 },
  { min: 8662.5, max: Infinity, rate: 35, deduction: 1750.09 },
];

// ── Gratificación ──
export const GRATIFICATION_MONTHLY_UF_CAP = 4.75; // Max 4.75 UF per month
export const GRATIFICATION_ANNUAL_UF_CAP = 57;    // 4.75 * 12

// ── Aguinaldo (Navidad) ──
export const AGUINALDO_RATE = 0.30; // 30% of December salary
export const AGUINALDO_UF_CAP = 3;  // Max 3 UF

// ── Vacation days ──
export const VACATION_DAYS_AFTER_1_YEAR = 15;
export const VACATION_DAYS_PER_3_YEARS = 1;

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  rut: string;
  base_salary: number;
  contract_type: string;
  afp_fund: string;
  afp_rate: number;
  afp_commission: number;
  health_type: string;
  health_amount: number;
  mutual_type: string;
  mutual_rate: number;
  apv_amount: number;
  hire_date: string;
  status: string;
}

export interface PayrollItem {
  code: string;
  concept: string;
  type: 'earning' | 'deduction';
  category: 'earning' | 'deduction' | 'employer';
  amount: number;
  quantity: number;
  unit_value: number;
  is_taxable: boolean;
  is_employer: boolean;
}

export interface PayrollResult {
  employee_id: string;
  employee_name: string;
  base_salary: number;
  imponible_salary: number;
  items: PayrollItem[];
  total_earnings: number;
  total_deductions: number;
  total_employer_contributions: number;
  total_tax: number;
  net_pay: number;
}

/**
 * Calculate Impuesto Único de Segunda Categoría
 * Uses monthly UF brackets
 */
function calculateImpuestoUnico(monthlyImponible: number): number {
  for (const bracket of TAX_BRACKETS) {
    if (monthlyImponible > bracket.min && monthlyImponible <= bracket.max) {
      return Math.max(0, (monthlyImponible * bracket.rate / 100) - bracket.deduction);
    }
  }
  return 0;
}

/**
 * Calculate monthly UF equivalent from annual amount
 */
function monthlyUF(annualAmount: number): number {
  return annualAmount / 12;
}

/**
 * Calculate gratificación monthly (proportional to months worked)
 */
function calculateGratificacion(monthlySalary: number, hireDate: string, periodEnd: Date): { amount: number; monthsWorked: number } {
  const hire = new Date(hireDate);
  const periodYear = periodEnd.getFullYear();
  const hireYear = hire.getFullYear();

  let monthsWorked: number;
  if (hireYear < periodYear) {
    monthsWorked = 12;
  } else if (hireYear === periodYear) {
    monthsWorked = 12 - hire.getMonth();
  } else {
    monthsWorked = 0;
  }

  const annualSalary = monthlySalary * 12;
  const gratification = (annualSalary / 12) * monthsWorked;
  const gratificationUf = gratification / UF_VALUE_CLP;
  const cappedGratificationUf = Math.min(gratificationUf, GRATIFICATION_MONTHLY_UF_CAP * monthsWorked);
  const amount = cappedGratificationUf * UF_VALUE_CLP;

  return { amount, monthsWorked };
}

/**
 * Calculate aguinaldo de navidad (Christmas bonus)
 * 30% of December salary, max 3 UF
 */
function calculateAguinaldo(monthlySalary: number): number {
  const amount = monthlySalary * AGUINALDO_RATE;
  const amountUf = amount / UF_VALUE_CLP;
  const cappedUf = Math.min(amountUf, AGUINALDO_UF_CAP);
  return cappedUf * UF_VALUE_CLP;
}

/**
 * Calculate days worked in the period
 */
function calculateDaysWorked(hireDate: string, periodStart: Date, periodEnd: Date): number {
  const hire = new Date(hireDate);
  const effectiveStart = hire > periodStart ? hire : periodStart;
  const diffTime = periodEnd.getTime() - effectiveStart.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate proportional salary based on days worked
 */
function calculateProportionalSalary(baseSalary: number, daysWorked: number, periodDays: number): number {
  if (daysWorked >= periodDays) return baseSalary;
  return (baseSalary / periodDays) * daysWorked;
}

/**
 * Main payroll calculation for a single employee
 */
export function calculateEmployeePayroll(
  employee: Employee,
  periodStart: Date,
  periodEnd: Date
): PayrollResult {
  const items: PayrollItem[] = [];
  const periodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysWorked = calculateDaysWorked(employee.hire_date, periodStart, periodEnd);

  // ── Base salary (proportional if started mid-month) ──
  const proportionalSalary = calculateProportionalSalary(employee.base_salary, daysWorked, periodDays);
  const monthlySalary = employee.base_salary;
  const imponibleSalary = proportionalSalary;

  // ═══════════════════════════════════════
  // EARNINGS
  // ═══════════════════════════════════════

  // Sueldo base
  items.push({
    code: 'SB',
    concept: 'Sueldo Base',
    type: 'earning',
    category: 'earning',
    amount: proportionalSalary,
    quantity: 1,
    unit_value: proportionalSalary,
    is_taxable: true,
    is_employer: false,
  });

  // Gratificación (only if period includes the month)
  const gratificacion = calculateGratificacion(monthlySalary, employee.hire_date, periodEnd);
  if (gratificacion.amount > 0 && daysWorked >= 25) {
    items.push({
      code: 'GRAT',
      concept: 'Gratificación',
      type: 'earning',
      category: 'earning',
      amount: gratificacion.amount / 12,
      quantity: 1,
      unit_value: gratificacion.amount / 12,
      is_taxable: true,
      is_employer: false,
    });
  }

  // Aguinaldo (only in December)
  if (periodEnd.getMonth() === 11) {
    const aguinaldo = calculateAguinaldo(monthlySalary);
    items.push({
      code: 'AGUI',
      concept: 'Aguinaldo Navidad',
      type: 'earning',
      category: 'earning',
      amount: aguinaldo,
      quantity: 1,
      unit_value: aguinaldo,
      is_taxable: true,
      is_employer: false,
    });
  }

  // Horas extras (placeholder - to be added via manual input)
  // Bonos (placeholder - to be added via manual input)

  // ═══════════════════════════════════════
  // EMPLOYEE DEDUCTIONS
  // ═══════════════════════════════════════

  const afpFund = AFP_FUNDS[employee.afp_fund] || AFP_FUNDS['AFP Habitat'];
  const afpRate = employee.afp_rate || afpFund.si;
  const afpCommission = employee.afp_commission || afpFund.commission;

  // AFP Pensión
  const afpPension = imponibleSalary * afpRate / 100;
  items.push({
    code: 'AFP',
    concept: `AFP Pensión (${afpFund.si}%)`,
    type: 'deduction',
    category: 'deduction',
    amount: afpPension,
    quantity: 1,
    unit_value: afpPension,
    is_taxable: false,
    is_employer: false,
  });

  // AFP Comisión
  if (afpCommission > 0) {
    const afpComm = imponibleSalary * afpCommission / 100;
    items.push({
      code: 'AFP-COM',
      concept: `AFP Comisión (${afpCommission}%)`,
      type: 'deduction',
      category: 'deduction',
      amount: afpComm,
      quantity: 1,
      unit_value: afpComm,
      is_taxable: false,
      is_employer: false,
    });
  }

  // Salud
  if (employee.health_type === 'isapre' && employee.health_amount > 0) {
    items.push({
      code: 'SALUD',
      concept: 'Isapre',
      type: 'deduction',
      category: 'deduction',
      amount: employee.health_amount,
      quantity: 1,
      unit_value: employee.health_amount,
      is_taxable: false,
      is_employer: false,
    });
  } else {
    const salud = imponibleSalary * FONASA_RATE / 100;
    items.push({
      code: 'SALUD',
      concept: 'FONASA (7%)',
      type: 'deduction',
      category: 'deduction',
      amount: salud,
      quantity: 1,
      unit_value: salud,
      is_taxable: false,
      is_employer: false,
    });
  }

  // AFC Cesantía (employee)
  const afcEmployeeRate = employee.contract_type === 'plazo_fijo' ? AFC_EMPLOYEE_FIXED : AFC_EMPLOYEE_INDEFINITE;
  const afcEmployee = imponibleSalary * afcEmployeeRate / 100;
  items.push({
    code: 'AFC-E',
    concept: `AFC Cesantía (${afcEmployeeRate}%)`,
    type: 'deduction',
    category: 'deduction',
    amount: afcEmployee,
    quantity: 1,
    unit_value: afcEmployee,
    is_taxable: false,
    is_employer: false,
  });

  // APV (Ahorro Previsional Voluntario)
  if (employee.apv_amount > 0) {
    items.push({
      code: 'APV',
      concept: 'APV (Ahorro Voluntario)',
      type: 'deduction',
      category: 'deduction',
      amount: employee.apv_amount,
      quantity: 1,
      unit_value: employee.apv_amount,
      is_taxable: false,
      is_employer: false,
    });
  }

  // Impuesto Único de Segunda Categoría
  const totalDeductionsBeforeTax = items
    .filter(i => i.type === 'deduction' && i.code !== 'IMP-2C')
    .reduce((sum, i) => sum + i.amount, 0);
  const taxableIncome = imponibleSalary - totalDeductionsBeforeTax;
  const impuestoUnico = calculateImpuestoUnico(taxableIncome / UF_VALUE_CLP) * UF_VALUE_CLP;

  if (impuestoUnico > 0) {
    items.push({
      code: 'IMP-2C',
      concept: 'Impuesto Único 2da Categoría',
      type: 'deduction',
      category: 'deduction',
      amount: impuestoUnico,
      quantity: 1,
      unit_value: impuestoUnico,
      is_taxable: false,
      is_employer: false,
    });
  }

  // ═══════════════════════════════════════
  // EMPLOYER CONTRIBUTIONS
  // ═══════════════════════════════════════

  // SIS (Seguro de Invalidez y Sobrevivencia)
  const sis = imponibleSalary * SIS_RATE / 100;
  items.push({
    code: 'SIS',
    concept: `SIS (${SIS_RATE}%)`,
    type: 'deduction',
    category: 'employer',
    amount: sis,
    quantity: 1,
    unit_value: sis,
    is_taxable: false,
    is_employer: true,
  });

  // Mutual de Seguridad
  const mutualRate = employee.mutual_rate || MUTUAL_RATES[employee.mutual_type]?.base || 0.93;
  const mutual = imponibleSalary * mutualRate / 100;
  items.push({
    code: 'MUTUAL',
    concept: `Mutual (${mutualRate}%)`,
    type: 'deduction',
    category: 'employer',
    amount: mutual,
    quantity: 1,
    unit_value: mutual,
    is_taxable: false,
    is_employer: true,
  });

  // AFC Cesantía (employer)
  const afcEmployerRate = employee.contract_type === 'plazo_fijo' ? AFC_EMPLOYER_FIXED : AFC_EMPLOYER_INDEFINITE;
  const afcEmployer = imponibleSalary * afcEmployerRate / 100;
  items.push({
    code: 'AFC-EM',
    concept: `AFC Cesantía Empleador (${afcEmployerRate}%)`,
    type: 'deduction',
    category: 'employer',
    amount: afcEmployer,
    quantity: 1,
    unit_value: afcEmployer,
    is_taxable: false,
    is_employer: true,
  });

  // Caja de Compensación
  const caja = imponibleSalary * CAJA_COMPENSACION_RATE / 100;
  items.push({
    code: 'CAJA',
    concept: `Caja Compensación (${CAJA_COMPENSACION_RATE}%)`,
    type: 'deduction',
    category: 'employer',
    amount: caja,
    quantity: 1,
    unit_value: caja,
    is_taxable: false,
    is_employer: true,
  });

  // Gratificación (employer expense)
  if (gratificacion.amount > 0 && daysWorked >= 25) {
    items.push({
      code: 'GRAT-EM',
      concept: 'Gratificación (Empleador)',
      type: 'deduction',
      category: 'employer',
      amount: gratificacion.amount / 12,
      quantity: 1,
      unit_value: gratificacion.amount / 12,
      is_taxable: false,
      is_employer: true,
    });
  }

  // ── Totals ──
  const totalEarnings = items.filter(i => i.category === 'earning').reduce((sum, i) => sum + i.amount, 0);
  const totalDeductions = items.filter(i => i.category === 'deduction' && !i.is_employer).reduce((sum, i) => sum + i.amount, 0);
  const totalEmployer = items.filter(i => i.category === 'employer').reduce((sum, i) => sum + i.amount, 0);
  const totalTax = items.filter(i => i.code === 'IMP-2C').reduce((sum, i) => sum + i.amount, 0);
  const netPay = totalEarnings - totalDeductions - totalTax;

  return {
    employee_id: employee.id,
    employee_name: `${employee.first_name} ${employee.last_name}`,
    base_salary: monthlySalary,
    imponible_salary: imponibleSalary,
    items,
    total_earnings: totalEarnings,
    total_deductions: totalDeductions,
    total_employer_contributions: totalEmployer,
    total_tax: totalTax,
    net_pay: netPay,
  };
}

/**
 * Calculate payroll for all employees in a period
 */
export function calculatePayroll(
  employees: Employee[],
  periodStart: Date,
  periodEnd: Date
): PayrollResult[] {
  return employees
    .filter(e => e.status === 'active')
    .map(e => calculateEmployeePayroll(e, periodStart, periodEnd));
}

/**
 * Get summary from payroll results
 */
export function getPayrollSummary(results: PayrollResult[]) {
  return {
    employee_count: results.length,
    gross_amount: results.reduce((sum, r) => sum + r.total_earnings, 0),
    total_deductions: results.reduce((sum, r) => sum + r.total_deductions, 0),
    total_employer: results.reduce((sum, r) => sum + r.total_employer_contributions, 0),
    total_tax: results.reduce((sum, r) => sum + r.total_tax, 0),
    net_amount: results.reduce((sum, r) => sum + r.net_pay, 0),
  };
}
