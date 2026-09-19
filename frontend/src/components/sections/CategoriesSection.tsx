import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Tag } from 'lucide-react';
import { categoriesApi } from '@/services/api';
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection';
import { CategoryCardSkeleton } from '@/components/ui/Skeleton';
import type { Category } from '@/types';

export default function CategoriesSection() {
  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.getAll().then((r) => r.data.data as Category[]), staleTime: 10 * 60 * 1000 });
  const categories = data?.filter((c) => c.isActive) || [];

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-xl">
        <AnimatedSection className="text-center mb-12">
          <span className="section-badge">Browse by Category</span>
          <h2 className="section-title mx-auto">Explore Our Product Categories</h2>
          <p className="section-subtitle mx-auto">From heavy industrial machinery to precision components — find everything your business needs.</p>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {categories.map((cat) => (
              <StaggerItem key={cat.id}>
                <Link to={`/products?category=${cat.slug}`} className="group block relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
                  {/* Category Image */}
                  <div className="aspect-square bg-white p-3.5 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
                        <Tag size={32} className="text-gray-300" />
                      </div>
                    )}
                    {/* Hover subtle tint & explore pill */}
                    <div className="absolute inset-0 bg-dark-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                      <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        Explore <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 bg-gray-50/80 group-hover:bg-primary-50/40 transition-colors flex flex-col justify-between flex-1">
                    <h3 className="font-heading font-bold text-dark-900 text-sm leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">{cat.name}</h3>
                    <p className="text-gray-400 text-xs mt-1.5 flex items-center justify-between">
                      <span>{cat._count?.products || 0} Products</span>
                      <ArrowRight size={12} className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
