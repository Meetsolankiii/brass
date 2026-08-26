// Shared TypeScript types for the frontend

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductFeature {
  id: string;
  productId: string;
  feature: string;
  order: number;
}

export interface ProductSpec {
  id: string;
  productId: string;
  label: string;
  value: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  categoryId: string;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  shortDesc?: string;
  fullDesc?: string;
  price?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  featured: boolean;
  stock?: number;
  metaTitle?: string;
  metaDesc?: string;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  features?: ProductFeature[];
  specs?: ProductSpec[];
  related?: Product[];
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating: number;
  content: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  site_name?: string;
  site_tagline?: string;
  site_description?: string;
  hero_heading?: string;
  hero_subheading?: string;
  hero_cta_primary?: string;
  hero_cta_secondary?: string;
  about_heading?: string;
  about_content?: string;
  about_years_experience?: string;
  about_products_count?: string;
  about_clients_count?: string;
  about_states_count?: string;
  contact_address?: string;
  contact_phone?: string;
  contact_phone_alt?: string;
  whatsapp_number?: string;
  contact_email?: string;
  contact_email_support?: string;
  contact_hours?: string;
  social_linkedin?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_youtube?: string;
  cta_heading?: string;
  cta_subheading?: string;
  cta_button_text?: string;
  meta_title?: string;
  meta_description?: string;
  [key: string]: string | undefined;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  lastLoginAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProductFormData {
  name: string;
  categoryId: string;
  shortDesc: string;
  fullDesc: string;
  price: string;
  sku: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  featured: boolean;
  stock: string;
  metaTitle: string;
  metaDesc: string;
  features: string[];
  specs: Array<{ label: string; value: string }>;
}

export interface AuthData {
  accessToken: string;
  user: AdminUser;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
