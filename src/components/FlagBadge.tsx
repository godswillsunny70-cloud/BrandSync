import React from 'react';
import { BrandFlag } from '../types.ts';
import { getFlagStyle } from '../lib/storage.ts';

interface FlagBadgeProps {
  flag?: BrandFlag;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const FlagBadge: React.FC<FlagBadgeProps> = ({
  flag = { a: '#14273A', b: '#E8B422', p: 'split' },
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-4',
    md: 'w-8 h-5',
    lg: 'w-12 h-7',
    xl: 'w-16 h-10',
  }[size];

  return (
    <span
      className={`inline-block shrink-0 shadow-xs border border-black/10 transition-transform ${sizeClasses} ${className}`}
      style={{
        background: getFlagStyle(flag),
        clipPath: 'polygon(0 0, 100% 0, 84% 50%, 100% 100%, 0 100%)',
      }}
      aria-hidden="true"
    />
  );
};
