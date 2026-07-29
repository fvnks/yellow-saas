-- Migration 064: Add card transaction number to invoices
-- Stores the card machine transaction number for debit/credit payments

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS card_transaction_number TEXT;

COMMENT ON COLUMN invoices.card_transaction_number IS 'Card machine transaction number (debit/credit payments)';
