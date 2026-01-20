'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { MetricLineChart, MetricAreaChart, MetricBarChart } from '@/components/charts/Charts';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { GlobalMetricsDay } from '@/types';

// Transform API data to chart format
interface ChartDataPoint {
  date: string;
  dau: number;
  perpVolume: number;
  spotVolume: number;
}

function transformMetricsToChartData(metrics: GlobalMetricsDay[]): ChartDataPoint[] {
  return metrics.map(m => ({
    date: m.day,
    dau: m.dau,
    perpVolume: Number(m.perp_volume_usd),
    spotVolume: Number(m.spot_volume_usd),
  }));
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ChartDataPoint[]>([]);

  // Fetch metrics from API
  const fetchMetrics = async (range: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getGlobalMetrics(range);
      const chartData = transformMetricsToChartData(response.data || []);
      setData(chartData);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMetrics(timeRange);
  }, []);

  // Handle range change
  const handleRangeChange = (range: string) => {
    setTimeRange(range);
    fetchMetrics(range);
  };

  // Refresh data
  const refreshData = async () => {
    await fetchMetrics(timeRange);
  };

  // Calculate summary stats
  const calculateStats = () => {
    if (data.length < 2) {
      return {
        avgDAU: 0,
        totalPerpVolume: 0,
        totalSpotVolume: 0,
        dauChange: 0,
        perpChange: 0,
        spotChange: 0,
      };
    }

    const latestData = data[data.length - 1];
    const previousData = data[data.length - 2];

    const avgDAU = data.reduce((sum, d) => sum + d.dau, 0) / data.length;
    const totalPerpVolume = data.reduce((sum, d) => sum + d.perpVolume, 0);
    const totalSpotVolume = data.reduce((sum, d) => sum + d.spotVolume, 0);

    const dauChange = previousData.dau > 0 
      ? (latestData.dau - previousData.dau) / previousData.dau 
      : 0;
    const perpChange = previousData.perpVolume > 0 
      ? (latestData.perpVolume - previousData.perpVolume) / previousData.perpVolume 
      : 0;
    const spotChange = previousData.spotVolume > 0 
      ? (latestData.spotVolume - previousData.spotVolume) / previousData.spotVolume 
      : 0;

    return {
      avgDAU,
      totalPerpVolume,
      totalSpotVolume,
      dauChange,
      perpChange,
      spotChange,
    };
  };

  const stats = calculateStats();

  // Error state
  if (error && data.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="w-12 h-12 text-danger mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Analytics</h2>
          <p className="text-text-muted mb-4">{error}</p>
          <Button onClick={refreshData}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">
            Analytics
          </h1>
          <p className="text-text-secondary">
            Historical trends and performance metrics
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
            onChange={(e) => handleRangeChange(e.target.value)}
            className="w-40"
          />
          <Button
            variant="secondary"
            onClick={refreshData}
            loading={loading}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button variant="ghost" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && data.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
        </div>
      )}

      {/* Content */}
      {data.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-muted text-sm">Period Avg DAU</span>
                <div className={`flex items-center gap-1 text-sm ${stats.dauChange >= 0 ? 'text-success' : 'text-danger'}`}>
                  {stats.dauChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {(stats.dauChange * 100).toFixed(1)}%
                </div>
              </div>
              <p className="font-display font-bold text-3xl text-neon-cyan">
                {formatNumber(stats.avgDAU, 0)}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-muted text-sm">Total Perp Volume</span>
                <div className={`flex items-center gap-1 text-sm ${stats.perpChange >= 0 ? 'text-success' : 'text-danger'}`}>
                  {stats.perpChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {(stats.perpChange * 100).toFixed(1)}%
                </div>
              </div>
              <p className="font-display font-bold text-3xl text-neon-mint">
                {formatCurrency(stats.totalPerpVolume)}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-muted text-sm">Total Spot Volume</span>
                <div className={`flex items-center gap-1 text-sm ${stats.spotChange >= 0 ? 'text-success' : 'text-danger'}`}>
                  {stats.spotChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {(stats.spotChange * 100).toFixed(1)}%
                </div>
              </div>
              <p className="font-display font-bold text-3xl text-neon-pink">
                {formatCurrency(stats.totalSpotVolume)}
              </p>
            </div>
          </div>

          {/* DAU Chart */}
          <SectionCard
            title="Daily Active Users"
            subtitle={`User activity over the last ${timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}`}
            className="mb-6"
            action={
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Calendar className="w-4 h-4" />
                <span>{data[0]?.date} - {data[data.length - 1]?.date}</span>
              </div>
            }
          >
            <MetricAreaChart
              data={data}
              areas={[
                {
                  dataKey: 'dau',
                  name: 'Daily Active Users',
                  color: '#00f5ff',
                  gradientId: 'dauGradient',
                },
              ]}
              height={350}
            />
          </SectionCard>

          {/* Volume Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SectionCard
              title="Daily Perp Volume"
              subtitle="Perpetual trading volume trends"
            >
              <MetricAreaChart
                data={data}
                areas={[
                  {
                    dataKey: 'perpVolume',
                    name: 'Perp Volume',
                    color: '#00ff9d',
                    gradientId: 'perpGradient',
                  },
                ]}
                height={300}
              />
            </SectionCard>

            <SectionCard
              title="Daily Spot Volume"
              subtitle="Spot trading volume trends"
            >
              <MetricAreaChart
                data={data}
                areas={[
                  {
                    dataKey: 'spotVolume',
                    name: 'Spot Volume',
                    color: '#ff00ff',
                    gradientId: 'spotGradient',
                  },
                ]}
                height={300}
              />
            </SectionCard>
          </div>

          {/* Combined Volume Chart */}
          <SectionCard
            title="Volume Comparison"
            subtitle="Perp vs Spot volume side by side"
            className="mb-6"
          >
            <MetricLineChart
              data={data}
              lines={[
                {
                  dataKey: 'perpVolume',
                  name: 'Perp Volume',
                  color: '#00ff9d',
                },
                {
                  dataKey: 'spotVolume',
                  name: 'Spot Volume',
                  color: '#ff00ff',
                },
              ]}
              height={350}
            />
          </SectionCard>

          {/* Stacked Bar Chart */}
          <SectionCard
            title="Daily Volume Breakdown"
            subtitle="Combined view of trading activity"
          >
            <MetricBarChart
              data={data.slice(-14)}
              bars={[
                {
                  dataKey: 'perpVolume',
                  name: 'Perp Volume',
                  color: '#00ff9d',
                },
                {
                  dataKey: 'spotVolume',
                  name: 'Spot Volume',
                  color: '#ff00ff',
                },
              ]}
              height={350}
              stacked
            />
          </SectionCard>
        </>
      )}

      {/* Empty state */}
      {!loading && data.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Calendar className="w-12 h-12 text-text-muted mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Data Available</h2>
          <p className="text-text-muted mb-4">
            There is no metrics data for this time period yet.
          </p>
          <Button onClick={refreshData}>Refresh</Button>
        </div>
      )}
    </DashboardLayout>
  );
}