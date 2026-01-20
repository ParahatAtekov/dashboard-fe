import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
}

export function formatCurrency(num: number, currency: string = 'USD'): string {
  const formatted = formatNumber(num);
  return currency === 'USD' ? `$${formatted}` : `${formatted} ${currency}`;
}

export function formatPercent(num: number, decimals: number = 2): string {
  return `${(num * 100).toFixed(decimals)}%`;
}

export function formatAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function generateMockTimeseriesData(days: number = 30): Array<{
  date: string;
  dau: number;
  spotVolume: number;
  perpVolume: number;
}> {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic-looking data with some variance
    const baseDAU = 150 + Math.random() * 100;
    const basePerpVolume = 5_000_000 + Math.random() * 10_000_000;
    const baseSpotVolume = 500_000 + Math.random() * 2_000_000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      dau: Math.floor(baseDAU * (1 + Math.sin(i / 7) * 0.2)),
      spotVolume: Math.floor(baseSpotVolume * (1 + Math.cos(i / 5) * 0.3)),
      perpVolume: Math.floor(basePerpVolume * (1 + Math.sin(i / 3) * 0.25)),
    });
  }
  
  return data;
}

export function generateMockMetrics() {
  return {
    dau: Math.floor(150 + Math.random() * 100),
    wau: Math.floor(450 + Math.random() * 200),
    mau: Math.floor(1200 + Math.random() * 500),
    frequentWeeklyRetention: 0.35 + Math.random() * 0.2,
    frequentMonthlyRetention: 0.25 + Math.random() * 0.15,
    avgSpotVolumePerUser: 5000 + Math.random() * 10000,
    avgPerpVolumePerUser: 50000 + Math.random() * 100000,
    exchangeChurnRate: -0.05 + Math.random() * 0.15,
    aiSubscriptionChurnRate: -0.03 + Math.random() * 0.1,
    exchangeRetention: 0.85 + Math.random() * 0.1,
    dailyPerpVolumeSJ: 500000 + Math.random() * 1000000,
    weeklyPerpVolumeSJ: 3500000 + Math.random() * 5000000,
    monthlyPerpVolumeSJ: 15000000 + Math.random() * 20000000,
    totalPerpVolumeSJ: 150000000 + Math.random() * 100000000,
    openInterestSJ: 5000000 + Math.random() * 10000000,
    dailySpotVolumeSJ: 50000 + Math.random() * 100000,
    weeklySpotVolumeSJ: 350000 + Math.random() * 500000,
    monthlySpotVolumeSJ: 1500000 + Math.random() * 2000000,
    totalSpotVolumeSJ: 15000000 + Math.random() * 10000000,
  };
}
