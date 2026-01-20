'use client';

import { useState } from 'react';
import {
  Users,
  Activity,
  TrendingUp,
  Wallet,
  RefreshCw,
  ArrowUpRight,
  Calendar,
  Zap,
  BarChart3,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { MetricPieChart, MetricBarChart } from '@/components/charts/Charts';
import { generateMockMetrics, formatCurrency, formatPercent, formatAddress, getRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [metrics, setMetrics] = useState(generateMockMetrics());
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setMetrics(generateMockMetrics());
    setLastUpdated(new Date().toISOString());
    setLoading(false);
  };

  const coinDistribution = [
    { name: 'ETH', value: 2500000, color: '#00f5ff' },
    { name: 'BTC', value: 1800000, color: '#00ff9d' },
    { name: 'SJ', value: 1200000, color: '#ff00ff' },
    { name: 'SOL', value: 800000, color: '#ff6b00' },
    { name: 'Others', value: 500000, color: '#f0ff00' },
  ];

  const userVolumeData = [
    { range: '$0-1K', users: 450 },
    { range: '$1K-10K', users: 320 },
    { range: '$10K-50K', users: 180 },
    { range: '$50K-100K', users: 75 },
    { range: '$100K+', users: 45 },
  ];

  const topTraders = [
    { address: '0x1234567890abcdef1234567890abcdef12345678', volume: 2500000, trades: 342, lastTrade: '2026-01-19T10:30:00Z' },
    { address: '0xabcdef1234567890abcdef1234567890abcdef12', volume: 1800000, trades: 256, lastTrade: '2026-01-19T09:45:00Z' },
    { address: '0x9876543210fedcba9876543210fedcba98765432', volume: 1500000, trades: 198, lastTrade: '2026-01-19T11:15:00Z' },
    { address: '0xfedcba9876543210fedcba9876543210fedcba98', volume: 1200000, trades: 167, lastTrade: '2026-01-18T23:20:00Z' },
    { address: '0x5555555555555555555555555555555555555555', volume: 950000, trades: 143, lastTrade: '2026-01-18T22:00:00Z' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Dashboard</h1>
          <p className="text-text-secondary flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last updated: {getRelativeTime(lastUpdated)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
            ]}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-40"
          />
          <Button variant="secondary" onClick={refreshData} loading={loading} icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* User Activity Metrics */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-xl text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-neon-cyan" />
          User Activity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard title="Daily Active Users (DAU)" value={metrics.dau} subtitle="Users with at least 1 trade" icon={Users} color="cyan" format="number" change={0.12} changeLabel="vs yesterday" delay={0} />
          <MetricCard title="Weekly Active Users (WAU)" value={metrics.wau} subtitle="Users with at least 1 trade" icon={Activity} color="mint" format="number" change={0.08} changeLabel="vs last week" delay={100} />
          <MetricCard title="Monthly Active Users (MAU)" value={metrics.mau} subtitle="Users with at least 1 trade" icon={Calendar} color="pink" format="number" change={0.15} changeLabel="vs last month" delay={200} />
        </div>
      </div>

      {/* Retention Metrics */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-xl text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-neon-mint" />
          Retention & Engagement
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Weekly Retention" value={formatPercent(metrics.frequentWeeklyRetention)} subtitle="≥1 trade each week / Total" color="cyan" change={0.03} changeLabel="vs last week" delay={0} />
          <MetricCard title="Monthly Retention" value={formatPercent(metrics.frequentMonthlyRetention)} subtitle="≥1 trade each month / Total" color="mint" change={0.05} changeLabel="vs last month" delay={100} />
          <MetricCard title="Exchange Churn Rate" value={formatPercent(metrics.exchangeChurnRate)} subtitle="(Current - Previous) / Previous MAU" color={metrics.exchangeChurnRate > 0 ? 'mint' : 'pink'} delay={200} />
          <MetricCard title="Exchange Retention" value={formatPercent(metrics.exchangeRetention)} subtitle="Current MAU / Previous MAU" color="cyan" delay={300} />
        </div>
      </div>

      {/* Volume Metrics */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-xl text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-neon-orange" />
          Volume Per User
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard title="Avg Spot Volume per User" value={formatCurrency(metrics.avgSpotVolumePerUser)} subtitle="Daily Spot Volume / DAU" icon={Wallet} color="orange" change={0.18} changeLabel="vs yesterday" delay={0} />
          <MetricCard title="Avg Perp Volume per User" value={formatCurrency(metrics.avgPerpVolumePerUser)} subtitle="Daily Perp Volume / DAU" icon={Zap} color="yellow" change={0.22} changeLabel="vs yesterday" delay={100} />
        </div>
      </div>

      {/* SJ Token Metrics */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-xl text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-pink" />
          SJ Token Performance
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Perp Volumes (SJ)" subtitle="Perpetual trading volume for SJ token">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-text-muted text-sm mb-1">Daily</p>
                <p className="font-display font-bold text-xl text-neon-cyan">{formatCurrency(metrics.dailyPerpVolumeSJ)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-text-muted text-sm mb-1">Weekly</p>
                <p className="font-display font-bold text-xl text-neon-mint">{formatCurrency(metrics.weeklyPerpVolumeSJ)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-text-muted text-sm mb-1">Monthly</p>
                <p className="font-display font-bold text-xl text-neon-pink">{formatCurrency(metrics.monthlyPerpVolumeSJ)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-text-muted text-sm mb-1">Total</p>
                <p className="font-display font-bold text-xl text-neon-orange">{formatCurrency(metrics.totalPerpVolumeSJ)}</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-neon-cyan/10 to-neon-mint/10 border border-neon-cyan/20">
              <p className="text-text-muted text-sm mb-1">Open Interest (Perps Only)</p>
              <p className="font-display font-bold text-2xl text-gradient-cyan">{formatCurrency(metrics.openInterestSJ)}</p>
            </div>
          </SectionCard>

          <SectionCard title="Spot Volumes (SJ)" subtitle="Spot trading volume for SJ token">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-text-muted text-sm mb-1">Daily</p>
                <p className="font-display font-bold text-xl text-neon-cyan">{formatCurrency(metrics.dailySpotVolumeSJ)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-text-muted text-sm mb-1">Weekly</p>
                <p className="font-display font-bold text-xl text-neon-mint">{formatCurrency(metrics.weeklySpotVolumeSJ)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-text-muted text-sm mb-1">Monthly</p>
                <p className="font-display font-bold text-xl text-neon-pink">{formatCurrency(metrics.monthlySpotVolumeSJ)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-text-muted text-sm mb-1">Total</p>
                <p className="font-display font-bold text-xl text-neon-orange">{formatCurrency(metrics.totalSpotVolumeSJ)}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SectionCard title="Coin Volume Distribution" subtitle="Volume breakdown by coin">
          <MetricPieChart data={coinDistribution} height={280} />
        </SectionCard>
        <SectionCard title="User Volume Distribution" subtitle="Number of users by volume range">
          <MetricBarChart data={userVolumeData} bars={[{ dataKey: 'users', name: 'Users', color: '#00f5ff' }]} xAxisKey="range" height={280} />
        </SectionCard>
      </div>

      {/* Top Traders Table */}
      <SectionCard title="Top Traders" subtitle="Highest volume traders in the selected period" action={<Button variant="ghost" size="sm">View All<ArrowUpRight className="w-4 h-4" /></Button>}>
        <DataTable
          columns={[
            { key: 'address', header: 'Wallet', render: (item) => <span className="font-mono text-neon-cyan">{formatAddress(item.address)}</span> },
            { key: 'volume', header: 'Volume', render: (item) => <span className="font-medium">{formatCurrency(item.volume)}</span>, className: 'text-right' },
            { key: 'trades', header: 'Trades', render: (item) => <span>{item.trades.toLocaleString()}</span>, className: 'text-right' },
            { key: 'lastTrade', header: 'Last Trade', render: (item) => <Badge variant="info">{getRelativeTime(item.lastTrade)}</Badge>, className: 'text-right' },
          ]}
          data={topTraders}
          keyExtractor={(item) => item.address}
        />
      </SectionCard>
    </DashboardLayout>
  );
}
