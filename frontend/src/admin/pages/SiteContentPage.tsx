import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { settingsApi } from '@/services/api';
import { toast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { SiteSettings } from '@/types';

const GROUPS = [
  {
    group: 'general', label: 'General', fields: [
      { key: 'site_name', label: 'Business Name', type: 'text', placeholder: 'e.g. ABC Industries' },
      { key: 'site_tagline', label: 'Tagline', type: 'text', placeholder: 'e.g. Precision. Quality. Reliability.' },
      { key: 'site_description', label: 'Site Description', type: 'textarea', placeholder: 'One paragraph describing your business...' },
    ],
  },
  {
    group: 'hero', label: 'Hero Section', fields: [
      { key: 'hero_heading', label: 'Hero Heading', type: 'text', placeholder: 'Main headline' },
      { key: 'hero_subheading', label: 'Hero Subheading', type: 'textarea', placeholder: 'Supporting text below the headline' },
      { key: 'hero_cta_primary', label: 'Primary Button Text', type: 'text', placeholder: 'Explore Products' },
      { key: 'hero_cta_secondary', label: 'Secondary Button Text', type: 'text', placeholder: 'Contact Us' },
    ],
  },
  {
    group: 'about', label: 'About Section', fields: [
      { key: 'about_heading', label: 'Heading', type: 'text' },
      { key: 'about_content', label: 'Content', type: 'textarea' },
      { key: 'about_years_experience', label: 'Years Experience', type: 'text', placeholder: '20+' },
      { key: 'about_products_count', label: 'Products Count', type: 'text', placeholder: '500+' },
      { key: 'about_clients_count', label: 'Clients Count', type: 'text', placeholder: '1,000+' },
      { key: 'about_states_count', label: 'States Served', type: 'text', placeholder: '28' },
    ],
  },
  {
    group: 'contact', label: 'Contact Info', fields: [
      { key: 'contact_address', label: 'Address', type: 'textarea', placeholder: '123 Industrial Area, Phase II\nNew Delhi, 110020' },
      { key: 'contact_phone', label: 'Primary Phone', type: 'text', placeholder: '+91 98765 43210' },
      { key: 'contact_phone_alt', label: 'Secondary Phone', type: 'text' },
      { key: 'whatsapp_number', label: 'WhatsApp Number (With country code, no + or spaces, e.g. 919924464511)', type: 'text', placeholder: '919924464511' },
      { key: 'contact_email', label: 'Primary Email', type: 'text', placeholder: 'info@yourcompany.com' },
      { key: 'contact_email_support', label: 'Support Email', type: 'text' },
      { key: 'contact_hours', label: 'Business Hours', type: 'textarea', placeholder: 'Monday – Saturday: 9:00 AM – 6:00 PM' },
    ],
  },
  {
    group: 'social', label: 'Social Links', fields: [
      { key: 'social_linkedin', label: 'LinkedIn URL', type: 'text', placeholder: 'https://linkedin.com/company/...' },
      { key: 'social_facebook', label: 'Facebook URL', type: 'text', placeholder: 'https://facebook.com/...' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'text', placeholder: 'https://instagram.com/...' },
      { key: 'social_youtube', label: 'YouTube URL', type: 'text', placeholder: 'https://youtube.com/...' },
    ],
  },
  {
    group: 'cta', label: 'Call-to-Action Section', fields: [
      { key: 'cta_heading', label: 'CTA Heading', type: 'text' },
      { key: 'cta_subheading', label: 'CTA Subheading', type: 'textarea' },
      { key: 'cta_button_text', label: 'Button Text', type: 'text' },
    ],
  },
  {
    group: 'seo', label: 'SEO', fields: [
      { key: 'meta_title', label: 'Meta Title', type: 'text', placeholder: 'Your Company — Tagline' },
      { key: 'meta_description', label: 'Meta Description', type: 'textarea', placeholder: 'Compelling description for search engines (150-160 chars)' },
    ],
  },
];

export default function SiteContentPage() {
  const [activeGroup, setActiveGroup] = useState('general');
  const [local, setLocal] = useState<SiteSettings>({});
  const [dirty, setDirty] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.getAll().then((r) => r.data.data as SiteSettings) });

  useEffect(() => { if (data) { setLocal(data); setDirty(false); } }, [data]);

  const updateMutation = useMutation({
    mutationFn: () => settingsApi.update(local as Record<string, string>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast.success('Settings saved!'); setDirty(false); },
    onError: () => toast.error('Failed to save settings'),
  });

  const handleChange = (key: string, value: string) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const currentGroup = GROUPS.find((g) => g.group === activeGroup)!;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-dark-900">Site Content</h2>
          <p className="text-gray-500 text-sm">Edit all website text, contact info, and SEO from here.</p>
        </div>
        <button onClick={() => updateMutation.mutate()} disabled={!dirty || updateMutation.isPending} className="btn-primary btn-md rounded-xl disabled:opacity-50">
          <Save size={16} /> {updateMutation.isPending ? 'Saving...' : dirty ? 'Save Changes' : 'Saved'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <div className="lg:w-52 shrink-0">
          <nav className="bg-white rounded-2xl border border-gray-200 p-2 space-y-1">
            {GROUPS.map((g) => (
              <button key={g.group} onClick={() => setActiveGroup(g.group)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeGroup === g.group ? 'bg-primary-DEFAULT text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {g.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-7 space-y-5">
          <h3 className="font-heading font-semibold text-dark-900 text-lg">{currentGroup.label}</h3>
          {currentGroup.fields.map((field) => (
            <div key={field.key}>
              <label className="form-label">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea value={local[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} rows={4} className="form-input resize-none" placeholder={field.placeholder} />
              ) : (
                <input value={local[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} className="form-input" placeholder={field.placeholder} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
