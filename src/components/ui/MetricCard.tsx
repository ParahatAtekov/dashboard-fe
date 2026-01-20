'use client';

import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatNumber, formatPercent } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  color?: 'cyan' | 'mint' | 'pink' | 'orange' | 'yellow';
  format?: 'number' | 'currency' | 'percent' | 'raw';
  className?: string;
  delay?: number;
}

const colorClasses = {
  cyan: {
    bg: 'from-neon-cyan/20 to-neon-cyan/5',
    border: 'border-neon-cyan/20',
    icon: 'text-neon-cyan',
    glow: 'shadow-glow-cyan',
  },
  mint: {
    bg: 'from-neon-mint/20 to-neon-mint/5',
    border: 'border-neon-mint/20',
    icon: 'text-neon-mint',
    glow: 'shadow-glow-mint',
  },
  pink: {
    bg: 'from-neon-pink/20 to-neon-pink/5',
    border: 'border-neon-pink/20',
    icon: 'text-neon-pink',
    glow: 'shadow-glow-pink',
  },
  orange: {
    bg: 'from-neon-orange/20 to-neon-orange/5',
    border: 'border-neon-orange/20',
    icon: 'text-neon-orange',
    glow: '',
  },
  yellow: {
    bg: 'from-neon-yellow/20 to-neon-yellow/5',
    border: 'border-neon-yellow/20',
    icon: 'text-neon-yellow',
    glow: '',
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon: Icon,
  color = 'cyan',
  format = 'raw',
  className,
  delay = 0,
}: MetricCardProps) {
  const colors = colorClasses[color];
  
  const formattedValue = (() => {
    if (typeof value === 'string') return value;
    switch (format) {
      case 'number':
        return formatNumber(value);
      case 'currency':
        return `$${formatNumber(value)}`;
      case 'percent':
        return formatPercent(value);
      default:
        return value.toLocaleString();
    }
  })();

  const TrendIcon = change === undefined ? null : change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = change === undefined ? '' : change > 0 ? 'text-success' : change < 0 ? 'text-danger' : 'text-text-muted';

  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] glow-border animate-fade-in',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-text-muted text-sm font-medium mb-1">{title}</p>
          <h3 className={cn('font-display font-bold text-3xl', colors.icon)}>
            {formattedValue}
          </h3>
          {subtitle && (
            <p className="text-text-muted text-xs mt-1 font-mono">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
            colors.bg,
            colors.border,
            'border'
          )}>
            <Icon className={cn('w-6 h-6', colors.icon)} />
          </div>
        )}
      </div>
      
      {change !== undefined && (
        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          {TrendIcon && <TrendIcon className={cn('w-4 h-4', trendColor)} />}
          <span className={cn('text-sm font-medium', trendColor)}>
            {change > 0 ? '+' : ''}{formatPercent(change)}
          </span>
          {changeLabel && (
            <span className="text-text-muted text-sm">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
