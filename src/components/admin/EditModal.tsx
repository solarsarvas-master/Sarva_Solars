import React, { useState } from 'react';
import { uploadMediaFile } from '../../services/api';
import { X } from 'lucide-react';

interface EditModalProps {
  type: string;
  data: any;
  onClose: () => void;
  onSave: (formData: any) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ type, data, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>(
    data || getDefaultFormData(type)
  );
  const [uploadingHeroMedia, setUploadingHeroMedia] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState('');

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
          capacityRange: '',
          centralSubsidyAmount: '',
          stateBonusAmount: '',
          eligibility: [],
          documents: [],
          processSteps: []
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

    if (type === 'subsidies') {
      const schemeName = String(formData.schemeName ?? '').trim();
      const capacityRange = String(formData.capacityRange ?? '').trim();
      const centralRaw = formData.centralSubsidyAmount;
      const stateRaw = formData.stateBonusAmount;

      if (!schemeName || !capacityRange) {
        alert('Please enter the scheme name and capacity slab.');
        return;
      }

      if (
        centralRaw === '' || centralRaw === null || centralRaw === undefined ||
        stateRaw === '' || stateRaw === null || stateRaw === undefined
      ) {
        alert('Please enter both central and state subsidy amounts. Enter 0 if no state bonus applies.');
        return;
      }

      const central = Number(centralRaw);
      const state = Number(stateRaw);

      if (
        !Number.isFinite(central) || central < 0 ||
        !Number.isFinite(state) || state < 0
      ) {
        alert('Subsidy amounts must be valid, non-negative numbers.');
        return;
      }

      const cleanLines = (value: unknown): string[] => {
        const lines = Array.isArray(value)
          ? value
          : String(value ?? '').split(/\r?\n/);

        return lines
          .map((item) => String(item).trim())
          .filter(Boolean);
      };

      onSave({
        ...formData,
        schemeName,
        capacityRange,
        centralSubsidyAmount: central,
        stateBonusAmount: state,
        eligibility: cleanLines(formData.eligibility),
        documents: cleanLines(formData.documents),
        processSteps: cleanLines(formData.processSteps)
      });
      return;
    }

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
                  Main Headline Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Optional: e.g. Green Power, Bright Future. Clean Solar Energy for Every Roof."
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
                <div className="mt-3 rounded-xl border border-dashed border-amber-400 bg-amber-50/60 p-3">
                  <label className="block font-bold text-slate-700 mb-2">
                    Or upload a {formData.mediaType === 'video' ? 'video' : 'image'} file
                  </label>
                  <input
                    type="file"
                    accept={formData.mediaType === 'video' ? 'video/*' : 'image/*'}
                    disabled={uploadingHeroMedia}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setHeroUploadError('');
                      const expectedType = formData.mediaType === 'video' ? 'video/' : 'image/';
                      if (!file.type.startsWith(expectedType)) {
                        setHeroUploadError(`Please choose a valid ${formData.mediaType} file.`);
                        e.target.value = '';
                        return;
                      }
                      setUploadingHeroMedia(true);
                      try {
                        const result = await uploadMediaFile(file);
                        setFormData((previous: any) => ({
                          ...previous,
                          mediaUrl: result.url,
                          mediaType: result.mediaType === 'video' ? 'video' : 'image'
                        }));
                      } catch (error: any) {
                        setHeroUploadError(error?.message || 'Upload failed. Please try again.');
                      } finally {
                        setUploadingHeroMedia(false);
                        e.target.value = '';
                      }
                    }}
                    className="block w-full text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-400 file:px-3 file:py-2 file:font-bold file:text-slate-950 hover:file:bg-amber-500 disabled:opacity-50"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">
                    Uploads to Sarva Solar's media storage and fills in the public URL automatically. You can also paste an image or video URL above.
                  </p>
                  {uploadingHeroMedia && (
                    <p role="status" className="mt-2 text-amber-700 font-bold">Uploading media…</p>
                  )}
                  {heroUploadError && (
                    <p role="alert" className="mt-2 text-red-600">{heroUploadError}</p>
                  )}
                </div>

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
                <label className="block font-bold text-slate-700 mb-1">Markdown Body Content</label>
                <textarea
                  rows={4}
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 font-mono"
                />
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
                  value={formData.schemeName ?? ''}
                  onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Capacity Slab</label>
                <input
                  type="text"
                  required
                  placeholder="Enter the verified capacity range"
                  value={formData.capacityRange ?? ''}
                  onChange={(e) => setFormData({ ...formData, capacityRange: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Central Subsidy ₹</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formData.centralSubsidyAmount ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      centralSubsidyAmount: e.target.value === '' ? '' : Number(e.target.value)
                    })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State Subsidy / Bonus ₹</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formData.stateBonusAmount ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      stateBonusAmount: e.target.value === '' ? '' : Number(e.target.value)
                    })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                  />
                  <p className="mt-1 text-slate-500">Enter 0 if no applicable state bonus is verified.</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Eligibility Criteria</label>
                <textarea
                  rows={3}
                  placeholder="One criterion per line"
                  value={Array.isArray(formData.eligibility) ? formData.eligibility.join('\n') : ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    eligibility: e.target.value.split(/\r?\n/)
                  })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Documents</label>
                <textarea
                  rows={3}
                  placeholder="One document per line"
                  value={Array.isArray(formData.documents) ? formData.documents.join('\n') : ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    documents: e.target.value.split(/\r?\n/)
                  })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Application Process Steps</label>
                <textarea
                  rows={4}
                  placeholder="One step per line"
                  value={Array.isArray(formData.processSteps) ? formData.processSteps.join('\n') : ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    processSteps: e.target.value.split(/\r?\n/)
                  })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900"
                />
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
