'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  percentChange?: number;
  icon?: ReactNode;
  iconColor?: 'success' | 'primary' | 'warning' | 'error';
  progress?: number; // 0-100
  className?: string;
  trend?: 'up' | 'down';
}

export function StatsCard({
  title,
  value,
  percentChange,
  icon,
  iconColor = 'success',
  progress,
  className,
  trend,
}: StatsCardProps) {
  const iconColorClasses = {
    success: 'bg-success',
    primary: 'bg-primary',
    warning: 'bg-warning',
    error: 'bg-error',
  };

  const percentColorClasses = {
    up: 'text-success-dark',
    down: 'text-error-dark',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center">
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              'relative p-2 w-10 h-10 rounded-full flex items-center justify-center',
              iconColorClasses[iconColor]
            )}
          >
            <div className="text-white">{icon}</div>
          </div>
        )}

        {/* Title */}
        <h3 className="ml-3 text-text-secondary text-base font-medium">
          {title}
        </h3>

        {/* Percent Change */}
        {percentChange !== undefined && (
          <div className={cn('ml-auto flex items-center gap-1 font-semibold text-sm', percentColorClasses[trend || (percentChange >= 0 ? 'up' : 'down')])}>
            {percentChange > 0 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : percentChange < 0 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            ) : null}
            {Math.abs(percentChange)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <p className="text-4xl font-bold text-text-primary">{value}</p>
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="relative w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
            <div
              className={cn(
                'absolute top-0 left-0 h-full rounded-full transition-all duration-500',
                iconColorClasses[iconColor]
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          {progress !== undefined && (
            <p className="mt-2 text-xs text-text-tertiary">
              {progress}% of target
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Preset variants for common use cases
export function RevenueStatsCard({
  value,
  percentChange,
  progress,
  className,
}: {
  value: string | number;
  percentChange?: number;
  progress?: number;
  className?: string;
}) {
  return (
    <StatsCard
      title="Total Revenue"
      value={value}
      percentChange={percentChange}
      progress={progress}
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      iconColor="success"
      trend={percentChange && percentChange >= 0 ? 'up' : 'down'}
      className={className}
    />
  );
}

export function OrdersStatsCard({
  value,
  percentChange,
  progress,
  className,
}: {
  value: string | number;
  percentChange?: number;
  progress?: number;
  className?: string;
}) {
  return (
    <StatsCard
      title="Total Orders"
      value={value}
      percentChange={percentChange}
      progress={progress}
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      }
      iconColor="primary"
      trend={percentChange && percentChange >= 0 ? 'up' : 'down'}
      className={className}
    />
  );
}

export function CustomersStatsCard({
  value,
  percentChange,
  progress,
  className,
}: {
  value: string | number;
  percentChange?: number;
  progress?: number;
  className?: string;
}) {
  return (
    <StatsCard
      title="New Customers"
      value={value}
      percentChange={percentChange}
      progress={progress}
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      }
      iconColor="primary"
      trend={percentChange && percentChange >= 0 ? 'up' : 'down'}
      className={className}
    />
  );
}

export function ConversionStatsCard({
  value,
  percentChange,
  progress,
  className,
}: {
  value: string | number;
  percentChange?: number;
  progress?: number;
  className?: string;
}) {
  return (
    <StatsCard
      title="Conversion Rate"
      value={value}
      percentChange={percentChange}
      progress={progress}
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      }
      iconColor="warning"
      trend={percentChange && percentChange >= 0 ? 'up' : 'down'}
      className={className}
    />
  );
}

