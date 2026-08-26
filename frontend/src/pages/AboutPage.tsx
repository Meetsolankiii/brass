import AboutSection from '@/components/sections/AboutSection';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import CTASection from '@/components/sections/CTASection';
import AnimatedSection from '@/components/shared/AnimatedSection';

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Page header */}
      <div className="bg-dark-900 py-16">
        <div className="container-xl">
          <AnimatedSection className="text-center">
            <span className="inline-block bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">About Us</span>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">Our Story & Mission</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Learn about our journey, our values, and our commitment to delivering excellence in industrial solutions.</p>
          </AnimatedSection>
        </div>
      </div>
      <AboutSection />
      <WhyChooseUs />
      <CTASection />
    </div>
  );
}
