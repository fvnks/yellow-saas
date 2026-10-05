// ============================================
// INTEGRACIÓN DTE - BOLETAS ELECTRÓNICAS
// ============================================

/**
 * Genera los datos para una boleta electrónica (DTE 39)
 * para pensiones escolares
 */
export interface BoletaPension {
  rutEmisor: string;
  razonSocialEmisor: string;
  rutReceptor: string;
  razonSocialReceptor: string;
  folio: number;
  fechaEmision: string;
  montoNeto: number;
  montoIva: number;
  montoTotal: number;
  glosa: string;
  mes: number;
  anio: number;
}

export function generarBoletaPension(data: {
  rutEmisor: string;
  razonSocialEmisor: string;
  rutApoderado: string;
  nombreApoderado: string;
  folio: number;
  monto: number;
  mes: number;
  anio: number;
  estudianteNombre: string;
  curso: string;
}): BoletaPension {
  const iva = Math.round(data.monto * 0.19);
  const neto = data.monto - iva;
  
  return {
    rutEmisor: data.rutEmisor,
    razonSocialEmisor: data.razonSocialEmisor,
    rutReceptor: data.rutApoderado,
    razonSocialReceptor: data.nombreApoderado,
    folio: data.folio,
    fechaEmision: new Date().toISOString().split('T')[0],
    montoNeto: neto,
    montoIva: iva,
    montoTotal: data.monto,
    glosa: `Pensión Escolar ${data.mes}/${data.anio} - ${data.estudianteNombre} - ${data.curso}`,
    mes: data.mes,
    anio: data.anio,
  };
}

/**
 * Genera el contenido del DTE en formato XML (simplificado)
 */
export function generarDTEXML(boleta: BoletaPension): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<DTE version="1.0">
  <Documento ID="BOLETA_${boleta.folio}">
    <Encabezado>
      <IdDoc>
        <TipoDTE>39</TipoDTE>
        <Folio>${boleta.folio}</Folio>
        <FchEmis>${boleta.fechaEmision}</FchEmis>
      </IdDoc>
      <Emisor>
        <RUTEmisor>${boleta.rutEmisor}</RUTEmisor>
        <RznSoc>${boleta.razonSocialEmisor}</RznSoc>
      </Emisor>
      <Receptor>
        <RUTRecep>${boleta.rutReceptor}</RUTRecep>
        <RznSocRecep>${boleta.razonSocialReceptor}</RznSocRecep>
      </Receptor>
      <Totales>
        <MntNeto>${boleta.montoNeto}</MntNeto>
        <IVA>${boleta.montoIva}</IVA>
        <MntTotal>${boleta.montoTotal}</MntTotal>
      </Totales>
    </Encabezado>
    <Detalle>
      <NroLinDet>1</NroLinDet>
      <NmbItem>${boleta.glosa}</NmbItem>
      <MontoItem>${boleta.montoTotal}</MontoItem>
    </Detalle>
  </Documento>
</DTE>`;
}
