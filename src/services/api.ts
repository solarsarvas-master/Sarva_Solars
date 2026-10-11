import {
  AuthResponse,
  User,
  UserRole,
  Lead,
  QuoteRequest,
  Product,
  Project,
  BlogArticle,
  ServiceItem,
  SubsidyDetail,
  Testimonial,
  FAQItem,
  GalleryItem,
  JobOpening,
  JobApplication,
  AppSettings,
  HeroSlide,
  AuditLog,
  VisitorLog,
  EmailNotification
} from '../types';

import { getCurrentSupabaseUser, signInWithPassword, signOut } from './supabaseAuth';
import { supabase } from '../lib/supabase';

export function notifyDataUpdated(): void {
  if (typeof window === 'undefined') return;

  // 1. In-tab custom event
  try {
    window.dispatchEvent(new CustomEvent('sarva_data_updated'));
    window.dispatchEvent(new Event('sarva_data_updated'));
  } catch (e) {}

  // 2. Cross-tab storage event
  try {
    localStorage.setItem('sarva_last_data_update', Date.now().toString());
  } catch (e) {}

  // 3. Cross-tab Broadcast Channel
  try {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('sarva_data_channel');
      bc.postMessage('sarva_data_updated');
      bc.close();
    }
  } catch (e) {}
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return signInWithPassword(email, password);
}

export async function getCurrentUser(): Promise<User | null> {
  return getCurrentSupabaseUser();
}

export const fetchCurrentUser = getCurrentUser;

// STAFF / USERS
export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, phone, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((profile) => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role as User['role'],
    phone: profile.phone ?? undefined,
    createdAt: profile.created_at
  }));
}

// SETTINGS
export async function fetchSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) throw error;

  return {
    companyName: data.company_name,
    tagline: data.tagline,
    phone1: data.phone1,
    phone2: data.phone2,
    email: data.email,
    address: data.address,
    whatsappNumber: data.whatsapp_number,
    workingHours: data.working_hours,
    announcementBarText: data.announcement_bar_text,
    showAnnouncementBar: data.show_announcement_bar,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    googleMapsEmbedUrl: data.google_maps_embed_url,
    installedCapacity: data.installed_capacity ?? '',
    customerRating: data.customer_rating ?? '',
    panelWarranty: data.panel_warranty ?? '',
    governmentSubsidy: data.government_subsidy ?? ''
  };
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const payload = {
    company_name: updates.companyName,
    tagline: updates.tagline,
    phone1: updates.phone1,
    phone2: updates.phone2,
    email: updates.email,
    address: updates.address,
    whatsapp_number: updates.whatsappNumber,
    working_hours: updates.workingHours,
    announcement_bar_text: updates.announcementBarText,
    show_announcement_bar: updates.showAnnouncementBar,
    meta_title: updates.metaTitle,
    meta_description: updates.metaDescription,
    google_maps_embed_url: updates.googleMapsEmbedUrl,
    installed_capacity: updates.installedCapacity,
    customer_rating: updates.customerRating,
    panel_warranty: updates.panelWarranty,
    government_subsidy: updates.governmentSubsidy
  };

  Object.keys(payload).forEach((key) => {
    const typedKey = key as keyof typeof payload;
    if (payload[typedKey] === undefined) {
      delete payload[typedKey];
    }
  });

  const { data, error } = await supabase
    .from('settings')
    .update(payload)
    .eq('id', 1)
    .select('*')
    .single();

  if (error) throw error;

  return {
    companyName: data.company_name,
    tagline: data.tagline,
    phone1: data.phone1,
    phone2: data.phone2,
    email: data.email,
    address: data.address,
    whatsappNumber: data.whatsapp_number,
    workingHours: data.working_hours,
    announcementBarText: data.announcement_bar_text,
    showAnnouncementBar: data.show_announcement_bar,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    googleMapsEmbedUrl: data.google_maps_embed_url,
    installedCapacity: data.installed_capacity ?? '',
    customerRating: data.customer_rating ?? '',
    panelWarranty: data.panel_warranty ?? '',
    governmentSubsidy: data.government_subsidy ?? ''
  };
}

// SERVICES
export async function fetchServices(): Promise<ServiceItem[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((service) => ({
    id: service.id,
    title: service.title,
    slug: service.slug,
    shortDesc: service.short_desc,
    fullDesc: service.full_desc,
    iconName: service.icon_name,
    benefits: service.benefits ?? [],
    imageUrl: service.image_url,
    faqs: service.faqs ?? []
  }));
}

export async function createService(svc: Omit<ServiceItem, 'id'>): Promise<ServiceItem> {
  const id = `srv-${Date.now()}`;

  const { data, error } = await supabase
    .from('services')
    .insert({
      id,
      title: svc.title,
      slug: svc.slug,
      short_desc: svc.shortDesc,
      full_desc: svc.fullDesc,
      icon_name: svc.iconName,
      benefits: svc.benefits,
      image_url: svc.imageUrl,
      faqs: svc.faqs
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    shortDesc: data.short_desc,
    fullDesc: data.full_desc,
    iconName: data.icon_name,
    benefits: data.benefits ?? [],
    imageUrl: data.image_url,
    faqs: data.faqs ?? []
  };
}

export async function updateService(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem> {
  const payload: Record<string, unknown> = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.shortDesc !== undefined) payload.short_desc = updates.shortDesc;
  if (updates.fullDesc !== undefined) payload.full_desc = updates.fullDesc;
  if (updates.iconName !== undefined) payload.icon_name = updates.iconName;
  if (updates.benefits !== undefined) payload.benefits = updates.benefits;
  if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
  if (updates.faqs !== undefined) payload.faqs = updates.faqs;

  const { data, error } = await supabase
    .from('services')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    shortDesc: data.short_desc,
    fullDesc: data.full_desc,
    iconName: data.icon_name,
    benefits: data.benefits ?? [],
    imageUrl: data.image_url,
    faqs: data.faqs ?? []
  };
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// SUBSIDIES
export async function fetchSubsidies(): Promise<SubsidyDetail[]> {
  const { data, error } = await supabase
    .from('subsidies')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((subsidy) => ({
    id: subsidy.id,
    schemeName: subsidy.scheme_name,
    capacityRange: subsidy.capacity_range,
    centralSubsidyAmount: Number(subsidy.central_subsidy_amount),
    stateBonusAmount: Number(subsidy.state_bonus_amount),
    eligibility: subsidy.eligibility ?? [],
    documents: subsidy.documents ?? [],
    processSteps: subsidy.process_steps ?? [],
    updatedDate: subsidy.updated_date
  }));
}

export async function createSubsidy(sub: Omit<SubsidyDetail, 'id' | 'updatedDate'>): Promise<SubsidyDetail> {
  const id = `sub-${Date.now()}`;
  const updatedDate = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('subsidies')
    .insert({
      id,
      scheme_name: sub.schemeName,
      capacity_range: sub.capacityRange,
      central_subsidy_amount: sub.centralSubsidyAmount,
      state_bonus_amount: sub.stateBonusAmount,
      eligibility: sub.eligibility,
      documents: sub.documents,
      process_steps: sub.processSteps,
      updated_date: updatedDate
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    schemeName: data.scheme_name,
    capacityRange: data.capacity_range,
    centralSubsidyAmount: Number(data.central_subsidy_amount),
    stateBonusAmount: Number(data.state_bonus_amount),
    eligibility: data.eligibility ?? [],
    documents: data.documents ?? [],
    processSteps: data.process_steps ?? [],
    updatedDate: data.updated_date
  };
}

export async function updateSubsidy(id: string, updates: Partial<SubsidyDetail>): Promise<SubsidyDetail> {
  const payload: Record<string, unknown> = {};

  if (updates.schemeName !== undefined) payload.scheme_name = updates.schemeName;
  if (updates.capacityRange !== undefined) payload.capacity_range = updates.capacityRange;
  if (updates.centralSubsidyAmount !== undefined) payload.central_subsidy_amount = updates.centralSubsidyAmount;
  if (updates.stateBonusAmount !== undefined) payload.state_bonus_amount = updates.stateBonusAmount;
  if (updates.eligibility !== undefined) payload.eligibility = updates.eligibility;
  if (updates.documents !== undefined) payload.documents = updates.documents;
  if (updates.processSteps !== undefined) payload.process_steps = updates.processSteps;
  if (updates.updatedDate !== undefined) payload.updated_date = updates.updatedDate;

  const { data, error } = await supabase
    .from('subsidies')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    schemeName: data.scheme_name,
    capacityRange: data.capacity_range,
    centralSubsidyAmount: Number(data.central_subsidy_amount),
    stateBonusAmount: Number(data.state_bonus_amount),
    eligibility: data.eligibility ?? [],
    documents: data.documents ?? [],
    processSteps: data.process_steps ?? [],
    updatedDate: data.updated_date
  };
}

export async function deleteSubsidy(id: string): Promise<void> {
  const { error } = await supabase
    .from('subsidies')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// PRODUCTS
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand,
    price: Number(product.price),
    rating: Number(product.rating),
    specs: product.specs ?? {},
    description: product.description,
    warranty: product.warranty,
    imageUrl: product.image_url,
    isFeatured: product.is_featured,
    inventory: product.inventory
  }));
}

export async function createProduct(prod: Omit<Product, 'id'>): Promise<Product> {
  const id = `prod-${Date.now()}`;

  const { data, error } = await supabase
    .from('products')
    .insert({
      id,
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      price: prod.price,
      rating: prod.rating,
      specs: prod.specs,
      description: prod.description,
      warranty: prod.warranty,
      image_url: prod.imageUrl,
      is_featured: prod.isFeatured,
      inventory: prod.inventory
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    brand: data.brand,
    price: Number(data.price),
    rating: Number(data.rating),
    specs: data.specs ?? {},
    description: data.description,
    warranty: data.warranty,
    imageUrl: data.image_url,
    isFeatured: data.is_featured,
    inventory: data.inventory
  };
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const payload: Record<string, unknown> = {};

  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.brand !== undefined) payload.brand = updates.brand;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.rating !== undefined) payload.rating = updates.rating;
  if (updates.specs !== undefined) payload.specs = updates.specs;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.warranty !== undefined) payload.warranty = updates.warranty;
  if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
  if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;
  if (updates.inventory !== undefined) payload.inventory = updates.inventory;

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    brand: data.brand,
    price: Number(data.price),
    rating: Number(data.rating),
    specs: data.specs ?? {},
    description: data.description,
    warranty: data.warranty,
    imageUrl: data.image_url,
    isFeatured: data.is_featured,
    inventory: data.inventory
  };
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// PROJECTS
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((project) => ({
    id: project.id,
    title: project.title,
    category: project.category,
    location: project.location,
    state: project.state,
    capacityKw: Number(project.capacity_kw),
    annualSavingsRs: Number(project.annual_savings_rs),
    completionDate: project.completion_date,
    status: project.status,
    images: project.images ?? [],
    description: project.description,
    clientReview: project.client_review ?? undefined
  }));
}

export async function createProject(proj: Omit<Project, 'id'>): Promise<Project> {
  const id = `proj-${Date.now()}`;

  const { data, error } = await supabase
    .from('projects')
    .insert({
      id,
      title: proj.title,
      category: proj.category,
      location: proj.location,
      state: proj.state,
      capacity_kw: proj.capacityKw,
      annual_savings_rs: proj.annualSavingsRs,
      completion_date: proj.completionDate,
      status: proj.status,
      images: proj.images,
      description: proj.description,
      client_review: proj.clientReview
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    category: data.category,
    location: data.location,
    state: data.state,
    capacityKw: Number(data.capacity_kw),
    annualSavingsRs: Number(data.annual_savings_rs),
    completionDate: data.completion_date,
    status: data.status,
    images: data.images ?? [],
    description: data.description,
    clientReview: data.client_review
  };
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const payload: Record<string, unknown> = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.state !== undefined) payload.state = updates.state;
  if (updates.capacityKw !== undefined) payload.capacity_kw = updates.capacityKw;
  if (updates.annualSavingsRs !== undefined) payload.annual_savings_rs = updates.annualSavingsRs;
  if (updates.completionDate !== undefined) payload.completion_date = updates.completionDate;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.images !== undefined) payload.images = updates.images;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.clientReview !== undefined) payload.client_review = updates.clientReview;

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    category: data.category,
    location: data.location,
    state: data.state,
    capacityKw: Number(data.capacity_kw),
    annualSavingsRs: Number(data.annual_savings_rs),
    completionDate: data.completion_date,
    status: data.status,
    images: data.images ?? [],
    description: data.description,
    clientReview: data.client_review
  };
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// BLOGS
export async function fetchBlogs(): Promise<BlogArticle[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((blog) => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    category: blog.category,
    author: blog.author,
    publishedAt: blog.published_at,
    readTime: blog.read_time,
    excerpt: blog.excerpt,
    content: blog.content,
    imageUrl: blog.image_url,
    tags: blog.tags ?? [],
    isPublished: blog.is_published
  }));
}

export async function createBlog(blog: Omit<BlogArticle, 'id'>): Promise<BlogArticle> {
  const id = `blog-${Date.now()}`;

  const { data, error } = await supabase
    .from('blogs')
    .insert({
      id,
      title: blog.title,
      slug: blog.slug,
      category: blog.category,
      author: blog.author,
      published_at: blog.publishedAt,
      read_time: blog.readTime,
      excerpt: blog.excerpt,
      content: blog.content,
      image_url: blog.imageUrl,
      tags: blog.tags,
      is_published: blog.isPublished
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    category: data.category,
    author: data.author,
    publishedAt: data.published_at,
    readTime: data.read_time,
    excerpt: data.excerpt,
    content: data.content,
    imageUrl: data.image_url,
    tags: data.tags ?? [],
    isPublished: data.is_published
  };
}

export async function updateBlog(id: string, updates: Partial<BlogArticle>): Promise<BlogArticle> {
  const payload: Record<string, unknown> = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.author !== undefined) payload.author = updates.author;
  if (updates.publishedAt !== undefined) payload.published_at = updates.publishedAt;
  if (updates.readTime !== undefined) payload.read_time = updates.readTime;
  if (updates.excerpt !== undefined) payload.excerpt = updates.excerpt;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.isPublished !== undefined) payload.is_published = updates.isPublished;

  const { data, error } = await supabase
    .from('blogs')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    category: data.category,
    author: data.author,
    publishedAt: data.published_at,
    readTime: data.read_time,
    excerpt: data.excerpt,
    content: data.content,
    imageUrl: data.image_url,
    tags: data.tags ?? [],
    isPublished: data.is_published
  };
}

export async function deleteBlog(id: string): Promise<void> {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// TESTIMONIALS
export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((testimonial) => ({
    id: testimonial.id,
    customerName: testimonial.customer_name,
    location: testimonial.location,
    systemSizeKw: Number(testimonial.system_size_kw),
    rating: Number(testimonial.rating),
    comment: testimonial.comment,
    photoUrl: testimonial.photo_url,
    savedPerYear: String(testimonial.saved_per_year)
  }));
}

export async function createTestimonial(t: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  const id = `t-${Date.now()}`;

  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      id,
      customer_name: t.customerName,
      location: t.location,
      system_size_kw: t.systemSizeKw,
      rating: t.rating,
      comment: t.comment,
      photo_url: t.photoUrl,
      saved_per_year: t.savedPerYear
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    customerName: data.customer_name,
    location: data.location,
    systemSizeKw: Number(data.system_size_kw),
    rating: Number(data.rating),
    comment: data.comment,
    photoUrl: data.photo_url,
    savedPerYear: String(data.saved_per_year)
  };
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
  const payload: Record<string, unknown> = {};

  if (updates.customerName !== undefined) payload.customer_name = updates.customerName;
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.systemSizeKw !== undefined) payload.system_size_kw = updates.systemSizeKw;
  if (updates.rating !== undefined) payload.rating = updates.rating;
  if (updates.comment !== undefined) payload.comment = updates.comment;
  if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl;
  if (updates.savedPerYear !== undefined) payload.saved_per_year = updates.savedPerYear;

  const { data, error } = await supabase
    .from('testimonials')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    customerName: data.customer_name,
    location: data.location,
    systemSizeKw: Number(data.system_size_kw),
    rating: Number(data.rating),
    comment: data.comment,
    photoUrl: data.photo_url,
    savedPerYear: String(data.saved_per_year)
  };
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// FAQS
export async function fetchFaqs(): Promise<FAQItem[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((faq) => ({
    id: faq.id,
    category: faq.category,
    question: faq.question,
    answer: faq.answer
  }));
}

export async function createFaq(faq: Omit<FAQItem, 'id'>): Promise<FAQItem> {
  const id = `faq-${Date.now()}`;

  const { data, error } = await supabase
    .from('faqs')
    .insert({
      id,
      category: faq.category,
      question: faq.question,
      answer: faq.answer
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    category: data.category,
    question: data.question,
    answer: data.answer
  };
}

export async function updateFaq(id: string, updates: Partial<FAQItem>): Promise<FAQItem> {
  const payload: Record<string, unknown> = {};

  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.question !== undefined) payload.question = updates.question;
  if (updates.answer !== undefined) payload.answer = updates.answer;

  const { data, error } = await supabase
    .from('faqs')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    category: data.category,
    question: data.question,
    answer: data.answer
  };
}

export async function deleteFaq(id: string): Promise<void> {
  const { error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// GALLERY
export async function fetchGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    type: item.type,
    mediaUrl: item.media_url,
    caption: item.caption
  }));
}

export async function createGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
  const id = `gal-${Date.now()}`;

  const { data, error } = await supabase
    .from('gallery')
    .insert({
      id,
      title: item.title,
      category: item.category,
      type: item.type,
      media_url: item.mediaUrl,
      caption: item.caption
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    category: data.category,
    type: data.type,
    mediaUrl: data.media_url,
    caption: data.caption
  };
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
  const payload: Record<string, unknown> = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.mediaUrl !== undefined) payload.media_url = updates.mediaUrl;
  if (updates.caption !== undefined) payload.caption = updates.caption;

  const { data, error } = await supabase
    .from('gallery')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    category: data.category,
    type: data.type,
    mediaUrl: data.media_url,
    caption: data.caption
  };
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id);

  if (error) throw error;
}


async function dispatchEmail(
  formType: "Lead" | "Quote" | "JobApplication",
  recordId: string
): Promise<void> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formType, recordId }),
    });

    if (!response.ok) {
      console.error("Email dispatch request failed:", response.status);
    }
  } catch (error) {
    console.error("Email dispatch could not be reached:", error);
  }
}

// LEADS
export async function submitLead(data: any): Promise<{ message: string; lead: Lead }> {
  const id = `lead-${Date.now()}`;

  const leadData = {
    id,
    full_name: data.fullName || data.name || 'Valued Customer',
    phone: data.phone || '',
    email: data.email || '',
    city: data.city || 'Guntur',
    state: data.state || 'Andhra Pradesh',
    solar_for: data.solarFor || 'Home',
    monthly_bill: String(data.monthlyBill || '0'),
    roof_type: data.roofType || 'RCC Flat Roof',
    connection_type: data.connectionType || null,
    finance_interest: data.financeInterest || 'No',
    status: 'New' as const,
    notes: data.notes || ''
  };

  const { error } = await supabase
    .from('leads')
    .insert(leadData);

  if (error) throw error;

  const now = new Date().toISOString();

  const lead: Lead = {
    id: leadData.id,
    fullName: leadData.full_name,
    phone: leadData.phone,
    email: leadData.email,
    city: leadData.city,
    state: leadData.state,
    solarFor: leadData.solar_for,
    monthlyBill: leadData.monthly_bill,
    roofType: leadData.roof_type,
    connectionType: leadData.connection_type ?? undefined,
    financeInterest: leadData.finance_interest,
    status: leadData.status,
    notes: leadData.notes,
    createdAt: now,
    updatedAt: now
  };

  await dispatchEmail('Lead', leadData.id);
  return { message: 'Lead submitted successfully', lead };
}

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((lead) => ({
    id: lead.id,
    fullName: lead.full_name,
    phone: lead.phone,
    email: lead.email,
    city: lead.city,
    state: lead.state,
    solarFor: lead.solar_for,
    monthlyBill: lead.monthly_bill,
    roofType: lead.roof_type,
    connectionType: lead.connection_type,
    financeInterest: lead.finance_interest,
    status: lead.status,
    assignedTo: lead.assigned_to ?? undefined,
    notes: lead.notes,
    createdAt: lead.created_at,
    updatedAt: lead.updated_at
  }));
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  const payload: Record<string, unknown> = {};

  if (updates.fullName !== undefined) payload.full_name = updates.fullName;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.city !== undefined) payload.city = updates.city;
  if (updates.state !== undefined) payload.state = updates.state;
  if (updates.solarFor !== undefined) payload.solar_for = updates.solarFor;
  if (updates.monthlyBill !== undefined) payload.monthly_bill = updates.monthlyBill;
  if (updates.roofType !== undefined) payload.roof_type = updates.roofType;
  if (updates.connectionType !== undefined) payload.connection_type = updates.connectionType;
  if (updates.financeInterest !== undefined) payload.finance_interest = updates.financeInterest;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    fullName: data.full_name,
    phone: data.phone,
    email: data.email,
    city: data.city,
    state: data.state,
    solarFor: data.solar_for,
    monthlyBill: data.monthly_bill,
    roofType: data.roof_type,
    connectionType: data.connection_type,
    financeInterest: data.finance_interest,
    status: data.status,
    assignedTo: data.assigned_to ?? undefined,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// QUOTES
export async function submitQuote(data: any): Promise<{ message: string; quote: QuoteRequest }> {
  const id = `quote-${Date.now()}`;

  const payload = {
    id,
    name: data.name || 'Valued Customer',
    phone: data.phone || '',
    email: data.email || '',
    city: data.city || 'Guntur',
    state: data.state || 'Andhra Pradesh',
    property_type: data.propertyType || 'Residential',
    monthly_bill: Number(data.monthlyBill || data.averageMonthlyBill) || 0,
    roof_type: data.roofType || 'RCC Flat Roof',
    proposed_kw: Number(data.proposedKw || data.recommendedKw) || 3,
    estimated_cost: Number(data.estimatedCost || data.estimatedCostMin) || 120000,
    estimated_subsidy: Number(data.estimatedSubsidy) || 78000,
    net_cost: Number(data.netCost) || 42000,
    status: 'Pending',
    message: data.message || ''
  };

  const { error } = await supabase
    .from('quotes')
    .insert(payload);

  if (error) throw error;

  const quote: QuoteRequest = {
    id,
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    city: payload.city,
    state: payload.state,
    propertyType: payload.property_type,
    monthlyBill: payload.monthly_bill,
    roofType: payload.roof_type,
    proposedKw: payload.proposed_kw,
    estimatedCost: payload.estimated_cost,
    estimatedSubsidy: payload.estimated_subsidy,
    netCost: payload.net_cost,
    status: payload.status,
    message: payload.message,
    createdAt: new Date().toISOString()
  };

  await dispatchEmail('Quote', id);

  return { message: 'Quote submitted successfully', quote };
}

export async function fetchQuotes(): Promise<QuoteRequest[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((quote) => ({
    id: quote.id,
    name: quote.name,
    phone: quote.phone,
    email: quote.email,
    state: quote.state,
    city: quote.city,
    propertyType: quote.property_type,
    monthlyBill: Number(quote.monthly_bill),
    roofType: quote.roof_type,
    proposedKw: Number(quote.proposed_kw),
    estimatedCost: Number(quote.estimated_cost),
    estimatedSubsidy: Number(quote.estimated_subsidy),
    netCost: Number(quote.net_cost),
    status: quote.status,
    message: quote.message,
    createdAt: quote.created_at
  }));
}

export async function updateQuoteStatus(id: string, status: QuoteRequest['status']): Promise<QuoteRequest> {
  const { data, error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    email: data.email,
    state: data.state,
    city: data.city,
    propertyType: data.property_type,
    monthlyBill: Number(data.monthly_bill),
    roofType: data.roof_type,
    proposedKw: Number(data.proposed_kw),
    estimatedCost: Number(data.estimated_cost),
    estimatedSubsidy: Number(data.estimated_subsidy),
    netCost: Number(data.net_cost),
    status: data.status,
    message: data.message,
    createdAt: data.created_at
  };
}

export async function deleteQuoteRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// JOBS
export async function fetchJobs(): Promise<JobOpening[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    type: job.type,
    exp: job.exp,
    desc: job.description,
    department: job.department,
    isActive: job.is_active,
    postedDate: job.posted_date
  }));
}

export async function createJob(job: Omit<JobOpening, 'id'>): Promise<JobOpening> {
  const id = `job-${Date.now()}`;

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      id,
      title: job.title,
      location: job.location,
      type: job.type,
      exp: job.exp,
      description: job.desc,
      department: job.department,
      is_active: job.isActive,
      posted_date: job.postedDate
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    location: data.location,
    type: data.type,
    exp: data.exp,
    desc: data.description,
    department: data.department,
    isActive: data.is_active,
    postedDate: data.posted_date
  };
}

export async function updateJob(id: string, updates: Partial<JobOpening>): Promise<JobOpening> {
  const payload: Record<string, unknown> = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.exp !== undefined) payload.exp = updates.exp;
  if (updates.desc !== undefined) payload.description = updates.desc;
  if (updates.department !== undefined) payload.department = updates.department;
  if (updates.isActive !== undefined) payload.is_active = updates.isActive;
  if (updates.postedDate !== undefined) payload.posted_date = updates.postedDate;

  const { data, error } = await supabase
    .from('jobs')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    location: data.location,
    type: data.type,
    exp: data.exp,
    desc: data.description,
    department: data.department,
    isActive: data.is_active,
    postedDate: data.posted_date
  };
}

export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// JOB APPLICATIONS
export async function fetchJobApplications(): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((application) => ({
    id: application.id,
    jobId: application.job_id ?? undefined,
    name: application.name,
    phone: application.phone,
    email: application.email,
    role: application.role,
    experience: application.experience,
    message: application.message,
    status: application.status,
    createdAt: application.created_at
  }));
}

export async function submitJobApplication(data: Omit<JobApplication, 'id' | 'createdAt' | 'status'>): Promise<{ message: string; application: JobApplication }> {
  const id = `app-${Date.now()}`;

  const { data: applicationData, error } = await supabase
    .from('job_applications')
    .insert({
      id,
      job_id: data.jobId ?? null,
      name: data.name,
      phone: data.phone,
      email: data.email,
      role: data.role,
      experience: data.experience,
      message: data.message,
      status: 'New'
    })
    .select('*')
    .single();

  if (error) throw error;

  const application: JobApplication = {
    id: applicationData.id,
    jobId: applicationData.job_id ?? undefined,
    name: applicationData.name,
    phone: applicationData.phone,
    email: applicationData.email,
    role: applicationData.role,
    experience: applicationData.experience,
    message: applicationData.message,
    status: applicationData.status,
    createdAt: applicationData.created_at
  };

  await dispatchEmail('JobApplication', applicationData.id);
  return { message: 'Application submitted successfully', application };
}

export async function updateJobApplicationStatus(id: string, status: JobApplication['status']): Promise<JobApplication> {
  const { data, error } = await supabase
    .from('job_applications')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    jobId: data.job_id ?? undefined,
    name: data.name,
    phone: data.phone,
    email: data.email,
    role: data.role,
    experience: data.experience,
    message: data.message,
    status: data.status,
    createdAt: data.created_at
  };
}

export async function deleteJobApplication(id: string): Promise<void> {
  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// HERO SLIDES
export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((slide) => ({
    id: slide.id,
    badge: slide.badge ?? undefined,
    title: slide.title,
    subtitle: slide.subtitle,
    mediaType: slide.media_type,
    mediaUrl: slide.media_url,
    ctaPrimaryText: slide.cta_primary_text ?? undefined,
    ctaPrimaryAction: slide.cta_primary_action ?? undefined,
    ctaSecondaryText: slide.cta_secondary_text ?? undefined,
    ctaSecondaryAction: slide.cta_secondary_action ?? undefined,
    order: slide.display_order
  }));
}

export async function createHeroSlide(data: Omit<HeroSlide, 'id'>): Promise<HeroSlide> {
  const id = `slide-${Date.now()}`;

  const { data: slide, error } = await supabase
    .from('hero_slides')
    .insert({
      id,
      badge: data.badge,
      title: data.title,
      subtitle: data.subtitle,
      media_type: data.mediaType,
      media_url: data.mediaUrl,
      cta_primary_text: data.ctaPrimaryText,
      cta_primary_action: data.ctaPrimaryAction,
      cta_secondary_text: data.ctaSecondaryText,
      cta_secondary_action: data.ctaSecondaryAction,
      display_order: data.order
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: slide.id,
    badge: slide.badge,
    title: slide.title,
    subtitle: slide.subtitle,
    mediaType: slide.media_type,
    mediaUrl: slide.media_url,
    ctaPrimaryText: slide.cta_primary_text,
    ctaPrimaryAction: slide.cta_primary_action,
    ctaSecondaryText: slide.cta_secondary_text,
    ctaSecondaryAction: slide.cta_secondary_action,
    order: slide.display_order
  };
}

export async function updateHeroSlide(id: string, updates: Partial<HeroSlide>): Promise<HeroSlide> {
  const payload: Record<string, unknown> = {};

  if (updates.badge !== undefined) payload.badge = updates.badge;
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
  if (updates.mediaType !== undefined) payload.media_type = updates.mediaType;
  if (updates.mediaUrl !== undefined) payload.media_url = updates.mediaUrl;
  if (updates.ctaPrimaryText !== undefined) payload.cta_primary_text = updates.ctaPrimaryText;
  if (updates.ctaPrimaryAction !== undefined) payload.cta_primary_action = updates.ctaPrimaryAction;
  if (updates.ctaSecondaryText !== undefined) payload.cta_secondary_text = updates.ctaSecondaryText;
  if (updates.ctaSecondaryAction !== undefined) payload.cta_secondary_action = updates.ctaSecondaryAction;
  if (updates.order !== undefined) payload.display_order = updates.order;

  const { data: slide, error } = await supabase
    .from('hero_slides')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: slide.id,
    badge: slide.badge,
    title: slide.title,
    subtitle: slide.subtitle,
    mediaType: slide.media_type,
    mediaUrl: slide.media_url,
    ctaPrimaryText: slide.cta_primary_text,
    ctaPrimaryAction: slide.cta_primary_action,
    ctaSecondaryText: slide.cta_secondary_text,
    ctaSecondaryAction: slide.cta_secondary_action,
    order: slide.display_order
  };
}

export async function deleteHeroSlide(id: string): Promise<{ message: string }> {
  const { error } = await supabase
    .from('hero_slides')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return { message: 'Hero slide deleted successfully' };
}

async function callAdminUsers(payload: Record<string, unknown>): Promise<any> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!sessionData.session?.access_token) {
    throw new Error('You must be signed in to manage staff users.');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session.access_token}`
      },
      body: JSON.stringify(payload)
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Staff user operation failed.');
  }

  return result;
}

export async function createStaffUser(data: {
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Sales' | 'Technician';
  phone?: string;
  password: string;
}): Promise<User> {
  const result = await callAdminUsers({
    action: 'create',
    ...data
  });

  return {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    role: result.user.role as User['role'],
    phone: result.user.phone ?? undefined,
    createdAt: result.user.created_at
  };
}

export async function updateStaffUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: 'Admin' | 'Manager' | 'Sales' | 'Technician';
    phone?: string;
    password?: string;
  }
): Promise<User> {
  const result = await callAdminUsers({
    action: 'update',
    id,
    ...data
  });

  return {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    role: result.user.role as User['role'],
    phone: result.user.phone ?? undefined,
    createdAt: result.user.created_at
  };
}

export async function deleteStaffUser(id: string): Promise<{ success: boolean; message: string }> {
  return callAdminUsers({
    action: 'delete',
    id
  });
}

// AUDIT / ANALYTICS
export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((log) => ({
    id: log.id,
    timestamp: log.timestamp,
    userEmail: log.user_email,
    action: log.action,
    details: log.details ?? {}
  }));
}

export async function logVisitor(pathName?: string): Promise<void> {
  try {
    await supabase.from('visitor_logs').insert({
      path: pathName || window.location.pathname,
      referrer: document.referrer || 'Direct',
      user_agent: navigator.userAgent
    });
  } catch {
    // Ignore logging errors
  }
}

export async function fetchVisitorLogs(): Promise<VisitorLog[]> {
  const { data, error } = await supabase
    .from('visitor_logs')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((log) => ({
    id: log.id,
    ip: log.ip,
    path: log.path,
    referrer: log.referrer,
    userAgent: log.user_agent,
    deviceType: log.device_type,
    timestamp: log.timestamp
  }));
}

export async function fetchAnalyticsSummary(): Promise<any> {
  const [leadsResult, quotesResult, productsResult, projectsResult] = await Promise.all([
    supabase.from('leads').select('id, status, created_at'),
    supabase.from('quotes').select('id, status'),
    supabase.from('products').select('id'),
    supabase.from('projects').select('id')
  ]);

  if (leadsResult.error) throw leadsResult.error;
  if (quotesResult.error) throw quotesResult.error;
  if (productsResult.error) throw productsResult.error;
  if (projectsResult.error) throw projectsResult.error;

  const today = new Date().toISOString().slice(0, 10);
  const leads = leadsResult.data ?? [];
  const quotes = quotesResult.data ?? [];

  return {
    totalLeads: leads.length,
    totalQuotes: quotes.length,
    totalProducts: productsResult.data?.length ?? 0,
    totalProjects: projectsResult.data?.length ?? 0,
    newLeadsToday: leads.filter(
      (lead) => lead.status === 'New' && lead.created_at?.startsWith(today)
    ).length,
    pendingQuotes: quotes.filter((quote) => quote.status === 'Pending').length
  };
}

export async function fetchEmailNotifications(): Promise<EmailNotification[]> {
  const { data, error } = await supabase
    .from('email_notifications')
    .select('*')
    .order('sent_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((notification) => ({
    id: notification.id,
    to: notification.to_email,
    subject: notification.subject,
    formType: notification.form_type,
    customerName: notification.customer_name,
    customerEmail: notification.customer_email,
    customerPhone: notification.customer_phone,
    details: notification.details ?? {},
    sentAt: notification.sent_at,
    status: notification.status,
    deliveryMethod: notification.delivery_method,
    errorMessage: notification.error_message
  }));
}

export async function changeUserPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const { data: authData, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!authData.user?.email) {
    throw new Error('You must be signed in to change your password.');
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: authData.user.email,
    password: currentPassword
  });

  if (verifyError) {
    throw new Error('Current password is incorrect.');
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;

  return {
    success: true,
    message: 'Password updated successfully'
  };
}

export async function updateUserProfile(updates: { name?: string; email?: string; phone?: string }): Promise<{ success: boolean; user: User; message: string }> {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!authData.user) throw new Error('You must be signed in to update your profile.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      name: updates.name,
      email: updates.email,
      phone: updates.phone
    })
    .eq('id', authData.user.id)
    .select('id, name, email, role, phone, created_at')
    .single();

  if (profileError) throw profileError;

  if (updates.email && updates.email !== authData.user.email) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: updates.email
    });
    if (emailError) throw emailError;
  }

  const user: User = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role as User['role'],
    phone: profile.phone ?? undefined,
    createdAt: profile.created_at
  };

  return {
    success: true,
    user,
    message: 'Profile updated successfully'
  };
}

// Media Upload & Storage APIs
export async function uploadMediaFile(file: File): Promise<{ success: boolean; url: string; fileName: string; size: number; mediaType: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const fileName = `${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from('media')
    .upload(fileName, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  return {
    success: true,
    url: data.publicUrl,
    fileName,
    size: file.size,
    mediaType: file.type.startsWith('video/')
      ? 'video'
      : file.type.includes('pdf')
        ? 'document'
        : 'image'
  };
}

export async function fetchMediaList(): Promise<Array<{ name: string; url: string; size: number; type: string; createdAt: string }>> {
  const { data, error } = await supabase.storage
    .from('media')
    .list('', {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) throw error;

  return (data ?? [])
    .filter((file) => file.name)
    .map((file) => {
      const { data: publicUrl } = supabase.storage
        .from('media')
        .getPublicUrl(file.name);

      return {
        name: file.name,
        url: publicUrl.publicUrl,
        size: file.metadata?.size ?? 0,
        type: file.metadata?.mimetype ?? 'application/octet-stream',
        createdAt: file.created_at ?? new Date().toISOString()
      };
    });
}

export async function deleteMediaFile(filename: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase.storage
    .from('media')
    .remove([filename]);

  if (error) throw error;

  return {
    success: true,
    message: 'File deleted successfully'
  };
}
