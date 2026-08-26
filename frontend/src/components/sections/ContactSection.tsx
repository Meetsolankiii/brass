import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { settingsApi, contactApi } from '@/services/api';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { toast } from '@/components/ui/Toast';
import type { SiteSettings } from '@/types';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(20, 'Please provide more detail (at least 20 characters)'),
});
type ContactForm = z.infer<typeof contactSchema>;

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.getAll().then((r) => r.data.data as SiteSettings), staleTime: 10 * 60 * 1000 });
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactForm) => {
    try {
      await contactApi.submit(data);
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err: any) {
      console.error('Contact submission error:', err);
      const errMsg = err.response?.data?.message || 'Failed to send message. Please try again later.';
      toast.error(errMsg);
    }
  };

  const contactItems = [
    { icon: MapPin, label: 'Address', value: settings?.contact_address, href: null },
    { icon: Phone, label: 'Phone', value: settings?.contact_phone, href: `tel:${settings?.contact_phone}` },
    { icon: Mail, label: 'Email', value: settings?.contact_email, href: `mailto:${settings?.contact_email}` },
    { icon: Clock, label: 'Business Hours', value: settings?.contact_hours, href: null },
  ].filter((c) => c.value);

  return (
    <section id="contact" className="section-padding bg-gray-50">
      <div className="container-xl">
        <AnimatedSection className="text-center mb-12">
          <span className="section-badge">Contact Us</span>
          <h2 className="section-title mx-auto">Get In Touch With Us</h2>
          <p className="section-subtitle mx-auto">Our team is ready to help with product queries, bulk orders, technical consultation, and custom requirements.</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            {contactItems.map(({ icon: Icon, label, value, href }) => (
              <AnimatedSection key={label} direction="left">
                <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-primary-DEFAULT" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                    {href ? (
                      <a href={href} className="text-dark-900 text-sm font-medium hover:text-primary-DEFAULT transition-colors whitespace-pre-line">{value}</a>
                    ) : (
                      <p className="text-dark-900 text-sm font-medium whitespace-pre-line">{value}</p>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Contact form */}
          <AnimatedSection delay={0.2} className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Send size={28} className="text-green-600" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-dark-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input {...register('name')} className="form-input" placeholder="Your name" />
                      {errors.name && <p className="form-error">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Email *</label>
                      <input {...register('email')} type="email" className="form-input" placeholder="your@email.com" />
                      {errors.email && <p className="form-error">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Phone</label>
                      <input {...register('phone')} className="form-input" placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="form-label">Company</label>
                      <input {...register('company')} className="form-input" placeholder="Your company" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Subject *</label>
                    <input {...register('subject')} className="form-input" placeholder="Product inquiry / Bulk order / Technical support..." />
                    {errors.subject && <p className="form-error">{errors.subject.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Message *</label>
                    <textarea {...register('message')} rows={5} className="form-input resize-none" placeholder="Describe your requirements in detail..." />
                    {errors.message && <p className="form-error">{errors.message.message}</p>}
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-primary btn-md rounded-xl w-full disabled:opacity-60 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Sending...' : 'Send Message'} <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
