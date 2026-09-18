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
    // Solid indigo — primary CTA
    primary:
      'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5',
    // Subtle white glass — secondary
    secondary:
      'bg-white/80 text-slate-700 border border-slate-200 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-sm hover:-translate-y-0.5',
    // Glass border
    outline:
      'border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900',
    // Ghost — no bg
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
    // Explicit glass variant
    glass:
      'bg-white/70 text-slate-700 border border-white/90 backdrop-blur-md hover:bg-white/90 hover:text-slate-900 shadow-sm hover:-translate-y-0.5',
    // Streak / gamification
    streak:
      'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5',
    // Exam
    exam:
      'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5',
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
