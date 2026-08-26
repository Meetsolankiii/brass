import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection';
import { Shield, Award, Headphones, Truck, BadgeCheck, Clock } from 'lucide-react';

const reasons = [
  { icon: Award, title: 'ISO Certified Quality', desc: 'All products meet rigorous international quality standards and certifications you can trust.' },
  { icon: BadgeCheck, title: '20+ Years of Experience', desc: 'Decades of industrial expertise gives us deep knowledge to serve your exact requirements.' },
  { icon: Shield, title: 'Genuine Products Only', desc: 'We supply only authentic, manufacturer-verified products with full warranty coverage.' },
  { icon: Headphones, title: 'Dedicated Support', desc: '24/7 technical support team available for consultation, installation, and after-sales service.' },
  { icon: Truck, title: 'Pan-India Delivery', desc: 'Reliable logistics network covering all 28 states with tracked, on-time delivery.' },
  { icon: Clock, title: 'Fast Turnaround', desc: 'Express manufacturing and delivery options for urgent requirements — keeping your operations running.' },
];

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-dark-900 relative overflow-hidden">
      <div className="absolute inset-0 hero-pattern" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-DEFAULT/40 to-transparent" />

      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-14">
          <span className="inline-block bg-primary-DEFAULT/20 border border-primary-DEFAULT/30 text-primary-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Why Choose Us</span>
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight mx-auto">
            The Preferred Choice of<br /><span className="text-accent-DEFAULT">Industrial Leaders</span>
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">We don't just supply products — we deliver engineering partnerships built on quality, trust, and expertise.</p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <StaggerItem key={title}>
              <div className="group p-7 rounded-2xl border border-dark-600 bg-dark-800/50 hover:bg-dark-700 hover:border-primary-DEFAULT/40 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary-DEFAULT/15 flex items-center justify-center mb-5 group-hover:bg-primary-DEFAULT/25 transition-colors">
                  <Icon size={24} className="text-primary-300" />
                </div>
                <h3 className="font-heading font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
