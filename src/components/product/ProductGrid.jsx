import React from 'react';
import ProductCard from './ProductCard';
import ProductListCard from './ProductListCard';
import { ProductCardSkeleton } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

export const ProductGrid = ({
  products = [],
  loading = false,
  onProductClick,
  onQuickView,
  viewMode = 'grid',
  columns = 3,
  emptyType = 'general',
  emptyTitle,
  emptyDesc,
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div className={viewMode === 'list' ? 'space-y-4' : `grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-${columns} gap-3 sm:gap-6`}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        type={emptyType}
        title={emptyTitle}
        description={emptyDesc}
        actionLabel={onResetFilters ? 'Clear all filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <ProductListCard
            key={product.id}
            product={product}
            onClick={() => onProductClick?.(product)}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    );
  }

  const gridColsClass = columns === 4
    ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6'
    : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6';

  return (
    <div className={gridColsClass}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick?.(product)}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
