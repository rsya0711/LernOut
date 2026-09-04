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
        'bg-white rounded-2xl p-6 transition-all duration-200 shadow-card',
        bordered && 'border-2 border-slate-100',
        hoverable &&
          'hover:shadow-card-hover hover:border-brand-200 hover:-translate-y-0.5 cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
