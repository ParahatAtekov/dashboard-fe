'use client';

import { useState } from 'react';
import {
  LineChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { MetricLineChart, MetricAreaChart, MetricBarChart } from '@/components/charts/Charts';
import { generateMockTimeseriesData, formatCurrency, formatNumber } from '@/lib/utils';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(generateMockTimeseriesData(30));

  const handleRangeChange = (range: string) => {
    setTimeRange(range);
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    setData(generateMockTimeseriesData(days));
  };

  const refreshData = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    setData(generateMockTimeseriesData(days));
    setLoading(false);
  };

  // Calculate summary stats
  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];
  const dauChange = previousData ? (latestData.dau - previousData.dau) / previousData.dau : 0;
  const perpChange = previousData ? (latestData.perpVolume - previousData.perpVolume) / previousData.perpVolume : 0;
  const spotChange = previousData ? (latestData.spotVolume - previousData.spotVolume) / previousData.spotVolume : 0;

  const totalPerpVolume = data.reduce((sum, d) => sum + d.perpVolume, 0);
  const totalSpotVolume = data.reduce((sum, d) => sum + d.spotVolume, 0);
  const avgDAU = data.reduce((sum, d) => sum + d.dau, 0) / data.length;

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-muted text-sm">Period Avg DAU</span>
            <div className={`flex items-center gap-1 text-sm ${dauChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {dauChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {(dauChange * 100).toFixed(1)}%
            </div>
          </div>
          <p className="font-display font-bold text-3xl text-neon-cyan">
            {formatNumber(avgDAU, 0)}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-muted text-sm">Total Perp Volume</span>
            <div className={`flex items-center gap-1 text-sm ${perpChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {perpChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {(perpChange * 100).toFixed(1)}%
            </div>
          </div>
          <p className="font-display font-bold text-3xl text-neon-mint">
            {formatCurrency(totalPerpVolume)}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-muted text-sm">Total Spot Volume</span>
            <div className={`flex items-center gap-1 text-sm ${spotChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {spotChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {(spotChange * 100).toFixed(1)}%
            </div>
          </div>
          <p className="font-display font-bold text-3xl text-neon-pink">
            {formatCurrency(totalSpotVolume)}
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
          data={data.slice(-14)} // Last 14 days for bar chart readability
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
    </DashboardLayout>
  );
}
