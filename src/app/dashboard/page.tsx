'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  TrendingUp,
  Wallet,
  RefreshCw,
  Calendar,
  Zap,
  BarChart3,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DataTable } from '@/components/ui/DataTable';
import { api } from '@/lib/api';
import { formatCurrency, formatAddress, getRelativeTime } from '@/lib/utils';
import type { DashboardSummary, TopWallet, GlobalMetricsDay } from '@/types';

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Real data from API
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topWallets, setTopWallets] = useState<TopWallet[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetricsDay[]>([]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [summaryData, walletsData, metricsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getTopWallets(timeRange, 10),
        api.getGlobalMetrics(timeRange),
      ]);

      setSummary(summaryData);
      setTopWallets(walletsData.data || []);
      setGlobalMetrics(metricsData.data || []);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refetch when time range changes
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // Calculate derived metrics from global metrics
  const calculateDerivedMetrics = () => {
    if (!globalMetrics.length) {
      return {
        dau: summary?.dau || 0,
        wau: 0,
        mau: 0,
        avgSpotVolume: summary?.avgSpotPerUser || 0,
        avgPerpVolume: summary?.avgPerpPerUser || 0,
        totalSpotVolume: summary?.spotVolumeUsd || 0,
        totalPerpVolume: summary?.perpVolumeUsd || 0,
      };
    }

    // Calculate WAU (unique wallets in last 7 days)
    const last7Days = globalMetrics.slice(-7);
    const wau = Math.max(...last7Days.map(d => d.dau), 0);

    // Calculate MAU (unique wallets in last 30 days)
    const last30Days = globalMetrics.slice(-30);
    const mau = Math.max(...last30Days.map(d => d.dau), 0);

    // Calculate totals
    const totalSpotVolume = globalMetrics.reduce((sum, d) => sum + Number(d.spot_volume_usd), 0);
    const totalPerpVolume = globalMetrics.reduce((sum, d) => sum + Number(d.perp_volume_usd), 0);

    return {
      dau: summary?.dau || (globalMetrics[globalMetrics.length - 1]?.dau || 0),
      wau,
      mau,
      avgSpotVolume: summary?.avgSpotPerUser || 0,
      avgPerpVolume: summary?.avgPerpPerUser || 0,
      totalSpotVolume,
      totalPerpVolume,
    };
  };

  const metrics = calculateDerivedMetrics();

  // Error state
  if (error && !summary) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="w-12 h-12 text-danger mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Dashboard</h2>
          <p className="text-text-muted mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Dashboard</h1>
          <p className="text-text-secondary flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {lastUpdated ? `Last updated: ${getRelativeTime(lastUpdated)}` : 'Loading...'}
            {summary?.day && (
              <span className="text-text-muted">• Data for {summary.day}</span>
            )}
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
          <Button 
            variant="secondary" 
            onClick={fetchDashboardData} 
            loading={loading} 
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && !summary && (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 h-32 bg-obsidian/50" />
            ))}
          </div>
        </div>
      )}

      {/* User Activity Metrics */}
      {summary && (
        <>
          <div className="mb-8">
            <h2 className="font-display font-semibold text-xl text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-neon-cyan" />
              User Activity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard 
                title="Daily Active Users (DAU)" 
                value={metrics.dau} 
                subtitle="Wallets with at least 1 trade" 
                icon={Users} 
                color="cyan" 
                format="number" 
                delay={0} 
              />
              <MetricCard 
                title="Weekly Active Users (WAU)" 
                value={metrics.wau} 
                subtitle="Max DAU in last 7 days" 
                icon={Activity} 
                color="mint" 
                format="number" 
                delay={100} 
              />
              <MetricCard 
                title="Monthly Active Users (MAU)" 
                value={metrics.mau} 
                subtitle="Max DAU in last 30 days" 
                icon={Calendar} 
                color="pink" 
                format="number" 
                delay={200} 
              />
            </div>
          </div>

          {/* Volume Metrics */}
          <div className="mb-8">
            <h2 className="font-display font-semibold text-xl text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-neon-orange" />
              Volume Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard 
                title="Today's Spot Volume" 
                value={formatCurrency(Number(summary.spotVolumeUsd))} 
                subtitle="Total spot trading volume" 
                icon={Wallet} 
                color="cyan" 
                delay={0} 
              />
              <MetricCard 
                title="Today's Perp Volume" 
                value={formatCurrency(Number(summary.perpVolumeUsd))} 
                subtitle="Total perpetual volume" 
                icon={Zap} 
                color="mint" 
                delay={100} 
              />
              <MetricCard 
                title="Avg Spot per User" 
                value={formatCurrency(Number(summary.avgSpotPerUser))} 
                subtitle="Spot Volume / DAU" 
                icon={Wallet} 
                color="orange" 
                delay={200} 
              />
              <MetricCard 
                title="Avg Perp per User" 
                value={formatCurrency(Number(summary.avgPerpPerUser))} 
                subtitle="Perp Volume / DAU" 
                icon={Zap} 
                color="yellow" 
                delay={300} 
              />
            </div>
          </div>

          {/* Period Totals */}
          <div className="mb-8">
            <h2 className="font-display font-semibold text-xl text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-mint" />
              Period Totals ({timeRange})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-6">
                <p className="text-text-muted text-sm mb-2">Total Spot Volume</p>
                <p className="font-display font-bold text-3xl text-neon-cyan">
                  {formatCurrency(metrics.totalSpotVolume)}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <p className="text-text-muted text-sm mb-2">Total Perp Volume</p>
                <p className="font-display font-bold text-3xl text-neon-mint">
                  {formatCurrency(metrics.totalPerpVolume)}
                </p>
              </div>
            </div>
          </div>

          {/* Top Traders */}
          <SectionCard 
            title="Top Traders" 
            subtitle={`Top 10 by volume in the last ${timeRange}`}
          >
            {topWallets.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                No trading activity found for this period
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    key: 'rank',
                    header: '#',
                    render: (_, index) => (
                      <span className="text-text-muted font-mono">{index + 1}</span>
                    ),
                    className: 'w-12',
                  },
                  {
                    key: 'address',
                    header: 'Address',
                    render: (wallet) => (
                      <span className="font-mono text-neon-cyan">
                        {formatAddress(wallet.address)}
                      </span>
                    ),
                  },
                  {
                    key: 'spot_volume',
                    header: 'Spot Volume',
                    render: (wallet) => (
                      <span className="text-white">
                        {formatCurrency(Number(wallet.spot_volume_usd))}
                      </span>
                    ),
                  },
                  {
                    key: 'perp_volume',
                    header: 'Perp Volume',
                    render: (wallet) => (
                      <span className="text-white">
                        {formatCurrency(Number(wallet.perp_volume_usd))}
                      </span>
                    ),
                  },
                  {
                    key: 'trades',
                    header: 'Trades',
                    render: (wallet) => (
                      <span className="text-text-secondary">{wallet.trades}</span>
                    ),
                  },
                  {
                    key: 'last_trade',
                    header: 'Last Trade',
                    render: (wallet) => (
                      <span className="text-text-muted">
                        {wallet.last_trade_at ? getRelativeTime(wallet.last_trade_at) : '-'}
                      </span>
                    ),
                  },
                ]}
                data={topWallets}
                keyExtractor={(w) => w.wallet_id}
                emptyMessage="No traders found"
              />
            )}
          </SectionCard>
        </>
      )}
    </DashboardLayout>
  );
}