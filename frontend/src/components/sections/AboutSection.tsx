import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Award, Users, Globe } from 'lucide-react';
import { settingsApi } from '@/services/api';
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection';
import type { SiteSettings } from '@/types';

export default function AboutSection() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.getAll().then((r) => r.data.data as SiteSettings), staleTime: 10 * 60 * 1000 });

  const heading = settings?.about_heading || 'Built on a Foundation of Engineering Excellence';
  const content = settings?.about_content || 'With over 20 years of experience in the industrial manufacturing sector, we have established ourselves as a trusted partner for businesses across India.';

  const stats = [
    { value: settings?.about_years_experience || '20+', label: 'Years Experience', icon: Award },
    { value: settings?.about_products_count || '500+', label: 'Products', icon: CheckCircle },
    { value: settings?.about_clients_count || '1,000+', label: 'Happy Clients', icon: Users },
    { value: settings?.about_states_count || '28', label: 'States Served', icon: Globe },
  ];

  const values = [
    { title: 'Uncompromising Quality', desc: 'Every product we supply meets rigorous quality standards and international certifications.' },
    { title: 'Engineering Expertise', desc: 'Decades of experience give us deep domain knowledge across all industrial sectors.' },
    { title: 'Customer Focus', desc: 'We listen, understand your requirements, and deliver solutions tailored to your needs.' },
    { title: 'Reliable Supply Chain', desc: 'Consistent inventory and logistics ensure your operations are never held up.' },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <AnimatedSection>
              <span className="section-badge">About Us</span>
              <h2 className="section-title">{heading}</h2>
              <div className="mt-6 space-y-4">
                {content.split('\n\n').map((para, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed">{para}</p>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="mt-8 grid grid-cols-2 gap-4">
              {values.map((v) => (
                <div key={v.title} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-accent-DEFAULT shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-dark-900 text-sm">{v.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{v.desc}</div>
                  </div>
                </div>
              ))}
            </AnimatedSection>
          </div>

          {/* Right: Stats grid */}
          <StaggerContainer className="grid grid-cols-2 gap-5">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <StaggerItem key={label}>
                <div className={`p-6 rounded-2xl border-2 transition-all hover:shadow-premium group ${i % 2 === 0 ? 'bg-primary-DEFAULT border-primary-DEFAULT text-white' : 'bg-white border-gray-100 hover:border-primary-DEFAULT'}`}>
                  <Icon size={28} className={i % 2 === 0 ? 'text-white/80 mb-3' : 'text-primary-DEFAULT mb-3'} />
                  <div className={`font-heading font-bold text-4xl ${i % 2 === 0 ? 'text-white' : 'text-dark-900'}`}>{value}</div>
                  <div className={`text-sm mt-1 ${i % 2 === 0 ? 'text-white/70' : 'text-gray-500'}`}>{label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
