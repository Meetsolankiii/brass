import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { productsApi, categoriesApi } from '@/services/api';
import ProductCard from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import AnimatedSection from '@/components/shared/AnimatedSection';
import type { Product, Category, PaginatedResponse } from '@/types';

const LIMIT = 12;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => updateParam('search', search), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Fetch categories (admin controls isActive toggle in Categories management)
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((r) => r.data.data as Category[]),
    staleTime: 5 * 60 * 1000,
  });

  // Showcase only categories that the admin has toggled ON
  const showcasedCategories = categoriesData?.filter((c) => c.isActive) || [];

  const queryParams: Record<string, string> = {
    page: String(page),
    limit: String(LIMIT),
    sort,
    order,
  };
  if (category) queryParams.category = category;
  if (searchParams.get('search')) queryParams.search = searchParams.get('search')!;

  const { data, isLoading } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsApi.getAll(queryParams).then((r) => r.data as PaginatedResponse<Product>),
    staleTime: 2 * 60 * 1000,
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-dark-900 py-14">
        <div className="container-xl">
          <AnimatedSection>
            <div className="text-center">
              <span className="inline-block bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                Our Products
              </span>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
                Precision Brass Product Catalogue
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Explore our precision-machined brass components, fasteners, threaded inserts, fittings, and custom turned parts.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <div className="container-xl py-10">
        {/* Category Showcase Bar - Driven directly by Admin Panel Showcase toggle */}
        {showcasedCategories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={16} className="text-primary-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Showcase Categories
              </span>
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              <button
                type="button"
                onClick={() => updateParam('category', '')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                  !category
                    ? 'bg-primary-600 text-white shadow-glow-red scale-[1.02]'
                    : 'bg-white text-gray-700 hover:text-primary-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                All Products
              </button>
              {showcasedCategories.map((cat) => {
                const isSelected = category === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateParam('category', cat.slug)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-sm ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-glow-red scale-[1.02]'
                        : 'bg-white text-gray-700 hover:text-primary-600 hover:bg-gray-50 border border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat._count?.products !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                          isSelected ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {cat._count.products}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, SKU, application..."
              className="form-input pl-11 w-full text-base bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  updateParam('search', '');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            value={sort + ':' + order}
            onChange={(e) => {
              const [s, o] = e.target.value.split(':');
              updateParam('sort', s);
              updateParam('order', o);
            }}
            className="form-input w-full sm:w-48 bg-white cursor-pointer font-medium"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="name:asc">Name A–Z</option>
            <option value="name:desc">Name Z–A</option>
          </select>
          <button
            type="button"
            onClick={() => setShowFilters((p) => !p)}
            className={`btn btn-md rounded-xl border-2 transition-all ${
              showFilters
                ? 'bg-primary-DEFAULT text-white border-primary-DEFAULT'
                : 'border-gray-300 text-gray-600 bg-white hover:border-primary-DEFAULT hover:text-primary-DEFAULT'
            }`}
          >
            <SlidersHorizontal size={16} /> Advanced Filters
          </button>
        </div>

        {/* Advanced Filters dropdown */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 flex flex-wrap gap-4 shadow-sm">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Filter by Category
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateParam('category', '')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    !category ? 'bg-primary-DEFAULT text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categoriesData?.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateParam('category', cat.slug)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      category === cat.slug
                        ? 'bg-primary-DEFAULT text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active filter pills */}
        {(category || searchParams.get('search')) && (
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            <span className="text-xs text-gray-400 font-semibold uppercase">Active:</span>
            {category && (
              <span className="flex items-center gap-1.5 bg-primary-50 text-primary-DEFAULT border border-primary-100 text-sm font-medium px-3 py-1 rounded-full">
                {categoriesData?.find((c) => c.slug === category)?.name || category}
                <button type="button" onClick={() => updateParam('category', '')}>
                  <X size={13} />
                </button>
              </span>
            )}
            {searchParams.get('search') && (
              <span className="flex items-center gap-1.5 bg-primary-50 text-primary-DEFAULT border border-primary-100 text-sm font-medium px-3 py-1 rounded-full">
                "{searchParams.get('search')}"
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    updateParam('search', '');
                  }}
                >
                  <X size={13} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results count */}
        {!isLoading && (
          <p className="text-gray-500 text-sm mb-6 font-medium">
            {pagination ? `Showing ${products.length} of ${pagination.total} products` : ''}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="font-heading font-semibold text-xl text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-400 mb-6">Try selecting another category or clearing your search term.</p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSearchParams({});
              }}
              className="btn-primary btn-md rounded-xl"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              type="button"
              onClick={() => updateParam('page', String(page - 1))}
              disabled={!pagination.hasPrevPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, pagination.totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateParam('page', String(p))}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                      p === page ? 'bg-primary-DEFAULT text-white shadow-md' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => updateParam('page', String(page + 1))}
              disabled={!pagination.hasNextPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
