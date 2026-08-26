import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/services/api';
import type { SiteSettings } from '@/types';
import { whatsappConfig } from '@/config/whatsapp.config';

export default function WhatsAppButton() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll().then((r) => r.data.data as SiteSettings),
    staleTime: 10 * 60 * 1000,
  });

  const number = settings?.whatsapp_number || whatsappConfig.number;
  const encodedText = encodeURIComponent(whatsappConfig.defaultMessage);
  const whatsappUrl = `https://wa.me/${number}?text=${encodedText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-4 right-4 md:bottom-5 md:right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(37,211,102,0.3)] hover:shadow-[0_8px_24px_rgba(37,211,102,0.5)] hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 transition-all duration-300 transform group"
    >
      {/* Outer pulsing ring for professional touch */}
      <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping group-hover:animate-none opacity-60" />
      
      {/* Official WhatsApp SVG Logo */}
      <svg
        viewBox="0 0 24 24"
        className="w-7 h-7 fill-current relative z-10 transition-transform duration-300 group-hover:rotate-6"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 1.981 14.115.95 11.482.95 6.042.95 1.614 5.32 1.61 10.749c-.001 1.744.469 3.447 1.361 4.966L1.932 21.9l6.3-1.654-.585-.092zm10.312-7.143c-.27-.135-1.597-.788-1.846-.879-.25-.09-.43-.135-.61.135-.18.27-.696.879-.852 1.058-.157.18-.314.202-.584.067-.27-.135-1.14-.42-2.172-1.341-.803-.715-1.346-1.597-1.503-1.867-.157-.27-.017-.417.118-.552.122-.122.27-.315.405-.472.135-.157.18-.27.27-.45.09-.18.045-.337-.022-.472-.068-.135-.61-1.468-.836-2.013-.22-.53-.442-.458-.61-.466-.157-.008-.337-.01-.518-.01-.18 0-.472.067-.72.337-.247.27-.945.922-.945 2.247s.965 2.6 1.1 2.78c.135.18 1.9 2.9 4.604 4.07 2.7.1.325.2.637.28.326.08.7.2 1.168.325.438.12.922.3 1.258.337.337.037.72.067.72-.045s.54-.52.54-1.22c0-.7-.27-.81-.36-.945z" />
      </svg>
    </a>
  );
}
