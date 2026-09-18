import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  bordered = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 transition-all duration-300',
        bordered && 'border border-white/90 shadow-sm',
        hoverable && 'hover:border-indigo-400/30 hover:-translate-y-1 hover:shadow-xl cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
