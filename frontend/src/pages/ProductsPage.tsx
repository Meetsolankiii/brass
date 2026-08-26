import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => updateParam('search', search), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.getAll().then((r) => r.data.data as Category[]), staleTime: 10 * 60 * 1000 });

  const queryParams: Record<string, string> = { page: String(page), limit: String(LIMIT), sort, order };
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
              <span className="inline-block bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Our Products</span>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">Industrial Product Catalogue</h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Browse our comprehensive range of industrial machinery, precision parts, tools, safety equipment, and hydraulic systems.</p>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <div className="container-xl py-10">
        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, SKU, description..."
              className="form-input pl-11 w-full text-base"
            />
            {search && (
              <button onClick={() => { setSearch(''); updateParam('search', ''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <select value={sort + ':' + order} onChange={(e) => { const [s, o] = e.target.value.split(':'); updateParam('sort', s); updateParam('order', o); }}
            className="form-input w-full sm:w-48 bg-white cursor-pointer">
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="name:asc">Name A–Z</option>
            <option value="name:desc">Name Z–A</option>
          </select>
          <button onClick={() => setShowFilters((p) => !p)} className={`btn btn-md rounded-lg border-2 ${showFilters ? 'bg-primary-DEFAULT text-white border-primary-DEFAULT' : 'border-gray-300 text-gray-600 bg-white hover:border-primary-DEFAULT hover:text-primary-DEFAULT'}`}>
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {/* Filters row */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex flex-wrap gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Category</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateParam('category', '')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!category ? 'bg-primary-DEFAULT text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
                {categoriesData?.map((cat) => (
                  <button key={cat.id} onClick={() => updateParam('category', cat.slug)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === cat.slug ? 'bg-primary-DEFAULT text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active filters */}
        {(category || searchParams.get('search')) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {category && (
              <span className="flex items-center gap-1.5 bg-primary-50 text-primary-DEFAULT border border-primary-100 text-sm px-3 py-1 rounded-full">
                {categoriesData?.find((c) => c.slug === category)?.name || category}
                <button onClick={() => updateParam('category', '')}><X size={12} /></button>
              </span>
            )}
            {searchParams.get('search') && (
              <span className="flex items-center gap-1.5 bg-primary-50 text-primary-DEFAULT border border-primary-100 text-sm px-3 py-1 rounded-full">
                "{searchParams.get('search')}"
                <button onClick={() => { setSearch(''); updateParam('search', ''); }}><X size={12} /></button>
              </span>
            )}
          </div>
        )}

        {/* Results count */}
        {!isLoading && (
          <p className="text-gray-500 text-sm mb-6">
            {pagination ? `Showing ${products.length} of ${pagination.total} products` : ''}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: LIMIT }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="font-heading font-semibold text-xl text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters.</p>
            <button onClick={() => { setSearch(''); setSearchParams({}); }} className="btn-outline btn-md rounded-lg">Clear All Filters</button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button onClick={() => updateParam('page', String(page - 1))} disabled={!pagination.hasPrevPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={16} /> Prev
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, pagination.totalPages - 4)) + i;
                return (
                  <button key={p} onClick={() => updateParam('page', String(p))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary-DEFAULT text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    {p}
                  </button>
                );
              })}
            </div>
            <button onClick={() => updateParam('page', String(page + 1))} disabled={!pagination.hasNextPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
