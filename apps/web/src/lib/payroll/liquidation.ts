import { getUFValue } from './index';
import { query } from '@/api/lib/db';

export type TerminationType =
  | 'despido_sin_causa'
  | 'despido_con_causa'
  | 'renuncia'
  | 'mutuo_acuerdo';

export interface TerminationInput {
  employee_id: string;
  termination_type: TerminationType;
  termination_date: string;
  notice_given?: boolean;
}

export interface TerminationLineItem {
  code: string;
  concept: string;
  amount: number;
  taxable: boolean;
  category: 'earnings' | 'severance' | 'compensation' | 'deduction' | 'notice';
}

export interface TerminationResult {
  employee_name: string;
  employee_rut: string;
  position: string;
  department: string;
  contract_type: string;
  hire_date: string;
  base_salary: number;
  termination_type: TerminationType;
  termination_date: string;
  years_of_service: number;
  items: TerminationLineItem[];
  totals: {
    earnings: number;
    severance: number;
    compensation: number;
    deductions: number;
    notice: number;
    net_total: number;
  };
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function monthsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
}

/**
 * Chilean Labor Law Termination Calculator
 *
 * - Art. 159: Termination with cause (no severance)
 * - Art. 160: Employee resignation (no severance)
 * - Art. 161: Indemnizacion por antiguedad (1 month/year, max 11 months, cap 45 UF)
 * - Art. 162: Indemnizacion sustitutiva de aviso previo
 * - Art. 168: Recargo 25% por falta de aviso previo
 * - Art. 172: Mutuo acuerdo (50% of Art. 161)
 * - Gratificacion proporcional
 * - Vacaciones proporcionales + proporcionales pendientes
 * - Sueldo proporcional del mes
 */
export async function calculateTermination(
  companyId: string,
  input: TerminationInput
): Promise<TerminationResult> {
  const { rows: empRows } = await query(
    `SELECT id, first_name, last_name, rut, position, department, contract_type,
            hire_date, base_salary
     FROM employees WHERE id = $1 AND company_id = $2`,
    [input.employee_id, companyId]
  );

  if (!empRows[0]) throw new Error('Empleado no encontrado');
  const emp = empRows[0];

  const currentYear = new Date(input.termination_date).getFullYear();
  const { rows: vacRows } = await query(
    `SELECT * FROM vacation_balances WHERE employee_id = $1 AND year = $2`,
    [emp.id, currentYear]
  );
  const vacBalance = vacRows[0] || { days_earned: 0, days_used: 0, days_available: 0, days_pending: 0 };

  const hireDate = new Date(emp.hire_date);
  const termDate = new Date(input.termination_date);
  const monthlySalary = emp.base_salary;
  const dailySalary = monthlySalary / 30;
  const yearsOfService = monthsBetween(emp.hire_date, input.termination_date) / 12;
  const fullYears = Math.floor(yearsOfService);

  const terminationDate = new Date(input.termination_date);
  const totalDaysInMonth = new Date(terminationDate.getFullYear(), terminationDate.getMonth() + 1, 0).getDate();
  const periodStart = new Date(terminationDate.getFullYear(), terminationDate.getMonth(), 1);
  const effectiveStart = hireDate > periodStart ? hireDate : periodStart;
  const daysWorked = daysBetween(effectiveStart.toISOString().split('T')[0], input.termination_date) + 1;

  const items: TerminationLineItem[] = [];
  const noticeGiven = input.notice_given !== false;

  const proportionSalary = Math.round(monthlySalary * daysWorked / totalDaysInMonth);
  if (daysWorked < totalDaysInMonth) {
    items.push({
      code: 'LIQ-SUELDO',
      concept: `Sueldo proporcional (${daysWorked}/${totalDaysInMonth} dias)`,
      amount: proportionSalary,
      taxable: true,
      category: 'earnings',
    });
  }

  const proportionalVacDays = Math.round(vacBalance.days_earned * daysWorked / totalDaysInMonth);
  const proportionalVacAmount = Math.round(proportionalVacDays * dailySalary);
  if (proportionalVacDays > 0) {
    items.push({
      code: 'LIQ-VAC-PROP',
      concept: `Vacaciones proporcionales (${proportionalVacDays} dias)`,
      amount: proportionalVacAmount,
      taxable: true,
      category: 'earnings',
    });
  }

  if (vacBalance.days_pending > 0) {
    const pendingVacAmount = Math.round(vacBalance.days_pending * dailySalary);
    items.push({
      code: 'LIQ-VAC-PEND',
      concept: `Vacaciones pendientes (${vacBalance.days_pending} dias)`,
      amount: pendingVacAmount,
      taxable: true,
      category: 'earnings',
    });
  }

  const monthsWorkedThisYear = Math.min(
    12,
    monthsBetween(`${currentYear}-01-01`, input.termination_date) + 1
  );
  const proportionalGrat = Math.round(monthlySalary * 0.01 * monthsWorkedThisYear);
    const maxGrat = Math.round(4.75 * getUFValue());
  const gratAmount = Math.min(proportionalGrat, maxGrat);
  if (gratAmount > 0 && input.termination_type !== 'despido_con_causa') {
    items.push({
      code: 'LIQ-GRAT',
      concept: `Gratificacion proporcional (${monthsWorkedThisYear}/12 meses)`,
      amount: gratAmount,
      taxable: true,
      category: 'earnings',
    });
  }

  const christmasMonth = 12;
  const proportionalChristmas = Math.round(monthlySalary * 0.3 * monthsWorkedThisYear / 12);
    const maxChristmas = Math.round(3 * getUFValue());
  const christmasAmount = Math.min(proportionalChristmas, maxChristmas);
  if (christmasAmount > 0 && terminationDate.getMonth() + 1 < christmasMonth && input.termination_type !== 'despido_con_causa') {
    items.push({
      code: 'LIQ-AGUINALDO',
      concept: 'Sueldo navidad proporcional',
      amount: christmasAmount,
      taxable: true,
      category: 'earnings',
    });
  }

  if (input.termination_type === 'despido_sin_causa') {
    const maxIndemnMonths = Math.min(fullYears, 11);
    const maxIndemnUF = 45 * getUFValue();
    const indemnAmount = Math.min(Math.round(monthlySalary * maxIndemnMonths), maxIndemnUF);
    if (indemnAmount > 0) {
      items.push({
        code: 'LIQ-IND-ANT',
        concept: `Indemnizacion por antiguedad (${maxIndemnMonths} meses)`,
        amount: indemnAmount,
        taxable: false,
        category: 'severance',
      });
    }

    if (!noticeGiven) {
      const noticeAmount = fullYears >= 1 ? monthlySalary : Math.round(dailySalary * 3);
      const penalty = Math.round(noticeAmount * 0.25);
      items.push({
        code: 'LIQ-AVISO',
        concept: 'Indemnizacion sustitutiva aviso previo',
        amount: noticeAmount,
        taxable: false,
        category: 'notice',
      });
      items.push({
        code: 'LIQ-PEN-AVISO',
        concept: 'Recargo 25% falta aviso previo',
        amount: penalty,
        taxable: false,
        category: 'notice',
      });
    }
  }

  if (input.termination_type === 'mutuo_acuerdo') {
    const maxIndemnMonths = Math.min(fullYears, 11);
    const maxIndemnUF = 45 * getUFValue();
    const fullIndemn = Math.min(Math.round(monthlySalary * maxIndemnMonths), maxIndemnUF);
    const indemnAmount = Math.round(fullIndemn * 0.5);
    if (indemnAmount > 0) {
      items.push({
        code: 'LIQ-MUT-ANT',
        concept: `Mutuo acuerdo - 50% antiguedad (${maxIndemnMonths} meses)`,
        amount: indemnAmount,
        taxable: false,
        category: 'severance',
      });
    }
  }

  if (input.termination_type === 'despido_sin_causa' || input.termination_type === 'mutuo_acuerdo') {
    const cajaAmount = Math.round(proportionSalary * 0.006);
    if (cajaAmount > 0) {
      items.push({
        code: 'LIQ-CAJA',
        concept: 'Caja de compensacion proporcional',
        amount: cajaAmount,
        taxable: false,
        category: 'compensation',
      });
    }
  }

  const earnings = items.filter(i => i.category === 'earnings').reduce((s, i) => s + i.amount, 0);
  const severance = items.filter(i => i.category === 'severance').reduce((s, i) => s + i.amount, 0);
  const compensation = items.filter(i => i.category === 'compensation').reduce((s, i) => s + i.amount, 0);
  const notice = items.filter(i => i.category === 'notice').reduce((s, i) => s + i.amount, 0);
  const deductions = items.filter(i => i.category === 'deduction').reduce((s, i) => s + i.amount, 0);
  const netTotal = earnings + severance + compensation + notice - deductions;

  return {
    employee_name: `${emp.first_name} ${emp.last_name}`,
    employee_rut: emp.rut,
    position: emp.position,
    department: emp.department,
    contract_type: emp.contract_type,
    hire_date: emp.hire_date,
    base_salary: monthlySalary,
    termination_type: input.termination_type,
    termination_date: input.termination_date,
    years_of_service: parseFloat(yearsOfService.toFixed(1)),
    items,
    totals: {
      earnings,
      severance,
      compensation,
      deductions,
      notice,
      net_total: netTotal,
    },
  };
}
