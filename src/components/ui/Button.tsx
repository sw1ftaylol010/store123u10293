import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const MotionButton = motion.button;
    
    return (
      <MotionButton
        ref={ref}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            // Primary - Blue gradient button
            'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-xl': variant === 'primary',
            // Secondary - Light gray button
            'bg-background-secondary text-text-primary hover:bg-background-tertiary border border-border hover:shadow-md': variant === 'secondary',
            // Outline - Border button
            'border-2 border-primary text-primary hover:bg-primary-50': variant === 'outline',
            // Ghost - Transparent button
            'text-text-secondary hover:text-text-primary hover:bg-background-hover': variant === 'ghost',
            'px-3 py-1.5 text-sm rounded-lg': size === 'sm',
            'px-6 py-2.5 text-base rounded-lg': size === 'md',
            'px-8 py-3.5 text-lg rounded-xl': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            Loading...
          </>
        ) : (
          children
        )}
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';

