import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { productsApi, categoriesApi } from '@/services/api';
import ProductCard from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import AnimatedSection from '@/components/shared/AnimatedSection';
import type { Product, Category, PaginatedResponse } from '@/types';

export default function FeaturedProducts() {
  const [selectedCat, setSelectedCat] = useState<string>('');

  // Fetch only categories that the admin has set to Showcase (isActive = true)
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((r) => r.data.data as Category[]),
    staleTime: 5 * 60 * 1000,
  });

  const activeCategories = categoriesData?.filter((c) => c.isActive) || [];

  const { data, isLoading } = useQuery({
    queryKey: ['featured-products', selectedCat],
    queryFn: () => {
      const params: Record<string, string> = {
        limit: '8',
        status: 'ACTIVE',
      };
      if (selectedCat) {
        params.category = selectedCat;
      } else {
        params.featured = 'true';
      }
      return productsApi.getAll(params).then((r) => r.data as PaginatedResponse<Product>);
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.data || [];

  return (
    <section className="section-padding bg-gray-50 grid-pattern">
      <div className="container-xl">
        <AnimatedSection className="text-center mb-8">
          <span className="section-badge">Featured Showcase</span>
          <h2 className="section-title mx-auto">Precision Brass Products</h2>
          <p className="section-subtitle mx-auto">
            Discover our high-precision brass components, custom CNC turned parts, and industrial fittings trusted by global manufacturers.
          </p>

          {/* Admin-Driven Category Showcase Pills */}
          {activeCategories.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
              <button
                type="button"
                onClick={() => setSelectedCat('')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm ${
                  selectedCat === ''
                    ? 'bg-primary-600 text-white shadow-glow-red scale-[1.03]'
                    : 'bg-white text-gray-700 hover:text-primary-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Featured
              </button>
              {activeCategories.map((cat) => {
                const isSelected = selectedCat === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCat(cat.slug)}
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-glow-red scale-[1.03]'
                        : 'bg-white text-gray-700 hover:text-primary-600 hover:bg-gray-100 border border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-400">No products found in this category.</p>
          </div>
        )}

        <AnimatedSection delay={0.2} className="mt-12 text-center">
          <Link to="/products" className="btn-primary btn-lg rounded-xl shadow-glow-red">
            View Complete Catalogue <ArrowRight size={18} />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
