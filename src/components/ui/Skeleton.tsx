import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div 
      className={cn(
        "animate-pulse rounded-xl bg-white/5 border border-white/5",
        className
      )}
    />
  );
};

export default Skeleton;
