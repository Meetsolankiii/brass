import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import { productsApi, categoriesApi } from '@/services/api';
import { toast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ImageUploader from '@/admin/components/ImageUploader';
import ConfirmModal from '@/admin/components/ConfirmModal';
import type { Category, Product, ApiResponse } from '@/types';

interface FormData {
  name: string;
  categoryId: string;
  shortDesc: string;
  fullDesc: string;
  price: string;
  sku: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  featured: boolean;
  stock: string;
  metaTitle: string;
  metaDesc: string;
  features: { value: string }[];
  specs: { label: string; value: string }[];
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: categoriesRes } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.getAll().then((r) => r.data as { data: Category[] }) });
  const { data: productRes, isLoading: productLoading } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: () => productsApi.getOne(id!).then((r) => r.data as ApiResponse<Product>),
    enabled: isEdit,
  });

  const product = productRes?.data;
  const categories = categoriesRes?.data || [];

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { status: 'DRAFT', featured: false, features: [], specs: [] },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control, name: 'features' });
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control, name: 'specs' });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        categoryId: product.categoryId || '',
        shortDesc: product.shortDesc || '',
        fullDesc: product.fullDesc || '',
        price: product.price?.toString() || '',
        sku: product.sku || '',
        status: product.status,
        featured: product.featured,
        stock: product.stock?.toString() || '',
        metaTitle: product.metaTitle || '',
        metaDesc: product.metaDesc || '',
        features: (product.features || []).map((f) => ({ value: f.feature })),
        specs: (product.specs || []).map((s) => ({ label: s.label, value: s.value })),
      });
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : null,
        stock: data.stock ? parseInt(data.stock) : null,
        sku: data.sku?.trim() ? data.sku.trim() : null,
        shortDesc: data.shortDesc?.trim() ? data.shortDesc.trim() : null,
        fullDesc: data.fullDesc?.trim() ? data.fullDesc.trim() : null,
        metaTitle: data.metaTitle?.trim() ? data.metaTitle.trim() : null,
        metaDesc: data.metaDesc?.trim() ? data.metaDesc.trim() : null,
        features: (data.features || []).map((f) => f.value).filter(Boolean),
        specs: (data.specs || []).filter((s) => s.label && s.value),
        featured: Boolean(data.featured),
      };
      if (isEdit) return productsApi.update(id!, payload);
      return productsApi.create(payload);
    },
    onSuccess: async (res) => {
      const productId = isEdit ? id! : (res.data as ApiResponse<Product>).data.id;
      // Upload pending images
      if (pendingImages.length > 0) {
        try {
          await productsApi.uploadImages(productId, pendingImages);
        } catch { toast.error('Product saved but image upload failed'); }
      }
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product-edit', id] });
      toast.success(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/owner/products');
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} product`);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => productsApi.deleteImage(id!, imageId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['product-edit', id] }); toast.success('Image deleted'); },
    onError: () => toast.error('Failed to delete image'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
      navigate('/owner/products');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  if (isEdit && productLoading) return <LoadingSpinner fullscreen />;

  const existingImages = product?.images?.map((img) => ({ id: img.id, url: img.url, altText: img.altText })) || [];

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/owner/products" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="font-heading font-bold text-2xl text-dark-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <p className="text-gray-500 text-sm">{isEdit ? `Editing: ${product?.name}` : 'Fill in the details to add a new product'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-7">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          <h3 className="font-heading font-semibold text-dark-900 mb-5">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="form-label">Product Name *</label>
              <input {...register('name', { required: 'Product name is required' })} className="form-input" placeholder="e.g. Industrial CNC Milling Machine XL-5000" />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select {...register('categoryId', { required: 'Category is required' })} className="form-input bg-white cursor-pointer">
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="form-error">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="form-label">SKU</label>
              <input {...register('sku')} className="form-input font-mono" placeholder="e.g. CNC-XL-5000" />
            </div>
            <div>
              <label className="form-label">Price (₹)</label>
              <input {...register('price')} type="number" step="0.01" className="form-input" placeholder="Leave blank if enquiry only" />
            </div>
            <div>
              <label className="form-label">Stock Quantity</label>
              <input {...register('stock')} type="number" className="form-input" placeholder="Leave blank if unlimited" />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select {...register('status')} className="form-input bg-white cursor-pointer">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active (Published)</option>
                <option value="INACTIVE">Inactive (Hidden)</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input {...register('featured')} type="checkbox" id="featured" className="w-4 h-4 text-primary-DEFAULT rounded" />
              <label htmlFor="featured" className="font-semibold text-gray-700 text-sm cursor-pointer">Mark as Featured Product</label>
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          <h3 className="font-heading font-semibold text-dark-900 mb-5">Descriptions</h3>
          <div className="space-y-5">
            <div>
              <label className="form-label">Short Description</label>
              <textarea {...register('shortDesc')} rows={2} className="form-input resize-none" placeholder="Brief one-line summary shown in product cards..." />
            </div>
            <div>
              <label className="form-label">Full Description</label>
              <textarea {...register('fullDesc')} rows={6} className="form-input resize-none" placeholder="Detailed product description for the product detail page..." />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-dark-900">Key Features</h3>
            <button type="button" onClick={() => appendFeature({ value: '' })} className="btn-ghost btn-sm rounded-lg text-primary-DEFAULT border border-primary-DEFAULT/30">
              <Plus size={14} /> Add Feature
            </button>
          </div>
          <div className="space-y-3">
            {featureFields.map((field, i) => (
              <div key={field.id} className="flex gap-2">
                <input {...register(`features.${i}.value`)} className="form-input flex-1" placeholder={`Feature ${i + 1} (e.g. 5-axis simultaneous machining)`} />
                <button type="button" onClick={() => removeFeature(i)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
            {featureFields.length === 0 && <p className="text-gray-400 text-sm">No features added. Click "Add Feature" to add one.</p>}
          </div>
        </div>

        {/* Specs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-dark-900">Technical Specifications</h3>
            <button type="button" onClick={() => appendSpec({ label: '', value: '' })} className="btn-ghost btn-sm rounded-lg text-primary-DEFAULT border border-primary-DEFAULT/30">
              <Plus size={14} /> Add Spec
            </button>
          </div>
          <div className="space-y-3">
            {specFields.map((field, i) => (
              <div key={field.id} className="flex gap-2">
                <input {...register(`specs.${i}.label`)} className="form-input w-44" placeholder="Label (e.g. Weight)" />
                <input {...register(`specs.${i}.value`)} className="form-input flex-1" placeholder="Value (e.g. 8,500 kg)" />
                <button type="button" onClick={() => removeSpec(i)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
            {specFields.length === 0 && <p className="text-gray-400 text-sm">No specifications added. Click "Add Spec" to add one.</p>}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          <h3 className="font-heading font-semibold text-dark-900 mb-2">Product Images</h3>
          <p className="text-gray-500 text-sm mb-5">Upload up to 10 images. The first image will be the primary (cover) image. Max 5MB per file.</p>
          <ImageUploader
            multiple
            onFilesSelected={setPendingImages}
            existingImages={existingImages}
            onDeleteExisting={(imageId) => deleteImageMutation.mutate(imageId)}
          />
        </div>

        {/* SEO */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          <h3 className="font-heading font-semibold text-dark-900 mb-5">SEO (Optional)</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Meta Title</label>
              <input {...register('metaTitle')} className="form-input" placeholder="Custom SEO title (defaults to product name)" />
            </div>
            <div>
              <label className="form-label">Meta Description</label>
              <textarea {...register('metaDesc')} rows={2} className="form-input resize-none" placeholder="SEO meta description..." />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link to="/owner/products" className="btn-ghost btn-md rounded-xl border border-gray-300 flex-1 justify-center">Cancel</Link>
          {isEdit && (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="btn border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 btn-md rounded-xl flex-1 justify-center transition-colors font-semibold"
            >
              Delete Product
            </button>
          )}
          <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary btn-md rounded-xl flex-1 justify-center disabled:opacity-60">
            <Save size={16} /> {isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone and will also remove all associated images."
        confirmText="Delete Product"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteConfirmOpen(false)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
