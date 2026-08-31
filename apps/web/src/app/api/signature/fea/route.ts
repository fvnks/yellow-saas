import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

// GET: Fetch Digital Signatures & FEA Certificates Status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const mockCertificates = [
      { id: 'cert-01', provider: 'e-Certchile (Cámara de Comercio de Santiago)', subject_rut: '12.876.543-2', subject_name: 'María José Fernández', valid_until: '2027-11-15', status: 'activo' },
      { id: 'cert-02', provider: 'Acepta.com FEA', subject_rut: '15.432.890-K', subject_name: 'Juan Carlos Pérez', valid_until: '2026-12-01', status: 'activo' }
    ];

    const mockSignedDocuments = [
      { id: 'doc-01', title: 'Contrato de Trabajo Indefinido - Carlos Soto', type: 'contrato_rrhh', signed_at: '2026-03-01 10:15', status: 'firmado_valido', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
      { id: 'doc-02', title: 'Acta de Asamblea Ordinaria de Copropietarios 2026', type: 'acta_condominio', signed_at: '2026-03-02 16:30', status: 'firmado_valido', hash: 'c90b2b8109d73d2a02e60408544d6537759a224a1b021379c6d36e2f183ef07a' }
    ];

    return NextResponse.json({
      success: true,
      data: {
        certificates: mockCertificates,
        signedDocuments: mockSignedDocuments
      }
    });
  } catch (error: any) {
    console.error('Error fetching FEA data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
