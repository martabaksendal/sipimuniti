import React from 'react';
import { getRankTier } from '../lib/db';
import { Sparkles } from 'lucide-react';

export const RatingBadge = ({
  rating,
  showRatingNumber = true,
  size = 'md'
}) => {
  const tier = getRankTier(rating);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
    md: 'px-2.5 py-1 text-xs font-bold gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-extrabold gap-2'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full shadow-sm ${tier.badgeClass} ${sizeClasses[size]}`}
      title={`${tier.name} Rating: ${rating}`}
    >
      <Sparkles className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{tier.name}</span>
      {showRatingNumber && (
        <span className="opacity-90 font-mono border-l border-current/30 pl-1.5 ml-0.5">
          {rating}
        </span>
      )}
    </span>
  );
};
