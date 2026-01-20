// API Response Types

export interface DashboardSummary {
  day: string;
  dau: number;
  spotVolumeUsd: number;
  perpVolumeUsd: number;
  avgSpotPerUser: number;
  avgPerpPerUser: number;
  updatedAt: string;
}

export interface GlobalMetricsDay {
  day: string;
  dau: number;
  spot_volume_usd: number;
  perp_volume_usd: number;
}

export interface TopWallet {
  wallet_id: number;
  address: string;
  spot_volume_usd: number;
  perp_volume_usd: number;
  trades: number;
  last_trade_at: string;
}

export interface WalletWithDetails {
  wallet_id: number;
  address: string;
  label: string | null;
  is_active: boolean;
  added_at: string;
  last_ingested_at: string | null;
  cursor_status: string | null;
  error_count: number;
}

export interface ListWalletsResponse {
  wallets: WalletWithDetails[];
  total: number;
}

export interface RegisterWalletResult {
  wallet_id: number;
  address: string;
  label: string | null;
  is_new: boolean;
  backfill_job_id?: number;
}

export interface BulkRegisterResult {
  total: number;
  successful: number;
  failed: number;
  results: {
    successful: RegisterWalletResult[];
    failed: Array<{ address: string; error: string }>;
  };
}

export interface ValidateWalletResult {
  valid: boolean;
  hasActivity: boolean;
  error?: string;
}

// Extended metrics for UI
export interface ExtendedMetrics {
  dau: number;
  wau: number;
  mau: number;
  frequentWeeklyRetention: number;
  frequentMonthlyRetention: number;
  avgSpotVolumePerUser: number;
  avgPerpVolumePerUser: number;
  exchangeChurnRate: number;
  aiSubscriptionChurnRate: number;
  exchangeRetention: number;
  dailyPerpVolumeSJ: number;
  weeklyPerpVolumeSJ: number;
  monthlyPerpVolumeSJ: number;
  totalPerpVolumeSJ: number;
  openInterestSJ: number;
  dailySpotVolumeSJ: number;
  weeklySpotVolumeSJ: number;
  monthlySpotVolumeSJ: number;
  totalSpotVolumeSJ: number;
  coinVolumeDistribution: Record<string, number>;
  userVolumeDistribution: Array<{ address: string; volume: number }>;
}

// User & Auth Types
export interface User {
  id: string;
  email: string;
  orgId: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MultiSeriesChartData {
  date: string;
  [key: string]: string | number;
}
