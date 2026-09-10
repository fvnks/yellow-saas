import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
}

function esc(str: unknown): string {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generatePrescriptionHTML(prescription: Record<string, unknown>, items: Record<string, unknown>[]): string {
  const p = prescription;
  const patientName = esc(p.patient_name as string);
  const clientName = esc(p.client_name as string);
  const professionalName = esc(p.professional_name as string);

  const itemRows = items.map((item, idx) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#475569;">${idx + 1}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:500;color:#0f172a;">${esc(item.medication_name)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(item.active_ingredient)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(item.dose)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(item.frequency)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(item.duration)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(item.route)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#475569;text-align:center;">${esc(item.quantity)}</td>
      </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Receta Médica - ${patientName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #0f172a; background: #fff; }
    @page { size: A4; margin: 15mm 18mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    .page { width: 100%; max-width: 210mm; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #facc15; padding-bottom: 16px; margin-bottom: 20px; }
    .clinic-info h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .clinic-info p { font-size: 12px; color: #64748b; line-height: 1.5; }
    .doc-title { text-align: right; }
    .doc-title h2 { font-size: 16px; font-weight: 700; color: #facc15; background: #0f172a; padding: 6px 14px; border-radius: 8px; display: inline-block; }
    .doc-title p { font-size: 11px; color: #64748b; margin-top: 6px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 20px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; }
    .info-card h3 { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #facc15; margin-bottom: 8px; }
    .info-card p { font-size: 12px; color: #334155; line-height: 1.6; }
    .info-card .label { color: #64748b; font-size: 11px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
    .items-table thead th { background: #0f172a; color: #fff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; padding: 10px; text-align: left; }
    .instructions { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px; }
    .instructions h3 { font-size: 12px; font-weight: 600; color: #92400e; margin-bottom: 8px; }
    .instructions p { font-size: 12px; color: #78350f; line-height: 1.6; white-space: pre-wrap; }
    .signature-area { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; }
    .sig-block { text-align: center; width: 200px; }
    .sig-line { border-top: 1px solid #94a3b8; margin-top: 50px; padding-top: 8px; }
    .sig-block .title { font-size: 11px; color: #64748b; }
    .sig-block .name { font-size: 12px; font-weight: 600; color: #0f172a; }
    .stamp-area { width: 140px; height: 80px; border: 2px dashed #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="clinic-info">
        <h1>Clínica Veterinaria</h1>
        <p>RUT: 76.000.000-0</p>
        <p>Av. Ejemplo 1234, Santiago, Chile</p>
        <p>+56 9 1234 5678</p>
      </div>
      <div class="doc-title">
        <h2>RECETA MÉDICA</h2>
        <p>Fecha: ${esc(p.prescription_date as string)}</p>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <h3>Paciente</h3>
        <p><span class="label">Nombre:</span> ${patientName}</p>
        <p><span class="label">Especie:</span> ${esc(p.patient_species)}</p>
        <p><span class="label">Raza:</span> ${esc(p.patient_breed)}</p>
        <p><span class="label">Peso:</span> ${p.patient_weight ? `${esc(p.patient_weight)} kg` : '-'}</p>
      </div>
      <div class="info-card">
        <h3>Propietario</h3>
        <p><span class="label">Nombre:</span> ${clientName}</p>
        <p><span class="label">RUT:</span> ${esc(p.client_rut)}</p>
        <p><span class="label">Teléfono:</span> ${esc(p.client_phone)}</p>
      </div>
      <div class="info-card">
        <h3>Profesional</h3>
        <p><span class="label">Nombre:</span> ${professionalName}</p>
        <p><span class="label">Licencia:</span> ${esc(p.professional_license)}</p>
        <p><span class="label">Especialidad:</span> ${esc(p.professional_specialty)}</p>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th>Medicamento</th>
          <th>Principio Activo</th>
          <th>Dosis</th>
          <th>Frecuencia</th>
          <th>Duración</th>
          <th>Vía</th>
          <th style="width:50px;text-align:center;">Cant.</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows || '<tr><td colspan="8" style="padding:16px;text-align:center;color:#94a3b8;">Sin medicamentos prescritos</td></tr>'}
      </tbody>
    </table>

    ${p.instructions ? `
    <div class="instructions">
      <h3>Instrucciones Especiales</h3>
      <p>${esc(p.instructions)}</p>
    </div>` : ''}

    <div class="signature-area">
      <div class="sig-block">
        <div class="sig-line">
          <p class="title">Firma del Profesional</p>
          <p class="name">${professionalName}</p>
          <p class="title">Lic. ${esc(p.professional_license)}</p>
        </div>
      </div>
      <div class="stamp-area">
        Sello Clínica
      </div>
      <div class="sig-block">
        <div class="sig-line">
          <p class="title">Firma del Propietario</p>
          <p class="name">${clientName}</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { prescription_id } = body;

    if (!prescription_id) return errorResponse('prescription_id is required', 400);

    const prescriptionResult = await query(
      `SELECT vp.*,
        vpct.full_name AS client_name, vpct.rut AS client_rut, vpct.phone AS client_phone,
        vpp.name AS patient_name, vpp.species AS patient_species, vpp.breed AS patient_breed,
        vpp.current_weight_kg AS patient_weight,
        vpf.full_name AS professional_name, vpf.professional_license AS professional_license,
        vpf.specialty AS professional_specialty
       FROM veterinary_prescriptions vp
       JOIN veterinary_clients vpct ON vpct.id = vp.client_id
       JOIN veterinary_patients vpp ON vpp.id = vp.patient_id
       JOIN veterinary_professionals vpf ON vpf.id = vp.professional_id
       WHERE vp.id = $1 AND vp.company_id = $2`,
      [prescription_id, companyId]
    );

    if (prescriptionResult.rows.length === 0) {
      return errorResponse('Prescripción no encontrada', 404);
    }

    const prescription = prescriptionResult.rows[0];

    const itemsResult = await query(
      `SELECT * FROM veterinary_prescription_items WHERE prescription_id = $1 ORDER BY id`,
      [prescription_id]
    );

    const html = generatePrescriptionHTML(prescription, itemsResult.rows);
    const patientName = prescription.patient_name || 'Paciente';

    return successResponse({
      html,
      title: `Receta Médica - ${patientName}`,
    });
  } catch (error) {
    console.error('Error generating prescription PDF:', error);
    return errorResponse('Error al generar la prescripción', 500);
  }
}
