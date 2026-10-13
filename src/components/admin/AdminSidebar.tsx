import React from 'react';
import {
  TrendingUp,
  Sliders,
  Settings as SettingsIcon,
  Wrench,
  ShoppingBag,
  Building2,
  BookOpen,
  Award,
  MessageSquare,
  HelpCircle,
  ImageIcon,
  Briefcase,
  FileText,
  Users,
  Eye,
  UserCheck,
  Activity,
  Folder,
  LogOut,
  ShieldCheck,
  X
} from 'lucide-react';
import { User } from '../../types';

export type TabType =
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

interface AdminSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user: User;
  leadsCount: number;
  quotesCount: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onLogout: () => void;
  onOpenCredModal: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  leadsCount,
  quotesCount,
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogout,
  onOpenCredModal
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: TrendingUp },
    { id: 'heroSlides', label: 'Hero Slideshow', icon: Sliders },
    { id: 'settings', label: 'Website & Company Info', icon: SettingsIcon },
    { id: 'services', label: 'EPC Solar Services', icon: Wrench },
    { id: 'products', label: 'Products & Store', icon: ShoppingBag },
    { id: 'projects', label: 'Portfolio Installations', icon: Building2 },
    { id: 'blogs', label: 'Blog & Solar Guides', icon: BookOpen },
    { id: 'subsidies', label: 'PM Surya Ghar Tiers', icon: Award },
    { id: 'testimonials', label: 'Customer Reviews', icon: MessageSquare },
    { id: 'faqs', label: 'FAQs Manager', icon: HelpCircle },
    { id: 'gallery', label: 'Media & Installation Showcase', icon: ImageIcon },
    { id: 'careers', label: 'Job Careers & Hiring', icon: Briefcase },
    { id: 'leads', label: 'Customer Inquiry Leads', icon: FileText, count: leadsCount },
    { id: 'quotes', label: 'Instant Quote Requests', icon: Users, count: quotesCount },
    { id: 'visitorLogs', label: 'Live Visitor Traffic Logs', icon: Eye },
    { id: 'staff', label: 'Staff Accounts & Roles', icon: UserCheck },
    ...(user.role === 'Admin' ? [{ id: 'audit', label: 'System Audit Logs', icon: Activity }] : []),
    { id: 'media', label: 'Media & File Library', icon: Folder }
  ] as const;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800 shrink-0">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg">
            ⚡
          </div>
          <div>
            <h1 className="font-bold text-white text-base font-poppins leading-none">
              Sarva Group
            </h1>
            <p className="text-[10px] text-amber-400/90 font-medium tracking-wider uppercase mt-1">
              CMS Admin Portal
            </p>
          </div>
        </div>
        {mobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as TabType);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {'count' in item && item.count !== undefined && item.count > 0 && (
                <span
                  className={`ml-2 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-2.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-[10px] text-slate-400 truncate capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onOpenCredModal}
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Edit Profile Credentials"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-screen sticky top-0">{sidebarContent}</div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
