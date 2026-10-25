import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, FolderOpen, Star, Zap, Plus, ArrowRight, Clock, Users, RotateCcw, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsApi, categoriesApi, testimonialsApi, settingsApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/components/ui/Toast';
import type { PaginatedResponse, Product, Category, Testimonial } from '@/types';

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  link,
  action,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  link?: string;
  action?: React.ReactNode;
}) {
  const content = (
    <div className={`p-5 rounded-2xl border-2 ${color} bg-white group cursor-default relative overflow-hidden transition-all duration-200 hover:shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="font-heading font-bold text-2xl sm:text-3xl text-dark-900">{value}</p>
          {action && <div className="mt-2.5">{action}</div>}
        </div>
        <div className="w-11 h-11 rounded-xl bg-current/10 flex items-center justify-center shrink-0">
          <Icon size={22} className="opacity-80" />
        </div>
      </div>
    </div>
  );
  return link ? <Link to={link} className="block hover:-translate-y-1 transition-transform">{content}</Link> : <div>{content}</div>;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [newCountVal, setNewCountVal] = useState('0');

  // Ultra-fast optimized queries: exclude 11MB image payloads for instant dashboard load
  const { data: productsData } = useQuery({
    queryKey: ['dashboard-products'],
    queryFn: () => productsApi.getAll({ limit: '5', includeImages: 'false' }).then((r) => r.data as PaginatedResponse<Product>),
  });

  const { data: featuredData } = useQuery({
    queryKey: ['dashboard-featured'],
    queryFn: () => productsApi.getAll({ featured: 'true', limit: '1', includeImages: 'false' }).then((r) => r.data as PaginatedResponse<Product>),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((r) => r.data as { data: Category[] }),
  });

  const { data: testimonialsData } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => testimonialsApi.getAll().then((r) => r.data as { data: Testimonial[] }),
  });

  const { data: visitorData } = useQuery({
    queryKey: ['visitor-stats'],
    queryFn: () => settingsApi.getVisitStats().then((r) => r.data as { success: boolean; data: { count: number } }),
  });

  const resetMutation = useMutation({
    mutationFn: (count: number) => settingsApi.resetVisitCount(count),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['visitor-stats'] });
      toast.success(`Visitor counter set to ${variables}`);
      setIsResetOpen(false);
    },
    onError: () => toast.error('Failed to update visitor counter'),
  });

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(newCountVal, 10);
    resetMutation.mutate(isNaN(parsed) || parsed < 0 ? 0 : parsed);
  };

  const stats = [
    {
      icon: Users,
      label: 'Website Visitors',
      value: visitorData?.data?.count !== undefined ? Number(visitorData.data.count).toLocaleString() : '0',
      color: 'border-emerald-200 text-emerald-600',
      action: (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setNewCountVal(String(visitorData?.data?.count ?? 0));
            setIsResetOpen(true);
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          title="Reset or adjust the visitor count"
        >
          <RotateCcw size={11} /> Reset
        </button>
      ),
    },
    { icon: Package, label: 'Total Products', value: productsData?.pagination?.total ?? '—', color: 'border-primary-200 text-primary-DEFAULT', link: '/owner/products' },
    { icon: Zap, label: 'Featured Products', value: featuredData?.pagination?.total ?? '—', color: 'border-amber-200 text-amber-600', link: '/owner/products' },
    { icon: FolderOpen, label: 'Categories', value: categoriesData?.data?.length ?? '—', color: 'border-blue-200 text-blue-600', link: '/owner/categories' },
    { icon: Star, label: 'Testimonials', value: testimonialsData?.data?.length ?? '—', color: 'border-purple-200 text-purple-600', link: '/owner/testimonials' },
  ];

  const recentProducts = productsData?.data?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-dark-900">Welcome back, {user?.firstName || user?.username}! 👋</h2>
          <p className="text-gray-500 text-sm mt-1">Here's an overview of your website traffic and content.</p>
        </div>
        <Link to="/owner/products/new" className="btn-primary btn-md rounded-xl hidden sm:flex">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Reset Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-gray-100 animate-fade-in">
            <button
              type="button"
              onClick={() => setIsResetOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Users size={24} />
            </div>

            <h3 className="font-heading font-bold text-lg text-dark-900 mb-1">Reset Visitor Counter</h3>
            <p className="text-gray-500 text-xs mb-4">
              Reset your website visitor count to 0, or enter a custom number.
            </p>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Visitor Count Number
                </label>
                <input
                  type="number"
                  min="0"
                  value={newCountVal}
                  onChange={(e) => setNewCountVal(e.target.value)}
                  className="form-input text-center font-bold text-2xl py-2 w-full"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewCountVal('0')}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Set 0
                </button>
                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="flex-1 btn-primary btn-sm rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  {resetMutation.isPending ? 'Saving...' : 'Save Count'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Products */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-heading font-semibold text-dark-900 flex items-center gap-2"><Clock size={16} className="text-gray-400" /> Recent Products</h3>
          <Link to="/owner/products" className="text-sm text-primary-DEFAULT hover:text-primary-700 flex items-center gap-1">View All <ArrowRight size={14} /></Link>
        </div>
        {recentProducts.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Product', 'Category', 'Status', 'Featured', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-dark-900 text-sm truncate max-w-xs">{p.name}</div>
                    {p.sku && <div className="text-xs text-gray-400 font-mono">{p.sku}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.category?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : p.status === 'DRAFT' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{p.featured ? <span className="text-accent-DEFAULT font-semibold">★ Yes</span> : <span className="text-gray-400">No</span>}</td>
                  <td className="px-6 py-4">
                    <Link to={`/owner/products/${p.id}/edit`} className="text-primary-DEFAULT hover:text-primary-700 text-sm font-medium">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-400">No products yet. <Link to="/owner/products/new" className="text-primary-DEFAULT hover:underline">Add your first product</Link></div>
        )}
      </div>
    </div>
  );
}
