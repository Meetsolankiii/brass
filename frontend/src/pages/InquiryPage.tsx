import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Phone, Mail, Send, Factory, HelpCircle, MessageSquare } from 'lucide-react';
import { settingsApi, productsApi, inquiryApi } from '@/services/api';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { toast } from '@/components/ui/Toast';
import type { SiteSettings, Product } from '@/types';

const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.string().optional(),
  requirements: z.string().min(10, 'Please provide more details on specifications (at least 10 characters)'),
});
type InquiryForm = z.infer<typeof inquirySchema>;

export default function InquiryPage() {
  const [submitted, setSubmitted] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll().then((r) => r.data.data as SiteSettings),
    staleTime: 10 * 60 * 1000,
  });

  const { data: products } = useQuery({
    queryKey: ['products-dropdown'],
    queryFn: () => productsApi.getAll({ limit: '100' }).then((r) => r.data.data as Product[]),
    staleTime: 5 * 60 * 1000,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { productId: '' },
  });

  const onSubmit = async (data: InquiryForm) => {
    try {
      await inquiryApi.submit(data);
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 8000);
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      const errMsg = err.response?.data?.message || 'Failed to submit inquiry. Please try again later.';
      toast.error(errMsg);
    }
  };

  const whatsappNum = settings?.whatsapp_number || '919924464511';
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=Hello,%20I%20have%20an%20inquiry%20regarding%20precision%20brass%20components.`;

  return (
    <div>
      {/* Top dark banner */}
      <div className="bg-dark-900 pt-32 pb-16">
        <div className="container-xl">
          <AnimatedSection className="text-center">
            <span className="inline-block bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Inquiry Portal</span>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">Request a Custom Quote</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Submit your product requirements, material specifications, and quantities below to receive a direct quote.</p>
          </AnimatedSection>
        </div>
      </div>

      {/* Main content grid */}
      <div className="container-xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Inquiry Form */}
          <div className="lg:col-span-2">
            <AnimatedSection>
              <div className="bg-white rounded-2xl shadow-premium border border-gray-100 p-8">
                {submitted ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <Send size={28} className="text-green-600" />
                    </div>
                    <h3 className="font-heading font-bold text-2xl text-dark-900 mb-2">Inquiry Submitted!</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Thank you for requesting a quote. Our engineering sales team will review your specifications and get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-heading font-bold text-dark-900 mb-1">Inquiry Details</h2>
                      <p className="text-sm text-gray-500">Please provide accurate contact & product specification requirements.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="form-label font-semibold">Full Name *</label>
                        <input {...register('name')} className="form-input" placeholder="e.g. John Doe" />
                        {errors.name && <p className="form-error">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="form-label font-semibold">Company Name</label>
                        <input {...register('company')} className="form-input" placeholder="e.g. Apex Engineering Solutions" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="form-label font-semibold">Email Address *</label>
                        <input {...register('email')} type="email" className="form-input" placeholder="e.g. john@example.com" />
                        {errors.email && <p className="form-error">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label className="form-label font-semibold">Phone / WhatsApp *</label>
                        <input {...register('phone')} className="form-input" placeholder="e.g. +91 98765 43210" />
                        {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="form-label font-semibold">Select Product *</label>
                        <select {...register('productId')} className="form-input bg-white appearance-none cursor-pointer">
                          <option value="">-- Choose a Product --</option>
                          <option value="general">General Inquiry (Custom Component)</option>
                          {products?.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        {errors.productId && <p className="form-error">{errors.productId.message}</p>}
                      </div>
                      <div>
                        <label className="form-label font-semibold">Estimated Quantity</label>
                        <input {...register('quantity')} className="form-input" placeholder="e.g. 5,000 pcs" />
                      </div>
                    </div>

                    <div>
                      <label className="form-label font-semibold">Inquiry & Specification Requirements *</label>
                      <textarea 
                        {...register('requirements')} 
                        rows={6} 
                        className="form-input resize-none" 
                        placeholder="Specify material grade (IS 319, CZ 121), thread size, plating (Nickel/Natural), packaging, or custom CAD parameters..." 
                      />
                      {errors.requirements && <p className="form-error">{errors.requirements.message}</p>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn-accent btn-md rounded-xl w-full flex items-center justify-center gap-2 font-bold shadow-glow-gold hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 transition-transform">
                      {isSubmitting ? 'Sending Request...' : 'Submit Inquiry'} <Send size={16} />
                    </button>
                  </form>
                )}
              </div>
            </AnimatedSection>
          </div>

          {/* Right Column: Direct Sales Desk */}
          <div>
            <AnimatedSection delay={0.2}>
              <div className="bg-gradient-to-br from-dark-900 via-dark-800 to-primary-950 border border-dark-600 rounded-2xl shadow-premium p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-DEFAULT/20 flex items-center justify-center">
                    <HelpCircle size={20} className="text-accent-DEFAULT" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg">Direct Sales Desk</h3>
                    <div className="h-0.5 w-12 bg-accent-DEFAULT mt-0.5 rounded-full" />
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  Have urgent technical queries or large OEM RFQs? Connect directly with our engineering sales representatives.
                </p>

                <div className="space-y-4">
                  {/* Phone */}
                  <a 
                    href={`tel:${settings?.contact_phone || ''}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-dark-900/60 border border-dark-700/50 hover:bg-dark-900 hover:border-accent-DEFAULT transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs uppercase tracking-wider">Call Us Directly</div>
                      <div className="text-white text-sm font-semibold mt-0.5">{settings?.contact_phone || '+91 98765 43210'}</div>
                    </div>
                  </a>

                  {/* Email */}
                  <a 
                    href={`mailto:${settings?.contact_email || ''}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-dark-900/60 border border-dark-700/50 hover:bg-dark-900 hover:border-accent-DEFAULT transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs uppercase tracking-wider">Email RFQ</div>
                      <div className="text-white text-sm font-semibold mt-0.5">{settings?.contact_email || 'info@example.com'}</div>
                    </div>
                  </a>

                  {/* WhatsApp */}
                  <a 
                    href={whatsappUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl bg-green-500/15 border border-green-500/30 hover:bg-green-500/20 hover:border-green-400 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-105 transition-transform shrink-0">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <div className="text-green-400 text-xs uppercase tracking-wider font-semibold">Instant WhatsApp</div>
                      <div className="text-white text-sm font-bold mt-0.5">Chat With Sales</div>
                    </div>
                  </a>
                </div>

                {/* Office Info */}
                <div className="mt-8 pt-6 border-t border-dark-700/50 flex gap-3">
                  <Factory size={18} className="text-accent-DEFAULT shrink-0 mt-0.5" />
                  <div>
                    <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Factory & Office:</div>
                    <p className="text-gray-300 text-sm mt-1 whitespace-pre-line leading-relaxed">
                      {settings?.contact_address || '123 Industrial Area, Phase II\nNew Delhi, 110020\nIndia'}
                    </p>
                  </div>
                </div>

              </div>
            </AnimatedSection>
          </div>

        </div>
      </div>
    </div>
  );
}
