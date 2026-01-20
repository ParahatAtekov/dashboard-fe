import { useAuthStore } from '@/store/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getDashboardSummary: () => 
    fetchWithAuth('/api/v1/dashboard/summary'),
  
  getGlobalMetrics: (range = '30d') => 
    fetchWithAuth(`/api/v1/metrics/global?range=${range}`),
  
  getTopWallets: (window = '30d', limit = 50) => 
    fetchWithAuth(`/api/v1/wallets/top?window=${window}&limit=${limit}`),
  
  getWallets: (limit = 100, offset = 0) => 
    fetchWithAuth(`/api/v1/wallets?limit=${limit}&offset=${offset}`),
  
  addWallet: (address: string, label?: string) => 
    fetchWithAuth('/api/v1/wallets', {
      method: 'POST',
      body: JSON.stringify({ address, label, triggerBackfill: true }),
    }),
  
  addWalletsBulk: (wallets: Array<{ address: string; label?: string }>) =>
    fetchWithAuth('/api/v1/wallets/bulk', {
      method: 'POST',
      body: JSON.stringify({ wallets }),
    }),
  
  validateWallet: (address: string) =>
    fetchWithAuth('/api/v1/wallets/validate', {
      method: 'POST',
      body: JSON.stringify({ address }),
    }),
  
  deleteWallet: (walletId: number) =>
    fetchWithAuth(`/api/v1/wallets/${walletId}`, { 
      method: 'DELETE' 
    }),
};