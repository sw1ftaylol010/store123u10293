import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          {
            'bg-background-secondary text-text-secondary border border-border': variant === 'default',
            'bg-success-light text-success-dark border border-success/30': variant === 'success',
            'bg-warning-light text-warning-dark border border-warning/30': variant === 'warning',
            'bg-error-light text-error-dark border border-error/30': variant === 'error',
            'bg-primary-50 text-primary-700 border border-primary/30': variant === 'primary',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

