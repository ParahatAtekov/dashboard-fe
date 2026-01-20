'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatNumber, formatDate } from '@/lib/utils';

interface ChartProps {
  data: Array<Record<string, unknown>>;
  height?: number;
}

interface LineChartProps extends ChartProps {
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  xAxisKey?: string;
}

interface AreaChartProps extends ChartProps {
  areas: Array<{
    dataKey: string;
    name: string;
    color: string;
    gradientId: string;
  }>;
  xAxisKey?: string;
  stacked?: boolean;
}

interface BarChartProps extends ChartProps {
  bars: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  xAxisKey?: string;
  stacked?: boolean;
}

interface PieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-3 shadow-glass border border-neon-cyan/20">
        <p className="text-neon-cyan text-sm font-medium mb-2">{formatDate(label || '')}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-secondary">{entry.name}:</span>
            <span className="text-white font-mono">
              {typeof entry.value === 'number' ? formatNumber(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function MetricLineChart({ data, lines, xAxisKey = 'date', height = 300 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey={xAxisKey}
          tickFormatter={(value) => formatDate(value)}
          stroke="rgba(255,255,255,0.3)"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatNumber(value)}
          stroke="rgba(255,255,255,0.3)"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span className="text-text-secondary text-sm">{value}</span>}
        />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: line.color, stroke: '#050508', strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MetricAreaChart({ data, areas, xAxisKey = 'date', height = 300, stacked = false }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {areas.map((area) => (
            <linearGradient key={area.gradientId} id={area.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey={xAxisKey}
          tickFormatter={(value) => formatDate(value)}
          stroke="rgba(255,255,255,0.3)"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatNumber(value)}
          stroke="rgba(255,255,255,0.3)"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span className="text-text-secondary text-sm">{value}</span>}
        />
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={area.color}
            strokeWidth={2}
            fill={`url(#${area.gradientId})`}
            stackId={stacked ? '1' : undefined}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MetricBarChart({ data, bars, xAxisKey = 'date', height = 300, stacked = false }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey={xAxisKey}
          tickFormatter={(value) => formatDate(value)}
          stroke="rgba(255,255,255,0.3)"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatNumber(value)}
          stroke="rgba(255,255,255,0.3)"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span className="text-text-secondary text-sm">{value}</span>}
        />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? '1' : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MetricPieChart({ data, height = 300 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="glass-card rounded-lg p-3 shadow-glass border border-neon-cyan/20">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: data.color }}
                    />
                    <span className="text-white font-medium">{data.name}</span>
                  </div>
                  <p className="text-neon-cyan font-mono mt-1">${formatNumber(data.value)}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          formatter={(value) => <span className="text-text-secondary text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
