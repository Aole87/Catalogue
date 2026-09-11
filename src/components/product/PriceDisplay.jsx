import React from 'react';

export const PriceDisplay = ({
  price,
  compareAtPrice,
  tier,
  currency = 'THB',
  size = 'md',
  className = '',
}) => {
  const numericPrice = typeof price === 'number' ? price : Number(price);
  const numericCompareAt = compareAtPrice ? Number(compareAtPrice) : null;

  if (isNaN(numericPrice) || numericPrice === null || numericPrice === undefined) {
    return (
      <span className={`text-slate-400 font-medium ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'} ${className}`}>
        ติดต่อสอบถามราคา
      </span>
    );
  }

  const formatCurrency = (val) => {
    return `฿${Number(val).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
      <span
        className={`font-extrabold text-slate-900 tracking-tight font-mono ${
          size === 'sm'
            ? 'text-sm'
            : size === 'lg'
            ? 'text-2xl sm:text-3xl'
            : 'text-lg sm:text-xl'
        }`}
      >
        {formatCurrency(numericPrice)}
      </span>

      {numericCompareAt && numericCompareAt > numericPrice && (
        <span
          className={`line-through text-slate-400 font-mono ${
            size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-sm' : 'text-xs'
          }`}
        >
          {formatCurrency(numericCompareAt)}
        </span>
      )}

      {tier && tier !== 'GENERAL' && (
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 rounded">
          {tier}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
