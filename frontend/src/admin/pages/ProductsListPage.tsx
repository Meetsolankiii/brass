import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Image, X } from 'lucide-react';
import { productsApi } from '@/services/api';
import ConfirmModal from '@/admin/components/ConfirmModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/components/ui/Toast';
import type { Product, PaginatedResponse } from '@/types';

export default function ProductsListPage() {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [failedImgs, setFailedImgs] = useState<Record<string, boolean>>({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: () => productsApi.getAll({ search, limit: '50' }).then((r) => r.data as PaginatedResponse<Product>),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const products = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-dark-900">Products</h2>
          <p className="text-gray-500 text-sm">{data?.pagination?.total || 0} total products</p>
        </div>
        <Link to="/owner/products/new" className="btn-primary btn-md rounded-xl">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="form-input pl-10" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4"><Package size={28} className="text-gray-400" /></div>
            <p className="text-gray-500 mb-3">No products found</p>
            <Link to="/owner/products/new" className="btn-primary btn-sm rounded-lg">Add First Product</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Image', 'Product', 'Category', 'SKU', 'Status', 'Featured', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const primaryImg = p.images?.find((i) => i.isPrimary) || p.images?.[0];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        {primaryImg && !failedImgs[primaryImg.id] ? (
                          <img
                            src={primaryImg.url}
                            alt={p.name}
                            onError={() => setFailedImgs((prev) => ({ ...prev, [primaryImg.id]: true }))}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center"><Image size={18} className="text-gray-300" /></div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-dark-900 text-sm max-w-xs truncate">{p.name}</div>
                        {p.shortDesc && <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{p.shortDesc}</div>}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{p.category?.name}</td>
                      <td className="px-5 py-4 text-xs text-gray-400 font-mono">{p.sku || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${p.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : p.status === 'DRAFT' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">{p.featured ? <span className="text-accent-DEFAULT font-bold">★</span> : <span className="text-gray-300">—</span>}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/owner/products/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-DEFAULT transition-colors"><Pencil size={15} /></Link>
                          <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone and will also remove all associated images."
        confirmText="Delete Product"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function Package({ size, className }: { size: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>;
}
