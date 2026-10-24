import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Image, Eye } from 'lucide-react';
import { categoriesApi } from '@/services/api';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/admin/components/ConfirmModal';
import ImageUploader from '@/admin/components/ImageUploader';
import { toast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Category } from '@/types';

type CategoryForm = { name: string; description: string; order: string; isActive: boolean };
const defaultForm: CategoryForm = { name: '', description: '', order: '0', isActive: true };

export default function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((r) => r.data as { data: Category[] }),
  });
  const categories = data?.data || [];

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditing(cat);
      setForm({ name: cat.name, description: cat.description || '', order: String(cat.order), isActive: cat.isActive });
    } else {
      setEditing(null);
      setForm(defaultForm);
    }
    setImageFile(null);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (f: CategoryForm) => {
      const payload = { ...f, isActive: Boolean(f.isActive) };
      const res = editing ? await categoriesApi.update(editing.id, payload) : await categoriesApi.create(payload);
      const catId = (res.data as { data: Category }).data.id;
      if (imageFile) await categoriesApi.uploadImage(catId, imageFile);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['navbar-products'] });
      toast.success(`Category ${editing ? 'updated' : 'created'}!`);
      setModalOpen(false);
    },
    onError: () => toast.error('Failed to save category'),
  });

  // 1-Click optimistic toggle switch for showcasing category on website
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      categoriesApi.update(id, { isActive }),
    onMutate: async ({ id, isActive }) => {
      await qc.cancelQueries({ queryKey: ['categories'] });
      const prev = qc.getQueryData<{ data: Category[] }>(['categories']);
      qc.setQueryData<{ data: Category[] }>(['categories'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((c) => (c.id === id ? { ...c, isActive } : c)),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['categories'], ctx.prev);
      toast.error('Failed to update category showcase status');
    },
    onSuccess: (_data, { isActive }) => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['navbar-products'] });
      toast.success(isActive ? 'Category now showcased on website ✓' : 'Category hidden from showcase');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['navbar-products'] });
      toast.success('Category deleted');
      setDeleteId(null);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to delete');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-dark-900">Categories</h2>
          <p className="text-gray-500 text-sm">{categories.length} total categories</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary btn-md rounded-xl">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 w-fit">
        <Eye size={15} className="text-blue-500 shrink-0" />
        <span>
          <strong className="text-blue-700">Showcase Toggle:</strong> Turn ON to feature this category on the public website and Products showcase bar. Turn OFF to hide it.
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No categories yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Image', 'Category', 'Description', 'Products', 'Showcase on Website', 'Order', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => {
                  const isToggling = toggleActiveMutation.isPending && toggleActiveMutation.variables?.id === cat.id;

                  return (
                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-xl object-contain bg-white border border-gray-100 p-0.5" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Image size={18} className="text-gray-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold text-dark-900 text-sm whitespace-nowrap">{cat.name}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 max-w-xs truncate">{cat.description || '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 font-mono">{cat._count?.products || 0}</td>

                      {/* 1-Click Showcase Toggle */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleActiveMutation.mutate({ id: cat.id, isActive: !cat.isActive })}
                            disabled={isToggling}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              cat.isActive ? 'bg-primary-600' : 'bg-gray-200'
                            }`}
                            title={cat.isActive ? 'Visible on website (Click to hide)' : 'Hidden from website (Click to showcase)'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                cat.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-semibold ${cat.isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                            {cat.isActive ? 'Showcase' : 'Hidden'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-400 font-mono">{cat.order}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button onClick={() => openModal(cat)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-DEFAULT transition-colors" title="Edit Category">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteId(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete Category">
                            <Trash2 size={15} />
                          </button>
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'Add Category'}
        size="md"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-ghost btn-md rounded-lg border border-gray-200">
              Cancel
            </button>
            <button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending || !form.name}
              className="btn-primary btn-md rounded-lg disabled:opacity-60"
            >
              {saveMutation.isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Category Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
              placeholder="e.g. Precision Brass Components"
            />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="form-input resize-none"
              placeholder="Brief category description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Display Order</label>
              <input
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                type="number"
                className="form-input"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                type="checkbox"
                id="cat-active"
                className="w-4 h-4 text-primary-DEFAULT rounded cursor-pointer"
              />
              <label htmlFor="cat-active" className="form-label mb-0 cursor-pointer">
                Showcase on Website
              </label>
            </div>
          </div>
          <div>
            <label className="form-label">Category Image</label>
            <ImageUploader
              onFilesSelected={(files) => setImageFile(files[0] || null)}
              existingImages={editing?.image ? [{ id: 'existing', url: editing.image }] : []}
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Category"
        message="Deleting this category will fail if it has products assigned. You must move or delete those products first."
        confirmText="Delete Category"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
