export type ReconciliationStatus = 'pending' | 'in_progress' | 'reconciled' | 'cancelled';
export type BankTransactionType = 'credit' | 'debit';
export type ReconciliationSource = 'manual' | 'import_csv' | 'import_ofx' | 'auto';
export type MatchStatus = 'matched' | 'partial' | 'unmatched' | 'auto_matched';

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  openingBalanceCLP: number;
  lastReconciledAt: string | null;
  status: 'active' | 'inactive';
}

export interface BankStatementLine {
  id: string;
  accountId: string;
  statementDate: string;
  transactionDate: string;
  description: string;
  amountCLP: number;
  type: BankTransactionType;
  referenceNumber?: string;
  category?: string;
  source: ReconciliationSource;
  matchStatus: MatchStatus;
  matchedEntryId?: string;
  matchedAmountCLP?: number;
  differenceCLP?: number;
  notes?: string;
  createdAt: string;
}

export interface ReconciliationMatch {
  id: string;
  statementLineId: string;
  entryId: string;
  matchAmountCLP: number;
  differenceCLP: number;
  matchedAt: string;
  matchedBy: string;
  matchType: 'full' | 'partial';
}

export interface ReconciliationSession {
  id: string;
  accountId: string;
  statementPeriod: string;
  status: ReconciliationStatus;
  openingBalanceCLP: number;
  statementBalanceCLP: number;
  reconciledAmountCLP: number;
  unmatchedAmountCLP: number;
  differencesCLP: number;
  createdAt: string;
  completedAt?: string;
  lines: BankStatementLine[];
  matches: ReconciliationMatch[];
}

export interface ReconciliationStats {
  totalAccounts: number;
  activeAccounts: number;
  totalStatements: number;
  reconciledStatements: number;
  pendingStatements: number;
  totalMatchedCLP: number;
  totalUnmatchedCLP: number;
  totalDifferencesCLP: number;
}
