import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    // 1. Ensure condo property exists
    let condoRes = await query(
      `SELECT * FROM condos_properties WHERE company_id = $1 AND is_active = true LIMIT 1`,
      [companyId]
    );

    let propertyId: string;
    if (condoRes.rows.length === 0) {
      const newProp = await query(
        `INSERT INTO condos_properties (company_id, name, rut, address, total_units, reserve_fund_pct, late_interest_pct, due_day)
         VALUES ($1, 'Condominio Central', '76.543.210-K', 'Av. Las Condes 12345', 12, 5.00, 1.50, 10)
         RETURNING *`,
        [companyId]
      );
      propertyId = newProp.rows[0].id;

      // Seed initial units for demonstration if empty
      const sampleUnits = [
        { num: '101', type: 'departamento', owner: 'Juan Pérez', email: 'juan.perez@email.cl', phone: '+56912345678', pct: 8.5 },
        { num: '102', type: 'departamento', owner: 'María González', email: 'maria.g@email.cl', phone: '+56987654321', pct: 8.5 },
        { num: '201', type: 'departamento', owner: 'Carlos Rodríguez', email: 'crodriguez@email.cl', phone: '+56911223344', pct: 9.0 },
        { num: '202', type: 'departamento', owner: 'Ana Silva', email: 'ana.silva@email.cl', phone: '+56955667788', pct: 9.0 },
        { num: '301', type: 'departamento', owner: 'Roberto Tapia', email: 'rtapia@email.cl', phone: '+56999887766', pct: 10.0 },
        { num: '302', type: 'departamento', owner: 'Lucía Morales', email: 'lmorales@email.cl', phone: '+56933445566', pct: 10.0 },
        { num: '401', type: 'departamento', owner: 'Pedro Araya', email: 'paraya@email.cl', phone: '+56977889900', pct: 11.0 },
        { num: '402', type: 'departamento', owner: 'Camila Rojas', email: 'crojas@email.cl', phone: '+56922334455', pct: 11.0 },
        { num: '501', type: 'departamento', owner: 'Diego Bravo', email: 'dbravo@email.cl', phone: '+56966778899', pct: 11.5 },
        { num: '502', type: 'departamento', owner: 'Valentina Soto', email: 'vsoto@email.cl', phone: '+56944556677', pct: 11.5 },
        { num: 'B01', type: 'bodega', owner: 'Juan Pérez', email: 'juan.perez@email.cl', phone: '+56912345678', pct: 0.0 },
        { num: 'E01', type: 'estacionamiento', owner: 'Juan Pérez', email: 'juan.perez@email.cl', phone: '+56912345678', pct: 0.0 }
      ];

      for (const u of sampleUnits) {
        const uRes = await query(
          `INSERT INTO condos_units (company_id, property_id, unit_number, type, resident_name, resident_email, resident_phone)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [companyId, propertyId, u.num, u.type, u.owner, u.email, u.phone]
        );
        const unitId = uRes.rows[0].id;
        await query(
          `INSERT INTO condos_coefficients (company_id, property_id, unit_id, category, percentage, coefficient_pct)
           VALUES ($1, $2, $3, 'general', $4, $4)`,
          [companyId, propertyId, unitId, u.pct]
        );
      }
    } else {
      propertyId = condoRes.rows[0].id;
    }

    // 2. Fetch Units with Coeff & Balance
    const unitsRes = await query(
      `SELECT u.id, u.unit_number as number, u.type, u.resident_name as "ownerName",
              u.resident_email as "ownerEmail", u.resident_phone as "ownerPhone",
              COALESCE(c.coefficient_pct, c.percentage, 0) as "alicuotaPercentage",
              COALESCE(SUM(us.total_amount - us.amount_paid), 0) as "unpaidBalanceCLP"
       FROM condos_units u
       LEFT JOIN condos_coefficients c ON c.unit_id = u.id AND c.category = 'general'
       LEFT JOIN condos_unit_statements us ON us.unit_id = u.id AND us.status != 'paid'
       WHERE u.company_id = $1 AND u.property_id = $2
       GROUP BY u.id, u.unit_number, u.type, u.resident_name, u.resident_email, u.resident_phone, c.coefficient_pct, c.percentage
       ORDER BY u.unit_number ASC`,
      [companyId, propertyId]
    );

    const formattedUnits = unitsRes.rows.map(u => ({
      id: u.id,
      number: u.number,
      type: u.type,
      sectorId: 's1',
      sectorName: 'Torre Central',
      ownerName: u.ownerName || 'Sin Asignar',
      ownerRut: '12.345.678-9',
      ownerEmail: u.ownerEmail || '',
      ownerPhone: u.ownerPhone || '',
      alicuotaPercentage: Number(u.alicuotaPercentage) || 0,
      areaM2: 65,
      unpaidBalanceCLP: Number(u.unpaidBalanceCLP) || 0,
      status: Number(u.unpaidBalanceCLP) > 0 ? (Number(u.unpaidBalanceCLP) > 150000 ? 'moroso' : 'pendiente') : 'al_dia'
    }));

    // 3. Fetch Sectors (Static / Configured)
    const sectors = [
      { id: 's1', name: 'Torre Central', type: 'torre', description: 'Edificio principal 5 pisos', color: 'blue' }
    ];

    // 4. Fetch Periods & Expense Items
    const periodsRes = await query(
      `SELECT p.id, p.period_code as "periodName", p.period_date as "periodDate",
              p.due_date as "dueDate", p.status, p.total_expenses_clp as "totalExpensesCLP",
              p.total_amount as "totalBilledCLP"
       FROM condos_periods p
       WHERE p.company_id = $1 AND p.property_id = $2
       ORDER BY p.created_at DESC`,
      [companyId, propertyId]
    );

    const periods = [];
    for (const p of periodsRes.rows) {
      const itemsRes = await query(
        `SELECT id, category, name as description, amount_clp as "amountCLP", description as notes
         FROM condos_expense_items
         WHERE period_id = $1`,
        [p.id]
      );
      periods.push({
        id: p.id,
        periodName: p.periodName || 'Período Actual',
        periodDate: p.periodDate ? String(p.periodDate).substring(0, 7) : '2026-03',
        dueDate: p.dueDate ? String(p.dueDate).substring(0, 10) : '2026-04-10',
        status: p.status === 'calculated' || p.status === 'issued' ? 'emitido' : p.status === 'closed' ? 'cerrado' : 'borrador',
        reserveFundPercentage: 5.0,
        lateInterestRate: 1.5,
        items: itemsRes.rows.map(item => ({
          id: item.id,
          category: item.category,
          description: item.description || 'Gasto Operacional',
          amountCLP: Number(item.amountCLP) || 0,
          supplierName: 'Proveedor Servicio',
          documentNumber: 'FAC-001'
        })),
        totalExpensesCLP: Number(p.totalExpensesCLP) || 0,
        totalReserveFundCLP: Math.round((Number(p.totalExpensesCLP) || 0) * 0.05),
        totalBilledCLP: Number(p.totalBilledCLP) || Math.round((Number(p.totalExpensesCLP) || 0) * 1.05)
      });
    }

    // 5. Fetch Payments
    const paymentsRes = await query(
      `SELECT pay.id, pay.unit_id as "unitId", u.unit_number as "unitNumber", u.resident_name as "ownerName",
              pay.statement_id as "periodId", pay.amount_clp as "amountCLP", pay.payment_date as "paymentDate",
              pay.payment_method as "paymentMethod", pay.reference_number as "referenceNumber", pay.notes
       FROM condos_payments pay
       LEFT JOIN condos_units u ON u.id = pay.unit_id
       WHERE pay.company_id = $1
       ORDER BY pay.payment_date DESC`,
      [companyId]
    );

    const payments = paymentsRes.rows.map(pay => ({
      id: pay.id,
      unitId: pay.unitId,
      unitNumber: pay.unitNumber || '101',
      ownerName: pay.ownerName || 'Copropietario',
      periodId: pay.periodId,
      amountCLP: Number(pay.amountCLP) || 0,
      paymentDate: pay.paymentDate ? String(pay.paymentDate).substring(0, 10) : new Date().toISOString().substring(0, 10),
      paymentMethod: pay.paymentMethod || 'transferencia',
      referenceNumber: pay.referenceNumber || 'TR-001',
      bankReconciled: true,
      notes: pay.notes
    }));

    // Summary calculation
    const totalExpenses = periods[0]?.totalExpensesCLP || 0;
    const totalCollected = payments.reduce((acc, pay) => acc + pay.amountCLP, 0);
    const totalDebt = formattedUnits.reduce((acc, u) => acc + u.unpaidBalanceCLP, 0);

    return NextResponse.json({
      success: true,
      data: {
        propertyId,
        units: formattedUnits,
        sectors,
        periods,
        payments,
        summary: {
          totalUnits: formattedUnits.length,
          totalExpensesCLP: totalExpenses,
          totalCollectedCLP: totalCollected,
          totalDebtCLP: totalDebt,
        }
      }
    });
  } catch (error) {
    console.error('Error in /api/condominio:', error);
    return NextResponse.json(
      { success: false, error: 'Error al consultar datos de Mi Condominio' },
      { status: 500 }
    );
  }
}
