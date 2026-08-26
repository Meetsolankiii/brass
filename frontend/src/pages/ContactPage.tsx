import ContactSection from '@/components/sections/ContactSection';
import AnimatedSection from '@/components/shared/AnimatedSection';

export default function ContactPage() {
  return (
    <div className="pt-20">
      <div className="bg-dark-900 py-16">
        <div className="container-xl">
          <AnimatedSection className="text-center">
            <span className="inline-block bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Contact</span>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">Get In Touch</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Our team is ready to assist with enquiries, bulk orders, technical support, and custom requirements.</p>
          </AnimatedSection>
        </div>
      </div>
      <ContactSection />
    </div>
  );
}
