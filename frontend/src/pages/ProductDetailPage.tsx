import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Phone, MessageCircle, CheckCircle, ArrowLeft, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productsApi, settingsApi } from '@/services/api';
import ProductCard from '@/components/shared/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AnimatedSection from '@/components/shared/AnimatedSection';
import type { Product, ApiResponse, SiteSettings } from '@/types';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'specs'>('description');

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getOne(slug!).then((r) => r.data as ApiResponse<Product & { related: Product[] }>),
    enabled: !!slug,
  });

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll().then((r) => r.data.data as SiteSettings),
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) return <div className="pt-20"><LoadingSpinner fullscreen message="Loading product..." /></div>;
  if (error || !data?.data) return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🔧</div>
        <h2 className="font-heading font-bold text-2xl text-dark-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/products" className="btn-primary btn-md rounded-lg">Browse All Products</Link>
      </div>
    </div>
  );

  const product = data.data;
  const images = product.images?.sort((a, b) => (a.isPrimary ? -1 : 0) - (b.isPrimary ? -1 : 0)) || [];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-xl py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-DEFAULT transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/products" className="hover:text-primary-DEFAULT transition-colors">Products</Link>
            <ChevronRight size={14} />
            <Link to={`/products?category=${product.category?.slug}`} className="hover:text-primary-DEFAULT transition-colors">{product.category?.name}</Link>
            <ChevronRight size={14} />
            <span className="text-dark-900 font-medium truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-xl py-10">
        {/* Back button */}
        <Link to="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-DEFAULT text-sm font-medium mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Products
        </Link>

        {/* Product main section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image gallery */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-md aspect-square mb-4 relative">
              <AnimatePresence mode="wait">
                {images[activeImage] ? (
                  <motion.img
                    key={activeImage}
                    src={images[activeImage].url}
                    alt={images[activeImage].altText || product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Tag size={60} className="text-gray-300" />
                  </div>
                )}
              </AnimatePresence>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-18 h-18 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-primary-DEFAULT shadow-glow-blue' : 'border-gray-200 hover:border-primary-300'}`}>
                    <img src={img.url} alt={img.altText || product.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <AnimatedSection direction="right">
            <span className="section-badge">{product.category?.name}</span>
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-dark-900 leading-tight mb-4">{product.name}</h1>
            {product.sku && <p className="text-gray-400 text-sm mb-4">SKU: <span className="font-mono">{product.sku}</span></p>}
            {product.shortDesc && <p className="text-gray-600 text-base leading-relaxed mb-8">{product.shortDesc}</p>}

            {/* Status */}
            <div className="flex items-center gap-3 mb-8">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${product.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                <span className={`w-2 h-2 rounded-full ${product.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {product.status === 'ACTIVE' ? 'In Stock / Available' : product.status}
              </span>
              {product.featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-accent-50 text-accent-700">
                  ★ Featured
                </span>
              )}
            </div>

            {/* Quick features preview */}
            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-dark-900 text-sm uppercase tracking-wider mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.slice(0, 4).map((f) => (
                    <li key={f.id} className="flex items-start gap-2.5 text-gray-600 text-sm">
                      <CheckCircle size={16} className="text-primary-DEFAULT shrink-0 mt-0.5" />
                      {f.feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/contact" className="btn-primary btn-lg rounded-xl flex-1 justify-center shadow-glow-blue">
                <Phone size={16} /> Enquire Now
              </Link>
              <a 
                href={`https://wa.me/${settingsData?.whatsapp_number || '919924464511'}?text=${encodeURIComponent(`Hi, I am interested in your product: ${product.name} (SKU: ${product.sku || 'N/A'}). Can you please share more details?`)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-outline border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 btn-lg rounded-xl flex-1 justify-center gap-2"
              >
                <MessageCircle size={16} /> Send Message
              </a>
            </div>
          </AnimatedSection>
        </div>

        {/* Tabs: Description / Features / Specs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-16">
          <div className="flex border-b border-gray-100">
            {(['description', 'features', 'specs'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-primary-DEFAULT border-primary-DEFAULT' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
                {tab === 'specs' ? 'Specifications' : tab}
              </button>
            ))}
          </div>
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose prose-gray max-w-none">
                {product.fullDesc ? (
                  product.fullDesc.split('\n\n').map((para, i) => <p key={i} className="text-gray-600 leading-relaxed mb-4">{para}</p>)
                ) : (
                  <p className="text-gray-400">No detailed description available.</p>
                )}
              </div>
            )}
            {activeTab === 'features' && (
              <div>
                {product.features && product.features.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.features.map((f) => (
                      <li key={f.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <CheckCircle size={18} className="text-primary-DEFAULT shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{f.feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-gray-400">No features listed.</p>}
              </div>
            )}
            {activeTab === 'specs' && (
              <div>
                {product.specs && product.specs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody>
                        {product.specs.map((spec, i) => (
                          <tr key={spec.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-5 py-3 text-sm font-semibold text-dark-900 w-1/3 rounded-l-lg">{spec.label}</td>
                            <td className="px-5 py-3 text-sm text-gray-600 rounded-r-lg">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-gray-400">No specifications available.</p>}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {product.related && product.related.length > 0 && (
          <div>
            <h2 className="font-heading font-bold text-2xl text-dark-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
