import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

function esc(str: unknown): string {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateCarnetHTML(patient: Record<string, unknown>, vaccinations: Record<string, unknown>[]): string {
  const p = patient;

  const vaccRows = vaccinations.map((v, idx) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#475569;">${idx + 1}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:500;color:#0f172a;">${esc(v.vaccine_name)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(v.manufacturer)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(v.batch_number)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(v.application_date)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(v.next_due_date)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(v.dose)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(v.professional_name)}</td>
      </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Carnet de Vacunación - ${esc(p.name as string)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #0f172a; background: #fff; }
    @page { size: A4; margin: 15mm 18mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    .page { width: 100%; max-width: 210mm; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #10b981; padding-bottom: 16px; margin-bottom: 20px; }
    .clinic-info h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .clinic-info p { font-size: 12px; color: #64748b; line-height: 1.5; }
    .doc-title { text-align: right; }
    .doc-title h2 { font-size: 16px; font-weight: 700; color: #fff; background: #10b981; padding: 6px 14px; border-radius: 8px; display: inline-block; }
    .patient-header { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    .patient-header h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
    .patient-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .patient-field .label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .patient-field .value { font-size: 13px; font-weight: 500; color: #0f172a; margin-top: 2px; }
    .owner-section { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; }
    .info-card h3 { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #10b981; margin-bottom: 8px; }
    .info-card p { font-size: 12px; color: #334155; line-height: 1.6; }
    .info-card .label { color: #64748b; font-size: 11px; }
    .vacc-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
    .vacc-table thead th { background: #0f172a; color: #fff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; padding: 10px; text-align: left; }
    .empty-state { padding: 24px; text-align: center; color: #94a3b8; font-size: 13px; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 10px; color: #94a3b8; }
    .footer .legal { font-style: italic; margin-top: 4px; }
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
        <h2>CARNET DE VACUNACIÓN</h2>
      </div>
    </div>

    <div class="patient-header">
      <h3>${esc(p.name as string)}</h3>
      <div class="patient-grid">
        <div class="patient-field">
          <span class="label">Especie</span>
          <p class="value">${esc(p.species)}</p>
        </div>
        <div class="patient-field">
          <span class="label">Raza</span>
          <p class="value">${esc(p.breed)}</p>
        </div>
        <div class="patient-field">
          <span class="label">Color</span>
          <p class="value">${esc(p.color)}</p>
        </div>
        <div class="patient-field">
          <span class="label">Peso</span>
          <p class="value">${p.current_weight_kg ? `${esc(p.current_weight_kg)} kg` : '-'}</p>
        </div>
        <div class="patient-field">
          <span class="label">Microchip</span>
          <p class="value">${esc(p.microchip) || '-'}</p>
        </div>
        <div class="patient-field">
          <span class="label">N° Registro</span>
          <p class="value">${esc(p.registration_number) || '-'}</p>
        </div>
        <div class="patient-field">
          <span class="label">Género</span>
          <p class="value">${esc(p.gender)}</p>
        </div>
        <div class="patient-field">
          <span class="label">Fecha Nacimiento</span>
          <p class="value">${esc(p.birth_date) || '-'}</p>
        </div>
      </div>
    </div>

    <div class="owner-section">
      <div class="info-card">
        <h3>Propietario</h3>
        <p><span class="label">Nombre:</span> ${esc(p.client_name)}</p>
        <p><span class="label">RUT:</span> ${esc(p.client_rut)}</p>
        <p><span class="label">Teléfono:</span> ${esc(p.client_phone)}</p>
      </div>
      <div class="info-card">
        <h3>Información</h3>
        <p><span class="label">Fecha de emisión:</span> ${new Date().toLocaleDateString('es-CL')}</p>
        <p><span class="label">Total vacunas registradas:</span> ${vaccinations.length}</p>
      </div>
    </div>

    <table class="vacc-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th>Vacuna</th>
          <th>Fabricante</th>
          <th>Lote</th>
          <th>Fecha Aplicación</th>
          <th>Próxima Dosis</th>
          <th>Dosis</th>
          <th>Profesional</th>
        </tr>
      </thead>
      <tbody>
        ${vaccRows || '<tr><td colspan="8" class="empty-state">No hay vacunas registradas para este paciente</td></tr>'}
      </tbody>
    </table>

    <div class="footer">
      <p>Clínica Veterinaria — Av. Ejemplo 1234, Santiago, Chile — +56 9 1234 5678</p>
      <p class="legal">Carnet de vacunación conforme a la Ley N° 21.020 de tenencia responsable de animales de compañía.</p>
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
    const { patient_id } = body;

    if (!patient_id) return errorResponse('patient_id is required', 400);

    const patientResult = await query(
      `SELECT p.*,
        vc.full_name AS client_name, vc.rut AS client_rut, vc.phone AS client_phone
       FROM veterinary_patients p
       LEFT JOIN veterinary_clients vc ON vc.id = p.client_id
       WHERE p.id = $1 AND p.company_id = $2`,
      [patient_id, companyId]
    );

    if (patientResult.rows.length === 0) {
      return errorResponse('Paciente no encontrado', 404);
    }

    const patient = patientResult.rows[0];

    const vaccResult = await query(
      `SELECT v.*,
        COALESCE(vpf.full_name, 'No asignado') AS professional_name
       FROM veterinary_vaccinations v
       LEFT JOIN veterinary_professionals vpf ON vpf.id = v.professional_id
       WHERE v.patient_id = $1 AND v.company_id = $2
       ORDER BY v.application_date DESC`,
      [patient_id, companyId]
    );

    const html = generateCarnetHTML(patient, vaccResult.rows);

    return successResponse({
      html,
      title: `Carnet de Vacunación - ${patient.name}`,
    });
  } catch (error) {
    console.error('Error generating vaccination carnet:', error);
    return errorResponse('Error al generar el carnet de vacunación', 500);
  }
}
