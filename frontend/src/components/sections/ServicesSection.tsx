import { useQuery } from '@tanstack/react-query';
import { Settings, MessageSquare, Wrench, ShieldCheck, Package, Zap } from 'lucide-react';
import { servicesApi } from '@/services/api';
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection';
import type { Service } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  Settings, MessageSquare, Wrench, ShieldCheck, Package, Zap,
};

export default function ServicesSection() {
  const { data } = useQuery({ queryKey: ['services'], queryFn: () => servicesApi.getAll().then((r) => r.data.data as Service[]), staleTime: 5 * 60 * 1000 });
  const services = data || [];

  return (
    <section className="section-padding bg-white">
      <div className="container-xl">
        <AnimatedSection className="text-center mb-12">
          <span className="section-badge">Our Services</span>
          <h2 className="section-title mx-auto">More Than Just Products</h2>
          <p className="section-subtitle mx-auto">We provide comprehensive industrial services to support your business at every stage — from consultation to after-sales support.</p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(services.length > 0 ? services : Array.from({ length: 6 })).map((service, i) => {
            const s = service as Service;
            const Icon = (s?.icon && iconMap[s.icon]) || Settings;
            return (
              <StaggerItem key={s?.id || i}>
                <div className="group p-7 rounded-2xl border-2 border-gray-100 hover:border-primary-DEFAULT/30 hover:shadow-premium transition-all duration-300 hover:-translate-y-1">
                  <div className="w-13 h-13 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mb-5 group-hover:from-primary-DEFAULT group-hover:to-primary-700 transition-all duration-300">
                    <Icon size={22} className="text-primary-DEFAULT group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-heading font-semibold text-dark-900 text-lg mb-2">{s?.title || 'Service Title'}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s?.description || 'Service description goes here.'}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
