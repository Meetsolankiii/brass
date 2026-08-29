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
  const [scrolled, setScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const showDarkNavbar = scrolled || !isHomePage;

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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const siteName = settingsData?.site_name || '[Client Name ] Industries';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showDarkNavbar ? 'bg-dark-900/95 backdrop-blur-md shadow-premium-lg' : 'bg-transparent'
        }`}
    >
      <nav className="container-xl">
        <div className="flex items-center justify-between h-18 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="bg-white px-3 py-1.5 rounded-xl h-11 md:h-12 flex items-center shadow-md border border-white/10 group-hover:scale-[1.02] transition-transform">
              <img
                src="/images/hero/cbi-logo.png"
                alt="Chetan Brass Industries"
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div
                  key={link.to}
                  ref={productsRef}
                  className="relative"
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                >
                  <Link
                    to={link.to}
                    onClick={() => setProductsOpen(false)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-95 ${location.pathname.startsWith('/products') ? 'text-accent-DEFAULT bg-white/5' : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {link.label}
                    <ChevronDown size={14} className={`transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
                  </Link>
                  <AnimatePresence>
                    {productsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 w-56 pt-2 z-50"
                      >
                        <div className="bg-dark-800 border border-dark-600 rounded-xl shadow-premium-lg overflow-hidden">
                          <Link to="/products" className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-dark-700 font-semibold border-b border-dark-600">All Products</Link>
                          {categoriesData?.slice(0, 6).map((cat) => (
                            <Link key={cat.id} to={`/products?category=${cat.slug}`} className="block px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-dark-700 transition-colors">
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
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-95 ${isActive ? 'text-accent-DEFAULT bg-white/5 shadow-inner' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={`tel:${settingsData?.contact_phone || ''}`}
              className="flex items-center gap-2 text-gray-300 hover:text-accent-DEFAULT text-sm transition-all duration-250 transform hover:scale-[1.02]"
            >
              <Phone size={14} className="shrink-0" />
              <span>{settingsData?.contact_phone || '+91 98765 43210'}</span>
            </a>
            <Link to="/contact" className="btn-accent btn-sm rounded-lg px-5 py-2.5 text-sm transform hover:scale-[1.04] active:scale-[0.97] transition-all duration-200">
              Get Quote
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen((p) => !p)}
            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
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
            className="lg:hidden bg-dark-900/98 backdrop-blur-md border-t border-dark-700 overflow-hidden"
          >
            <div className="container-xl py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <div key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-accent-DEFAULT bg-dark-800' : 'text-gray-300 hover:text-white hover:bg-dark-800'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                  {link.hasDropdown && (
                    <div className="pl-4 mt-1 flex flex-col gap-0.5">
                      {categoriesData?.slice(0, 5).map((cat) => (
                        <Link key={cat.id} to={`/products?category=${cat.slug}`} className="px-4 py-2 text-xs text-gray-500 hover:text-gray-300 rounded-lg hover:bg-dark-800 transition-colors">
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link to="/contact" className="btn-accent btn-md rounded-lg mt-2 text-center">Get Quote</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
