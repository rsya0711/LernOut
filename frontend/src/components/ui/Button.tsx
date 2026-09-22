import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'streak' | 'exam';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-wide transition-all rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed btn-press';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const variantStyles = {
    // Primary Cyan Glass
    primary:
      'bg-cyan-500/80 backdrop-blur-md border border-cyan-300/50 text-white hover:bg-cyan-400/90 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5',
    // Secondary Glass
    secondary:
      'bg-cyan-50/70 backdrop-blur-md text-cyan-800 border border-cyan-200/60 hover:bg-cyan-100/80 hover:border-cyan-300 shadow-sm hover:-translate-y-0.5',
    // Outline Glass
    outline:
      'border border-cyan-300/70 backdrop-blur-sm text-cyan-700 hover:bg-cyan-50/50 hover:text-cyan-900 hover:border-cyan-400',
    // Ghost
    ghost:
      'text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50/50',
    // Pure Glass
    glass:
      'bg-white/30 backdrop-blur-lg text-cyan-800 border border-white/60 hover:bg-white/40 shadow-sm hover:-translate-y-0.5',
    // Gamification variants (keeping their themes but adding glass)
    streak:
      'bg-gradient-to-r from-cyan-500/80 to-teal-400/80 backdrop-blur-md border border-white/20 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5',
    exam:
      'bg-gradient-to-r from-sky-500/80 to-cyan-500/80 backdrop-blur-md border border-white/20 text-white shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:-translate-y-0.5',
  };

  return (
    <button
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Memuat...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
