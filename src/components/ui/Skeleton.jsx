import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-md' }) => {
  return (
    <div className={`skeleton-shimmer bg-slate-200 ${rounded} ${className}`} />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-card">
      <Skeleton className="w-full aspect-[4/3] rounded-lg" />
      <div className="flex items-center justify-between">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-16 h-3" />
      </div>
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-28 h-6 rounded-full" />
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  );
};

export const CategoryNavSkeleton = () => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="w-24 h-9 rounded-full shrink-0" />
      ))}
    </div>
  );
};

export const VehicleSelectorSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-slate-900 rounded-2xl">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="w-full h-11 rounded-lg bg-slate-800" />
      ))}
    </div>
  );
};

export default Skeleton;
