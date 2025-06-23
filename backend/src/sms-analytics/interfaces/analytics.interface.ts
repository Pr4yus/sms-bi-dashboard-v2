export interface SMSAnalyticsData {
  country: string;
  year: number;
  month: number;
  total_sms: number;
  successful_sms: number;
  error_sms: number;
  success_rate: number;
  accounts: AccountData[];
  generated_at: string;
}

export interface AccountData {
  account_uid: string;
  account_name: string;
  total_sms: number;
  successful_sms: number;
  error_sms: number;
  success_rate: number;
  balance_vs_package?: BalanceVsPackage;
  parent_account_uid?: string;
  client_id?: string;
  package_size?: number;
  usage_percentage?: number;
  usage_status?: 'alto' | 'adecuado' | 'bajo' | 'critico';
}

export interface BalanceVsPackage {
  current_balance: number;
  package_size: number;
  usage_percentage: number;
  remaining_sms: number;
  overage_sms: number;
  status: 'under' | 'adequate' | 'over';
}

export interface RegionalMetrics {
  year: number;
  month: number;
  total_sms: number;
  total_successful: number;
  total_errors: number;
  overall_success_rate: number;
  key_accounts: Record<string, KeyAccountMetrics>;
  generated_at: string;
}

export interface KeyAccountMetrics {
  account_name: string;
  total_sms: number;
  successful_sms: number;
  error_sms: number;
  success_rate: number;
  data_source: string;
}

export interface HierarchicalAccount {
  account_uid: string;
  account_name: string;
  total_sms: number;
  successful_sms: number;
  error_sms: number;
  success_rate: number;
  children?: HierarchicalAccount[];
  is_parent: boolean;
  parent_account_uid?: string;
}

export interface ClientData {
  client_id: string;
  client_name: string;
  total_accounts: number;
  total_sms: number;
  successful_sms: number;
  error_sms: number;
  success_rate: number;
  accounts: AccountData[];
}

export interface RegionalSummary {
  period: string;
  grand_totals: {
    total_messages: number;
    successful_messages: number;
    error_messages: number;
    success_rate: number;
  };
  countries: Record<string, CountrySummary>;
  generated_at: string;
}

export interface CountrySummary {
  country: string;
  total_messages: number;
  successful_messages: number;
  error_messages: number;
  success_rate: number;
  top_clients: ClientSummary[];
}

export interface ClientSummary {
  client_id: string;
  client_name: string;
  total_messages: number;
  successful_messages: number;
  error_messages: number;
  success_rate: number;
}

export interface ConnectionStatus {
  [country: string]: {
    connected: boolean;
    database: string;
    collections: {
      accounts: boolean;
      transactions: boolean;
      transactionspertype: boolean;
    };
  };
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory_usage: number;
} 