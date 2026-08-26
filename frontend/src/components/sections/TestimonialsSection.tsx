import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { testimonialsApi } from '@/services/api';
import AnimatedSection from '@/components/shared/AnimatedSection';
import type { Testimonial } from '@/types';

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const { data } = useQuery({ queryKey: ['testimonials'], queryFn: () => testimonialsApi.getAll().then((r) => r.data.data as Testimonial[]), staleTime: 5 * 60 * 1000 });
  const testimonials = data || [];

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => { setDirection(1); setCurrent((p) => (p + 1) % testimonials.length); }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const navigate = (dir: 1 | -1) => {
    setDirection(dir);
    setCurrent((p) => (p + dir + testimonials.length) % testimonials.length);
  };

  if (testimonials.length === 0) return null;

  const t = testimonials[current];

  return (
    <section className="section-padding bg-gradient-to-br from-primary-900 to-dark-900 relative overflow-hidden">
      <div className="absolute inset-0 hero-pattern opacity-50" />
      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-14">
          <span className="inline-block bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Client Testimonials</span>
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-white">What Our Clients Say</h2>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto relative">
          {/* Quote icon */}
          <div className="absolute -top-4 left-0 text-white/10">
            <Quote size={80} />
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 60 }}
              transition={{ duration: 0.4 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-10"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} fill={i < t.rating ? '#c9a227' : 'transparent'} className={i < t.rating ? 'text-accent-DEFAULT' : 'text-white/30'} />
                ))}
              </div>
              <p className="text-white text-lg leading-relaxed mb-8 italic">"{t.content}"</p>
              <div className="flex items-center gap-4">
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-accent-DEFAULT" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent-DEFAULT flex items-center justify-center text-white font-bold text-lg">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-heading font-semibold text-white">{t.name}</div>
                  <div className="text-gray-300 text-sm">{t.role}{t.company ? ` · ${t.company}` : ''}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                    className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-accent-DEFAULT' : 'w-2 bg-white/30 hover:bg-white/50'}`} />
                ))}
              </div>
              <button onClick={() => navigate(1)} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
