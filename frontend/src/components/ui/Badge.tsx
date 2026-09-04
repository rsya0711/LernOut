import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'streak' | 'exam' | 'neutral' | 'success' | 'warning';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'brand',
  size = 'md',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs font-bold tracking-wide',
  };

  const variantStyles = {
    brand: 'bg-brand-50 text-brand-700 border border-brand-200',
    streak: 'bg-amber-50 text-amber-700 border border-amber-200',
    exam: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    warning: 'bg-rose-100 text-rose-800 border border-rose-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
