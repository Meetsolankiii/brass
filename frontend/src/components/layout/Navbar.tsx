import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Factory, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi, categoriesApi } from '@/services/api';
import type { SiteSettings, Category } from '@/types';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/products', label: 'Products', hasDropdown: true },
  { to: '/inquiry', label: 'Inquiry' },
  { to: '/contact', label: 'Contact Us' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll().then((r) => r.data.data as SiteSettings),
    staleTime: 10 * 60 * 1000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((r) => r.data.data as Category[]),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    setIsOpen(false);
    setProductsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) setProductsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const siteName = settingsData?.site_name || 'Chetan Brass Industries';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200/80 transition-all duration-300">
      <nav className="container-xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group py-2">
            <img
              src={settingsData?.site_logo || "/images/hero/cbi-logo.png"}
              alt={siteName}
              className="h-12 md:h-14 w-auto max-w-[260px] md:max-w-[300px] object-contain mix-blend-multiply transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div
                  key={link.to}
                  ref={productsRef}
                  className="relative group"
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                >
                  <Link
                    to={link.to}
                    onClick={() => setProductsOpen(false)}
                    className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 outline-none focus:outline-none ${
                      location.pathname.startsWith('/products')
                        ? 'text-primary-600 font-bold'
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    {link.label}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${productsOpen ? 'rotate-180 text-primary-600' : ''}`} />
                    {/* Red hover & active underline */}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-0.5 bg-primary-600 rounded-full transition-all duration-300 ${
                        location.pathname.startsWith('/products')
                          ? 'opacity-100 scale-x-100'
                          : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                  <AnimatePresence>
                    {productsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 w-60 pt-2 z-50"
                      >
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-premium-lg overflow-hidden py-1">
                          <Link to="/products" className="block px-4 py-2.5 text-sm text-gray-800 hover:text-primary-600 hover:bg-primary-50 font-bold border-b border-gray-100 transition-colors">
                            All Products
                          </Link>
                          {categoriesData?.slice(0, 8).map((cat) => (
                            <Link key={cat.id} to={`/products?category=${cat.slug}`} className="block px-4 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `group relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 outline-none focus:outline-none ${
                      isActive
                        ? 'text-primary-600 font-bold'
                        : 'text-gray-700 hover:text-primary-600'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {/* Red hover & active underline */}
                      <span
                        className={`absolute bottom-0 left-4 right-4 h-0.5 bg-primary-600 rounded-full transition-all duration-300 ${
                          isActive
                            ? 'opacity-100 scale-x-100'
                            : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              )
            )}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={`tel:${settingsData?.contact_phone || ''}`}
              className="flex items-center gap-2 text-gray-700 hover:text-primary-600 text-sm font-medium transition-colors"
            >
              <Phone size={15} className="shrink-0 text-primary-600" />
              <span>{settingsData?.contact_phone || '+91 98765 43210'}</span>
            </a>
            <Link to="/contact" className="btn-primary btn-sm rounded-xl px-5 py-2.5 text-sm font-bold shadow-md hover:shadow-glow-red transition-all">
              Get Quote
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen((p) => !p)}
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors outline-none focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="container-xl py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <div key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive ? 'text-primary-600 bg-primary-50 font-bold border-l-4 border-primary-600' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                  {link.hasDropdown && (
                    <div className="pl-4 mt-1 flex flex-col gap-0.5">
                      {categoriesData?.slice(0, 6).map((cat) => (
                        <Link key={cat.id} to={`/products?category=${cat.slug}`} className="px-4 py-2 text-xs text-gray-500 hover:text-primary-600 rounded-lg hover:bg-gray-50 transition-colors">
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link to="/contact" className="btn-primary btn-md rounded-xl mt-2 text-center font-bold">
                Get Quote
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
