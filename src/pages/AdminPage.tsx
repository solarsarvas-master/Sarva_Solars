import React, { useState, useEffect } from 'react';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import BlogRichTextEditor from '../components/admin/BlogRichTextEditor';
import BlogEditorPage from './BlogEditorPage';
import {
  User,
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
  AuditLog,
  VisitorLog,
  HeroSlide,
  UserRole
} from '../types';
import {
  loginUser,
  fetchLeads,
  updateLead,
  deleteLead,
  fetchQuotes,
  updateQuoteStatus,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  fetchServices,
  createService,
  updateService,
  deleteService,
  fetchSubsidies,
  createSubsidy,
  updateSubsidy,
  deleteSubsidy,
  fetchTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  fetchFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  fetchGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  fetchJobs,
  createJob,
  updateJob,
  deleteJob,
  fetchJobApplications,
  updateJobApplicationStatus,
  deleteJobApplication,
  fetchSettings,
  updateSettings,
  fetchAnalyticsSummary,
  fetchAuditLogs,
  fetchVisitorLogs,
  changeUserPassword,
  updateUserProfile,
  fetchUsers,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
  fetchHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  uploadMediaFile,
  fetchMediaList,
  deleteMediaFile,
  notifyDataUpdated
} from '../services/api';
import {
  ShieldCheck,
  Users,
  FileText,
  ShoppingBag,
  TrendingUp,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Download,
  CheckCircle2,
  AlertCircle,
  Search,
  Key,
  Database,
  Building2,
  Wrench,
  Award,
  MessageSquare,
  HelpCircle,
  Image as ImageIcon,
  Video as VideoIcon,
  Sliders,
  BookOpen,
  Briefcase,
  UserCheck,
  MapPin,
  Activity,
  Save,
  X,
  Eye,
  Upload,
  Copy,
  ExternalLink,
  Folder,
  Paperclip
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AdminPageProps {
  user: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ user, onLoginSuccess, onLogout }) => {
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Tab Navigation
  type TabType =
    | 'dashboard'
    | 'heroSlides'
    | 'settings'
    | 'services'
    | 'products'
    | 'projects'
    | 'blogs'
    | 'subsidies'
    | 'testimonials'
    | 'faqs'
    | 'gallery'
    | 'careers'
    | 'leads'
    | 'quotes'
    | 'visitorLogs'
    | 'staff'
    | 'audit'
    | 'media';

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Data States
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [editorPath, setEditorPath] = useState<string>(() => window.location.pathname);
  const [blogsLoaded, setBlogsLoaded] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [subsidies, setSubsidies] = useState<SubsidyDetail[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [careersSubTab, setCareersSubTab] = useState<'openings' | 'applications'>('openings');
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [settings, setSettingsState] = useState<AppSettings | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [mediaFiles, setMediaFiles] = useState<Array<{ name: string; url: string; size: number; type: string; createdAt: string }>>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Search & Filters
  const [leadSearch, setLeadSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [staffSearch, setStaffSearch] = useState('');
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'All' | 'image' | 'video' | 'document'>('All');

  // Active Modals / Editors
  const [editingItem, setEditingItem] = useState<{ type: TabType; data: any } | null>(null);
  const [isCreating, setIsCreating] = useState<TabType | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Staff Account Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'Admin' | 'Manager' | 'Sales' | 'Technician'>('Sales');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [savingStaff, setSavingStaff] = useState(false);

  // Credential Modal State
  const [showCredModal, setShowCredModal] = useState(false);
  const [credName, setCredName] = useState(user?.name || '');
  const [credEmail, setCredEmail] = useState(user?.email || '');
  const [credPhone, setCredPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credUpdating, setCredUpdating] = useState(false);

  // Delete Confirmation Modal State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const requestDeleteConfirm = (title: string, message: string, onConfirm: () => Promise<void>) => {
    if (!window.confirm(`CONFIRMATION REQUIRED:\n\n${title}\n${message}\n\nDo you want to proceed?`)) {
      return;
    }
    setDeleteConfirmTarget({
      title,
      message,
      onConfirm
    });
  };

  useEffect(() => {
    if (user) {
      setCredName(user.name);
      setCredEmail(user.email);
      setCredPhone(user.phone || '');
    }
  }, [user]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg(null), 3500);
  };

  const loadData = async () => {
    if (!user) return;
    try {
      const [l, q, prod, proj, b, svc, sub, test, faq, gal, j, apps, set, ana, vLogs, uList, hs, media] = await Promise.all([
        fetchLeads().catch(() => []),
        fetchQuotes().catch(() => []),
        fetchProducts().catch(() => []),
        fetchProjects().catch(() => []),
        fetchBlogs().catch(() => []),
        fetchServices().catch(() => []),
        fetchSubsidies().catch(() => []),
        fetchTestimonials().catch(() => []),
        fetchFaqs().catch(() => []),
        fetchGallery().catch(() => []),
        fetchJobs().catch(() => []),
        fetchJobApplications().catch(() => []),
        fetchSettings().catch(() => null),
        fetchAnalyticsSummary().catch(() => null),
        fetchVisitorLogs().catch(() => []),
        fetchUsers().catch(() => []),
        fetchHeroSlides().catch(() => []),
        fetchMediaList().catch(() => [])
      ]);
      setLeads(l);
      setQuotes(q);
      setProducts(prod);
      setProjects(proj);
      setBlogs(b);
      setBlogsLoaded(true);
      setServices(svc);
      setSubsidies(sub);
      setTestimonials(test);
      setFaqs(faq);
      setGallery(gal);
      setJobs(j);
      setJobApplications(apps);
      if (set) setSettingsState(set);
      if (ana) setAnalytics(ana);
      setVisitorLogs(vLogs);
      setStaffUsers(uList);
      setHeroSlides(hs);
      setMediaFiles(media);

      if (user.role === 'Admin') {
        const logs = await fetchAuditLogs().catch(() => []);
        setAuditLogs(logs);
      }
    } catch (err) {
      console.warn('Error loading admin portal data:', err);
    }
  };

  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffName('');
    setStaffEmail('');
    setStaffRole('Sales');
    setStaffPhone('');
    setStaffPassword('');
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (u: User) => {
    setEditingStaff(u);
    setStaffName(u.name);
    setStaffEmail(u.email);
    setStaffRole(
      u.role === 'Admin' || u.role === 'Manager' || u.role === 'Sales' || u.role === 'Technician'
        ? u.role
        : 'Sales'
    );
    setStaffPhone(u.phone || '');
    setStaffPassword('');
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }
    if (!editingStaff && !staffPassword) {
      showToast('Password is required for new staff accounts', 'error');
      return;
    }
    const confirmMsg = editingStaff
      ? `Are you sure you want to update the staff account for "${staffName}"?`
      : `Are you sure you want to create a new staff account for "${staffName}"?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }
    setSavingStaff(true);
    try {
      if (editingStaff) {
        await updateStaffUser(editingStaff.id, {
          name: staffName,
          email: staffEmail,
          role: staffRole,
          phone: staffPhone,
          password: staffPassword || undefined
        });
        showToast(`Staff account for ${staffName} updated successfully!`);
      } else {
        await createStaffUser({
          name: staffName,
          email: staffEmail,
          role: staffRole,
          phone: staffPhone,
          password: staffPassword
        });
        showToast(`Staff account for ${staffName} created successfully!`);
      }
      setShowStaffModal(false);
      const updatedList = await fetchUsers();
      setStaffUsers(updatedList);
    } catch (err: any) {
      showToast(err.message || 'Failed to save staff account', 'error');
    } finally {
      setSavingStaff(false);
    }
  };

  const handleDeleteStaff = (u: User) => {
    requestDeleteConfirm(
      'Delete Staff Account',
      `Are you sure you want to permanently remove staff account for "${u.name}" (${u.email})?`,
      async () => {
        await deleteStaffUser(u.id);
        showToast(`Staff account ${u.name} removed successfully!`);
        const updatedList = await fetchUsers();
        setStaffUsers(updatedList);
      }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    let successCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadMediaFile(file);
        if (res.success) {
          successCount++;
        }
      }
      showToast(`Successfully uploaded ${successCount} media asset${successCount > 1 ? 's' : ''}`);
      const list = await fetchMediaList().catch(() => []);
      setMediaFiles(list);
    } catch (err: any) {
      showToast(err.message || 'Failed to upload media', 'error');
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  const handleDeleteMedia = async (filename: string) => {
    requestDeleteConfirm(
      'Delete Media File',
      `Are you sure you want to delete "${filename}"? Any pages or components referencing this file URL will need to be updated.`,
      async () => {
        try {
          const res = await deleteMediaFile(filename);
          if (res.success) {
            showToast('Media file deleted successfully');
            const list = await fetchMediaList().catch(() => []);
            setMediaFiles(list);
          }
        } catch (err: any) {
          showToast(err.message || 'Failed to delete file', 'error');
        }
      }
    );
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Keep the dedicated editor synchronized with browser Back and Forward.
  useEffect(() => {
    const syncEditorPath = () => {
      const path = window.location.pathname;
      setEditorPath(path);

      if (path === '/admin') {
        setActiveTab('blogs');
      }
    };

    window.addEventListener('popstate', syncEditorPath);
    return () => window.removeEventListener('popstate', syncEditorPath);
  }, []);

  const openBlogEditor = (id?: string) => {
    setEditingItem(null);
    setIsCreating(null);

    const path = id
      ? `/admin/blog-editor/${encodeURIComponent(id)}`
      : '/admin/blog-editor/new';

    window.history.pushState({}, '', path);
    setEditorPath(path);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const returnToBlogList = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }

    setEditorPath('/admin');
    setActiveTab('blogs');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const saveBlogFromEditor: React.ComponentProps<typeof BlogEditorPage>['onSave'] =
    async (data) => {
      const { id, ...payload } = data;

      if (id) {
        const updated = await updateBlog(id, payload);
        setBlogs((current) =>
          current.map((blog) => blog.id === updated.id ? updated : blog)
        );
      } else {
        const created = await createBlog(payload);
        setBlogs((current) => [created, ...current]);
      }

      notifyDataUpdated();
      returnToBlogList();
    };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await loginUser(loginEmail, loginPassword);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password');
    } finally {
      setLoggingIn(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Contacted': return 'bg-amber-100 text-amber-700';
      case 'Site Inspection': return 'bg-purple-100 text-purple-700';
      case 'Proposal Sent': return 'bg-indigo-100 text-indigo-700';
      case 'Closed Won': return 'bg-emerald-100 text-emerald-700 font-extrabold';
      case 'Closed Lost': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Login Screen if unauthorized
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-poppins">
              Sarva Group Staff Portal
            </h2>
            <p className="text-xs text-slate-500">
              Complete Administration & Staff Control Panel
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Staff Email
              </label>
              <input
                type="email"
                required
                placeholder="sarvasolars@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-lg text-sm transition-transform active:scale-98"
            >
              {loggingIn ? 'Authenticating...' : 'Sign In to Portal'}
            </button>


          </form>
        </div>
      </div>
    );
  }

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.fullName.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.phone.includes(leadSearch) ||
      l.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.state.toLowerCase().includes(leadSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  const isBlogEditorRoute = editorPath.startsWith('/admin/blog-editor/');
  const editorSegment = isBlogEditorRoute
    ? editorPath.slice('/admin/blog-editor/'.length).split('/')[0]
    : '';
  const editorId = editorSegment && editorSegment !== 'new'
    ? decodeURIComponent(editorSegment)
    : null;
  const editorArticle = editorId
    ? blogs.find((blog) => blog.id === editorId) || null
    : null;

  if (isBlogEditorRoute) {
    if (editorId && !blogsLoaded) {
      return (
        <div className="min-h-screen flex items-center justify-center text-slate-600">
          Loading blog article...
        </div>
      );
    }

    if (editorId && !editorArticle) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
          <h2 className="text-xl font-bold text-slate-900">Blog article not found</h2>
          <p className="text-sm text-slate-600">
            This article could not be found in the loaded blog list.
          </p>
          <button
            type="button"
            onClick={returnToBlogList}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Return to blog list
          </button>
        </div>
      );
    }

    return (
      <BlogEditorPage
        key={editorArticle?.id || 'new-blog'}
        article={editorArticle}
        onCancel={returnToBlogList}
        onSave={saveBlogFromEditor}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {actionMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
            actionMsg.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-400'
              : 'bg-red-600 text-white border-red-400'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Top Welcome Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-poppins">
                {user.name}
              </h2>
              <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full">
                {user.role} Portal
              </span>
            </div>
            <p className="text-xs text-slate-500">
              SARVA GROUP Cleantech - Full Website Master Control Panel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCredModal(true)}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-2 px-3.5 rounded-xl border border-slate-200 transition-colors shadow-sm"
          >
            <Key className="w-4 h-4 text-amber-500" />
            <span>Change Admin Credentials</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-xs font-bold text-red-600 hover:bg-red-50 py-2 px-3.5 rounded-xl border border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Analytics
        </button>

        <button
          onClick={() => setActiveTab('heroSlides')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'heroSlides' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Hero Slides ({heroSlides.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          Site Settings
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'services' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          Services ({services.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'products' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'projects' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Projects ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('blogs')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'blogs' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Blogs ({blogs.length})
        </button>

        <button
          onClick={() => setActiveTab('subsidies')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'subsidies' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Subsidies ({subsidies.length})
        </button>

        <button
          onClick={() => setActiveTab('testimonials')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'testimonials' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Testimonials ({testimonials.length})
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'faqs' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          FAQs ({faqs.length})
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'gallery' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Gallery ({gallery.length})
        </button>

        <button
          onClick={() => setActiveTab('careers')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'careers' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Careers & HR ({jobs.length})
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'leads' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Leads ({leads.length})
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'quotes' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Quotes ({quotes.length})
        </button>

        <button
          onClick={() => setActiveTab('visitorLogs')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'visitorLogs' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Customer Visits ({visitorLogs.length})
        </button>

        

        <button
          onClick={() => setActiveTab('staff')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'staff' ? 'bg-indigo-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
          Staff Accounts ({staffUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'media' ? 'bg-emerald-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Folder className="w-3.5 h-3.5 text-emerald-500" />
          Media & Asset Library ({mediaFiles.length})
        </button>

        {user.role === 'Admin' && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Audit Logs
          </button>
        )}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && analytics && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Leads</span>
              <p className="text-3xl font-black text-blue-600 mt-1">{analytics.totalLeads}</p>
              <span className="text-[10px] text-emerald-500 font-bold">{analytics.newLeads} Pending New</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Conversion Rate</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">{analytics.conversionRate}</p>
              <span className="text-[10px] text-slate-500">{analytics.closedWon} Closed Projects</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">kW Installed</span>
              <p className="text-3xl font-black text-amber-500 mt-1">{analytics.totalKwInstalled} kWp</p>
              <span className="text-[10px] text-slate-500">Completed Projects</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Products</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{products.length}</p>
              <span className="text-[10px] text-slate-500">Catalog Inventory</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-poppins">
              Lead Pipeline Stage Breakdown
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'New', count: leads.filter((l) => l.status === 'New').length },
                    { name: 'Contacted', count: leads.filter((l) => l.status === 'Contacted').length },
                    { name: 'Site Inspection', count: leads.filter((l) => l.status === 'Site Inspection').length },
                    { name: 'Proposal Sent', count: leads.filter((l) => l.status === 'Proposal Sent').length },
                    { name: 'Closed Won', count: leads.filter((l) => l.status === 'Closed Won').length }
                  ]}
                >
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0B5ED7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SITE SETTINGS */}
      {activeTab === 'settings' && (
        <AdminSettingsTab
          settings={settings}
          setSettingsState={(nextSettings) => setSettingsState(nextSettings)}
          showToast={showToast}
        />
      )}

      {/* TAB 3: SERVICES */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins">
                Solar Installation Services ({services.length})
              </h3>
              <p className="text-xs text-slate-500">Edit titles, descriptions, benefits, and images pin to pin.</p>
            </div>
            <button
              onClick={() => setIsCreating('services')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => (
              <div key={svc.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 font-poppins">{svc.title}</h4>
                    <p className="text-xs text-amber-500 font-mono">/services/{svc.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem({ type: 'services', data: { ...svc } })}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user.role === 'Admin' && (
                      <button
                        onClick={() => {
                          requestDeleteConfirm(
                            'Delete Service',
                            `Are you sure you want to delete service "${svc.title}"?`,
                            async () => {
                              await deleteService(svc.id);
                              setServices(services.filter((s) => s.id !== svc.id));
                              showToast('Service deleted');
                            }
                          );
                        }}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{svc.shortDesc}</p>
                <div className="text-[11px] text-slate-500 font-mono">
                  Benefits: {svc.benefits?.slice(0, 3).join(', ')}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins">
                Solar Product Catalog ({products.length})
              </h3>
              <p className="text-xs text-slate-500">Manage solar panels, inverters, batteries, prices, and warranties.</p>
            </div>
            <button
              onClick={() => setIsCreating('products')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 relative shadow-sm">
                <div className="h-36 rounded-xl overflow-hidden bg-slate-100">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 font-poppins">{p.name}</h4>
                    <p className="text-xs text-slate-500">{p.brand} • {p.category}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingItem({ type: 'products', data: { ...p } })}
                      className="p-1 bg-slate-100 text-blue-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {user.role === 'Admin' && (
                      <button
                        onClick={() => {
                          requestDeleteConfirm(
                            'Delete Product',
                            `Are you sure you want to delete product "${p.name}"?`,
                            async () => {
                              await deleteProduct(p.id);
                              setProducts(products.filter((item) => item.id !== p.id));
                              showToast('Product deleted');
                            }
                          );
                        }}
                        className="p-1 bg-slate-100 text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-sm font-black font-mono text-blue-600">
                    ₹{p.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
                    {p.warranty} Warranty
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins">
                Projects Portfolio ({projects.length})
              </h3>
              <p className="text-xs text-slate-500">Edit completed installations, capacities, savings & client reviews.</p>
            </div>
            <button
              onClick={() => setIsCreating('projects')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 relative">
                <div className="h-40 rounded-xl overflow-hidden">
                  <img src={p.images[0] || 'https://images.unsplash.com/photo-1509391365360-2e959784a276'} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 font-poppins">{p.title}</h4>
                    <p className="text-xs text-slate-500">{p.location}, {p.state} • {p.category}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setEditingItem({ type: 'projects', data: { ...p } })}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded-lg text-xs"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user.role === 'Admin' && (
                      <button
                        onClick={() => {
                          requestDeleteConfirm(
                            'Delete Project',
                            `Are you sure you want to delete project "${p.title}"?`,
                            async () => {
                              await deleteProject(p.id);
                              setProjects(projects.filter((item) => item.id !== p.id));
                              showToast('Project deleted');
                            }
                          );
                        }}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-2.5 rounded-xl border border-slate-200">
                  <div>Capacity: <span className="font-bold text-amber-500">{p.capacityKw} kWp</span></div>
                  <div>Annual Savings: <span className="font-bold text-emerald-500">₹{p.annualSavingsRs.toLocaleString('en-IN')}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: BLOG ARTICLES */}
      {activeTab === 'blogs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins">
                Blog Articles & Knowledge Base ({blogs.length})
              </h3>
              <p className="text-xs text-slate-500">Edit titles, markdown content, tags, authors, and cover images.</p>
            </div>
            <button
              onClick={() => openBlogEditor()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Blog Article</span>
            </button>
          </div>

          <div className="space-y-4">
            {blogs.map((b) => (
              <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-4 items-center">
                  <img src={b.imageUrl} alt={b.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-500">{b.author} • {b.category} • {b.readTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openBlogEditor(b.id)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  {user.role === 'Admin' && (
                    <button
                      onClick={() => {
                        requestDeleteConfirm(
                          'Delete Blog Article',
                          `Are you sure you want to delete blog article "${b.title}"?`,
                          async () => {
                            await deleteBlog(b.id);
                            setBlogs(blogs.filter((item) => item.id !== b.id));
                            showToast('Blog article deleted');
                          }
                        );
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-xl text-xs font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SUBSIDIES */}
      {activeTab === 'subsidies' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins">
                PM Surya Ghar Subsidy Schemes ({subsidies.length})
              </h3>
              <p className="text-xs text-slate-500">Edit central/state subsidy amounts, capacity slabs, and document requirements.</p>
            </div>
            <button
              onClick={() => setIsCreating('subsidies')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subsidy Scheme</span>
            </button>
          </div>

          <div className="space-y-4">
            {subsidies.map((s) => (
              <div key={s.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 font-poppins">{s.schemeName}</h4>
                    <p className="text-slate-500 font-mono">Range: {s.capacityRange}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-mono font-bold text-sm bg-emerald-50 px-3 py-1 rounded-xl">
                      Central: ₹{s.centralSubsidyAmount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => setEditingItem({ type: 'subsidies', data: { ...s } })}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user.role === 'Admin' && (
                      <button
                        onClick={() => {
                          requestDeleteConfirm(
                            'Delete Subsidy Scheme',
                            `Are you sure you want to delete subsidy scheme "${s.schemeName}"?`,
                            async () => {
                              await deleteSubsidy(s.id);
                              setSubsidies(subsidies.filter((item) => item.id !== s.id));
                              showToast('Subsidy deleted');
                            }
                          );
                        }}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: TESTIMONIALS */}
      {activeTab === 'testimonials' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins">
                Customer Testimonials ({testimonials.length})
              </h3>
              <p className="text-xs text-slate-500">Edit verified customer reviews, system capacities, and photo URLs.</p>
            </div>
            <button
              onClick={() => setIsCreating('testimonials')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Testimonial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src={t.photoUrl} alt={t.customerName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{t.customerName}</h4>
                      <p className="text-xs text-slate-500">{t.location} • {t.systemSizeKw} kW System</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingItem({ type: 'testimonials', data: { ...t } })}
                      className="p-1 text-blue-600 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user.role === 'Admin' && (
                      <button
                        onClick={() => {
                          requestDeleteConfirm(
                            'Delete Testimonial',
                            `Are you sure you want to delete testimonial by "${t.customerName}"?`,
                            async () => {
                              await deleteTestimonial(t.id);
                              setTestimonials(testimonials.filter((item) => item.id !== t.id));
                              showToast('Testimonial deleted');
                            }
                          );
                        }}
                        className="p-1 text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">"{t.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: FAQS */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins">
                Frequently Asked Questions ({faqs.length})
              </h3>
              <p className="text-xs text-slate-500">Edit Q&A pairs across General, Subsidy, Billing, and Technical topics.</p>
            </div>
            <button
              onClick={() => setIsCreating('faqs')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {f.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{f.question}</h4>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingItem({ type: 'faqs', data: { ...f } })}
                      className="p-1 text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user.role === 'Admin' && (
                      <button
                        onClick={() => {
                          requestDeleteConfirm(
                            'Delete FAQ',
                            'Are you sure you want to delete this FAQ?',
                            async () => {
                              await deleteFaq(f.id);
                              setFaqs(faqs.filter((item) => item.id !== f.id));
                              showToast('FAQ deleted');
                            }
                          );
                        }}
                        className="p-1 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: HERO SLIDES */}
      {activeTab === 'heroSlides' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <span>Homepage Hero Slides ({heroSlides.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage background images, MP4/WebM videos, YouTube links, badges, titles, and call-to-action buttons for the homepage hero carousel.
              </p>
            </div>
            <button
              onClick={() => setIsCreating('heroSlides')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hero Slide</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heroSlides.map((slide, index) => {
              const videoInfo = slide.mediaType === 'video' ? (() => {
                if (!slide.mediaUrl) return { type: 'direct', embedUrl: '' };
                const ytMatch = slide.mediaUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                if (ytMatch && ytMatch[2] && ytMatch[2].length === 11) {
                  return { type: 'youtube', embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[2]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytMatch[2]}` };
                }
                const vimeoMatch = slide.mediaUrl.match(/(?:www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/);
                if (vimeoMatch && vimeoMatch[1]) {
                  return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&background=1` };
                }
                return { type: 'direct', embedUrl: slide.mediaUrl };
              })() : null;

              return (
                <div
                  key={slide.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Media Preview Box */}
                  <div className="relative h-44 bg-slate-950 overflow-hidden group">
                    {slide.mediaType === 'video' && videoInfo ? (
                      videoInfo.type === 'youtube' || videoInfo.type === 'vimeo' ? (
                        <iframe
                          src={videoInfo.embedUrl}
                          title={slide.title}
                          className="w-full h-full object-cover opacity-80 pointer-events-none scale-125"
                        />
                      ) : (
                        <video
                          src={slide.mediaUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover opacity-80"
                        />
                      )
                    ) : (
                      <img
                        src={slide.mediaUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover opacity-80"
                      />
                    )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                  {/* Badges on preview */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 font-extrabold text-[10px] border border-amber-500/30">
                      Order #{slide.order || index + 1}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] border border-slate-700 flex items-center gap-1">
                      {slide.mediaType === 'video' ? (
                        <>
                          <VideoIcon className="w-3 h-3 text-red-400" />
                          <span>Video</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3 text-emerald-400" />
                          <span>Image</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    {slide.badge && (
                      <span className="inline-block text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md">
                        {slide.badge}
                      </span>
                    )}
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                      {slide.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Buttons Info & Actions */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p>Primary CTA: <span className="font-bold text-slate-700">{slide.ctaPrimaryText || 'None'}</span></p>
                      <p>Secondary CTA: <span className="font-bold text-slate-700">{slide.ctaSecondaryText || 'None'}</span></p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingItem({ type: 'heroSlides', data: { ...slide } })}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit Slide"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {user.role === 'Admin' && (
                        <button
                          onClick={() => {
                            requestDeleteConfirm(
                              'Delete Hero Slide',
                              `Are you sure you want to delete slide "${slide.title}"?`,
                              async () => {
                                await deleteHeroSlide(slide.id);
                                setHeroSlides(heroSlides.filter((s) => s.id !== slide.id));
                                showToast('Hero slide deleted');
                              }
                            );
                          }}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* TAB 10: GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins">
                Media Gallery Showcase ({gallery.length})
              </h3>
              <p className="text-xs text-slate-500">Edit gallery photos, drone views, categories, and captions.</p>
            </div>
            <button
              onClick={() => setIsCreating('gallery')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Gallery Media</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((g) => (
              <div key={g.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="h-32 rounded-xl overflow-hidden bg-slate-200">
                  <img src={g.mediaUrl} alt={g.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{g.title}</h4>
                    <p className="text-[10px] text-slate-500">{g.category} • {g.type}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingItem({ type: 'gallery', data: { ...g } })}
                      className="p-1 text-blue-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {user.role === 'Admin' && (
                      <button
                        onClick={() => {
                          requestDeleteConfirm(
                            'Delete Gallery Media',
                            `Are you sure you want to delete gallery item "${g.title}"?`,
                            async () => {
                              await deleteGalleryItem(g.id);
                              setGallery(gallery.filter((item) => item.id !== g.id));
                              showToast('Gallery item deleted');
                            }
                          );
                        }}
                        className="p-1 text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 11: LEADS */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins">
                Customer Inquiries & Leads Management
              </h3>
              <p className="text-xs text-slate-500">Track and update pipeline status for every lead.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                const headers = [
                  'ID', 'Full Name', 'Email', 'Phone', 'State', 'City',
                  'Solar For', 'Monthly Bill', 'Roof Type', 'Connection Type',
                  'Finance Interest', 'Status', 'Assigned To', 'Notes',
                  'Created At', 'Updated At'
                ];

                const escapeCsv = (value: unknown) =>
                  `"${String(value ?? '').replace(/"/g, '""')}"`;

                const rows = leads.map((lead) => [
                  lead.id,
                  lead.fullName,
                  lead.email,
                  lead.phone,
                  lead.state,
                  lead.city,
                  lead.solarFor,
                  lead.monthlyBill,
                  lead.roofType,
                  lead.connectionType,
                  lead.financeInterest,
                  lead.status,
                  lead.assignedTo,
                  lead.notes,
                  lead.createdAt,
                  lead.updatedAt
                ]);

                const csv = [headers, ...rows]
                  .map((row) => row.map(escapeCsv).join(','))
                  .join('\\r\\n');

                const blob = new Blob([`\\uFEFF${csv}`], {
                  type: 'text/csv;charset=utf-8;'
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'sarva_solar_leads.csv';
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Export Leads CSV</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-3 rounded-2xl">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search leads by name, phone..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="w-full bg-white text-xs text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 pr-8"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              {['All', 'New', 'Contacted', 'Site Inspection', 'Proposal Sent', 'Closed Won'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    statusFilter === st ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Location & Bill</th>
                  <th className="p-3">Solar For</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {filteredLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="p-3 font-sans font-bold">
                      <p className="text-slate-900">{l.fullName}</p>
                      <p className="text-[11px] text-slate-500">{l.phone} | {l.email}</p>
                    </td>
                    <td className="p-3 font-sans">
                      <p>{l.state} ({l.city})</p>
                      <p className="text-[11px] text-emerald-600 font-bold">{l.monthlyBill}</p>
                    </td>
                    <td className="p-3 font-sans">{l.solarFor} ({l.connectionType || 'On-Grid'})</td>
                    <td className="p-3">
                      <select
                        value={l.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as any;
                          if (!window.confirm(`Are you sure you want to update lead status for "${l.fullName}" to "${newStatus}"?`)) {
                            return;
                          }
                          const updated = await updateLead(l.id, { status: newStatus });
                          setLeads(leads.map((item) => (item.id === l.id ? updated : item)));
                          showToast('Lead status updated');
                        }}
                        className={`px-2.5 py-1 rounded-full font-sans font-bold text-[11px] focus:outline-none ${getStatusBadge(l.status)}`}
                      >
                        <option>New</option>
                        <option>Contacted</option>
                        <option>Site Inspection</option>
                        <option>Proposal Sent</option>
                        <option>Closed Won</option>
                        <option>Closed Lost</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      {user.role !== 'Employee' && (
                        <button
                          onClick={() => {
                            requestDeleteConfirm(
                              'Delete Lead',
                              `Are you sure you want to delete lead for "${l.fullName}"?`,
                              async () => {
                                await deleteLead(l.id);
                                setLeads(leads.filter((item) => item.id !== l.id));
                                showToast('Lead deleted');
                              }
                            );
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 12: QUOTES */}
      {activeTab === 'quotes' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <h3 className="text-xl font-bold text-slate-900 font-poppins">
            Live Instant Quote Proposals ({quotes.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Proposed Size</th>
                  <th className="p-3">Est. Cost / Subsidy</th>
                  <th className="p-3">Net Out of Pocket</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {quotes.map((q) => (
                  <tr key={q.id}>
                    <td className="p-3 font-sans font-bold">
                      <p className="text-slate-900">{q.name}</p>
                      <p className="text-[11px] text-slate-500">{q.phone} | {q.city}, {q.state}</p>
                    </td>
                    <td className="p-3 font-sans font-extrabold text-blue-600">
                      {q.proposedKw} kWp System
                    </td>
                    <td className="p-3 font-sans">
                      <p>Gross: ₹{q.estimatedCost.toLocaleString('en-IN')}</p>
                      <p className="text-emerald-600 font-bold">Subsidy: -₹{q.estimatedSubsidy.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="p-3 font-bold text-slate-900 font-mono">
                      ₹{q.netCost.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <select
                        value={q.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as any;
                          if (!window.confirm(`Are you sure you want to update quote request status to "${newStatus}"?`)) {
                            return;
                          }
                          const updated = await updateQuoteStatus(q.id, newStatus);
                          setQuotes(quotes.map((item) => (item.id === q.id ? updated : item)));
                          showToast('Quote status updated');
                        }}
                        className="p-1 rounded bg-slate-100 font-sans font-bold text-xs"
                      >
                        <option>Pending</option>
                        <option>Reviewed</option>
                        <option>Quoted</option>
                        <option>Archived</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CAREERS & HR */}
      {activeTab === 'careers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-amber-500" />
                Careers & HR Recruitment Dashboard
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage job vacancies, specifications, and review applicant submissions in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setCareersSubTab('openings')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    careersSubTab === 'openings'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Job Openings ({jobs.length})
                </button>
                <button
                  onClick={() => setCareersSubTab('applications')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    careersSubTab === 'applications'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Applications ({jobApplications.length})
                </button>
              </div>

              {user.role !== 'Employee' && careersSubTab === 'openings' && (
                <button
                  onClick={() => setIsCreating('careers')}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  Post Job Opening
                </button>
              )}
            </div>
          </div>

          {/* SubTab 1: Job Openings */}
          {careersSubTab === 'openings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-extrabold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase">
                        {job.type}
                      </span>
                      <button
                        onClick={async () => {
                          const newActive = !job.isActive;
                          if (!window.confirm(`Are you sure you want to ${newActive ? 'activate' : 'deactivate'} job posting "${job.title}"?`)) {
                            return;
                          }
                          const updated = await updateJob(job.id, { isActive: newActive });
                          setJobs(jobs.map((j) => (j.id === job.id ? updated : j)));
                          showToast(`Job ${updated.isActive ? 'activated' : 'deactivated'}`);
                        }}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          job.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {job.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 font-poppins">{job.title}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    {job.department && (
                      <p className="text-xs font-semibold text-slate-400">Dept: {job.department}</p>
                    )}
                    <p className="text-xs text-slate-600 line-clamp-3">{job.desc}</p>
                    <p className="text-xs font-bold text-emerald-600">Req: {job.exp}</p>
                  </div>

                  {user.role !== 'Employee' && (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setEditingItem({ type: 'careers', data: job })}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      {user.role === 'Admin' && (
                        <button
                          onClick={() => {
                            requestDeleteConfirm(
                              'Delete Job Opening',
                              `Are you sure you want to delete job opening "${job.title}"?`,
                              async () => {
                                await deleteJob(job.id);
                                setJobs(jobs.filter((j) => j.id !== job.id));
                                showToast('Job opening deleted', 'error');
                              }
                            );
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs p-2 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SubTab 2: Received Applications */}
          {careersSubTab === 'applications' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
              <h4 className="text-lg font-bold text-slate-900 font-poppins">
                Received Job Applications ({jobApplications.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Applied Role</th>
                      <th className="p-3">Experience / Note</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Applied Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobApplications.map((app) => (
                      <tr key={app.id}>
                        <td className="p-3 font-bold text-slate-900">
                          {app.name}
                        </td>
                        <td className="p-3 text-slate-600">
                          <p>{app.phone}</p>
                          <p className="text-[11px] text-slate-400">{app.email}</p>
                        </td>
                        <td className="p-3 font-bold text-blue-600">
                          {app.role}
                        </td>
                        <td className="p-3 max-w-xs text-slate-600">
                          <p className="font-semibold text-emerald-600">{app.experience}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{app.message}</p>
                        </td>
                        <td className="p-3">
                          <select
                            value={app.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value as any;
                              if (!window.confirm(`Are you sure you want to update application status for "${app.name}" to "${newStatus}"?`)) {
                                return;
                              }
                              const updated = await updateJobApplicationStatus(app.id, newStatus);
                              setJobApplications(jobApplications.map((a) => (a.id === app.id ? updated : a)));
                              showToast(`Application status set to ${updated.status}`);
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 font-bold text-xs border border-slate-200"
                          >
                            <option>New</option>
                            <option>Shortlisted</option>
                            <option>Interviewed</option>
                            <option>Hired</option>
                            <option>Rejected</option>
                          </select>
                        </td>
                        <td className="p-3 text-slate-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              requestDeleteConfirm(
                                'Delete Application',
                                `Are you sure you want to delete job application from "${app.name}"?`,
                                async () => {
                                  await deleteJobApplication(app.id);
                                  setJobApplications(jobApplications.filter((a) => a.id !== app.id));
                                  showToast('Application removed', 'error');
                                }
                              );
                            }}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 13: AUDIT LOGS */}
      {activeTab === 'audit' && user.role === 'Admin' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
          <h3 className="text-xl font-bold text-slate-900 font-poppins">
            System Admin Audit Trail
          </h3>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between items-center font-mono">
                <div>
                  <span className="font-bold text-blue-600 mr-2">[{log.action}]</span>
                  <span className="text-slate-800">{log.details}</span>
                  <p className="text-[10px] text-slate-500 font-sans">By {log.userEmail}</p>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: VISITOR LOGS */}
      {activeTab === 'visitorLogs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-500" />
                Customer Site Visit Traffic Logs ({visitorLogs.length})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Real-time record of customer traffic visiting Sarva Group pages.
              </p>
            </div>
            <span className="bg-blue-100 text-blue-800 font-extrabold text-xs px-3.5 py-1.5 rounded-full">
              Live Visitor Tracker Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="p-3">Visited Path</th>
                  <th className="p-3">Device / Browser</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Referrer</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {visitorLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No visits recorded yet. Visits will automatically appear as customers browse the site.
                    </td>
                  </tr>
                ) : (
                  visitorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-sans font-bold text-blue-600">
                        {log.path}
                      </td>
                      <td className="p-3 font-sans text-slate-700">
                        <span className="font-semibold text-slate-900 mr-2">{log.deviceType}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-xs block">{log.userAgent}</span>
                      </td>
                      <td className="p-3 text-slate-600">{log.ip}</td>
                      <td className="p-3 font-sans text-slate-500">{log.referrer}</td>
                      <td className="p-3 text-right text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: STAFF ACCOUNTS */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-indigo-600" />
                Staff Accounts & Portal Access ({staffUsers.length})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage staff login details, create new team logins, update passwords, and manage portal access permissions.
              </p>
            </div>

            {user.role === 'Admin' && (
              <button
                onClick={handleOpenAddStaff}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Staff Account</span>
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, email, or role..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Showing {staffUsers.filter(u => 
                u.name.toLowerCase().includes(staffSearch.toLowerCase()) || 
                u.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
                u.role.toLowerCase().includes(staffSearch.toLowerCase())
              ).length} staff member(s)
            </p>
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="p-3">Staff Member</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Phone Number</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Created Date</th>
                  {user.role === 'Admin' && <th className="p-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffUsers.filter(u => 
                  u.name.toLowerCase().includes(staffSearch.toLowerCase()) || 
                  u.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
                  u.role.toLowerCase().includes(staffSearch.toLowerCase())
                ).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No staff accounts found matching your search.
                    </td>
                  </tr>
                ) : (
                  staffUsers
                    .filter(u => 
                      u.name.toLowerCase().includes(staffSearch.toLowerCase()) || 
                      u.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
                      u.role.toLowerCase().includes(staffSearch.toLowerCase())
                    )
                    .map((u) => {
                      const isSelf = user.id === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {u.name}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">
                                    Current Session
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono font-medium text-slate-700">
                            {u.email}
                          </td>
                          <td className="p-3 font-mono text-slate-600">
                            {u.phone || '—'}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                u.role === 'Admin'
                                  ? 'bg-amber-100 text-amber-800'
                                  : u.role === 'Manager'
                                  ? 'bg-blue-100 text-blue-800'
                                  : u.role === 'Sales'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 text-[11px] font-mono">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Initial'}
                          </td>
                          {user.role === 'Admin' && (
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditStaff(u)}
                                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Edit Staff Account"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(u)}
                                  disabled={isSelf}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isSelf
                                      ? 'text-slate-300 cursor-not-allowed'
                                      : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                  }`}
                                  title={isSelf ? 'Cannot delete your active account' : 'Delete Staff Account'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: MEDIA & ASSET LIBRARY MANAGER */}
      {activeTab === 'media' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins flex items-center gap-2">
                <Folder className="w-6 h-6 text-emerald-600" />
                Media & Asset Library ({mediaFiles.length})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload and manage high-resolution images, solar installation videos, product banners, and PDF brochures. Copy URLs directly to use in site content.
              </p>
            </div>

            <label className={`cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95 ${uploadingMedia ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <Upload className="w-4 h-4" />
              <span>{uploadingMedia ? 'Uploading Asset...' : 'Upload Media File'}</span>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploadingMedia}
              />
            </label>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 rounded-2xl p-6 text-center transition-all cursor-pointer relative group">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploadingMedia}
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Click or Drag & Drop files here to upload
              </p>
              <p className="text-xs text-slate-500">
                Supports JPG, PNG, WEBP, SVG, MP4, WEBM, PDF, DOCX (Max 15MB per file)
              </p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search files by name..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {(['All', 'image', 'video', 'document'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMediaTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    mediaTypeFilter === t
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t === 'All' ? 'All Files' : `${t}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaFiles
              .filter((f) => {
                const matchesSearch = f.name.toLowerCase().includes(mediaSearch.toLowerCase());
                const matchesType = mediaTypeFilter === 'All' || f.type === mediaTypeFilter;
                return matchesSearch && matchesType;
              })
              .length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 space-y-2">
                <Folder className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-medium">No media files found matching your filter.</p>
                <p className="text-xs">Upload images, videos, or PDFs above to build your media library.</p>
              </div>
            ) : (
              mediaFiles
                .filter((f) => {
                  const matchesSearch = f.name.toLowerCase().includes(mediaSearch.toLowerCase());
                  const matchesType = mediaTypeFilter === 'All' || f.type === mediaTypeFilter;
                  return matchesSearch && matchesType;
                })
                .map((f) => (
                  <div
                    key={f.name}
                    className="glass-card glass-card-hover rounded-2xl p-3 border border-slate-200 flex flex-col justify-between space-y-3 group"
                  >
                    {/* Media Preview Box */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200/80">
                      {f.type === 'image' ? (
                        <img src={f.url} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : f.type === 'video' ? (
                        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-2">
                          <VideoIcon className="w-8 h-8 text-amber-400 mb-1" />
                          <span className="text-[10px] font-mono text-slate-300 truncate max-w-full">{f.name}</span>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-amber-50 flex flex-col items-center justify-center text-amber-700 p-2">
                          <Paperclip className="w-8 h-8 text-amber-600 mb-1" />
                          <span className="text-[10px] font-mono text-amber-800 font-bold">DOCUMENT</span>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                        {f.type}
                      </span>
                    </div>

                    {/* File Meta */}
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900 truncate" title={f.name}>
                        {f.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(f.url);
                          showToast('URL copied to clipboard! Paste it into any CMS field.');
                        }}
                        className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
                        title="Copy Asset URL"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </button>

                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Asset"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleDeleteMedia(f.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT STAFF ACCOUNT MODAL */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-poppins">
                    {editingStaff ? 'Edit Staff Details' : 'Add New Staff Account'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingStaff ? 'Update staff profile or reset login password' : 'Create login credentials for new staff member'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStaffModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Login Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@sarvasolar.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 7036590780"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Staff Role / Access Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 text-sm font-semibold"
                >
                  <option value="Admin">Admin (Full Control & System Settings)</option>
                  <option value="Manager">Manager (Leads, Quotes, Content & HR)</option>
                  <option value="Sales">Sales (Leads, Quotes & Customer Follow-up)</option>
                  <option value="Technician">Technician (Site Surveys & Project Status)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password {!editingStaff && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  required={!editingStaff}
                  placeholder={editingStaff ? 'Leave blank to keep existing password' : 'Min. 6 characters'}
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 text-sm"
                />
                {editingStaff && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter a new password only if you wish to reset this staff member's password.
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStaff}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg transition-transform active:scale-95"
                >
                  {savingStaff ? 'Saving Account...' : editingStaff ? 'Save Changes' : 'Create Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERIC EDIT/CREATE MODAL FOR PIN TO PIN EDITING */}
      {(editingItem || isCreating) && (
        <EditModal
          type={editingItem ? editingItem.type : isCreating!}
          data={editingItem ? editingItem.data : null}
          onClose={() => {
            setEditingItem(null);
            setIsCreating(null);
          }}
          onSave={async (savedData) => {
            const currentTab = editingItem ? editingItem.type : isCreating!;
            const itemName = savedData.name || savedData.title || savedData.question || 'this item';
            const actionText = editingItem ? 'update' : 'create';
            if (!window.confirm(`Are you sure you want to ${actionText} "${itemName}"?`)) {
              return;
            }
            try {
              if (currentTab === 'heroSlides') {
                if (editingItem) {
                  const updated = await updateHeroSlide(savedData.id, savedData);
                  setHeroSlides(prev => prev.map((s) => (s.id === updated.id ? updated : s)).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)));
                  showToast('Hero slide updated successfully');
                } else {
                  const created = await createHeroSlide(savedData);
                  setHeroSlides(prev => [...prev, created].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)));
                  showToast('Hero slide created successfully');
                }
              } else if (currentTab === 'services') {
                if (editingItem) {
                  const updated = await updateService(savedData.id, savedData);
                  setServices(services.map((s) => (s.id === updated.id ? updated : s)));
                } else {
                  const created = await createService(savedData);
                  setServices([...services, created]);
                }
              } else if (currentTab === 'products') {
                if (editingItem) {
                  const updated = await updateProduct(savedData.id, savedData);
                  setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
                } else {
                  const created = await createProduct(savedData);
                  setProducts([created, ...products]);
                }
              } else if (currentTab === 'projects') {
                if (editingItem) {
                  const updated = await updateProject(savedData.id, savedData);
                  setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
                } else {
                  const created = await createProject(savedData);
                  setProjects([created, ...projects]);
                }
              } else if (currentTab === 'blogs') {
                if (editingItem) {
                  const updated = await updateBlog(savedData.id, savedData);
                  setBlogs(blogs.map((b) => (b.id === updated.id ? updated : b)));
                } else {
                  const created = await createBlog(savedData);
                  setBlogs([created, ...blogs]);
                }
              } else if (currentTab === 'subsidies') {
                if (editingItem) {
                  const updated = await updateSubsidy(savedData.id, savedData);
                  setSubsidies(subsidies.map((s) => (s.id === updated.id ? updated : s)));
                } else {
                  const created = await createSubsidy(savedData);
                  setSubsidies([...subsidies, created]);
                }
              } else if (currentTab === 'testimonials') {
                if (editingItem) {
                  const updated = await updateTestimonial(savedData.id, savedData);
                  setTestimonials(testimonials.map((t) => (t.id === updated.id ? updated : t)));
                } else {
                  const created = await createTestimonial(savedData);
                  setTestimonials([created, ...testimonials]);
                }
              } else if (currentTab === 'faqs') {
                if (editingItem) {
                  const updated = await updateFaq(savedData.id, savedData);
                  setFaqs(faqs.map((f) => (f.id === updated.id ? updated : f)));
                } else {
                  const created = await createFaq(savedData);
                  setFaqs([...faqs, created]);
                }
              } else if (currentTab === 'gallery') {
                if (editingItem) {
                  const updated = await updateGalleryItem(savedData.id, savedData);
                  setGallery(gallery.map((g) => (g.id === updated.id ? updated : g)));
                } else {
                  const created = await createGalleryItem(savedData);
                  setGallery([created, ...gallery]);
                }
              } else if (currentTab === 'careers') {
                if (editingItem) {
                  const updated = await updateJob(savedData.id, savedData);
                  setJobs(jobs.map((j) => (j.id === updated.id ? updated : j)));
                } else {
                  const created = await createJob(savedData);
                  setJobs([created, ...jobs]);
                }
              }

              showToast('Item saved successfully!');
              notifyDataUpdated();
              setEditingItem(null);
              setIsCreating(null);
            } catch (err: any) {
              alert('Error saving: ' + (err.message || 'Unknown error'));
            }
          }}
        />
      )}

      {/* CHANGE ADMIN CREDENTIALS MODAL */}
      {showCredModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-poppins">
                    Account Credentials
                  </h3>
                  <p className="text-xs text-slate-500">Update Profile Details & Password</p>
                </div>
              </div>
              <button
                onClick={() => setShowCredModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!window.confirm('Are you sure you want to save changes to your profile details / account password?')) {
                  return;
                }
                setCredUpdating(true);
                try {
                  if (credName !== user.name || credEmail !== user.email || credPhone !== user.phone) {
                    const profRes = await updateUserProfile({
                      name: credName,
                      email: credEmail,
                      phone: credPhone
                    });
                    onLoginSuccess(profRes.user);
                  }

                  if (newPassword) {
                    if (!currentPassword) {
                      throw new Error('Please enter your current password to set a new password');
                    }
                    await changeUserPassword(currentPassword, newPassword);
                    setCurrentPassword('');
                    setNewPassword('');
                  }

                  showToast('Account credentials updated successfully!');
                  setShowCredModal(false);
                } catch (err: any) {
                  showToast(err.message || 'Failed to update credentials', 'error');
                } finally {
                  setCredUpdating(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={credName}
                  onChange={(e) => setCredName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Login Email Address
                </label>
                <input
                  type="email"
                  required
                  value={credEmail}
                  onChange={(e) => setCredEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={credPhone}
                  onChange={(e) => setCredPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-3">
                <p className="font-bold text-slate-900 text-xs">Change Password (Optional)</p>
                <div>
                  <label className="block text-slate-600 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCredModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={credUpdating}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md flex items-center gap-1.5"
                >
                  {credUpdating ? 'Saving...' : 'Update Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-poppins">
                  {deleteConfirmTarget.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {deleteConfirmTarget.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  if (!window.confirm(`CONFIRMATION: Are you sure you want to permanently delete "${deleteConfirmTarget.title}"?`)) {
                    return;
                  }
                  setDeleting(true);
                  try {
                    await deleteConfirmTarget.onConfirm();
                    notifyDataUpdated();
                    setDeleteConfirmTarget(null);
                  } catch (err: any) {
                    showToast(err.message || 'Failed to delete item', 'error');
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for editing/creating items pin-to-pin
interface EditModalProps {
  type: string;
  data: any;
  onClose: () => void;
  onSave: (formData: any) => void;
}

const EditModal: React.FC<EditModalProps> = ({ type, data, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>(
    data || getDefaultFormData(type)
  );

  function getDefaultFormData(t: string) {
    switch (t) {
      case 'heroSlides':
        return {
          badge: 'PM Surya Ghar Govt Subsidy Assistance up to ₹78,000',
          title: '',
          subtitle: '',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=2000&q=80',
          ctaPrimaryText: 'Get Free Instant Quote',
          ctaPrimaryAction: 'quote',
          ctaSecondaryText: 'Calculate Solar Savings',
          ctaSecondaryAction: 'calculators',
          order: 1
        };
      case 'services':
        return {
          title: '',
          slug: '',
          shortDesc: '',
          fullDesc: '',
          iconName: 'Sun',
          benefits: ['Clean Power', '25-Year Life', 'Government Subsidy'],
          imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
          faqs: []
        };
      case 'products':
        return {
          name: '',
          category: 'Solar Panels',
          brand: 'Sarva Tier-1',
          price: 25000,
          rating: 5,
          specs: { Wattage: '550W', Efficiency: '22%' },
          description: '',
          warranty: '25 Years',
          imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
          isFeatured: true,
          inventory: 50
        };
      case 'projects':
        return {
          title: '',
          category: 'Residential',
          location: 'Guntur',
          state: 'Andhra Pradesh',
          capacityKw: 5,
          annualSavingsRs: 65000,
          completionDate: new Date().toISOString().split('T')[0],
          status: 'Completed',
          images: ['https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80'],
          description: ''
        };
      case 'blogs':
        return {
          title: '',
          slug: '',
          category: 'Solar Guide',
          author: 'Sarva Technical Team',
          publishedAt: new Date().toISOString().split('T')[0],
          readTime: '5 min read',
          excerpt: '',
          content: '',
          imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
          tags: ['Solar', 'Andhra Pradesh'],
          isPublished: true
        };
      case 'subsidies':
        return {
          schemeName: 'PM Surya Ghar Muft Bijli Yojana',
          capacityRange: 'Up to 3 kW',
          centralSubsidyAmount: 78000,
          stateBonusAmount: 0,
          eligibility: ['Residential Homeowners', 'Valid Electricity Meter'],
          documents: ['Electricity Bill', 'Aadhaar Card', 'Roof Photo'],
          processSteps: ['Apply on Portal', 'Site Inspection', 'Installation', 'Subsidy Credit']
        };
      case 'testimonials':
        return {
          customerName: '',
          location: 'Guntur, AP',
          systemSizeKw: 3,
          rating: 5,
          comment: '',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          savedPerYear: '₹45,000/yr'
        };
      case 'faqs':
        return {
          category: 'General',
          question: '',
          answer: ''
        };
      case 'gallery':
        return {
          title: '',
          category: 'Residential',
          type: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
          caption: ''
        };
      case 'careers':
        return {
          title: '',
          department: 'Engineering',
          location: 'Guntur HQ',
          type: 'Full-time',
          exp: '1-3 Years in Solar EPC',
          desc: '',
          isActive: true
        };
      default:
        return {};
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="text-lg font-bold text-slate-900 capitalize font-poppins">
            {data ? 'Edit' : 'Create New'} {type.slice(0, -1)} Detail
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Dynamic Inputs based on type */}
          {type === 'heroSlides' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Main Headline Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Power, Bright Future. Clean Solar Energy for Every Roof."
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Subtitle / Subheading
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sarva Solar is a premier EPC solar partner..."
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Top Highlight Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PM Surya Ghar Govt Subsidy Assistance"
                    value={formData.badge || ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Display Order Priority
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order || 1}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Media Background Type
                </label>
                <div className="flex gap-4 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                    <input
                      type="radio"
                      name="mediaType"
                      value="image"
                      checked={formData.mediaType === 'image'}
                      onChange={() => setFormData({ ...formData, mediaType: 'image' })}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span>Image Background</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                    <input
                      type="radio"
                      name="mediaType"
                      value="video"
                      checked={formData.mediaType === 'video'}
                      onChange={() => setFormData({ ...formData, mediaType: 'video' })}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span>Video Background (YouTube / MP4 / WebM)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {formData.mediaType === 'video' ? 'Video Link (YouTube URL, MP4, or WebM)' : 'Image URL'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formData.mediaType === 'video'
                      ? 'e.g. https://www.youtube.com/watch?v=1uP332mth-4 or direct .mp4 URL'
                      : 'e.g. https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=2000&q=80'
                  }
                  value={formData.mediaUrl || ''}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 font-mono text-xs"
                />
                {formData.mediaType === 'video' && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports YouTube links (<code className="text-amber-500 font-mono">youtube.com/watch?v=...</code> or <code className="text-amber-500 font-mono">youtu.be/...</code>), Vimeo links, and direct <code className="text-amber-500 font-mono">.mp4</code> videos.
                  </p>
                )}

                {/* Live Media Preview Box */}
                {formData.mediaUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 h-36 bg-slate-950 relative">
                    {formData.mediaType === 'video' ? (() => {
                      const ytMatch = formData.mediaUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                      if (ytMatch && ytMatch[2] && ytMatch[2].length === 11) {
                        return (
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${ytMatch[2]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytMatch[2]}`}
                            title="YouTube Preview"
                            className="w-full h-full object-cover border-0 scale-125 pointer-events-none"
                          />
                        );
                      }
                      const vimeoMatch = formData.mediaUrl.match(/(?:www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/);
                      if (vimeoMatch && vimeoMatch[1]) {
                        return (
                          <iframe
                            src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&background=1`}
                            title="Vimeo Preview"
                            className="w-full h-full object-cover border-0 pointer-events-none"
                          />
                        );
                      }
                      return (
                        <video
                          src={formData.mediaUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      );
                    })() : (
                      <img
                        src={formData.mediaUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Primary CTA Button Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Get Free Instant Quote"
                    value={formData.ctaPrimaryText || ''}
                    onChange={(e) => setFormData({ ...formData, ctaPrimaryText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Primary Button Action Target
                  </label>
                  <select
                    value={formData.ctaPrimaryAction || 'quote'}
                    onChange={(e) => setFormData({ ...formData, ctaPrimaryAction: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="quote">Open Instant Quote Modal</option>
                    <option value="calculators">Navigate to Solar Calculators</option>
                    <option value="projects">Navigate to Completed Projects</option>
                    <option value="products">Navigate to Products Store</option>
                    <option value="services">Navigate to EPC Services</option>
                    <option value="subsidy">Navigate to Subsidy Info</option>
                    <option value="contact">Navigate to Contact Us</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Secondary CTA Button Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Calculate Solar Savings"
                    value={formData.ctaSecondaryText || ''}
                    onChange={(e) => setFormData({ ...formData, ctaSecondaryText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Secondary Button Action Target
                  </label>
                  <select
                    value={formData.ctaSecondaryAction || 'calculators'}
                    onChange={(e) => setFormData({ ...formData, ctaSecondaryAction: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="calculators">Navigate to Solar Calculators</option>
                    <option value="quote">Open Instant Quote Modal</option>
                    <option value="projects">Navigate to Completed Projects</option>
                    <option value="products">Navigate to Products Store</option>
                    <option value="services">Navigate to EPC Services</option>
                    <option value="subsidy">Navigate to Subsidy Info</option>
                    <option value="contact">Navigate to Contact Us</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {type === 'services' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Summary Description</label>
                <input
                  type="text"
                  required
                  value={formData.shortDesc || ''}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.fullDesc || ''}
                  onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
            </>
          )}

          {type === 'products' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category || 'Solar Panels'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  >
                    <option>Solar Panels</option>
                    <option>Inverters</option>
                    <option>Batteries</option>
                    <option>Mounting Structures</option>
                    <option>Accessories</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price ₹</label>
                  <input
                    type="number"
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Warranty Term</label>
                <input
                  type="text"
                  value={formData.warranty || ''}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
            </>
          )}

          {type === 'projects' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacity (kWp)</label>
                  <input
                    type="number"
                    value={formData.capacityKw || 0}
                    onChange={(e) => setFormData({ ...formData, capacityKw: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location City</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Annual Savings ₹</label>
                  <input
                    type="number"
                    value={formData.annualSavingsRs || 0}
                    onChange={(e) => setFormData({ ...formData, annualSavingsRs: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Main Image URL</label>
                <input
                  type="text"
                  value={formData.images?.[0] || ''}
                  onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
            </>
          )}

          {type === 'blogs' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Excerpt</label>
                <textarea
                  rows={2}
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-2">Article Body</label>
                <BlogRichTextEditor
                  value={formData.content || ''}
                  onChange={(html) =>
                    setFormData((previous: any) => ({ ...previous, content: html }))
                  }
                />
                <p className="mt-2 text-xs text-slate-500">
                  Use the toolbar to format text, adjust alignment and font size, insert symbols,
                  add links, and upload multiple images. Remember to save the article.
                </p>
              </div>
            </>
          )}

          {type === 'subsidies' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheme Name</label>
                <input
                  type="text"
                  required
                  value={formData.schemeName || ''}
                  onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacity Slab</label>
                  <input
                    type="text"
                    value={formData.capacityRange || ''}
                    onChange={(e) => setFormData({ ...formData, capacityRange: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Central Subsidy ₹</label>
                  <input
                    type="number"
                    value={formData.centralSubsidyAmount || 0}
                    onChange={(e) => setFormData({ ...formData, centralSubsidyAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
              </div>
            </>
          )}

          {type === 'testimonials' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName || ''}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Review Comment</label>
                <textarea
                  rows={3}
                  value={formData.comment || ''}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
            </>
          )}

          {type === 'faqs' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={formData.question || ''}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Answer</label>
                <textarea
                  rows={3}
                  required
                  value={formData.answer || ''}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
            </>
          )}

          {type === 'gallery' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Media URL</label>
                <input
                  type="text"
                  required
                  value={formData.mediaUrl || ''}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>
            </>
          )}

          {type === 'careers' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Solar Site Installation Engineer"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Technical / EPC Operations"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Guntur 5/15 Brodipet / Vijayawada"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Type</label>
                  <select
                    value={formData.type || 'Full-time'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Experience Requirement *</label>
                <input
                  type="text"
                  required
                  value={formData.exp || ''}
                  onChange={(e) => setFormData({ ...formData, exp: e.target.value })}
                  placeholder="e.g. 2-5 Years Rooftop Solar Execution"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Description & Responsibilities *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.desc || ''}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Provide key roles, expectations, and skills needed..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="font-bold text-slate-700 select-none">
                  Active Opening (Visible on live Careers page)
                </label>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
