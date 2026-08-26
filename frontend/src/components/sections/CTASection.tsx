import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { settingsApi } from '@/services/api';
import AnimatedSection from '@/components/shared/AnimatedSection';
import type { SiteSettings } from '@/types';

export default function CTASection() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.getAll().then((r) => r.data.data as SiteSettings), staleTime: 10 * 60 * 1000 });

  return (
    <section className="py-20 bg-white">
      <div className="container-xl">
        <AnimatedSection>
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-DEFAULT via-primary-700 to-dark-900 p-12 md:p-16 text-center">
            {/* Pattern overlay */}
            <div className="absolute inset-0 hero-pattern opacity-30" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-DEFAULT/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <span className="inline-block bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">Get In Touch</span>
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
                {settings?.cta_heading || 'Looking for Reliable Industrial Equipment?'}
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
                {settings?.cta_subheading || 'Contact our expert team today for guidance on the right products for your industrial needs.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="btn bg-accent-DEFAULT text-dark-900 hover:bg-accent-400 btn-lg rounded-xl font-bold shadow-glow-gold active:scale-95">
                  {settings?.cta_button_text || 'Get In Touch'} <ArrowRight size={18} />
                </Link>
                <Link to="/products" className="btn border-2 border-white/30 text-white hover:bg-white hover:text-dark-900 btn-lg rounded-xl active:scale-95">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
