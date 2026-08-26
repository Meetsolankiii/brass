import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { servicesApi } from '@/services/api';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/admin/components/ConfirmModal';
import { toast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Service } from '@/types';

const ICONS = ['Settings', 'MessageSquare', 'Wrench', 'ShieldCheck', 'Package', 'Zap', 'Truck', 'Clock', 'Award', 'Users', 'Globe', 'BadgeCheck'];
type SForm = { title: string; description: string; icon: string; order: string; isActive: boolean };
const defaultForm: SForm = { title: '', description: '', icon: 'Settings', order: '0', isActive: true };

export default function ServicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<SForm>(defaultForm);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['services'], queryFn: () => servicesApi.getAll().then((r) => r.data as { data: Service[] }) });
  const services = data?.data || [];

  const openModal = (s?: Service) => {
    if (s) { setEditing(s); setForm({ title: s.title, description: s.description, icon: s.icon || 'Settings', order: String(s.order), isActive: s.isActive }); }
    else { setEditing(null); setForm(defaultForm); }
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (f: SForm) => {
      const payload = { ...f, order: parseInt(f.order), isActive: Boolean(f.isActive) };
      return editing ? servicesApi.update(editing.id, payload) : servicesApi.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Saved!'); setModalOpen(false); },
    onError: () => toast.error('Failed to save service'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-dark-900">Services</h2>
          <p className="text-gray-500 text-sm">{services.length} services</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary btn-md rounded-xl"><Plus size={16} /> Add Service</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading ? <LoadingSpinner /> : services.length === 0 ? (
          <p className="col-span-3 text-center text-gray-400 py-12">No services yet.</p>
        ) : services.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-DEFAULT font-bold text-sm">{s.icon?.charAt(0) || '?'}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.isActive ? 'Active' : 'Hidden'}</span>
            </div>
            <h3 className="font-semibold text-dark-900 mb-1">{s.title}</h3>
            <p className="text-gray-500 text-sm line-clamp-2 mb-4">{s.description}</p>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-400">Order: {s.order}</span>
              <div className="flex gap-1.5">
                <button onClick={() => openModal(s)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-DEFAULT"><Pencil size={14} /></button>
                <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Service' : 'Add Service'} size="md"
        footer={<>
          <button onClick={() => setModalOpen(false)} className="btn-ghost btn-md rounded-lg border border-gray-200">Cancel</button>
          <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.title} className="btn-primary btn-md rounded-lg disabled:opacity-60">
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </>}>
        <div className="space-y-4">
          <div><label className="form-label">Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Description *</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="form-input resize-none" /></div>
          <div>
            <label className="form-label">Icon (Lucide icon name)</label>
            <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="form-input bg-white cursor-pointer">
              {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Order</label><input value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} type="number" className="form-input" /></div>
            <div className="flex items-center gap-2 pt-6">
              <input checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} type="checkbox" id="s-active" className="w-4 h-4 text-primary-DEFAULT rounded" />
              <label htmlFor="s-active" className="form-label mb-0 cursor-pointer">Active</label>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} title="Delete Service" message="Delete this service?" confirmText="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} isLoading={deleteMutation.isPending} />
    </div>
  );
}
