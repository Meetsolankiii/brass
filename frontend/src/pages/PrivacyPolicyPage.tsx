import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2, Building, Mail, Phone, MapPin } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-dark-900 text-white py-16 mb-12">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-DEFAULT/20 text-accent-DEFAULT border border-accent-DEFAULT/30">
                <Shield size={13} />
                Legal & Compliance
              </span>
              <span className="text-xs text-gray-400 font-mono">GSTIN: 24ATFPN6016R1Z9</span>
            </div>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              How Chetan Brass Industries protects and handles customer data, commercial RFQs, and proprietary technical blueprints.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Last updated: October 2026 • Effective for all global & domestic B2B operations
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-xl">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-10 md:p-12 space-y-10 text-gray-700 leading-relaxed text-sm sm:text-base">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-dark-900 flex items-center gap-2.5 border-b pb-3">
              <Building className="text-primary-DEFAULT shrink-0" size={22} />
              1. Overview & Commitment
            </h2>
            <p>
              <strong>Chetan Brass Industries</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), operating from Jamnagar, Gujarat, India (GSTIN: <strong>24ATFPN6016R1Z9</strong>), is a premier manufacturer and exporter of precision turned brass parts, components, and custom hardware. 
            </p>
            <p>
              We prioritize the complete confidentiality and protection of our industrial clients, procurement managers, distributors, and website visitors. This Privacy Policy details how we collect, store, and utilize technical and commercial information submitted across our portal.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-dark-900 flex items-center gap-2.5 border-b pb-3">
              <FileText className="text-primary-DEFAULT shrink-0" size={22} />
              2. Information We Collect
            </h2>
            <p>We only collect information necessary to prepare accurate manufacturing quotations, conduct engineering feasibility analyses, and fulfill orders:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong>Contact & Business Information:</strong> Name, professional email address, telephone/WhatsApp number, company name, and factory/shipping location submitted via our Request for Quote (RFQ) or Contact forms.</li>
              <li><strong>Technical Drawings & Product Specifications:</strong> CAD models, 2D/3D component drawings, dimensional tolerances, material grade preferences (e.g., Free Cutting Brass IS 319, CW614N, CDA 360), and required order volumes.</li>
              <li><strong>Operational & Browsing Telemetry:</strong> Anonymized website visit counts, browser types, and geographic location used strictly for server optimization, DDOS protection, and performance monitoring.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-dark-900 flex items-center gap-2.5 border-b pb-3">
              <Lock className="text-primary-DEFAULT shrink-0" size={22} />
              3. Protection of Proprietary Drawings & Non-Disclosure
            </h2>
            <div className="bg-primary-50/50 border-l-4 border-primary-DEFAULT p-4 rounded-r-xl">
              <p className="font-semibold text-dark-900 mb-1">Strict Intellectual Property Confidentiality</p>
              <p className="text-sm text-gray-700">
                All client-supplied CAD drawings, component blueprints, patent-pending samples, and custom tooling parameters remain 100% the intellectual property of the client. Chetan Brass Industries will never sell, lease, disclose, or replicate custom client components for unauthorized third parties.
              </p>
            </div>
            <p>
              Where requested by industrial buyers, we execute customized <strong>Mutual Non-Disclosure Agreements (NDAs)</strong> prior to reviewing technical drawings or initiating prototype tooling.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-dark-900 flex items-center gap-2.5 border-b pb-3">
              <CheckCircle2 className="text-primary-DEFAULT shrink-0" size={22} />
              4. How We Utilize Customer Data
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Preparing formal Proforma Invoices and engineering cost estimations.</li>
              <li>Coordinating sample development, tooling fabrication, and mass manufacturing schedules.</li>
              <li>Issuing GST tax invoices, export documentation (Shipping Bills, Certificates of Origin, Test Certificates), and logistics dispatch alerts.</li>
              <li>Direct client correspondence regarding order progress, inspection reports, and dispatch tracking.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-dark-900 flex items-center gap-2.5 border-b pb-3">
              <Shield className="text-primary-DEFAULT shrink-0" size={22} />
              5. Data Security & Storage Standards
            </h2>
            <p>
              Our web infrastructure enforces modern 256-bit SSL encryption across all data transmissions. Database storage utilizes secure cloud environments with encrypted connection strings and restricted access policies. We do not store sensitive payment card or banking passwords on our servers.
            </p>
          </section>

          {/* Section 6 - Contact */}
          <section className="bg-dark-900 text-white rounded-xl p-6 sm:p-8 space-y-4">
            <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
              6. Data Privacy Queries & Commercial Contact
            </h3>
            <p className="text-gray-300 text-sm">
              If you have any questions regarding your data, NDA requests, or wish to update your commercial records, please reach out directly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
              <div className="flex items-center gap-3 text-gray-300">
                <Building size={16} className="text-accent-DEFAULT shrink-0" />
                <span>Chetan Brass Industries</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin size={16} className="text-accent-DEFAULT shrink-0" />
                <span>Jamnagar, Gujarat, India</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone size={16} className="text-accent-DEFAULT shrink-0" />
                <a href="tel:+919924464511" className="hover:text-white transition-colors">+91 99244 64511</a>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail size={16} className="text-accent-DEFAULT shrink-0" />
                <a href="mailto:bhaveshnakum802@gmail.com" className="hover:text-white transition-colors">bhaveshnakum802@gmail.com</a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
