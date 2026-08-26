import { NextResponse } from 'next/server';
import { INITIAL_UNITS, INITIAL_SECTORS, INITIAL_PERIODS, INITIAL_PAYMENTS } from '@/lib/condominio-client';

export async function GET() {
  try {
    const totalExpenses = INITIAL_PERIODS[0]?.totalExpensesCLP || 0;
    const totalCollected = INITIAL_PAYMENTS.reduce((acc, p) => acc + p.amountCLP, 0);
    const totalDebt = INITIAL_UNITS.reduce((acc, u) => acc + u.unpaidBalanceCLP, 0);

    return NextResponse.json({
      success: true,
      data: {
        units: INITIAL_UNITS,
        sectors: INITIAL_SECTORS,
        periods: INITIAL_PERIODS,
        payments: INITIAL_PAYMENTS,
        summary: {
          totalUnits: INITIAL_UNITS.length,
          totalExpensesCLP: totalExpenses,
          totalCollectedCLP: totalCollected,
          totalDebtCLP: totalDebt,
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al consultar datos de Mi Condominio' },
      { status: 500 }
    );
  }
}