import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  variant?: 'brand' | 'streak' | 'exam';
  animated?: boolean;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  variant = 'brand',
  animated = true,
  showLabel = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantColors = {
    brand: 'bg-brand-500',
    streak: 'bg-streak',
    exam: 'bg-exam',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full bg-slate-200/80 rounded-full h-3.5 p-0.5 overflow-hidden shadow-inner">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 relative',
            variantColors[variant],
            animated && 'animate-stripes',
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Subtle top shine for 3D feel */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-full" />
        </div>
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1 text-xs font-semibold text-slate-500">
          <span>{Math.round(percentage)}% Selesai</span>
          <span>{value}/{max}</span>
        </div>
      )}
    </div>
  );
};
