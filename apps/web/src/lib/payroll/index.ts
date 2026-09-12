/**
 * Chilean Payroll Calculation Engine
 * Based on 2024-2025 labor law rates
 */

import { getChileanIndicators } from '@/lib/indicators';

// ── Dynamic UF & IMM values (lazy-loaded from indicators API) ──
let _ufValue = 38500;
let _immValue = 500000; // Ingreso Mínimo Mensual 2025 (CLP)

export async function loadIndicators(): Promise<{ uf: number; imm: number }> {
  try {
    const indicators = await getChileanIndicators();
    _ufValue = indicators.uf;
    // IMM is typically fetched from a separate API or DB; fallback to 500k
    _immValue = indicators.utm ? indicators.utm * 12 : 500000;
    return { uf: _ufValue, imm: _immValue };
  } catch {
    return { uf: _ufValue, imm: _immValue };
  }
}

export function setUFValue(value: number) { _ufValue = value; }
export function getUFValue() { return _ufValue; }
export function getImmValue() { return _immValue; }
export const UF_VALUE_CLP = 38500; // legacy alias

// ── Imponible Cap (80 UF) ──
export const IMPONIBLE_CAP_UF = 80;

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
export const FONASA_RATE = 7;

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
export const SIS_RATE = 1.53;

// ── AFC (Cesantía) ──
export const AFC_EMPLOYER_INDEFINITE = 0.6;
export const AFC_EMPLOYEE_INDEFINITE = 0.6;
export const AFC_EMPLOYER_FIXED = 2.8;
export const AFC_EMPLOYEE_FIXED = 3.0;

// ── Caja de Compensación ──
export const CAJA_COMPENSACION_RATE = 0.6;

// ── Impuesto Único de Segunda Categoría (2025, monthly UF) ──
// Table indexed by UTM-derived UF thresholds; update annually
export const TAX_BRACKETS = [
  { min: 0, max: 950.0, rate: 0, deduction: 0 },
  { min: 950.0, max: 2125.0, rate: 4, deduction: 38.0 },
  { min: 2125.0, max: 3542.0, rate: 8, deduction: 123.0 },
  { min: 3542.0, max: 4958.0, rate: 13.75, deduction: 326.0 },
  { min: 4958.0, max: 6375.0, rate: 20, deduction: 642.0 },
  { min: 6375.0, max: 8917.0, rate: 27, deduction: 1087.0 },
  { min: 8917.0, max: Infinity, rate: 35, deduction: 1805.0 },
];

// ── Gratificación (Art. 47) ──
// 25% of annual remuneration, capped at 4.75 IMM per month worked
export const GRATIFICATION_RATE = 0.25;
export const GRATIFICATION_MONTHLY_IMM_CAP = 4.75;

// ── Aguinaldo (Navidad) ──
export const AGUINALDO_RATE = 0.30;
export const AGUINALDO_UF_CAP = 3;

// ── Horas Extras ──
export const OVERTIME_FIRST_2_HOURS_RATE = 0.50;  // +50%
export const OVERTIME_BEYOND_RATE = 1.00;          // +100%
export const OVERTIME_REST_DAY_RATE = 1.00;        // +100%

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
  taxable_salary: number; // imponible used for contributions (capped at 80 UF)
  items: PayrollItem[];
  total_earnings: number;
  total_deductions: number;
  total_employer_contributions: number;
  total_tax: number;
  net_pay: number;
}

/**
 * Apply imponible cap (80 UF) for contribution calculations
 */
function applyImponibleCap(imponible: number): number {
  const capClp = IMPONIBLE_CAP_UF * _ufValue;
  return Math.min(imponible, capClp);
}

/**
 * Calculate Impuesto Único de Segunda Categoría
 * In Chile: applied to monthly taxable remuneration (imponible + taxable additions)
 * BEFORE deducting AFP/FONASA. The tax is on gross imponible.
 * @param monthlyImponibleCLP - Monthly imponible in CLP
 * @param ufValue - Current UF value in CLP for converting thresholds
 */
function calculateImpuestoUnico(monthlyImponibleCLP: number, ufValue: number): number {
  const monthlyImponibleUF = monthlyImponibleCLP / ufValue;
  for (const bracket of TAX_BRACKETS) {
    if (monthlyImponibleUF > bracket.min && monthlyImponibleUF <= bracket.max) {
      return Math.max(0, (monthlyImponibleUF * bracket.rate / 100) - bracket.deduction) * ufValue;
    }
  }
  return 0;
}

/**
 * Calculate gratificación monthly (Art. 47)
 * Chilean law: 25% of annual remuneration, capped at 4.75 IMM per month worked
 * If hired before the 15th, that month counts
 */
function calculateGratificacion(monthlySalary: number, hireDate: string, periodEnd: Date): { amount: number; monthsWorked: number } {
  const hire = new Date(hireDate);
  const periodYear = periodEnd.getFullYear();
  const hireYear = hire.getFullYear();

  let monthsWorked: number;
  if (hireYear < periodYear) {
    monthsWorked = 12;
  } else if (hireYear === periodYear) {
    const hireMonth = hire.getMonth(); // 0-indexed
    const hireDay = hire.getDate();
    monthsWorked = hireDay <= 15 ? (12 - hireMonth) : (11 - hireMonth);
    monthsWorked = Math.max(0, monthsWorked);
  } else {
    monthsWorked = 0;
  }

  // 25% of annual remuneration (Art. 47)
  const gratification = monthlySalary * GRATIFICATION_RATE * monthsWorked;
  // Cap: 4.75 IMM per month worked
  const capAmount = GRATIFICATION_MONTHLY_IMM_CAP * _immValue * monthsWorked;
  const amount = Math.min(gratification, capAmount);

  return { amount, monthsWorked };
}

/**
 * Calculate aguinaldo de navidad (Christmas bonus)
 * 30% of December salary, max 3 UF
 */
function calculateAguinaldo(monthlySalary: number): number {
  const amount = monthlySalary * AGUINALDO_RATE;
  const amountUf = amount / _ufValue;
  const cappedUf = Math.min(amountUf, AGUINALDO_UF_CAP);
  return cappedUf * _ufValue;
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
  periodEnd: Date,
  extras?: {
    overtime_hours?: number;
    overtime_rate?: number; // custom rate override
    bonuses?: { concept: string; amount: number; taxable: boolean }[];
    deductions?: { concept: string; amount: number }[];
  }
): PayrollResult {
  const items: PayrollItem[] = [];
  const periodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));

  // ── Safe defaults for Employee fields (M2 fix) ──
  const safeEmployee = {
    ...employee,
    afp_fund: employee.afp_fund || 'AFP Habitat',
    afp_rate: employee.afp_rate || 10.58,
    afp_commission: employee.afp_commission || 0.60,
    health_type: employee.health_type || 'FONASA',
    health_amount: employee.health_amount || 0,
    mutual_type: employee.mutual_type || 'achs',
    mutual_rate: employee.mutual_rate || 0.93,
    apv_amount: employee.apv_amount || 0,
    base_salary: employee.base_salary || 0,
  };
  employee = safeEmployee;
  const daysWorked = calculateDaysWorked(employee.hire_date, periodStart, periodEnd);

  // ── Base salary (proportional if started mid-month) ──
  const proportionalSalary = calculateProportionalSalary(employee.base_salary, daysWorked, periodDays);
  const monthlySalary = employee.base_salary;

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

  // Horas extras
  const overtimeHours = extras?.overtime_hours || 0;
  if (overtimeHours > 0) {
    // Legal jornada: 44h/semana → 6.2857h/día promedio (44/7)
    const CHILEAN_DAILY_HOURS = 44 / 7;
    const hourlyRate = monthlySalary / 30 / CHILEAN_DAILY_HOURS;
    const first2 = Math.min(overtimeHours, 2);
    const beyond = Math.max(0, overtimeHours - 2);
    const overtimeRate = extras?.overtime_rate || OVERTIME_FIRST_2_HOURS_RATE;

    const overtimeAmount = (first2 * hourlyRate * (1 + overtimeRate)) +
                           (beyond > 0 ? beyond * hourlyRate * (1 + OVERTIME_BEYOND_RATE) : 0);

    items.push({
      code: 'HE',
      concept: `Horas Extras (${overtimeHours}h)`,
      type: 'earning',
      category: 'earning',
      amount: overtimeAmount,
      quantity: overtimeHours,
      unit_value: hourlyRate,
      is_taxable: true,
      is_employer: false,
    });
  }

  // Bonos / Asignaciones
  const bonuses = extras?.bonuses || [];
  for (const bonus of bonuses) {
    if (bonus.amount > 0) {
      items.push({
        code: 'BONO',
        concept: bonus.concept,
        type: 'earning',
        category: 'earning',
        amount: bonus.amount,
        quantity: 1,
        unit_value: bonus.amount,
        is_taxable: bonus.taxable,
        is_employer: false,
      });
    }
  }

  // Gratificación (monthly proportional)
  const gratificacion = calculateGratificacion(monthlySalary, employee.hire_date, periodEnd);
  if (gratificacion.amount > 0 && daysWorked >= 25) {
    const gratMonthly = gratificacion.amount / 12;
    items.push({
      code: 'GRAT',
      concept: 'Gratificación',
      type: 'earning',
      category: 'earning',
      amount: gratMonthly,
      quantity: 1,
      unit_value: gratMonthly,
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

  // ── Calculate imponible salary (sum of all taxable earnings) ──
  const imponibleSalary = items
    .filter(i => i.is_taxable)
    .reduce((sum, i) => sum + i.amount, 0);

  // ── Apply imponible cap for contributions (80 UF) ──
  const taxableForContributions = applyImponibleCap(imponibleSalary);

  // ═══════════════════════════════════════
  // EMPLOYEE DEDUCTIONS
  // ═══════════════════════════════════════

  const afpFund = AFP_FUNDS[employee.afp_fund] || AFP_FUNDS['AFP Habitat'];
  const afpRate = employee.afp_rate || afpFund.si;
  const afpCommission = employee.afp_commission || afpFund.commission;

  // AFP Pensión (on capped imponible)
  const afpPension = taxableForContributions * afpRate / 100;
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

  // AFP Comisión (on capped imponible)
  if (afpCommission > 0) {
    const afpComm = taxableForContributions * afpCommission / 100;
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

  // Salud (on capped imponible for FONASA, fixed for Isapre)
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
    const salud = taxableForContributions * FONASA_RATE / 100;
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

  // AFC Cesantía employee (on capped imponible)
  const afcEmployeeRate = employee.contract_type === 'plazo_fijo' ? AFC_EMPLOYEE_FIXED : AFC_EMPLOYEE_INDEFINITE;
  const afcEmployee = taxableForContributions * afcEmployeeRate / 100;
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

  // Descuentos manuales
  const manualDeductions = extras?.deductions || [];
  for (const ded of manualDeductions) {
    if (ded.amount > 0) {
      items.push({
        code: 'DESC',
        concept: ded.concept,
        type: 'deduction',
        category: 'deduction',
        amount: ded.amount,
        quantity: 1,
        unit_value: ded.amount,
        is_taxable: false,
        is_employer: false,
      });
    }
  }

  // Impuesto Único de Segunda Categoría
  // In Chile: calculated on gross imponible (before AFP/FONASA deductions)
  const impuestoUnico = calculateImpuestoUnico(imponibleSalary, _ufValue);

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
  // EMPLOYER CONTRIBUTIONS (on capped imponible)
  // ═══════════════════════════════════════

  // SIS (Seguro de Invalidez y Sobrevivencia)
  const sis = taxableForContributions * SIS_RATE / 100;
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
  const mutual = taxableForContributions * mutualRate / 100;
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

  // AFC Cesantía employer (on capped imponible)
  const afcEmployerRate = employee.contract_type === 'plazo_fijo' ? AFC_EMPLOYER_FIXED : AFC_EMPLOYER_INDEFINITE;
  const afcEmployer = taxableForContributions * afcEmployerRate / 100;
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
  const caja = taxableForContributions * CAJA_COMPENSACION_RATE / 100;
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
    const gratMonthly = gratificacion.amount / 12;
    items.push({
      code: 'GRAT-EM',
      concept: 'Gratificación (Empleador)',
      type: 'deduction',
      category: 'employer',
      amount: gratMonthly,
      quantity: 1,
      unit_value: gratMonthly,
      is_taxable: false,
      is_employer: true,
    });
  }

  // ── Totals ──
  const totalEarnings = items.filter(i => i.category === 'earning').reduce((sum, i) => sum + i.amount, 0);
  const totalDeductions = items.filter(i => i.category === 'deduction' && !i.is_employer).reduce((sum, i) => sum + i.amount, 0);
  const totalEmployer = items.filter(i => i.category === 'employer').reduce((sum, i) => sum + i.amount, 0);
  const totalTax = items.filter(i => i.code === 'IMP-2C').reduce((sum, i) => sum + i.amount, 0);
  const netPay = totalEarnings - totalDeductions;

  return {
    employee_id: employee.id,
    employee_name: `${employee.first_name} ${employee.last_name}`,
    base_salary: monthlySalary,
    imponible_salary: imponibleSalary,
    taxable_salary: taxableForContributions,
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
