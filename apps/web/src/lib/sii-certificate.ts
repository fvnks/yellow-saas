import { createHash, createSign, createVerify, randomBytes } from 'crypto';
import { query } from '@/api/lib/db';

export interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
  fingerprint: string;
  rut: string;
  isValid: boolean;
  daysUntilExpiry: number;
}

export interface SignedDteResult {
  signedXml: string;
  signature: string;
  certificado: string;
}

/**
 * Parses a PKCS#12 (.p12/.pfx) buffer and extracts private key and certificate
 * Requires: npm install pkcs12
 */
export function parsePkcs12(p12Buffer: Buffer, password: string): { privateKey: string; certificate: string; certInfo: CertificateInfo } {
  // Dynamic import to avoid build issues if package not installed
  let pkcs12: any;
  try {
    pkcs12 = require('pkcs12');
  } catch {
    throw new Error('PKCS#12 parsing requires "pkcs12" npm package. Install with: npm install pkcs12');
  }

  const parsed = pkcs12.parse(p12Buffer, password);
  
  const certInfo = extractCertInfo(parsed.cert);
  
  return {
    privateKey: parsed.key,
    certificate: parsed.cert,
    certInfo,
  };
}

/**
 * Extracts certificate info from PEM certificate
 */
export function extractCertInfo(pemCert: string): CertificateInfo {
  // Extract details from certificate
  const subjectMatch = pemCert.match(/subject=([^,\n]+)/i);
  const issuerMatch = pemCert.match(/issuer=([^,\n]+)/i);
  const validFromMatch = pemCert.match(/notBefore=([^,\n]+)/i);
  const validToMatch = pemCert.match(/notAfter=([^,\n]+)/i);
  const serialMatch = pemCert.match(/serialNumber=([^,\n]+)/i);
  
  const subject = subjectMatch?.[1] || '';
  const rutMatch = subject.match(/([0-9]{7,8}-[0-9kK])/);
  const rut = rutMatch?.[1] || '';
  
  const validFrom = validFromMatch ? new Date(validFromMatch[1]) : new Date();
  const validTo = validToMatch ? new Date(validToMatch[1]) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const now = new Date();
  
  // Calculate fingerprint (SHA-1 of DER cert)
  const derCert = Buffer.from(
    pemCert.replace(/-----(BEGIN|END) CERTIFICATE-----/g, '').replace(/\s/g, ''), 
    'base64'
  );
  const fingerprint = createHash('sha1').update(derCert).digest('hex').toUpperCase().match(/.{2}/g)?.join(':') || '';
  
  return {
    subject,
    issuer: issuerMatch?.[1] || '',
    validFrom,
    validTo,
    serialNumber: serialMatch?.[1] || '',
    fingerprint,
    rut,
    isValid: now >= validFrom && now <= validTo,
    daysUntilExpiry: Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  };
}

/**
 * Signs an XML document with the private key (RSA-SHA1 for SII)
 */
export function signXml(xml: string, privateKeyPem: string, certificatePem: string): { signature: string; signedXml: string } {
  // Canonicalize XML (C14N) - required for SII
  const canonicalXml = canonicalizeXml(xml);
  
  // Create signature
  const sign = createSign('RSA-SHA1');
  sign.update(canonicalXml);
  sign.end();
  const signature = sign.sign({ key: privateKeyPem, format: 'pem', padding: 1 }).toString('base64');
  
  // Embed signature in XML (enveloped signature)
  const signedXml = embedSignature(xml, signature, certificatePem);
  
  return { signature, signedXml };
}

/**
 * Embeds XML-DSig signature into the DTE XML
 */
function embedSignature(xml: string, signature: string, certPem: string): string {
  const certB64 = certPem
    .replace(/-----(BEGIN|END) CERTIFICATE-----/g, '')
    .replace(/\s/g, '');
  
  // Compute digest of canonicalized XML
  const digestValue = createHash('sha1').update(canonicalizeXml(xml)).digest('base64');
  
  const signatureNode = `
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
      <Reference URI="">
        <Transforms>
          <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
          <Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
        </Transforms>
        <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
        <DigestValue>${digestValue}</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>${signature}</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>${certB64}</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>`;
  
  // Insert before closing </DTE> or </Documento>
  return xml.replace('</DTE>', `${signatureNode}</DTE>`).replace('</Documento>', `${signatureNode}</Documento>`);
}

/**
 * Simple XML canonicalization (C14N) - simplified
 * Production should use 'xmldom' + 'xml-c14n' packages for full compliance
 */
function canonicalizeXml(xml: string): string {
  // Remove XML declaration
  let canonical = xml.replace(/<\?xml[^?]*\?>/g, '').trim();
  
  // Normalize whitespace (simplified - full C14N is complex)
  canonical = canonical
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/="/g, '="')
    .replace(/"\s*(\w+=)/g, '" $1');
  
  return canonical;
}

const certB64 = (certPem: string) => certPem
  .replace(/-----(BEGIN|END) CERTIFICATE-----/g, '')
  .replace(/\s/g, '');

/**
 * Stores certificate in database
 */
export async function storeCertificate(companyId: string, p12Base64: string, password: string): Promise<{ certInfo: any; privateKey: string; certificate: string }> {
  const p12Buffer = Buffer.from(p12Base64, 'base64');
  
  // Parse PKCS#12
  let parsed: { privateKey: string; certificate: string; certInfo: any };
  try {
    parsed = parsePkcs12(p12Buffer, password);
  } catch (err) {
    throw new Error(`Failed to parse PKCS#12: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
  
  const p12BufferStored = Buffer.from(p12Base64, 'base64');
  
  await query(
    `UPDATE companies SET
      sii_cert_data = $2,
      sii_cert_password = $3,
      sii_cert_subject = $4,
      sii_cert_issuer = $5,
      sii_cert_not_before = $6,
      sii_cert_not_after = $7,
      updated_at = NOW()
    WHERE id = $1`,
    [companyId, p12BufferStored, password, parsed.certInfo.subject, parsed.certInfo.issuer, parsed.certInfo.validFrom, parsed.certInfo.validTo]
  );
  
  return parsed;
}

/**
 * Retrieves certificate data for signing
 */
export async function getCertificateForSigning(companyId: string): Promise<{ privateKey: string; certificate: string; certInfo: any } | null> {
  const result = await query(
    `SELECT sii_cert_data, sii_cert_password, sii_cert_subject, sii_cert_issuer, sii_cert_not_before, sii_cert_not_after
     FROM companies WHERE id = $1`,
    [companyId]
  );
  
  if (!result.rows.length || !result.rows[0].sii_cert_data) {
    return null;
  }
  
  const row = result.rows[0];
  const p12Buffer = Buffer.from(row.sii_cert_data);
  
  try {
    return parsePkcs12(p12Buffer, row.sii_cert_password);
  } catch (err) {
    console.error('Failed to parse certificate:', err);
    return null;
  }
}

/**
 * Verifies a signed XML document
 */
export function verifySignedXml(signedXml: string, certPem: string): boolean {
  try {
    // Extract signature and signed info from XML
    const signatureMatch = signedXml.match(/<SignatureValue>([^<]+)<\/SignatureValue>/);
    const digestMatch = signedXml.match(/<DigestValue>([^<]+)<\/DigestValue>/);
    const certMatch = signedXml.match(/<X509Certificate>([^<]+)<\/X509Certificate>/);
    
    if (!signatureMatch || !digestMatch || !certMatch) {
      return false;
    }
    
    // In production, fully verify the signature chain
    // For now, basic structure check
    return true;
  } catch {
    return false;
  }
}

/**
 * CAF (Código de Autorización de Folios) management
 */
export interface CafData {
  tipoDte: string;
  folioDesde: number;
  folioHasta: number;
  folioActual: number;
  fechaVencimiento: Date;
  rsaPublicKey: string;
  certificado: string;
  archivoCafXml?: string;
}

export async function storeCaf(companyId: string, caf: CafData): Promise<void> {
  await query(
    `INSERT INTO sii_caf (company_id, tipo_dte, folio_desde, folio_hasta, folio_actual, fecha_vencimiento, rsa_public_key, certificado, archivo_caf_xml)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (company_id, tipo_dte) DO UPDATE SET
       folio_desde = EXCLUDED.folio_desde,
       folio_hasta = EXCLUDED.folio_hasta,
       folio_actual = EXCLUDED.folio_actual,
       fecha_vencimiento = EXCLUDED.fecha_vencimiento,
       rsa_public_key = EXCLUDED.rsa_public_key,
       certificado = EXCLUDED.certificado,
       archivo_caf_xml = EXCLUDED.archivo_caf_xml,
       updated_at = NOW()`,
    [companyId, caf.tipoDte, caf.folioDesde, caf.folioHasta, caf.folioActual || 0, caf.fechaVencimiento, caf.rsaPublicKey, caf.certificado, caf.archivoCafXml || null]
  );
}

export async function getCaf(companyId: string, tipoDte: string): Promise<CafData | null> {
  const result = await query(
    `SELECT tipo_dte, folio_desde, folio_hasta, folio_actual, fecha_vencimiento, rsa_public_key, certificado, archivo_caf_xml
     FROM sii_caf WHERE company_id = $1 AND tipo_dte = $2`,
    [companyId, tipoDte]
  );
  
  if (!result.rows.length) return null;
  
  const row = result.rows[0];
  return {
    tipoDte: row.tipo_dte,
    folioDesde: row.folio_desde,
    folioHasta: row.folio_hasta,
    folioActual: row.folio_actual || 0,
    fechaVencimiento: row.fecha_vencimiento,
    rsaPublicKey: row.rsa_public_key,
    certificado: row.certificado,
    archivoCafXml: row.archivo_caf_xml,
  };
}

export async function getNextFolio(companyId: string, tipoDte: string): Promise<number | null> {
  const caf = await getCaf(companyId, tipoDte);
  
  if (!caf) {
    return null; // No CAF configured
  }
  
  const nextFolio = (caf.folioActual || 0) + 1;
  
  if (nextFolio > caf.folioHasta) {
    return null; // No folios available in CAF range
  }
  
  // Update folio_actual
  await query(
    `UPDATE sii_caf SET folio_actual = $1, updated_at = NOW() WHERE company_id = $2 AND tipo_dte = $3`,
    [nextFolio, companyId, tipoDte]
  );
  
  return nextFolio;
}

/**
 * SII Environment URLs
 */
export const SII_URLS = {
  test: {
    seed: 'https://maullin.sii.cl/DTEWS/CrSeed.jws',
    getToken: 'https://maullin.sii.cl/DTEWS/GetTokenFromSeed.jws',
    envioDte: 'https://maullin.sii.cl/DTEWS/EnvioDTE.jws',
    consultaEstado: 'https://maullin.sii.cl/DTEWS/ConsultaEstado.jws',
    consultaSolicitud: 'https://maullin.sii.cl/DTEWS/ConsultaSolicitud.jws',
  },
  production: {
    seed: 'https://palena.sii.cl/DTEWS/CrSeed.jws',
    getToken: 'https://palena.sii.cl/DTEWS/GetTokenFromSeed.jws',
    envioDte: 'https://palena.sii.cl/DTEWS/EnvioDTE.jws',
    consultaEstado: 'https://palena.sii.cl/DTEWS/ConsultaEstado.jws',
    consultaSolicitud: 'https://palena.sii.cl/DTEWS/ConsultaSolicitud.jws',
  },
};

/**
 * Gets SII token for authentication
 */
export async function getSiiToken(companyId: string, isTest: boolean): Promise<string | null> {
  const urls = isTest ? SII_URLS.test : SII_URLS.production;
  
  try {
    // 1. Get seed
    const seedRes = await fetch(urls.seed);
    if (!seedRes.ok) throw new Error(`Seed request failed: ${seedRes.status}`);
    const seedXml = await seedRes.text();
    
    const seedMatch = seedXml.match(/<SEMILLA>([^<]+)<\/SEMILLA>/);
    if (!seedMatch) throw new Error('No seed in response');
    const seed = seedMatch[1];
    
    // 2. Sign seed with private key
    const certData = await getCertificateForSigning(companyId);
    if (!certData) throw new Error('No certificate configured');
    
    const sign = createSign('RSA-SHA1');
    sign.update(seed);
    sign.end();
    const signedSeed = sign.sign({ key: certData.privateKey, format: 'pem' }).toString('base64');
    
    // 3. Get token
    const tokenBody = `<?xml version="1.0" encoding="ISO-8859-1"?>
<GETTOKEN>
  <ITEM>
    <SEMILLA>${seed}</SEMILLA>
    <FIRMA>${signedSeed}</FIRMA>
  </ITEM>
</GETTOKEN>`;
    
    const tokenRes = await fetch(urls.getToken, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: tokenBody,
    });
    
    if (!tokenRes.ok) throw new Error(`Token request failed: ${tokenRes.status}`);
    
    const tokenXml = await tokenRes.text();
    const tokenMatch = tokenXml.match(/<TOKEN>([^<]+)<\/TOKEN>/);
    
    return tokenMatch?.[1] || null;
  } catch (err) {
    console.error('SII token error:', err);
    return null;
  }
}

/**
 * Sends DTE to SII
 */
export async function sendDteToSii(
  companyId: string,
  dteXml: string,
  tipoDte: string,
  isTest: boolean
): Promise<{ trackId: string; status: string }> {
  const token = await getSiiToken(companyId, isTest);
  if (!token) throw new Error('Failed to get SII token');
  
  const urls = isTest ? SII_URLS.test : SII_URLS.production;
  
  // Get company RUT for CARATULA
  const companyResult = await query(`SELECT tax_id FROM companies WHERE id = $1`, [companyId]);
  const companyRut = companyResult.rows[0]?.tax_id || '';
  
  const envioXml = `<?xml version="1.0" encoding="ISO-8859-1"?>
<ENVIO_DTE VERSION="1.0">
  <SETDTE>
    <CARATULA VERSION="1.0">
      <RUT_EMISOR>${companyRut}</RUT_EMISOR>
      <RUT_ENVIA>${companyRut}</RUT_ENVIA>
      <RUT_RECEPTOR>60803000-K</RUT_RECEPTOR>
      <FCH_RESOL>${new Date().toISOString().split('T')[0]}</FCH_RESOL>
      <NRO_RESOL>0</NRO_RESOL>
      <TPO_OPERACION>ENVIO</TPO_OPERACION>
    </CARATULA>
    ${dteXml}
  </SETDTE>
</ENVIO_DTE>`;
  
  const response = await fetch(urls.envioDte, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      'Cookie': `TOKEN=${token}`,
    },
    body: envioXml,
  });
  
  if (!response.ok) {
    throw new Error(`SII submission failed: ${response.status}`);
  }
  
  const responseXml = await response.text();
  const trackIdMatch = responseXml.match(/<TRACKID>([^<]+)<\/TRACKID>/);
  const statusMatch = responseXml.match(/<ESTADO>([^<]+)<\/ESTADO>/);
  
  return {
    trackId: trackIdMatch?.[1] || '',
    status: statusMatch?.[1] || 'unknown',
  };
}

/**
 * Parses CAF XML file (from SII)
 */
export function parseCafXml(cafXml: string): Partial<CafData> | null {
  try {
    // Parse CAF XML to extract folio range, RSA key, certificate, etc.
    // CAF XML structure from SII
    const tipoDteMatch = cafXml.match(/<TD>([^<]+)<\/TD>/);
    const folioDesdeMatch = cafXml.match(/<FRM_DESDE>([^<]+)<\/FRM_DESDE>/);
    const folioHastaMatch = cafXml.match(/<FRM_HASTA>([^<]+)<\/FRM_HASTA>/);
    const fechaVencMatch = cafXml.match(/<FEC_VENC>([^<]+)<\/FEC_VENC>/);
    const rsaPubMatch = cafXml.match(/<RSA_PUBLIC_KEY>([^<]+)<\/RSA_PUBLIC_KEY>/);
    const certMatch = cafXml.match(/<CERTIFICADO>([^<]+)<\/CERTIFICADO>/);
    
    if (!tipoDteMatch || !folioDesdeMatch || !folioHastaMatch) {
      return null;
    }
    
    return {
      tipoDte: tipoDteMatch[1],
      folioDesde: parseInt(folioDesdeMatch[1]),
      folioHasta: parseInt(folioHastaMatch[1]),
      folioActual: 0,
      fechaVencimiento: fechaVencMatch ? new Date(fechaVencMatch[1]) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      rsaPublicKey: rsaPubMatch?.[1] || '',
      certificado: certMatch?.[1] || '',
    };
  } catch {
    return null;
  }
}