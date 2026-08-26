import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { testimonialsApi } from '@/services/api';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/admin/components/ConfirmModal';
import ImageUploader from '@/admin/components/ImageUploader';
import { toast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Testimonial } from '@/types';

type TForm = { name: string; role: string; company: string; rating: string; content: string; isActive: boolean; order: string };
const defaultForm: TForm = { name: '', role: '', company: '', rating: '5', content: '', isActive: true, order: '0' };

export default function TestimonialsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<TForm>(defaultForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['testimonials'], queryFn: () => testimonialsApi.getAll().then((r) => r.data as { data: Testimonial[] }) });
  const testimonials = data?.data || [];

  const openModal = (t?: Testimonial) => {
    if (t) { setEditing(t); setForm({ name: t.name, role: t.role || '', company: t.company || '', rating: String(t.rating), content: t.content, isActive: t.isActive, order: String(t.order) }); }
    else { setEditing(null); setForm(defaultForm); }
    setAvatarFile(null); setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (f: TForm) => {
      const payload = { ...f, rating: parseInt(f.rating), order: parseInt(f.order), isActive: Boolean(f.isActive) };
      const res = editing ? await testimonialsApi.update(editing.id, payload) : await testimonialsApi.create(payload);
      const tId = (res.data as { data: Testimonial }).data.id;
      if (avatarFile) await testimonialsApi.uploadAvatar(tId, avatarFile);
      return res;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success('Testimonial saved!'); setModalOpen(false); },
    onError: () => toast.error('Failed to save testimonial'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => testimonialsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success('Deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-dark-900">Testimonials</h2>
          <p className="text-gray-500 text-sm">{testimonials.length} reviews</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary btn-md rounded-xl"><Plus size={16} /> Add Testimonial</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading ? <LoadingSpinner /> : testimonials.length === 0 ? (
          <p className="col-span-3 text-center text-gray-400 py-12">No testimonials yet.</p>
        ) : testimonials.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {t.avatar ? <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" /> : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent-DEFAULT flex items-center justify-center text-white font-bold">{t.name.charAt(0)}</div>
                )}
                <div>
                  <div className="font-semibold text-dark-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}{t.company ? ` · ${t.company}` : ''}</div>
                </div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={12} fill="#c9a227" className="text-accent-DEFAULT" />)}
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">"{t.content}"</p>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className={`text-xs px-2 py-0.5 rounded-full ${t.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t.isActive ? 'Visible' : 'Hidden'}</span>
              <div className="flex gap-1.5">
                <button onClick={() => openModal(t)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-DEFAULT"><Pencil size={14} /></button>
                <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Testimonial' : 'Add Testimonial'} size="md"
        footer={<>
          <button onClick={() => setModalOpen(false)} className="btn-ghost btn-md rounded-lg border border-gray-200">Cancel</button>
          <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.name || !form.content} className="btn-primary btn-md rounded-lg disabled:opacity-60">
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="form-label">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" />
            </div>
            <div><label className="form-label">Role</label><input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="form-input" placeholder="Plant Manager" /></div>
            <div><label className="form-label">Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="form-input" placeholder="Company Name" /></div>
          </div>
          <div>
            <label className="form-label">Rating (1–5)</label>
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="form-input bg-white cursor-pointer">
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Testimonial *</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="form-input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Order</label><input value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} type="number" className="form-input" /></div>
            <div className="flex items-center gap-2 pt-6">
              <input checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} type="checkbox" id="t-active" className="w-4 h-4 text-primary-DEFAULT rounded" />
              <label htmlFor="t-active" className="form-label mb-0 cursor-pointer">Visible</label>
            </div>
          </div>
          <div>
            <label className="form-label">Avatar Photo</label>
            <ImageUploader onFilesSelected={(files) => setAvatarFile(files[0] || null)} existingImages={editing?.avatar ? [{ id: 'existing', url: editing.avatar }] : []} />
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} title="Delete Testimonial" message="Are you sure you want to delete this testimonial?" confirmText="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} isLoading={deleteMutation.isPending} />
    </div>
  );
}
