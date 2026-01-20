const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Dashboard endpoints
  async getDashboardSummary() {
    return this.request<{
      day: string;
      dau: number;
      spotVolumeUsd: number;
      perpVolumeUsd: number;
      avgSpotPerUser: number;
      avgPerpPerUser: number;
      updatedAt: string;
    }>('/api/v1/dashboard/summary');
  }

  // Metrics endpoints
  async getGlobalTimeseries(range: '7d' | '30d' | '90d' = '30d') {
    return this.request<Array<{
      day: string;
      dau: number;
      spot_volume_usd: number;
      perp_volume_usd: number;
    }>>(`/api/v1/metrics/global?range=${range}`);
  }

  // Wallet endpoints
  async getTopWallets(window: '7d' | '30d' = '30d', limit: number = 50) {
    return this.request<Array<{
      wallet_id: number;
      address: string;
      spot_volume_usd: number;
      perp_volume_usd: number;
      trades: number;
      last_trade_at: string;
    }>>(`/api/v1/wallets/top?window=${window}&limit=${limit}`);
  }

  async listWallets(limit: number = 50, offset: number = 0) {
    return this.request<{
      wallets: Array<{
        wallet_id: number;
        address: string;
        label: string | null;
        is_active: boolean;
        added_at: string;
        last_ingested_at: string | null;
        cursor_status: string | null;
        error_count: number;
      }>;
      total: number;
    }>(`/api/v1/wallets?limit=${limit}&offset=${offset}`);
  }

  async addWallet(address: string, label?: string, triggerBackfill: boolean = true) {
    return this.request<{
      wallet_id: number;
      address: string;
      label: string | null;
      is_new: boolean;
      backfill_job_id?: number;
    }>('/api/v1/wallets', {
      method: 'POST',
      body: JSON.stringify({ address, label, triggerBackfill }),
    });
  }

  async addWalletsBulk(wallets: Array<{ address: string; label?: string }>) {
    return this.request<{
      total: number;
      successful: number;
      failed: number;
      results: {
        successful: Array<{ wallet_id: number; address: string; label: string | null; is_new: boolean }>;
        failed: Array<{ address: string; error: string }>;
      };
    }>('/api/v1/wallets/bulk', {
      method: 'POST',
      body: JSON.stringify({ wallets }),
    });
  }

  async removeWallet(walletId: number) {
    return this.request<{ success: boolean; address?: string }>(
      `/api/v1/wallets/${walletId}`,
      { method: 'DELETE' }
    );
  }

  async validateWallet(address: string) {
    return this.request<{
      valid: boolean;
      hasActivity: boolean;
      error?: string;
    }>('/api/v1/wallets/validate', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }
}

export const api = new ApiClient();
