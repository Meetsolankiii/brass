import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, FileText, CheckCircle2, AlertCircle, Building, Mail, Phone, MapPin, Truck, Award } from 'lucide-react';

export default function TermsPage() {
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
                <Scale size={13} />
                Commercial Guidelines
              </span>
              <span className="text-xs text-gray-400 font-mono">GSTIN: 24ATFPN6016R1Z9</span>
            </div>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
              Terms & Conditions
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Commercial supply terms, quotation validity, manufacturing standards, and dispute guidelines for Chetan Brass Industries.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Last updated: October 2026 • Governing all industrial orders & contracts
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
              1. General Commercial Scope
            </h2>
            <p>
              These Terms and Conditions constitute a legally binding agreement between <strong>Chetan Brass Industries</strong> (Khimaliya Village, Jamnagar, Gujarat – 361120, India, GSTIN: <strong>24ATFPN6016R1Z9</strong>) and the purchasing entity or client.
            </p>
            <p>
              By issuing a Purchase Order (PO), confirming a quotation, or accepting delivery of brass components, turned parts, fasteners, or assemblies, the buyer agrees to be governed by these terms unless expressly superseded by a signed bilateral contract.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-dark-900 flex items-center gap-2.5 border-b pb-3">
              <FileText className="text-primary-DEFAULT shrink-0" size={22} />
              2. Quotations, Raw Material Indexing & Orders
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong>Raw Material Fluctuations:</strong> Brass pricing is tied to global copper and zinc commodity indices (LME / domestic MCX benchmarks). Unless explicitly fixed in writing, formal price quotes remain valid for <strong>15 calendar days</strong> from the date of issue.</li>
              <li><strong>Minimum Order Quantities (MOQ):</strong> MOQs are calculated based on tooling setup, machine downtime, and batch bar feeding requirements. Custom dimensions or specialty alloys may incur specific production minimums.</li>
              <li><strong>Order Confirmation:</strong> An order is deemed formally accepted only upon written acknowledgement and issuance of an official Proforma Invoice.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-dark-900 flex items-center gap-2.5 border-b pb-3">
              <Award className="text-primary-DEFAULT shrink-0" size={22} />
              3. Engineering Tolerances & Material Grades
            </h2>
            <p>
              All manufacturing is executed strictly according to approved customer blueprints, CAD files, or physical reference samples.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
              <p><strong>Standard Machining Tolerances:</strong> Adheres to standard ISO 2768-m (medium) class unless ultra-precision tolerances (e.g., ±0.005 mm) are agreed upon prior to manufacturing.</p>
              <p><strong>Alloy Specifications:</strong> Free Cutting Brass (IS 319 Type I/II, BS 2874 CZ121, CW614N, CDA 360), DZR Brass, Naval Brass, and lead-free alloys available upon certification request.</p>
              <p><strong>Surface Finishes:</strong> Natural brass, electro-nickel plating, chrome plating, tin plating, zinc passivation, or ultrasonic cleaning as stated on order specifications.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-dark-900 flex items-center gap-2.5 border-b pb-3">
              <Truck className="text-primary-DEFAULT shrink-0" size={22} />
              4. Shipping, Delivery & Incoterms
            </h2>
            <p>
              We provide comprehensive dispatch options across domestic India and international export destinations:
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong>Domestic Orders:</strong> Ex-Factory (Khimaliya, Jamnagar, Gujarat – 361120) or Door Delivery via approved third-party road freight carriers. Goods transit at buyer&apos;s risk unless transit insurance is expressly contracted.</li>
              <li><strong>Export Consignments:</strong> Shipped under recognized Incoterms (FOB Mundra / Kandla Port, CIF, CFR, or Air Freight). Chetan Brass Industries furnishes standard commercial export invoices, packing lists, and Certificates of Origin.</li>
              <li><strong>Lead Times:</strong> Delivery schedules indicate estimated dispatch dates from our factory and are contingent upon raw material availability, power supply, and standard industrial operating conditions.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-dark-900 flex items-center gap-2.5 border-b pb-3">
              <CheckCircle2 className="text-primary-DEFAULT shrink-0" size={22} />
              5. Payment Terms & Invoicing
            </h2>
            <p>
              All transactions are processed through verified banking channels and accompanied by legitimate GST invoices (GSTIN: <strong>24ATFPN6016R1Z9</strong>).
            </p>
            <p>
              Standard commercial terms require an agreed advance deposit upon order placement to procure raw materials and tooling, with the remaining balance due against dispatch inspection or Bill of Lading (BL) copy.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-dark-900 flex items-center gap-2.5 border-b pb-3">
              <AlertCircle className="text-primary-DEFAULT shrink-0" size={22} />
              6. Inspection, Quality Claims & Rejections
            </h2>
            <p>
              We encourage thorough pre-dispatch inspection. In the event of any dimensional discrepancy or non-conformance with approved technical drawings:
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li>The buyer must notify us in writing within <strong>7 business days</strong> of shipment arrival, including detailed inspection reports, sample measurements, and photographic evidence.</li>
              <li>Upon verified quality deviation attributable to manufacturing error, Chetan Brass Industries will rework, replace, or issue credit for the defective quantity. Our liability is strictly limited to the invoice value of the non-conforming goods.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-dark-900 flex items-center gap-2.5 border-b pb-3">
              <Scale className="text-primary-DEFAULT shrink-0" size={22} />
              7. Governing Law & Legal Jurisdiction
            </h2>
            <p>
              All contracts, purchases, disputes, and legal relationships shall be governed and interpreted under the commercial laws of the Republic of India. Any legal dispute, arbitration, or proceedings shall be subject exclusively to the territorial jurisdiction of the competent courts in <strong>Jamnagar, Gujarat, India</strong>.
            </p>
          </section>

          {/* Section 8 - Contact */}
          <section className="bg-dark-900 text-white rounded-xl p-6 sm:p-8 space-y-4">
            <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
              8. Commercial Department Inquiries
            </h3>
            <p className="text-gray-300 text-sm">
              For purchase orders, contract discussions, or banking verification, contact our commercial office:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
              <div className="flex items-center gap-3 text-gray-300">
                <Building size={16} className="text-accent-DEFAULT shrink-0" />
                <span>Chetan Brass Industries</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin size={16} className="text-accent-DEFAULT shrink-0" />
                <span>Khimaliya Village, Jamnagar, Gujarat – 361120, India</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone size={16} className="text-accent-DEFAULT shrink-0" />
                <a href="tel:+919327174035" className="hover:text-white transition-colors">+91 93271 74035</a>
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
