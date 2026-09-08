export interface DTEData {
  id: string;
  type: '33' | '46' | '56' | '55';
  folio: number;
  date: string;
  seller: {
    id: string;
    name: string;
    rut: string;
    address: string;
    city: string;
    region: string;
    phone: string;
    email: string;
  };
  buyer: {
    id: string;
    name: string;
    rut: string;
    address: string;
    city: string;
    region: string;
    phone: string;
    email: string;
  };
  items: {
    qty: number;
    unit: string;
    description: string;
    price: number;
    discount: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  taxable: number;
  iva: number;
  total: number;
  payment?: {
    method: string;
    terms: string;
  };
  observations?: string;
}

export function generateFacturaElectronica(data: DTEData): string {
  const { seller, buyer, items, subtotal, discount, taxable, iva, total, folio, date } = data;

  const itemsXml = items.map((item, i) => `
        <ItemReferencia>
          <IdElemDoc>${i + 1}</IdElemDoc>
          <TpoDoc>${data.type}</TpoDoc>
          <NroDoc>${folio}</NroDoc>
          <TpoDespacho>1</TpoDespacho>
          <CodArticul>${item.description.substring(0, 50)}</CodArticul>
          <DesArticul>${item.description}</DesArticul>
          <QtyUnitMed>${item.qty}</QtyUnitMed>
          <UnitMed>${item.unit || 'KGM'}</UnitMed>
          <PrcUnitario>${item.price.toFixed(2)}</PrcUnitario>
          <DescUnit>${item.discount > 0 ? item.discount.toFixed(2) : ''}</DescUnit>
          <MontoItem>${item.total.toFixed(2)}</MontoItem>
        </ItemReferencia>`).join('');

  return `<?xml version="1.0" encoding="ISO-8859-1"?>
<DTE VERSION="1.0">
  <DR>
    <TD>${data.type}</TD>
    <F>${folio}</F>
    <FE>${date}</FE>
    <RR>${seller.rut.replace(/[^0-9-]/g, '')}</RR>
    <RsRR>${seller.name}</RsRR>
    <EE>${seller.email}</EE>
    <RE>${seller.region}</RE>
    <CR>${seller.city}</CR>
    <CZ>${seller.address}</CZ>
    <TN>${seller.phone}</TN>
    <RR2>${buyer.rut.replace(/[^0-9-]/g, '')}</RR2>
    <RsRR2>${buyer.name}</RsRR2>
    <EE2>${buyer.email}</EE2>
    <RE2>${buyer.region}</RE2>
    <CR2>${buyer.city}</CR2>
    <CZ2>${buyer.address}</CZ2>
    <GiroRR2>${buyer.name}</GiroRR2>
    ${itemsXml}
    <MntNeto>${subtotal.toFixed(2)}</MntNeto>
    ${discount > 0 ? `<DescTotal>${discount.toFixed(2)}</DescTotal>` : ''}
    <MntExe>${(total - taxable - iva).toFixed(2)}</MntExe>
    <IVA>
      <BaseImponible>${(total - discount).toFixed(2)}</BaseImponible>
      <TasaIVA>19</TasaIVA>
      <MntIVA>${iva.toFixed(2)}</MntIVA>
    </IVA>
    <MntTotal>${total.toFixed(2)}</MntTotal>
    ${data.payment ? `
    <Pagos>
      <TpoPago>${data.payment.method || '0'}</TpoPago>
      <Plazo>${data.payment.terms || '0'}</Plazo>
    </Pagos>` : ''}
    ${data.observations ? `<Observacion>${data.observations}</Observacion>` : ''}
  </DR>
</DTE>`;
}

export function generateNotaDebito(data: DTEData): string {
  const template = generateFacturaElectronica(data);
  return template.replace(/<TD>33<\/TD>/, '<TD>46</TD>');
}

export function generateNotaCredito(data: DTEData): string {
  const template = generateFacturaElectronica(data);
  return template.replace(/<TD>33<\/TD>/, '<TD>56</TD>');
}

export function generateGuiaDespacho(data: DTEData): string {
  const { seller, buyer, items, subtotal, total, folio } = data;

  const itemsXml = items.map((item, i) => `
        <ItemReferencia>
          <IdElemDoc>${i + 1}</IdElemDoc>
          <TpoDoc>${data.type}</TpoDoc>
          <NroDoc>${folio}</NroDoc>
          <QtyUnitMed>${item.qty}</QtyUnitMed>
          <UnitMed>${item.unit || 'KGM'}</UnitMed>
          <DesArticul>${item.description}</DesArticul>
        </ItemReferencia>`).join('');

  return `<?xml version="1.0" encoding="ISO-8859-1"?>
<DTE VERSION="1.0">
  <DR>
    <TD>55</TD>
    <F>${data.folio}</F>
    <FE>${data.date}</FE>
    <RR>${seller.rut.replace(/[^0-9-]/g, '')}</RR>
    <RsRR>${seller.name}</RsRR>
    <EE>${seller.email}</EE>
    <RE>${seller.region}</RE>
    <CR>${seller.city}</CR>
    <CZ>${seller.address}</CZ>
    <TN>${seller.phone}</TN>
    <RR2>${buyer.rut.replace(/[^0-9-]/g, '')}</RR2>
    <RsRR2>${buyer.name}</RsRR2>
    <EE2>${buyer.email}</EE2>
    <RE2>${buyer.region}</RE2>
    <CR2>${buyer.city}</CR2>
    <CZ2>${buyer.address}</CZ2>
    ${itemsXml}
    <MntNeto>${subtotal.toFixed(2)}</MntNeto>
    <MntTotal>${total.toFixed(2)}</MntTotal>
  </DR>
</DTE>`;
}

export function generateDTE(type: '33' | '46' | '56' | '55', data: DTEData): string {
  switch (type) {
    case '46':
      return generateNotaDebito(data);
    case '56':
      return generateNotaCredito(data);
    case '55':
      return generateGuiaDespacho(data);
    default:
      return generateFacturaElectronica(data);
  }
}
