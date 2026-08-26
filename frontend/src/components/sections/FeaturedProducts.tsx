import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { productsApi } from '@/services/api';
import ProductCard from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import AnimatedSection from '@/components/shared/AnimatedSection';
import type { Product, PaginatedResponse } from '@/types';

export default function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getAll({ featured: 'true', limit: '8', status: 'ACTIVE' }).then((r) => r.data as PaginatedResponse<Product>),
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.data || [];

  return (
    <section className="section-padding bg-gray-50 grid-pattern">
      <div className="container-xl">
        <AnimatedSection className="text-center mb-12">
          <span className="section-badge">Featured Products</span>
          <h2 className="section-title mx-auto">Our Premium Product Range</h2>
          <p className="section-subtitle mx-auto">Discover our most popular industrial equipment, precision components, and safety solutions trusted by leading manufacturers.</p>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">No featured products available.</p>
        )}

        <AnimatedSection delay={0.3} className="mt-12 text-center">
          <Link to="/products" className="btn-primary btn-lg rounded-xl shadow-glow-blue">
            View All Products <ArrowRight size={18} />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
