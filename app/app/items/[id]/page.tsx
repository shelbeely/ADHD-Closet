'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface ImageAsset {
  id: string;
  kind: string;
  filePath: string;
  width?: number;
  height?: number;
}

interface Tag {
  id: string;
  name: string;
}

interface AIJob {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface Item {
  id: string;
  title?: string;
  category?: string;
  state: string;
  brand?: string;
  sizeText?: string;
  materials?: string;
  colorPalette?: string[];
  attributes?: Record<string, any>;
  cleanStatus: string;
  wearsBeforeWash: number;
  currentWears: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: 'tops', label: 'Tops', icon: '👕' },
  { value: 'bottoms', label: 'Bottoms', icon: '👖' },
  { value: 'dresses', label: 'Dresses', icon: '👗' },
  { value: 'outerwear', label: 'Outerwear', icon: '🧥' },
  { value: 'shoes', label: 'Shoes', icon: '👟' },
  { value: 'accessories', label: 'Accessories', icon: '🎒' },
  { value: 'underwear_bras', label: 'Underwear', icon: '🩲' },
  { value: 'jewelry', label: 'Jewelry', icon: '💍' },
];

const STATES = [
  { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'laundry', label: 'Laundry', color: 'bg-blue-100 text-blue-800' },
  { value: 'unavailable', label: 'Unavailable', color: 'bg-gray-100 text-gray-800' },
  { value: 'donate', label: 'Donate', color: 'bg-yellow-100 text-yellow-800' },
];

const CLEAN_STATUSES = [
  { value: 'clean', label: 'Clean', color: 'bg-green-100 text-green-800', icon: '✨' },
  { value: 'dirty', label: 'Dirty', color: 'bg-orange-100 text-orange-800', icon: '🧺' },
  { value: 'needs_wash', label: 'Needs Wash', color: 'bg-red-100 text-red-800', icon: '🚿' },
];

/**
 * Item Detail Page - View and edit individual items
 * 
 * Material Design 3 + ADHD-optimized principles:
 * - Progressive disclosure: Details grouped into collapsible sections
 * - Clear visual hierarchy: Primary actions prominent, secondary demoted
 * - Image gallery: All images visible with clear labels
 * - Inline editing: No separate edit mode, reduce friction
 * - Auto-save: Save changes automatically
 * - Status visibility: AI job history shows processing state
 */
export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [aiJobs, setAiJobs] = useState<AIJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);

  // Editable fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [state, setState] = useState('available');
  const [newTag, setNewTag] = useState('');
  const [cleanStatus, setCleanStatus] = useState('clean');
  const [wearsBeforeWash, setWearsBeforeWash] = useState(1);
  const [currentWears, setCurrentWears] = useState(0);

  useEffect(() => {
    loadItem();
  }, [params.id]);

  const loadItem = async () => {
    try {
      const response = await fetch(`/api/items/${params.id}`);
      if (!response.ok) throw new Error('Failed to load item');
      
      const data = await response.json();
      setItem(data.item);
      setImages(data.images || []);
      setTags(data.tags || []);
      setAiJobs(data.ai?.latestJobs || []);

      // Initialize editable fields
      setTitle(data.item.title || '');
      setCategory(data.item.category || '');
      setBrand(data.item.brand || '');
      setState(data.item.state || 'available');
      setCleanStatus(data.item.cleanStatus || 'clean');
      setWearsBeforeWash(data.item.wearsBeforeWash || 1);
      setCurrentWears(data.item.currentWears || 0);
    } catch (error) {
      console.error('Error loading item:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async (overrides?: Partial<{
    cleanStatus: string;
    wearsBeforeWash: number;
    currentWears: number;
  }>) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/items/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category: category || undefined,
          brand,
          state,
          tags: tags.map(t => t.name),
          cleanStatus: overrides?.cleanStatus ?? cleanStatus,
          wearsBeforeWash: overrides?.wearsBeforeWash ?? wearsBeforeWash,
          currentWears: overrides?.currentWears ?? currentWears,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      await loadItem();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      const response = await fetch(`/api/items/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      router.push('/');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleWear = async () => {
    const newWearCount = currentWears + 1;
    let newCleanStatus = cleanStatus;
    
    // Update status based on wear count
    if (newWearCount >= wearsBeforeWash) {
      newCleanStatus = 'needs_wash';
    } else if (newWearCount > 0) {
      newCleanStatus = 'dirty';
    }
    
    // Update local state
    setCurrentWears(newWearCount);
    setCleanStatus(newCleanStatus);
    
    // Save with new values
    await saveChanges({
      currentWears: newWearCount,
      cleanStatus: newCleanStatus,
    });
  };

  const handleWash = async () => {
    // Update local state
    setCurrentWears(0);
    setCleanStatus('clean');
    
    // Save with new values
    await saveChanges({
      currentWears: 0,
      cleanStatus: 'clean',
    });
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    
    // Generate temporary ID - will be replaced with server ID after save
    const tempTag = { id: `temp-${Date.now()}`, name: newTag.trim() };
    setTags([...tags, tempTag]);
    setNewTag('');
    
    // Auto-save will sync with server
    await saveChanges();
  };

  const removeTag = async (tagId: string) => {
    setTags(tags.filter(t => t.id !== tagId));
    await saveChanges();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-on-surface-variant">Loading item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">Item not found</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary text-on-primary rounded-full font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Group images by kind
  const frontImage = images.find(img => img.kind === 'original_main' || img.kind === 'ai_catalog');
  const backImage = images.find(img => img.kind === 'original_back');
  const detailImages = images.filter(img => img.kind === 'detail');
  const labelImages = images.filter(img => img.kind.startsWith('label_'));

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-container shadow-elevation-2">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-full hover:bg-surface-variant transition-colors"
            aria-label="Go back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Item Details</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Image Gallery */}
        <section className="bg-surface-container rounded-3xl shadow-elevation-1 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            
            {/* Main Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {frontImage && (
                <div className="relative aspect-square bg-surface-variant rounded-2xl overflow-hidden cursor-pointer"
                     onClick={() => setSelectedImage(frontImage)}>
                  <img
                    src={`/api/images/${frontImage.id}`}
                    alt="Front view"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm py-2 px-3">
                    Front
                  </div>
                </div>
              )}
              {backImage && (
                <div className="relative aspect-square bg-surface-variant rounded-2xl overflow-hidden cursor-pointer"
                     onClick={() => setSelectedImage(backImage)}>
                  <img
                    src={`/api/images/${backImage.id}`}
                    alt="Back view"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm py-2 px-3">
                    Back
                  </div>
                </div>
              )}
            </div>

            {/* Detail and Label Images */}
            {(detailImages.length > 0 || labelImages.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {detailImages.map(img => (
                  <div key={img.id} className="relative aspect-square bg-surface-variant rounded-xl overflow-hidden cursor-pointer"
                       onClick={() => setSelectedImage(img)}>
                    <img
                      src={`/api/images/${img.id}`}
                      alt="Detail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2">
                      Detail
                    </div>
                  </div>
                ))}
                {labelImages.map(img => (
                  <div key={img.id} className="relative aspect-square bg-surface-variant rounded-xl overflow-hidden cursor-pointer"
                       onClick={() => setSelectedImage(img)}>
                    <img
                      src={`/api/images/${img.id}`}
                      alt="Label"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2">
                      Label
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Details Form */}
        <section className="bg-surface-container rounded-3xl shadow-elevation-1 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Details</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => saveChanges()}
              placeholder="e.g., Black Band T-shirt"
              className="w-full px-4 py-3 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                saveChanges();
              }}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Not set</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              onBlur={() => saveChanges()}
              placeholder="e.g., Killstar"
              className="w-full px-4 py-3 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium mb-2">State</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STATES.map(s => (
                <button
                  key={s.value}
                  onClick={() => {
                    setState(s.value);
                    saveChanges();
                  }}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    state === s.value
                      ? 'bg-primary text-on-primary shadow-elevation-2'
                      : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Status & Wear Tracking */}
          <div className="space-y-4 p-4 bg-surface-variant rounded-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Cleanliness & Wear Tracking</h3>
            </div>
            
            {/* Clean Status */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <div className="grid grid-cols-3 gap-3">
                {CLEAN_STATUSES.map(cs => (
                  <button
                    key={cs.value}
                    onClick={() => {
                      setCleanStatus(cs.value);
                      saveChanges({ cleanStatus: cs.value });
                    }}
                    className={`px-3 py-2 rounded-xl font-medium transition-all text-sm ${
                      cleanStatus === cs.value
                        ? cs.color + ' ring-2 ring-offset-2 ring-primary'
                        : 'bg-surface text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="text-lg mb-1">{cs.icon}</div>
                    {cs.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wear Counter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Wears: {currentWears} / {wearsBeforeWash}
              </label>
              <div className="mb-3">
                <div className="w-full bg-surface-container-low rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentWears >= wearsBeforeWash
                        ? 'bg-error'
                        : currentWears > 0
                        ? 'bg-tertiary'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min((currentWears / wearsBeforeWash) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleWear}
                  className="flex-1 px-4 py-3 bg-tertiary text-on-tertiary rounded-xl font-medium hover:shadow-elevation-2 transition-all"
                >
                  👕 Wore It
                </button>
                <button
                  onClick={handleWash}
                  className="flex-1 px-4 py-3 bg-primary text-on-primary rounded-xl font-medium hover:shadow-elevation-2 transition-all"
                >
                  🧼 Washed
                </button>
              </div>
            </div>

            {/* Wears Before Wash Setting */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Wears Before Wash (e.g., denim = 5-10, shirts = 1-2)
              </label>
              <input
                type="number"
                min="1"
                value={wearsBeforeWash}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setWearsBeforeWash(Math.max(1, value));
                }}
                onBlur={() => {
                  const validValue = Math.max(1, wearsBeforeWash);
                  setWearsBeforeWash(validValue);
                  saveChanges({ wearsBeforeWash: validValue });
                }}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="text-xs text-on-surface-variant mt-2">
                💡 Denim: 5-10 wears, Shirts: 1-2 wears, Outerwear: 5+ wears
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-sm"
                >
                  {tag.name}
                  <button
                    onClick={() => removeTag(tag.id)}
                    className="hover:text-error transition-colors"
                    aria-label="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag..."
                className="flex-1 px-4 py-2 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                onClick={addTag}
                className="px-6 py-2 bg-primary text-on-primary rounded-xl font-medium hover:shadow-elevation-2 transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Color Palette */}
          {item.colorPalette && item.colorPalette.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Colors (AI detected)</label>
              <div className="flex gap-2">
                {item.colorPalette.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-full border-2 border-outline shadow-elevation-1"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Save Status */}
          {saving && (
            <div className="text-sm text-on-surface-variant">
              Saving...
            </div>
          )}
        </section>

        {/* AI Job History */}
        {aiJobs.length > 0 && (
          <section className="bg-surface-container rounded-3xl shadow-elevation-1 p-6">
            <h2 className="text-xl font-semibold mb-4">AI Processing History</h2>
            <div className="space-y-3">
              {aiJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                  <div className="flex-1">
                    <div className="font-medium">{job.type.replace(/_/g, ' ')}</div>
                    <div className="text-sm text-on-surface-variant">
                      {new Date(job.createdAt).toLocaleString()}
                    </div>
                    {job.error && (
                      <div className="text-sm text-error mt-1">{job.error}</div>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    job.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                    job.status === 'failed' ? 'bg-red-100 text-red-800' :
                    job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Delete Button */}
        <section className="bg-surface-container rounded-3xl shadow-elevation-1 p-6">
          <h2 className="text-xl font-semibold mb-4 text-error">Danger Zone</h2>
          <button
            onClick={handleDelete}
            className={`w-full px-6 py-3 rounded-xl font-medium transition-all ${
              deleteConfirm
                ? 'bg-error text-on-error shadow-elevation-3'
                : 'bg-error/10 text-error hover:bg-error/20'
            }`}
          >
            {deleteConfirm ? 'Click again to confirm deletion' : 'Delete Item'}
          </button>
          {deleteConfirm && (
            <button
              onClick={() => setDeleteConfirm(false)}
              className="w-full mt-2 px-6 py-2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
          )}
        </section>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={`/api/images/${selectedImage.id}`}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
