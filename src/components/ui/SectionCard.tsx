'use client';

import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  subtitle,
  children,
  action,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <div className={cn('glass-card rounded-2xl overflow-hidden', className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <h3 className="font-display font-semibold text-lg text-white">{title}</h3>
          {subtitle && (
            <p className="text-text-muted text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={cn('p-6', contentClassName)}>{children}</div>
    </div>
  );
}
