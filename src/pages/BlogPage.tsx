import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BlogArticle } from '../types';
import { Search, Clock, Calendar, User, Tag, ArrowRight, X } from 'lucide-react';

interface BlogPageProps {
  blogs: BlogArticle[];
  onOpenArticle: (slug: string) => void;
  onOpenQuoteModal: () => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ blogs, onOpenArticle, onOpenQuoteModal }) => {
  const [selectedBlog, setSelectedBlog] = useState<BlogArticle | null>(null);
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  const filteredBlogs = blogs.filter((b) => {
    const matchesCat = category === 'All' || b.category === category;
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      b.content.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
          Knowledge Center
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-poppins">
          Solar Insights & Technical Guides
        </h1>
        <p className="text-sm text-slate-600">
          Learn about PM Surya Ghar subsidies, solar ROI calculations, net metering in AP & Telangana, and lithium battery storage advice.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-md">
        <div className="flex flex-wrap gap-2">
          {['All', 'Government Subsidy', 'Solar Buying Guide', 'Technical'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all ${
                category === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 pr-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredBlogs.map((b) => (
          <motion.div
            key={b.id}
            onClick={() => onOpenArticle(b.slug)}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl space-y-4 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="h-60 overflow-hidden relative">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                  {b.category}
                </span>
              </div>

              <div className="px-6 space-y-3">
                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {b.publishedAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {b.readTime}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 font-poppins group-hover:text-amber-500 transition-colors">
                  {b.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {b.excerpt}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>Read Full Article</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-3xl w-full border border-slate-200 shadow-2xl relative my-8 space-y-6">
            <button
              onClick={() => setSelectedBlog(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <span className="text-xs font-extrabold bg-amber-500 text-slate-950 px-3 py-1 rounded-full uppercase">
                {selectedBlog.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-poppins">
                {selectedBlog.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 border-b border-slate-200 pb-3">
                <span>By {selectedBlog.author}</span>
                <span>•</span>
                <span>Published {selectedBlog.publishedAt}</span>
                <span>•</span>
                <span>{selectedBlog.readTime}</span>
              </div>
            </div>

            <div className="h-64 rounded-2xl overflow-hidden">
              <img
                src={selectedBlog.imageUrl}
                alt={selectedBlog.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="prose max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-4 whitespace-pre-line">
              {selectedBlog.content}
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="flex flex-wrap gap-1.5">
                {selectedBlog.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <button
                onClick={() => {
                  setSelectedBlog(null);
                  onOpenQuoteModal();
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 px-6 rounded-xl shadow-md shrink-0"
              >
                Inquire Solar Plant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
