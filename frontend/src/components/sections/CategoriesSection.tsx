import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Tag, Sparkles } from 'lucide-react';
import { categoriesApi } from '@/services/api';
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection';
import { CategoryCardSkeleton } from '@/components/ui/Skeleton';
import type { Category } from '@/types';

export default function CategoriesSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((r) => r.data.data as Category[]),
    staleTime: 10 * 60 * 1000,
  });

  const categories = data?.filter((c) => c.isActive) || [];

  return (
    <section className="section-padding bg-gray-50 border-t border-gray-100">
      <div className="container-xl">
        <AnimatedSection className="text-center mb-10">
          <span className="section-badge">Browse by Category</span>
          <h2 className="section-title mx-auto">Explore Our Product Categories</h2>
          <p className="section-subtitle mx-auto">
            From heavy industrial machinery to precision components — find everything your business needs.
          </p>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <StaggerItem key={cat.id}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group block relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-premium-xl transition-all duration-300 hover:-translate-y-1.5 border border-gray-200/80 flex flex-col h-full"
                >
                  {/* Category Image */}
                  <div className="aspect-[4/3] bg-white p-5 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
                        <Tag size={36} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 bg-white group-hover:bg-primary-50/20 transition-colors flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-heading font-bold text-dark-900 text-base leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
                        {cat.name}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1.5 font-medium">
                        {cat._count?.products === 1 ? '1 Product Available' : `${cat._count?.products || 0} Products Available`}
                      </p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-primary-600 group-hover:text-primary-700">
                      <span>Explore Category</span>
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Bottom Call to Action Controls */}
        <AnimatedSection delay={0.2} className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/products"
            className="btn-primary btn-lg rounded-xl inline-flex items-center gap-2 shadow-glow-red hover:-translate-y-0.5 transition-all text-sm sm:text-base font-bold"
          >
            <span>Explore All Products</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/inquiry"
            className="px-6 py-3.5 rounded-xl border-2 border-gray-300 hover:border-primary-500 bg-white text-dark-800 hover:text-primary-600 font-bold text-sm sm:text-base transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 shadow-sm"
          >
            <Sparkles size={16} className="text-amber-500" />
            <span>Need Custom Components? Get a Quote</span>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
