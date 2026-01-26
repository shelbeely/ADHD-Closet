'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

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

export default function AddItemPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'photo' | 'details'>('photo');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // ADHD: Auto-save draft to localStorage
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStep('details');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);

      // ADHD: Create item immediately (no forms to complete first)
      const itemResponse = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || undefined,
          category: category || undefined,
          brand: brand || undefined,
        }),
      });

      if (!itemResponse.ok) {
        throw new Error('Failed to create item');
      }

      const { id } = await itemResponse.json();

      // Upload image
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('kind', 'original_main');

      const uploadResponse = await fetch(`/api/items/${id}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      // ADHD: Navigate immediately, AI processing happens in background
      router.push(`/items/${id}`);
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ADHD: Skip button to save with minimal info
  const handleQuickSave = async () => {
    if (!selectedFile) return;
    setTitle('');
    setCategory('');
    setBrand('');
    await handleSubmit();
  };

  if (step === 'photo') {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        {/* Top App Bar */}
        <header className="bg-surface-container shadow-elevation-1">
          <div className="flex items-center justify-between px-4 h-16">
            <button
              onClick={() => router.back()}
              className="w-12 h-12 hover:bg-surface-variant rounded-full flex items-center justify-center transition-colors"
              aria-label="Go back"
            >
              <svg className="w-6 h-6 text-on-surface" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-title-large text-on-surface">
              Add Item
            </h1>
            <div className="w-12"></div>
          </div>
        </header>

        {/* Main Content - ADHD: Single clear action */}
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-32 h-32 bg-primary-container rounded-full flex items-center justify-center text-6xl mb-6 mx-auto">
              📸
            </div>
            <h2 className="text-headline-medium text-on-surface mb-3">
              Take or Upload Photo
            </h2>
            <p className="text-body-large text-on-surface-variant mb-8">
              Just snap a photo and we'll handle the rest
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="space-y-4">
              {/* ADHD: Large, obvious primary action */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-6 bg-primary text-on-primary rounded-full text-label-large font-medium shadow-elevation-2 hover:shadow-elevation-3 active:scale-98 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Take Photo / Choose from Gallery
                </span>
              </button>
              
              {/* ADHD: Time estimate to reduce anxiety */}
              <div className="flex items-center justify-center gap-2 text-label-medium text-on-surface-variant">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Takes about 30 seconds</span>
              </div>
            </div>

            {/* ADHD: Reassurance - can edit later */}
            <div className="mt-8 p-4 bg-secondary-container rounded-2xl text-left">
              <p className="text-body-small text-on-secondary-container">
                <strong>💡 Don't worry:</strong> You can add more details or edit anything later. Just get it in the system first!
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top App Bar */}
      <header className="bg-surface-container shadow-elevation-1">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setStep('photo')}
            className="w-12 h-12 hover:bg-surface-variant rounded-full flex items-center justify-center transition-colors"
            disabled={loading}
            aria-label="Go back"
          >
            <svg className="w-6 h-6 text-on-surface" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-title-large text-on-surface">
            Add Details
          </h1>
          {/* ADHD: Always show save button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-full text-label-large font-medium shadow-elevation-1 hover:shadow-elevation-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-6">
        {/* Photo Preview */}
        {previewUrl && (
          <div className="p-6">
            <div className="aspect-square w-full max-w-sm mx-auto bg-surface-container-low rounded-3xl overflow-hidden shadow-elevation-1">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Optional Details Section */}
        <div className="px-6 space-y-6 max-w-sm mx-auto">
          {/* ADHD: Label that these are optional */}
          <div className="text-center pb-2">
            <h3 className="text-title-medium text-on-surface mb-1">
              Optional Details
            </h3>
            <p className="text-body-small text-on-surface-variant">
              AI will fill in missing info automatically
            </p>
          </div>

          <div>
            <label className="block text-label-large text-on-surface mb-2">
              Name your item
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Black T-shirt"
              className="w-full px-4 py-3.5 bg-surface-container-high border-2 border-outline rounded-2xl focus:border-primary focus:ring-0 text-body-large text-on-surface placeholder:text-on-surface-variant transition-colors"
            />
          </div>

          <div>
            <label className="block text-label-large text-on-surface mb-3">
              Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value === category ? '' : cat.value)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    category === cat.value
                      ? 'border-primary bg-primary-container shadow-elevation-1'
                      : 'border-outline bg-surface-container-high hover:bg-surface-container'
                  }`}
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className={`text-label-medium font-medium ${
                    category === cat.value ? 'text-on-primary-container' : 'text-on-surface'
                  }`}>
                    {cat.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-label-large text-on-surface mb-2">
              Brand
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Zara, H&M"
              className="w-full px-4 py-3.5 bg-surface-container-high border-2 border-outline rounded-2xl focus:border-primary focus:ring-0 text-body-large text-on-surface placeholder:text-on-surface-variant transition-colors"
            />
          </div>

          {/* ADHD: Quick skip option */}
          <button
            type="button"
            onClick={handleQuickSave}
            disabled={loading}
            className="w-full py-3 text-label-large text-primary font-medium hover:bg-primary/10 rounded-2xl transition-colors"
          >
            Skip and save now
          </button>

          {/* ADHD: Reassuring info panel */}
          <div className="p-4 bg-tertiary-container rounded-2xl">
            <div className="flex gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="text-label-large text-on-tertiary-container font-medium mb-1">
                  AI will help fill this in
                </p>
                <p className="text-body-small text-on-tertiary-container">
                  Our AI will automatically categorize and tag your item based on the photo. 
                  You can always edit details later!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
