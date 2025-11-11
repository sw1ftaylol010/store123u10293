'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface CatalogFiltersProps {
  locale: Locale;
  brands: string[];
  categories: string[];
  regions: string[];
  currentFilters: {
    brand?: string;
    category?: string;
    region?: string;
  };
}

export function CatalogFilters({
  locale,
  brands,
  categories,
  regions,
  currentFilters,
}: CatalogFiltersProps) {
  const t = getTranslations(locale);
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/${locale}/catalog?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/${locale}/catalog`);
  };

  const hasActiveFilters = currentFilters.brand || currentFilters.category || currentFilters.region;

  return (
    <Card className="p-6 space-y-6 sticky top-24">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t.catalog.filters}</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:text-primary-light transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Brand Filter */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3">{t.catalog.brand}</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilter('brand', null)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !currentFilters.brand
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:bg-white/5 hover:text-white'
            }`}
          >
            {t.catalog.allBrands}
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => updateFilter('brand', brand)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentFilters.brand === brand
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3">{t.catalog.category}</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilter('category', null)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !currentFilters.category
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:bg-white/5 hover:text-white'
            }`}
          >
            {t.catalog.allCategories}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => updateFilter('category', category)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentFilters.category === category
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              {t.catalog.categories[category as keyof typeof t.catalog.categories] || category}
            </button>
          ))}
        </div>
      </div>

      {/* Region Filter */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3">{t.catalog.region}</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilter('region', null)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !currentFilters.region
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:bg-white/5 hover:text-white'
            }`}
          >
            {t.catalog.allRegions}
          </button>
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => updateFilter('region', region)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentFilters.region === region
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

