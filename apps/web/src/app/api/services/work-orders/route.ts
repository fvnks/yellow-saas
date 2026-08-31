import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const mockOrders = [
      {
        id: 'ot-001',
        order_number: 'OT-2026-041',
        customer_name: 'Inmobiliaria Los Arrayanes SpA',
        customer_rut: '76.990.111-2',
        service_type: 'Mantenimiento Preventivo TI',
        technician: 'Carlos Muñoz',
        scheduled_date: '2026-03-18',
        hours_estimated: 8,
        hours_actual: 7.5,
        labor_cost: 180000,
        materials_cost: 45000,
        total_cost: 225000,
        billable_amount: 450000,
        dte_folio: null,
        status: 'en_curso',
        priority: 'alta'
      },
      {
        id: 'ot-002',
        order_number: 'OT-2026-038',
        customer_name: 'Consultores & Asesores Ltda',
        customer_rut: '77.333.444-9',
        service_type: 'Instalación Impresoras + Capacitación',
        technician: 'María Soto',
        scheduled_date: '2026-03-10',
        hours_estimated: 4,
        hours_actual: 4,
        labor_cost: 96000,
        materials_cost: 0,
        total_cost: 96000,
        billable_amount: 180000,
        dte_folio: 1093,
        status: 'facturada',
        priority: 'media'
      },
      {
        id: 'ot-003',
        order_number: 'OT-2026-044',
        customer_name: 'Constructora Pacífico SpA',
        customer_rut: '76.555.888-1',
        service_type: 'Reparación Maquinaria Prensa 50T',
        technician: 'Pedro Vargas',
        scheduled_date: '2026-03-22',
        hours_estimated: 16,
        hours_actual: 0,
        labor_cost: 0,
        materials_cost: 0,
        total_cost: 0,
        billable_amount: 890000,
        dte_folio: null,
        status: 'programada',
        priority: 'urgente'
      }
    ];

    return NextResponse.json({ success: true, data: mockOrders });
  } catch (error: any) {
    console.error('Error fetching work orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = `OT-2026-${Math.floor(40 + Math.random() * 60)}`;
    const newOrder = {
      id: `ot-${Date.now()}`,
      order_number: orderNumber,
      customer_name: body.customer_name || 'Cliente SpA',
      customer_rut: body.customer_rut || '76.123.456-7',
      service_type: body.service_type || 'Servicio técnico',
      technician: body.technician || 'Por asignar',
      scheduled_date: body.scheduled_date || new Date().toISOString().substring(0, 10),
      hours_estimated: Number(body.hours_estimated) || 4,
      hours_actual: 0,
      labor_cost: 0,
      materials_cost: 0,
      total_cost: 0,
      billable_amount: Number(body.billable_amount) || 0,
      dte_folio: null,
      status: 'programada',
      priority: body.priority || 'media'
    };

    return NextResponse.json({
      success: true,
      message: `Orden de Trabajo ${orderNumber} creada.`,
      data: newOrder
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
