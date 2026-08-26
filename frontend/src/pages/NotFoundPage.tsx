import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-lg px-4">
        <div className="font-heading font-black text-9xl text-primary-DEFAULT/10 leading-none mb-4">404</div>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-DEFAULT to-primary-900 flex items-center justify-center mx-auto mb-6 shadow-glow-blue">
          <Search size={36} className="text-white" />
        </div>
        <h1 className="font-heading font-bold text-3xl text-dark-900 mb-4">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary btn-md rounded-xl">
            <Home size={16} /> Go Home
          </Link>
          <Link to="/products" className="btn-outline btn-md rounded-xl">
            <ArrowLeft size={16} /> Browse Products
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
