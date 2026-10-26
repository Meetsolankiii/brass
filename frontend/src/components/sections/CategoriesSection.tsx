import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Tag } from 'lucide-react';
import { productsApi } from '@/services/api';
import AnimatedSection from '@/components/shared/AnimatedSection';
import type { Product, PaginatedResponse } from '@/types';

export default function CategoriesSection() {
  // Fetch all active products for the scrolling showcase
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['showcase-products'],
    queryFn: () => productsApi.getAll({ limit: '50', status: 'ACTIVE' }).then((r) => r.data as PaginatedResponse<Product>),
    staleTime: 5 * 60 * 1000,
  });

  const products = productsData?.data || [];

  // Seamless duplication for infinite marquee loop (at least 12 cards on track)
  const repeatTimes = Math.max(2, Math.ceil(12 / (products.length || 1)));
  const displayProducts = Array.from({ length: repeatTimes }, () => products).flat();

  return (
    <section className="section-padding bg-gray-50 border-t border-gray-100 overflow-hidden relative">
      <div className="container-xl">
        {/* Header */}
        <AnimatedSection className="text-center mb-10">
          <span className="section-badge">Precision Products</span>
          <h2 className="section-title mx-auto">Explore Our Products</h2>
          <p className="section-subtitle mx-auto">
            From heavy industrial components to high-precision CNC turned fittings — find everything your business needs.
          </p>
        </AnimatedSection>
      </div>

      {/* Full-bleed Auto-Scrolling Marquee Track */}
      <div className="relative w-full py-4 overflow-hidden">
        {/* Left Gradient Fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10" />
        {/* Right Gradient Fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10" />

        {isLoading ? (
          <div className="flex gap-6 justify-center py-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[300px] h-[360px] bg-white rounded-2xl border border-gray-200 animate-pulse shrink-0" />
            ))}
          </div>
        ) : (
          <div className="animate-marquee-slow flex gap-6">
            {displayProducts.map((p, index) => {
              const primaryImg = p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url;
              return (
                <Link
                  key={`${p.id}-${index}`}
                  to={`/products/${p.slug}`}
                  className="group block w-[280px] sm:w-[320px] shrink-0 bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col"
                >
                  {/* Product Image Frame */}
                  <div className="aspect-square bg-white p-5 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={p.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
                        <Tag size={36} className="text-gray-300" />
                      </div>
                    )}

                    {/* Category Tag Badge */}
                    {p.category?.name && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold bg-dark-900/80 text-white backdrop-blur-sm max-w-[80%] truncate">
                        {p.category.name}
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4 bg-white flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-heading font-bold text-dark-900 text-sm sm:text-base leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
                        {p.name}
                      </h3>
                      {p.sku && (
                        <p className="text-gray-400 text-xs font-mono mt-1">
                          SKU: {p.sku}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-primary-600">
                      <span>View Specifications</span>
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom CTA Buttons */}
      <div className="container-xl mt-8">
        <AnimatedSection delay={0.2} className="text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/products"
            className="btn-primary btn-lg rounded-xl inline-flex items-center gap-2 shadow-glow-red hover:-translate-y-0.5 transition-all text-sm sm:text-base font-bold"
          >
            <span>Explore Complete Catalogue</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/inquiry"
            className="px-6 py-3.5 rounded-xl border-2 border-gray-300 hover:border-primary-500 bg-white text-dark-800 hover:text-primary-600 font-bold text-sm sm:text-base transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 shadow-sm font-heading"
          >
            <span>Need Custom Components? Request Quote</span>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
