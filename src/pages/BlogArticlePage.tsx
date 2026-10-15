import React, { useEffect } from 'react';
import DOMPurify from 'dompurify';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import type { BlogArticle } from '../types';

interface BlogArticlePageProps {
  blogs: BlogArticle[];
  slug: string;
  blogsLoaded: boolean;
  onBackToBlog: () => void;
  onOpenQuoteModal: () => void;
}

export const BlogArticlePage: React.FC<BlogArticlePageProps> = ({
  blogs,
  slug,
  blogsLoaded,
  onBackToBlog,
  onOpenQuoteModal,
}) => {
  const article = blogs.find(
    (blog) => blog.isPublished && blog.slug === slug
  );

  useEffect(() => {
    if (!article) return;

    const previousTitle = document.title;
    document.title = `${article.title} | Sarva Solar`;

    let descriptionMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    const createdMeta = !descriptionMeta;

    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.name = 'description';
      document.head.appendChild(descriptionMeta);
    }

    const previousDescription = descriptionMeta.content;
    descriptionMeta.content = article.excerpt || article.title;

    return () => {
      document.title = previousTitle;

      if (createdMeta) {
        descriptionMeta?.remove();
      } else if (descriptionMeta) {
        descriptionMeta.content = previousDescription;
      }
    };
  }, [article]);

  if (!blogsLoaded) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p role="status" className="text-sm text-slate-600">
          Loading article...
        </p>
      </div>
    );
  }

  if (!article) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-black text-slate-900">
          Article not found
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          This article may have been removed, unpublished, or moved.
        </p>
        <button
          type="button"
          onClick={onBackToBlog}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          <ArrowLeft size={16} />
          Back to Solar Insights
        </button>
      </section>
    );
  }

  const content = article.content || '';
  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  const safeHtml = containsHtml
    ? DOMPurify.sanitize(content, { USE_PROFILES: { html: true } })
    : '';

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <button
        type="button"
        onClick={onBackToBlog}
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-amber-600"
      >
        <ArrowLeft size={17} />
        All Solar Insights
      </button>

      <header className="space-y-5">
        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-900">
          {article.category}
        </span>

        <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-slate-900 font-poppins">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-base sm:text-lg leading-relaxed text-slate-600">
            {article.excerpt}
          </p>
        )}

        <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-slate-200 pb-5 text-xs text-slate-500">
          <span>By {article.author}</span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {article.publishedAt}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} />
            {article.readTime}
          </span>
        </div>
      </header>

      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="mt-8 w-full max-h-[480px] rounded-2xl object-cover"
        />
      )}

      <div className="prose prose-slate prose-lg mt-10 max-w-none break-words
        prose-headings:font-poppins prose-headings:font-bold
        prose-a:text-blue-700 prose-img:rounded-xl
        prose-blockquote:border-amber-500">
        {containsHtml ? (
          <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
        ) : (
          <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">
            {content}
          </div>
        )}
      </div>

      {article.tags?.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-6">
          <Tag size={15} className="text-slate-500" />
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <section className="mt-12 rounded-2xl bg-slate-900 p-6 sm:p-9 text-white">
        <h2 className="text-2xl font-bold">
          Planning a solar installation?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Talk to Sarva Solar about your rooftop solar requirements,
          project options, and applicable subsidy assistance.
        </p>
        <button
          type="button"
          onClick={onOpenQuoteModal}
          className="mt-5 rounded-xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-slate-950 hover:bg-amber-400"
        >
          Enquire About Solar
        </button>
      </section>
    </article>
  );
};

export default BlogArticlePage;
