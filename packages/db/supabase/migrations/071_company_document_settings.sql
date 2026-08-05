-- Company document customization settings (admin per company)

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS document_settings JSONB DEFAULT '{
    "template_id": "classic",
    "primary_color": "#1e293b",
    "accent_color": "#4f46e5",
    "show_logo": true,
    "show_qr": true,
    "language": "es",
    "currency": "CLP",
    "tax_label": "IVA (19%)",
    "header_text": "",
    "footer_text": "Documento generado por Yellow ERP",
    "default_notes": "",
    "document_titles": {
      "boleta": "BOLETA DE VENTA",
      "factura": "FACTURA DE VENTA",
      "cotizacion": "COTIZACIÓN",
      "orden_venta": "ORDEN DE VENTA",
      "orden_compra": "ORDEN DE COMPRA"
    }
  }'::jsonb;