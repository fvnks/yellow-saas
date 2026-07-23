'use client';

import { useCallback } from 'react';
import {
  openPrintWindow,
  generateInvoicePrint,
  generateDeliveryGuidePrint,
  generateCreditNotePrint,
  generateDebitNotePrint,
  generatePurchaseOrderPrint,
  generateQuotationPrint,
  generateSalesOrderPrint,
  generateGoodsReceiptPrint,
  type PrintDocumentData,
} from './print-utils';

export type PrintDocumentType =
  | 'invoice'
  | 'boleta'
  | 'factura'
  | 'delivery-guide'
  | 'credit-note'
  | 'debit-note'
  | 'purchase-order'
  | 'quotation'
  | 'sales-order'
  | 'goods-receipt';

export function usePrintDocument() {
  const print = useCallback((type: PrintDocumentType, data: PrintDocumentData) => {
    let html: string;

    switch (type) {
      case 'invoice':
      case 'boleta':
      case 'factura':
        html = generateInvoicePrint(data);
        break;
      case 'delivery-guide':
        html = generateDeliveryGuidePrint(data);
        break;
      case 'credit-note':
        html = generateCreditNotePrint(data);
        break;
      case 'debit-note':
        html = generateDebitNotePrint(data);
        break;
      case 'purchase-order':
        html = generatePurchaseOrderPrint(data);
        break;
      case 'quotation':
        html = generateQuotationPrint(data);
        break;
      case 'sales-order':
        html = generateSalesOrderPrint(data);
        break;
      case 'goods-receipt':
        html = generateGoodsReceiptPrint(data);
        break;
      default:
        html = generateInvoicePrint(data);
    }

    openPrintWindow(html, `${type} ${data.number}`);
  }, []);

  return { print };
}
