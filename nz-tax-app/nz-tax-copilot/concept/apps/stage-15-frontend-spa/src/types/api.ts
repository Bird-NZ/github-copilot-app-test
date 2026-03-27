export interface ApiError {
  status: number;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
}

export interface ReviewWarning {
  code: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

export interface CryptoTaxableActivity {
  activity: string;
  taxable: boolean;
}

export interface CryptoReview {
  intro: string;
  transactionCounts: Record<string, number>;
  taxableActivities: CryptoTaxableActivity[];
  whatToProvide: string[];
  status: {
    hasCryptoCsv: boolean;
    hasAnyCryptoActivity: boolean;
    saidHasCrypto: boolean;
  };
}

export interface WorkspaceReview {
  warnings: ReviewWarning[];
  crypto: CryptoReview;
}
