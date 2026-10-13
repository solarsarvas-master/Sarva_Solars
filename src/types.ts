export type UserRole = 'Admin' | 'Manager' | 'Employee' | 'Sales' | 'Technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type LeadStatus = 'New' | 'Contacted' | 'Site Inspection' | 'Proposal Sent' | 'Closed Won' | 'Closed Lost';

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  state: string;
  city?: string;
  solarFor: 'Home' | 'Business' | 'Agriculture' | 'Industrial';
  monthlyBill: string;
  roofType?: string;
  connectionType?: 'On-Grid' | 'Off-Grid' | 'Hybrid';
  financeInterest: 'Yes' | 'No';
  status: LeadStatus;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  propertyType: 'Residential' | 'Commercial' | 'Industrial' | 'Agriculture';
  monthlyBill: number;
  roofType: string;
  proposedKw: number;
  estimatedCost: number;
  estimatedSubsidy: number;
  netCost: number;
  status: 'Pending' | 'Reviewed' | 'Quoted' | 'Archived';
  message?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Solar Panels' | 'Inverters' | 'Batteries' | 'Mounting Structures' | 'Accessories';
  brand: string;
  price: number;
  rating: number;
  specs: Record<string, string>;
  description: string;
  warranty: string;
  imageUrl: string;
  isFeatured: boolean;
  inventory: number;
}

export interface Project {
  id: string;
  title: string;
  category: 'Residential' | 'Commercial' | 'Industrial' | 'Agriculture';
  location: string;
  state: string;
  capacityKw: number;
  annualSavingsRs: number;
  completionDate: string;
  status: 'Completed' | 'Ongoing';
  images: string[];
  description: string;
  clientReview?: {
    author: string;
    comment: string;
    rating: number;
  };
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  tags: string[];
  isPublished: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  benefits: string[];
  imageUrl: string;
  faqs: { question: string; answer: string }[];
}

export interface SubsidyDetail {
  id: string;
  schemeName: string;
  capacityRange: string;
  centralSubsidyAmount: number;
  stateBonusAmount: number;
  eligibility: string[];
  documents: string[];
  processSteps: string[];
  updatedDate: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  location: string;
  systemSizeKw: number;
  rating: number;
  comment: string;
  photoUrl: string;
  savedPerYear: string;
}

export interface FAQItem {
  id: string;
  category: 'General' | 'Subsidy' | 'Billing' | 'Technical' | 'Installation';
  question: string;
  answer: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Residential' | 'Commercial' | 'Industrial' | 'Drone Views';
  type: 'image' | 'video';
  mediaUrl: string;
  caption: string;
}

export interface JobOpening {
  id: string;
  title: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  exp: string;
  desc: string;
  department?: string;
  isActive: boolean;
  postedDate?: string;
}

export interface JobApplication {
  id: string;
  jobId?: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  experience: string;
  message: string;
  status: 'New' | 'Shortlisted' | 'Interviewed' | 'Hired' | 'Rejected';
  createdAt: string;
}

export interface AppSettings {
  companyName: string;
  tagline: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  whatsappNumber: string;
  workingHours: string;
  announcementBarText: string;
  showAnnouncementBar: boolean;
  metaTitle: string;
  metaDescription: string;
  googleMapsEmbedUrl: string;
  installedCapacity?: string;
  customerRating?: string;
  panelWarranty?: string;
  governmentSubsidy?: string;
}

export interface HeroSlide {
  id: string;
  badge?: string;
  title: string;
  subtitle: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  ctaPrimaryText?: string;
  ctaPrimaryAction?: string;
  ctaSecondaryText?: string;
  ctaSecondaryAction?: string;
  order: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  details: string;
}

export interface VisitorLog {
  id: string;
  ip: string;
  path: string;
  referrer: string;
  userAgent: string;
  deviceType?: string;
  timestamp: string;
}


