'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

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

interface OutfitImage {
  id: string;
  kind: string;
  filePath: string;
  createdAt: string;
}

interface AIJob {
  id: string;
  type: string;
  status: string;
  createdAt: string;
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
  images?: OutfitImage[];
  aiJobs?: AIJob[];
  createdAt: string;
  updatedAt: string;
}

export default function OutfitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const outfitId = params.id as string;

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingVisualization, setGeneratingVisualization] = useState(false);
  const [selectedVisualizationType, setSelectedVisualizationType] = useState<'outfit_board' | 'person_wearing'>('outfit_board');
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);

  useEffect(() => {
    loadOutfit();
  }, [outfitId]);

  // Poll for job completion
  useEffect(() => {
    if (!pollingJobId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ai/jobs?outfitId=${outfitId}&type=generate_outfit_visualization`);
        if (!response.ok) return;

        const data = await response.json();
        const job = data.jobs?.find((j: AIJob) => j.id === pollingJobId);

        if (job && (job.status === 'succeeded' || job.status === 'failed')) {
          setPollingJobId(null);
          setGeneratingVisualization(false);
          await loadOutfit();
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pollingJobId, outfitId]);

  const loadOutfit = async () => {
    try {
      const response = await fetch(`/api/outfits/${outfitId}`);
      if (!response.ok) throw new Error('Failed to load outfit');

      const data = await response.json();
      setOutfit(data);
    } catch (error) {
      console.error('Error loading outfit:', error);
      alert('Failed to load outfit');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVisualization = async () => {
    setGeneratingVisualization(true);

    try {
      const response = await fetch(`/api/outfits/${outfitId}/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visualizationType: selectedVisualizationType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPollingJobId(data.aiJobId);
      } else {
        alert(data.error || 'Failed to generate visualization');
        setGeneratingVisualization(false);
      }
    } catch (error) {
      console.error('Error generating visualization:', error);
      alert('Failed to generate visualization');
      setGeneratingVisualization(false);
    }
  };

  const getThumbnailUrl = (item: OutfitItem['item']) => {
    const thumbnailImage = item.images.find(img => 
      img.kind === 'thumbnail' || img.kind === 'ai_catalog' || img.kind === 'original_main'
    );
    return thumbnailImage ? `/api/images/${thumbnailImage.id}` : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-on-surface-variant">Loading outfit...</p>
        </div>
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-on-surface-variant mb-4">Outfit not found</p>
          <button
            onClick={() => router.push('/outfits')}
            className="px-6 py-3 bg-primary text-on-primary rounded-full font-medium hover:shadow-elevation-2 transition-all"
          >
            Back to Outfits
          </button>
        </div>
      </div>
    );
  }

  const outfitBoardImages = outfit.images?.filter(img => img.kind === 'outfit_board') || [];
  const personWearingImages = outfit.images?.filter(img => img.kind === 'outfit_person_wearing') || [];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-surface-container shadow-elevation-2">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => router.push('/outfits')}
            className="w-10 h-10 hover:bg-surface-variant rounded-full flex items-center justify-center transition-colors"
            aria-label="Go back"
          >
            <svg className="w-6 h-6 text-on-surface" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-title-large text-on-surface">
            {outfit.title || `Outfit Details`}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="p-4 max-w-5xl mx-auto">
        {/* Outfit Metadata */}
        <div className="mb-6 p-6 bg-surface-container rounded-3xl shadow-elevation-1">
          <h2 className="text-headline-medium text-on-surface mb-4">
            {outfit.title || `Outfit ${new Date(outfit.createdAt).toLocaleDateString()}`}
          </h2>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {outfit.weather && (
              <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-sm">
                🌤️ {outfit.weather}
              </span>
            )}
            {outfit.vibe && (
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-sm">
                ✨ {outfit.vibe.replace(/_/g, ' ')}
              </span>
            )}
            {outfit.occasion && (
              <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-sm">
                📍 {outfit.occasion}
              </span>
            )}
          </div>

          {/* Explanation */}
          {outfit.explanation && (
            <p className="text-body-large text-on-surface-variant mb-4">
              {outfit.explanation}
            </p>
          )}

          {outfit.notes && (
            <div className="mt-4 p-4 bg-surface-variant rounded-2xl">
              <p className="text-label-small text-on-surface-variant mb-1">Notes</p>
              <p className="text-body-medium text-on-surface">{outfit.notes}</p>
            </div>
          )}
        </div>

        {/* AI Visualizations Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-headline-small text-on-surface">AI Visualizations</h2>
          </div>

          {/* Generate Visualization Controls */}
          <div className="mb-6 p-6 bg-primary-container rounded-3xl">
            <h3 className="text-title-medium text-on-primary-container mb-3">
              Generate New Visualization
            </h3>
            <p className="text-body-small text-on-primary-container opacity-80 mb-4">
              Create an AI-generated outfit board or see the outfit on a person
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setSelectedVisualizationType('outfit_board')}
                disabled={generatingVisualization}
                className={`min-h-[72px] rounded-2xl text-left p-4 transition-all duration-200 ${
                  selectedVisualizationType === 'outfit_board'
                    ? 'bg-primary text-on-primary shadow-elevation-2'
                    : 'bg-surface text-on-surface hover:shadow-elevation-1'
                } disabled:opacity-50`}
              >
                <div className="text-2xl mb-1">📋</div>
                <div className="text-label-large font-medium">Outfit Board</div>
                <div className="text-body-small opacity-70">Flat lay style</div>
              </button>

              <button
                onClick={() => setSelectedVisualizationType('person_wearing')}
                disabled={generatingVisualization}
                className={`min-h-[72px] rounded-2xl text-left p-4 transition-all duration-200 ${
                  selectedVisualizationType === 'person_wearing'
                    ? 'bg-primary text-on-primary shadow-elevation-2'
                    : 'bg-surface text-on-surface hover:shadow-elevation-1'
                } disabled:opacity-50`}
              >
                <div className="text-2xl mb-1">👤</div>
                <div className="text-label-large font-medium">Person Wearing</div>
                <div className="text-body-small opacity-70">See it styled</div>
              </button>
            </div>

            <button
              onClick={handleGenerateVisualization}
              disabled={generatingVisualization}
              className="w-full min-h-[56px] bg-primary text-on-primary rounded-full text-label-large font-medium shadow-elevation-2 hover:shadow-elevation-3 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingVisualization ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Visualization'
              )}
            </button>

            <p className="text-body-small text-on-primary-container text-center mt-3 opacity-70">
              This may take 30-60 seconds
            </p>
          </div>

          {/* Existing Visualizations */}
          {(outfitBoardImages.length > 0 || personWearingImages.length > 0) && (
            <div className="space-y-6">
              {outfitBoardImages.length > 0 && (
                <div>
                  <h3 className="text-title-medium text-on-surface mb-3">📋 Outfit Boards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {outfitBoardImages.map(img => (
                      <div key={img.id} className="bg-surface-container rounded-3xl overflow-hidden shadow-elevation-1">
                        <img
                          src={`/api/outfit-images/${img.id}`}
                          alt="Outfit board"
                          className="w-full h-auto"
                        />
                        <div className="p-3 text-body-small text-on-surface-variant">
                          Generated {new Date(img.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {personWearingImages.length > 0 && (
                <div>
                  <h3 className="text-title-medium text-on-surface mb-3">👤 Person Wearing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personWearingImages.map(img => (
                      <div key={img.id} className="bg-surface-container rounded-3xl overflow-hidden shadow-elevation-1">
                        <img
                          src={`/api/outfit-images/${img.id}`}
                          alt="Person wearing outfit"
                          className="w-full h-auto"
                        />
                        <div className="p-3 text-body-small text-on-surface-variant">
                          Generated {new Date(img.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {outfitBoardImages.length === 0 && personWearingImages.length === 0 && !generatingVisualization && (
            <div className="text-center py-8 text-on-surface-variant">
              <p className="text-body-large mb-2">No visualizations yet</p>
              <p className="text-body-small">Generate your first visualization above!</p>
            </div>
          )}
        </div>

        {/* Outfit Items */}
        <div className="mb-6">
          <h2 className="text-headline-small text-on-surface mb-4">Items in This Outfit</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {outfit.items.map((outfitItem) => (
              <div
                key={outfitItem.itemId}
                className="bg-surface-container rounded-2xl overflow-hidden shadow-elevation-1 hover:shadow-elevation-3 transition-shadow cursor-pointer"
                onClick={() => router.push(`/items/${outfitItem.item.id}`)}
              >
                <div className="aspect-square bg-surface-variant">
                  {getThumbnailUrl(outfitItem.item) ? (
                    <img
                      src={getThumbnailUrl(outfitItem.item)!}
                      alt={outfitItem.item.title || outfitItem.role}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                      <span className="text-4xl">👕</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-label-small text-on-surface-variant mb-1">
                    {outfitItem.role}
                  </div>
                  <div className="text-body-medium text-on-surface line-clamp-2">
                    {outfitItem.item.title || outfitItem.item.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
