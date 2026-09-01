import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Tag } from 'lucide-react';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.url || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-2 flex flex-col"
    >
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="block relative aspect-product bg-gray-100 overflow-hidden">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={primaryImage?.altText || product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                <Tag size={28} className="text-gray-300" />
              </div>
              <span className="text-xs">No Image</span>
            </div>
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-primary-DEFAULT text-xs font-semibold px-3 py-1 rounded-full border border-primary-100 shadow-sm">
            {product.category?.name}
          </span>
        </div>
        {product.featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-accent-DEFAULT text-dark-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">★ Featured</span>
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <span className="bg-white text-primary-DEFAULT text-xs font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-1.5">
            View Details <ArrowRight size={12} />
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading font-semibold text-dark-900 text-base leading-snug mb-2 group-hover:text-primary-DEFAULT transition-colors line-clamp-2">
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        {product.shortDesc && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">{product.shortDesc}</p>
        )}
        {product.sku && <p className="text-xs text-gray-400 mb-3">SKU: {product.sku}</p>}
        <Link
          to={`/products/${product.slug}`}
          className="flex items-center gap-2 text-primary-DEFAULT text-sm font-semibold hover:gap-3 transition-all duration-200 mt-auto"
        >
          View Details <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
