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
                <Link to={`/products?category=${cat.slug}`} className="group block relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-2">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tag size={40} className="text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-heading font-semibold text-white text-sm leading-tight">{cat.name}</h3>
                      <p className="text-gray-300 text-xs mt-0.5">{cat._count?.products || 0} Products</p>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-primary-DEFAULT/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-white text-primary-DEFAULT text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        Explore <ArrowRight size={12} />
                      </span>
                    </div>
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
