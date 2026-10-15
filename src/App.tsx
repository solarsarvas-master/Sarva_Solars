import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { QuoteModal } from './components/QuoteModal';
import { HomePage } from './pages/HomePage';
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const SubsidyPage = lazy(() => import('./pages/SubsidyPage').then(m => ({ default: m.SubsidyPage })));
const CalculatorsPage = lazy(() => import('./pages/CalculatorsPage').then(m => ({ default: m.CalculatorsPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogArticlePage = lazy(() => import('./pages/BlogArticlePage').then(m => ({ default: m.BlogArticlePage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const CareersPage = lazy(() => import('./pages/CareersPage').then(m => ({ default: m.CareersPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })));

import {
  AppSettings,
  ServiceItem,
  Project,
  Product,
  BlogArticle,
  SubsidyDetail,
  FAQItem,
  Testimonial,
  GalleryItem,
  User,
  HeroSlide
} from './types';

import {
  fetchSettings,
  fetchServices,
  fetchProjects,
  fetchProducts,
  fetchBlogs,
  fetchSubsidies,
  fetchFaqs,
  fetchTestimonials,
  fetchGallery,
  fetchCurrentUser,
  fetchHeroSlides,
  logVisitor
} from './services/api';
import { signOut } from './services/supabaseAuth';

const defaultFallbackSettings: AppSettings = {
  companyName: 'Sarva Solar',
  tagline: 'Empowering Homes & Businesses with Clean Solar Energy',
  phone1: '+91 8985430100',
  phone2: '+91 9160513161',
  email: 'solarsarva@gmail.com',
  address: "SARVA GROUP of Company's, Brodipet 5/15 Guntur Andhra Pradesh pincode:-522002, India",
  whatsappNumber: '918985430100',
  workingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
  announcementBarText: '⚡ Govt Subsidy under PM Surya Ghar Scheme up to ₹78,000 available! Book your free site survey today.',
  showAnnouncementBar: true,
  metaTitle: 'Sarva Solar - Leading Solar Energy EPC Solutions in AP, Telangana & WB',
  metaDescription: 'Sarva Solar provides premium residential, commercial & industrial solar rooftop solutions with government subsidy assistance and zero EMI options.',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3829.418294719208!2d80.4328!3d16.3067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4a755d55555555%3A0x1111111111111111!2sGuntur%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin'
};

export function App() {
  const [currentView, setCurrentView] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path.startsWith('/admin/')) return 'admin';
    if (/^\/blog\/[^/]+\/?$/.test(path)) return 'blog-article';
    if (path === '/blog' || path === '/blog/') return 'blog';
    return 'home';
  });
  const [currentBlogSlug, setCurrentBlogSlug] = useState<string>(() =>
    window.location.pathname.startsWith('/blog/')
      ? window.location.pathname.slice('/blog/'.length).split('/')[0]
      : ''
  );
  const [blogsLoaded, setBlogsLoaded] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);

  // Loaded API Data
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [subsidies, setSubsidies] = useState<SubsidyDetail[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Strict Light Mode Only enforcement
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  // Keep public-page SEO metadata synchronized with CMS settings and the current URL.
  useEffect(() => {
    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement('meta');
        const [key, expectedValue] = selector.match(/\[(name|property)="([^"]+)"\]/)?.slice(1) ?? [];
        if (key && expectedValue) element.setAttribute(key, expectedValue);
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // Admin pages should not declare themselves as public canonical pages.
    if (currentView === 'admin') {
      document.querySelector('link[rel="canonical"]')?.remove();
      return;
    }

    const path = window.location.pathname;
    const canonicalUrl = `https://sarvasolar.in${path === '/' ? '/' : path.replace(/\/$/, '')}`;

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);

    // Blog article pages manage their own title, description and social metadata.
    if (currentView === 'blog-article') return;

    const title = settings?.metaTitle?.trim()
      || 'Sarva Solar | Rooftop Solar Solutions in Andhra Pradesh & Telangana';
    const description = settings?.metaDescription?.trim()
      || 'Explore rooftop solar solutions for homes and businesses with Sarva Solar.';

    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
  }, [currentView, currentBlogSlug, settings]);

  // Track customer site visits whenever the viewed page changes
  useEffect(() => {
    logVisitor(currentView);
  }, [currentView]);

  // Function to load/refresh all site data
  const loadAll = async () => {
    try {
      const [set, serv, proj, prod, b, sub, f, t, g, usr, hs] = await Promise.all([
        fetchSettings().catch((error) => { console.error('[Supabase Settings]', error); return null; }),
        fetchServices().catch(() => []),
        fetchProjects().catch(() => []),
        fetchProducts().catch(() => []),
        fetchBlogs().catch(() => []),
        fetchSubsidies().catch(() => []),
        fetchFaqs().catch(() => []),
        fetchTestimonials().catch(() => []),
        fetchGallery().catch(() => []),
        fetchCurrentUser().catch(() => null),
        fetchHeroSlides().catch((error) => { console.error('[Supabase Hero Slides]', error); return []; })
      ]);
      setSettings(set || defaultFallbackSettings);
      if (serv) setServices(serv);
      if (proj) setProjects(proj);
      if (prod) setProducts(prod);
      if (b) setBlogs(b);
      setBlogsLoaded(true);
      if (sub) setSubsidies(sub);
      if (f) setFaqs(f);
      if (t) setTestimonials(t);
      if (g) setGallery(g);
      if (hs) setHeroSlides(hs);
      if (usr) setCurrentUser(usr);
    } catch (err) {
      console.warn('Error fetching site data:', err);
      setSettings(defaultFallbackSettings);
    }
  };

  // Load All Site Data on mount, route changes, window focus, custom update events, & periodic background poll
  useEffect(() => {
    loadAll();

    const handleUpdate = () => {
      loadAll();
    };

    // 1. Same-window custom event listener
    window.addEventListener('sarva_data_updated', handleUpdate);

    // 2. Cross-tab storage listener (wakes other tabs on same origin when localStorage changes)
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'sarva_last_data_update' || e.key.startsWith('sarva_solar_')) {
        handleUpdate();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Tab focus listener (refreshes data when returning to tab)
    window.addEventListener('focus', handleUpdate);

    // 4. Cross-tab Broadcast Channel listener
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('sarva_data_channel');
        bc.onmessage = () => {
          handleUpdate();
        };
      } catch (e) {
        // BroadcastChannel optional fallback
      }
    }

    // 5. Poll every 60 seconds only while the tab is visible.
    // Event listeners handle faster same-origin updates.
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadAll();
      }
    }, 60000);

    return () => {
      window.removeEventListener('sarva_data_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleUpdate);
      if (bc) {
        try {
          bc.close();
        } catch (e) {}
      }
      clearInterval(pollInterval);
    };
  }, [currentView]);

  useEffect(() => {
    const handlePopState = async () => {
      const path = window.location.pathname;
      const isAdminPath =
        path === '/admin' || path.startsWith('/admin/');

      if (!isAdminPath && currentView === 'admin') {
        try {
          await signOut();
        } finally {
          setCurrentUser(null);
        }
      }

      if (isAdminPath) {
        setCurrentView('admin');
        setCurrentBlogSlug('');
        return;
      }

      const articleMatch = path.match(/^\/blog\/([^/]+)\/?$/);
      let slug = '';

      if (articleMatch) {
        try {
          slug = decodeURIComponent(articleMatch[1]);
        } catch {
          slug = articleMatch[1];
        }
      }

      setCurrentBlogSlug(slug);
      setCurrentView(
        articleMatch
          ? 'blog-article'
          : path === '/blog' || path === '/blog/'
            ? 'blog'
            : 'home'
      );
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  const handleNavigate = async (view: string) => {
    const nextPath = view === 'admin' ? '/admin' : view === 'blog' ? '/blog' : '/';

    if (currentView === 'admin' && view !== 'admin') {
      try {
        await signOut();
      } finally {
        setCurrentUser(null);
      }
    }

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    setCurrentView(view);
    setCurrentBlogSlug('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBlogArticle = (slug: string) => {
    const nextPath = `/blog/${encodeURIComponent(slug)}`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setCurrentBlogSlug(slug);
    setCurrentView('blog-article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 font-poppins">
          Loading Sarva Solar Cleantech Platform...
        </p>
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-sm font-semibold text-slate-600">Loading admin panel...</p></div>}>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-inter antialiased">
          <AdminPage
          user={currentUser}
          onLoginSuccess={(u) => setCurrentUser(u)}
          onLogout={async () => {
            try {
              await signOut();
            } finally {
              setCurrentUser(null);
            }
          }}
          />
        </div>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-inter antialiased">
      {/* Header */}
      <Header
        settings={settings}
        currentView={currentView}
        onNavigate={handleNavigate}
        user={currentUser}
        darkMode={false}
        onToggleDarkMode={() => {}}
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center" role="status">Loading page...</div>}>
        {currentView === 'home' && (
          <HomePage
            settings={settings}
            projects={projects}
            services={services}
            testimonials={testimonials}
            faqs={faqs}
            blogs={blogs.filter((blog) => blog.isPublished)}
            heroSlides={heroSlides}
            onNavigate={handleNavigate}
            onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            settings={settings}
            onNavigate={handleNavigate}
            onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          />
        )}

        {currentView === 'services' && (
          <ServicesPage
            services={services}
            onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          />
        )}

        {currentView === 'projects' && (
          <ProjectsPage
            projects={projects}
            onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          />
        )}

        {currentView === 'products' && (
          <ProductsPage
            products={products}
            onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          />
        )}

        {currentView === 'subsidy' && (
          <SubsidyPage
            subsidies={subsidies}
            onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          />
        )}

        {currentView === 'calculators' && <CalculatorsPage />}

        {currentView === 'blog-article' && (
          <BlogArticlePage
            blogs={blogs}
            slug={currentBlogSlug}
            blogsLoaded={blogsLoaded}
            onBackToBlog={() => { void handleNavigate('blog'); }}
            onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          />
        )}

        {currentView === 'blog' && (
          <BlogPage
            blogs={blogs.filter((blog) => blog.isPublished)}
            onOpenArticle={handleOpenBlogArticle}
            onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          />
        )}

        {currentView === 'gallery' && <GalleryPage gallery={gallery} />}

        {currentView === 'careers' && <CareersPage />}

        {currentView === 'contact' && <ContactPage settings={settings} />}
        </Suspense>
      </main>

      {/* Footer */}
      <Footer settings={settings} onNavigate={handleNavigate} onOpenQuoteModal={() => setIsQuoteModalOpen(true)} />

      {/* Live Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </div>
  );
}

export default App;
