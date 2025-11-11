'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface StepperStep {
  id: string;
  title: string;
  status: 'completed' | 'active' | 'pending';
  statusLabel?: string;
  time?: string;
  icon?: ReactNode;
}

interface StepperProps {
  steps: StepperStep[];
  className?: string;
}

export function Stepper({ steps, className }: StepperProps) {
  return (
    <div className={cn('bg-white rounded-xl p-8 shadow-card', className)}>
      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex">
            {/* Vertical line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute left-[19px] top-10 bottom-[-32px] w-0.5 z-[1]',
                  step.status === 'completed' ? 'bg-primary' : 'bg-border'
                )}
              />
            )}

            {/* Circle */}
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center mr-4 z-[2] shrink-0',
                {
                  'bg-primary text-white': step.status === 'completed',
                  'border-2 border-primary text-primary bg-white': step.status === 'active',
                  'border-2 border-border text-text-tertiary bg-white': step.status === 'pending',
                }
              )}
            >
              {step.status === 'completed' ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span className="font-semibold">{index + 1}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3
                className={cn('font-semibold mb-1', {
                  'text-text-primary': step.status === 'completed' || step.status === 'active',
                  'text-text-tertiary': step.status === 'pending',
                })}
              >
                {step.title}
              </h3>

              {step.statusLabel && (
                <span
                  className={cn(
                    'inline-block text-xs px-2 py-0.5 rounded-full mt-1',
                    {
                      'bg-success-light text-success-dark': step.status === 'completed',
                      'bg-info-light text-info-dark': step.status === 'active',
                      'bg-background-secondary text-text-tertiary': step.status === 'pending',
                    }
                  )}
                >
                  {step.statusLabel}
                </span>
              )}

              {step.time && (
                <p className="text-xs text-text-tertiary mt-1">{step.time}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StepperControlsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  previousLabel?: string;
  nextLabel?: string;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
}

export function StepperControls({
  onPrevious,
  onNext,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  previousDisabled = false,
  nextDisabled = false,
  className,
}: StepperControlsProps) {
  return (
    <div className={cn('flex justify-between mt-8', className)}>
      <button
        onClick={onPrevious}
        disabled={previousDisabled}
        className={cn(
          'px-4 py-2 rounded-lg border border-border bg-white',
          'flex items-center gap-2 transition-all',
          'hover:bg-background-hover disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {previousLabel}
      </button>

      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={cn(
          'px-4 py-2 rounded-lg',
          'flex items-center gap-2 transition-all',
          'bg-primary text-white hover:bg-primary-dark',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {nextLabel}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}

