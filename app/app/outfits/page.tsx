'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OutfitItem {
  itemId: string;
  role: string;
  item: {
    id: string;
    title?: string;
    category?: string;
    images: Array<{
      id: string;
      kind: string;
    }>;
  };
}

interface Outfit {
  id: string;
  title?: string;
  notes?: string;
  rating: 'up' | 'down' | 'neutral';
  weather?: string;
  vibe?: string;
  occasion?: string;
  timeAvailable?: string;
  explanation?: string;
  items: OutfitItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Outfit History Page - Browse all saved outfits
 * 
 * Material Design 3 + ADHD-optimized principles:
 * - Responsive grid layout with clear cards
 * - Filter by rating for quick access
 * - Thumbnails show outfit at a glance
 * - Inline editing for name/notes
 * - Delete with confirmation
 * - Clear visual hierarchy
 */
export default function OutfitsPage() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  const [editingOutfit, setEditingOutfit] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadOutfits();
  }, [ratingFilter]);

  const loadOutfits = async () => {
    try {
      const url = new URL('/api/outfits', window.location.origin);
      if (ratingFilter) {
        url.searchParams.append('rating', ratingFilter);
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load outfits');
      
      const data = await response.json();
      setOutfits(data.outfits || []);
    } catch (error) {
      console.error('Error loading outfits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (outfitId: string, newRating: 'up' | 'down' | 'neutral') => {
    try {
      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating }),
      });

      if (!response.ok) throw new Error('Failed to update rating');
      await loadOutfits();
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Failed to update rating. Please try again.');
    }
  };

  const startEdit = (outfit: Outfit) => {
    setEditingOutfit(outfit.id);
    setEditTitle(outfit.title || '');
    setEditNotes(outfit.notes || '');
  };

  const saveEdit = async (outfitId: string) => {
    try {
      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          notes: editNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      setEditingOutfit(null);
      await loadOutfits();
    } catch (error) {
      console.error('Error saving outfit:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleDelete = async (outfitId: string) => {
    if (deleteConfirm !== outfitId) {
      setDeleteConfirm(outfitId);
      return;
    }

    try {
      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      setDeleteConfirm(null);
      await loadOutfits();
    } catch (error) {
      console.error('Error deleting outfit:', error);
      alert('Failed to delete outfit. Please try again.');
    }
  };

  const getThumbnailUrl = (item: OutfitItem['item']) => {
    const thumbnailImage = item.images.find(img => img.kind === 'thumbnail' || img.kind === 'ai_catalog' || img.kind === 'original_main');
    return thumbnailImage ? `/api/images/${thumbnailImage.id}` : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-on-surface-variant">Loading outfits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-container shadow-elevation-2">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-full hover:bg-surface-variant transition-colors"
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">Outfit History</h1>
            <button
              onClick={() => router.push('/outfits/generate')}
              className="px-4 py-2 bg-primary text-on-primary rounded-full font-medium text-sm hover:shadow-elevation-2 transition-all"
            >
              + New
            </button>
          </div>

          {/* Rating Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setRatingFilter(null)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                ratingFilter === null
                  ? 'bg-primary text-on-primary shadow-elevation-2'
                  : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRatingFilter('up')}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                ratingFilter === 'up'
                  ? 'bg-primary text-on-primary shadow-elevation-2'
                  : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              👍 Liked
            </button>
            <button
              onClick={() => setRatingFilter('down')}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                ratingFilter === 'down'
                  ? 'bg-primary text-on-primary shadow-elevation-2'
                  : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              👎 Disliked
            </button>
            <button
              onClick={() => setRatingFilter('neutral')}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                ratingFilter === 'neutral'
                  ? 'bg-primary text-on-primary shadow-elevation-2'
                  : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              😐 Neutral
            </button>
          </div>
        </div>
      </header>

      {/* Outfits Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {outfits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-on-surface-variant mb-4">No outfits yet</p>
            <button
              onClick={() => router.push('/outfits/generate')}
              className="px-6 py-3 bg-primary text-on-primary rounded-full font-medium hover:shadow-elevation-2 transition-all"
            >
              Generate Your First Outfit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.map(outfit => (
              <div
                key={outfit.id}
                className="bg-surface-container rounded-3xl shadow-elevation-1 overflow-hidden hover:shadow-elevation-3 transition-shadow"
              >
                {/* Outfit Items Thumbnails */}
                <div className="grid grid-cols-3 gap-1 p-4 bg-surface-variant">
                  {outfit.items.slice(0, 6).map((outfitItem, idx) => (
                    <div key={idx} className="aspect-square bg-surface rounded-xl overflow-hidden">
                      {getThumbnailUrl(outfitItem.item) ? (
                        <img
                          src={getThumbnailUrl(outfitItem.item)!}
                          alt={outfitItem.item.title || outfitItem.role}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                          <span className="text-2xl">👕</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {outfit.items.length > 6 && (
                    <div className="aspect-square bg-surface rounded-xl flex items-center justify-center">
                      <span className="text-sm text-on-surface-variant">+{outfit.items.length - 6}</span>
                    </div>
                  )}
                </div>

                {/* Outfit Details */}
                <div className="p-4 space-y-3">
                  {/* Title */}
                  {editingOutfit === outfit.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Outfit name..."
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <h3 className="font-semibold text-lg">
                      {outfit.title || `Outfit ${new Date(outfit.createdAt).toLocaleDateString()}`}
                    </h3>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 text-sm">
                    {outfit.weather && (
                      <span className="px-2 py-1 bg-tertiary-container text-on-tertiary-container rounded-full">
                        {outfit.weather}
                      </span>
                    )}
                    {outfit.vibe && (
                      <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full">
                        {outfit.vibe.replace(/_/g, ' ')}
                      </span>
                    )}
                    {outfit.occasion && (
                      <span className="px-2 py-1 bg-primary-container text-on-primary-container rounded-full">
                        {outfit.occasion}
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {editingOutfit === outfit.id ? (
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Notes..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ) : outfit.notes ? (
                    <p className="text-sm text-on-surface-variant">{outfit.notes}</p>
                  ) : null}

                  {/* Explanation */}
                  {outfit.explanation && editingOutfit !== outfit.id && (
                    <p className="text-sm text-on-surface-variant line-clamp-2">
                      {outfit.explanation}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2 pt-2 border-t border-outline/20">
                    <button
                      onClick={() => handleRatingChange(outfit.id, 'up')}
                      className={`p-2 rounded-full transition-all ${
                        outfit.rating === 'up'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      aria-label="Like"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleRatingChange(outfit.id, 'neutral')}
                      className={`p-2 rounded-full transition-all ${
                        outfit.rating === 'neutral'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      aria-label="Neutral"
                    >
                      😐
                    </button>
                    <button
                      onClick={() => handleRatingChange(outfit.id, 'down')}
                      className={`p-2 rounded-full transition-all ${
                        outfit.rating === 'down'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      aria-label="Dislike"
                    >
                      👎
                    </button>

                    <div className="flex-1"></div>

                    {/* Edit/Save Button */}
                    {editingOutfit === outfit.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(outfit.id)}
                          className="px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-medium hover:shadow-elevation-2 transition-all"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingOutfit(null)}
                          className="px-4 py-2 bg-surface-variant text-on-surface-variant rounded-full text-sm hover:bg-surface-container-high transition-all"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(outfit)}
                          className="p-2 rounded-full bg-surface-variant text-on-surface-variant hover:bg-surface-container-high transition-all"
                          aria-label="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(outfit.id)}
                          className={`p-2 rounded-full transition-all ${
                            deleteConfirm === outfit.id
                              ? 'bg-error text-on-error'
                              : 'bg-surface-variant text-on-surface-variant hover:bg-error/10 hover:text-error'
                          }`}
                          aria-label="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  {deleteConfirm === outfit.id && (
                    <div className="text-sm text-error text-center">
                      Click delete again to confirm
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
