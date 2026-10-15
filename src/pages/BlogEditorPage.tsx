import React, { useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Eye,
  Save,
  Send,
  ImagePlus,
  FileText,
  Globe,
  LoaderCircle,
  X,
} from 'lucide-react';
import type { BlogArticle } from '../types';
import BlogRichTextEditor from '../components/admin/BlogRichTextEditor';
import { uploadMediaFile } from '../services/api';

type BlogDraft = Partial<BlogArticle> & {
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
};

interface BlogEditorPageProps {
  article: BlogArticle | null;
  onCancel: () => void;
  onSave: (data: BlogDraft) => Promise<void>;
}

const makeDraft = (article: BlogArticle | null): BlogDraft => ({
  ...(article || {}),
  title: article?.title || '',
  slug: article?.slug || '',
  category: article?.category || 'Solar Guide',
  author: article?.author || 'Sarva Technical Team',
  publishedAt: article?.publishedAt || new Date().toISOString().slice(0, 10),
  readTime: article?.readTime || '5 min read',
  excerpt: article?.excerpt || '',
  content: article?.content || '',
  imageUrl: article?.imageUrl || '',
  tags: article?.tags || [],
  isPublished: article?.isPublished ?? false,
});

const fieldClass =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100';

const labelClass = 'text-xs font-semibold text-slate-700';

const BlogEditorPage: React.FC<BlogEditorPageProps> = ({
  article,
  onCancel,
  onSave,
}) => {
  const [draft, setDraft] = useState<BlogDraft>(() => makeDraft(article));
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInput = useRef<HTMLInputElement>(null);

  const update = <K extends keyof BlogDraft>(key: K, value: BlogDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const save = async (publish: boolean) => {
    if (!draft.title.trim()) {
      setError('Please enter an article title.');
      return;
    }

    if (!draft.slug.trim()) {
      setError('Please enter a URL slug.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave({
        ...draft,
        title: draft.title.trim(),
        slug: draft.slug.trim(),
        isPublished: publish,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save the article.');
    } finally {
      setSaving(false);
    }
  };

  const uploadCover = async (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setError('Choose an image no larger than 10 MB.');
      return;
    }

    setUploadingCover(true);
    setError('');

    try {
      const result = await uploadMediaFile(file);
      update('imageUrl', result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cover image upload failed.');
    } finally {
      setUploadingCover(false);
      if (coverInput.current) coverInput.current.value = '';
    }
  };

  const tagText = draft.tags.join(', ');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
              aria-label="Back to blog management"
              title="Back to blog management"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                Sarva Solar · Content Studio
              </p>
              <h1 className="text-lg font-bold sm:text-xl">
                {article ? 'Edit Blog Article' : 'Create Blog Article'}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPreview((current) => !current)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              {preview ? <X size={16} /> : <Eye size={16} />}
              {preview ? 'Close preview' : 'Preview'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              {saving ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}
              Save Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={16} />}
              {article?.isPublished ? 'Update & Publish' : 'Publish Article'}
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div role="alert" className="mx-auto mt-4 flex max-w-[1700px] items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      <main className="mx-auto grid max-w-[1700px] grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <label className={labelClass} htmlFor="blog-title">Article title</label>
            <input
              id="blog-title"
              className="mt-2 w-full border-0 bg-transparent text-2xl font-bold tracking-tight outline-none placeholder:text-slate-300 sm:text-3xl"
              placeholder="Write a clear, useful article title..."
              value={draft.title}
              onChange={(event) => {
                const title = event.target.value;
                setDraft((current) => ({
                  ...current,
                  title,
                  slug: current.slug === '' ||
                    current.slug === current.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                    ? title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                    : current.slug,
                }));
              }}
            />
            <div className="mt-4 border-t border-slate-100 pt-4">
              <label className={labelClass} htmlFor="blog-excerpt">Article summary / excerpt</label>
              <textarea
                id="blog-excerpt"
                rows={3}
                className={fieldClass}
                placeholder="Summarize what readers will learn..."
                value={draft.excerpt}
                onChange={(event) => update('excerpt', event.target.value)}
              />
            </div>
          </div>

          {preview ? (
            <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10">
              {draft.imageUrl && (
                <img
                  src={draft.imageUrl}
                  alt={draft.title || 'Article cover'}
                  className="mb-8 max-h-[440px] w-full rounded-xl object-cover"
                />
              )}
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-700">
                {draft.category}
              </p>
              <h2 className="mb-4 text-3xl font-bold">{draft.title || 'Untitled article'}</h2>
              <p className="mb-8 text-slate-500">{draft.excerpt}</p>
              <div
                className="blog-article-content max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(draft.content, {
                    USE_PROFILES: { html: true },
                  }),
                }}
              />
            </article>
          ) : (
            <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <FileText size={17} className="text-amber-600" />
                  Article body
                </div>
                <span className="text-xs text-slate-400">Rich-text editor</span>
              </div>
              <BlogRichTextEditor
                key={article?.id || 'new-blog'}
                value={draft.content}
                onChange={(html) => update('content', html)}
              />
            </section>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 text-sm font-bold">Article tags</h2>
            <label htmlFor="blog-tags" className={labelClass}>Comma-separated tags</label>
            <input
              id="blog-tags"
              className={fieldClass}
              placeholder="Solar, Rooftop Solar, Solar Subsidy"
              value={tagText}
              onChange={(event) => update(
                'tags',
                event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean),
              )}
            />
            <p className="mt-2 text-xs text-slate-500">
              Use relevant topics and search phrases. Separate each tag with a comma.
            </p>
          </div>
        </section>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-bold">
              <Globe size={17} className="text-amber-600" />
              Publishing settings
            </h2>

            <label className={labelClass} htmlFor="blog-status">Status</label>
            <select
              id="blog-status"
              className={fieldClass}
              value={draft.isPublished ? 'published' : 'draft'}
              onChange={(event) => update('isPublished', event.target.value === 'published')}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <label className={`${labelClass} mt-4 block`} htmlFor="blog-category">Category</label>
            <input
              id="blog-category"
              className={fieldClass}
              value={draft.category}
              onChange={(event) => update('category', event.target.value)}
              placeholder="Solar Guide"
            />

            <label className={`${labelClass} mt-4 block`} htmlFor="blog-author">Author</label>
            <input
              id="blog-author"
              className={fieldClass}
              value={draft.author}
              onChange={(event) => update('author', event.target.value)}
            />

            <label className={`${labelClass} mt-4 block`} htmlFor="blog-date">Publication date</label>
            <input
              id="blog-date"
              type="date"
              className={fieldClass}
              value={draft.publishedAt}
              onChange={(event) => update('publishedAt', event.target.value)}
            />

            <label className={`${labelClass} mt-4 block`} htmlFor="blog-read-time">Reading time</label>
            <input
              id="blog-read-time"
              className={fieldClass}
              value={draft.readTime}
              onChange={(event) => update('readTime', event.target.value)}
              placeholder="5 min read"
            />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold">URL and SEO</h2>
            <label className={labelClass} htmlFor="blog-slug">URL slug</label>
            <input
              id="blog-slug"
              className={fieldClass}
              value={draft.slug}
              onChange={(event) => update('slug', event.target.value.toLowerCase().trim().replace(/\s+/g, '-'))}
              placeholder="solar-panel-guide"
            />
            <p className="mt-2 break-all text-xs text-slate-500">
              Public URL: /blog/{draft.slug || 'your-article-slug'}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold">Featured image</h2>
            {draft.imageUrl ? (
              <img
                src={draft.imageUrl}
                alt="Featured image preview"
                className="mb-3 aspect-video w-full rounded-lg border border-slate-100 object-cover"
              />
            ) : (
              <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                <ImagePlus size={32} />
              </div>
            )}

            <label className={labelClass} htmlFor="blog-image-url">Image URL</label>
            <input
              id="blog-image-url"
              className={fieldClass}
              value={draft.imageUrl}
              onChange={(event) => update('imageUrl', event.target.value)}
              placeholder="https://..."
            />

            <input
              ref={coverInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void uploadCover(event.target.files?.[0])}
            />
            <button
              type="button"
              disabled={uploadingCover}
              onClick={() => coverInput.current?.click()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              {uploadingCover
                ? <LoaderCircle size={16} className="animate-spin" />
                : <ImagePlus size={16} />}
              {uploadingCover ? 'Uploading image...' : 'Upload featured image'}
            </button>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              JPG, PNG, WebP or other supported image formats, up to 10 MB.
            </p>
          </section>

          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel and return to blog list
          </button>
        </aside>
      </main>
    </div>
  );
};

export default BlogEditorPage;
