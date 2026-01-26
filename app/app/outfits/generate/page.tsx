'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Weather = 'hot' | 'warm' | 'cool' | 'cold' | 'rain' | 'snow';
type Vibe = 'dysphoria_safe' | 'confidence_boost' | 'dopamine' | 'neutral';
type TimeAvailable = 'quick' | 'normal';

export default function OutfitGeneratorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [panicMode, setPanicMode] = useState(false);
  const [weather, setWeather] = useState<Weather | undefined>();
  const [vibe, setVibe] = useState<Vibe | undefined>();
  const [occasion, setOccasion] = useState('');
  const [timeAvailable, setTimeAvailable] = useState<TimeAvailable>('normal');

  const handlePanicPick = async () => {
    setPanicMode(true);
    setLoading(true);

    try {
      const response = await fetch('/api/outfits/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          panicPick: true,
          weather,
          vibe,
          timeAvailable
        })
      });

      const data = await response.json();

      if (response.ok && data.outfit) {
        router.push(`/outfits/${data.outfit.id}`);
      } else {
        alert(data.error || 'Failed to generate panic pick');
      }
    } catch (error) {
      console.error('Error generating panic pick:', error);
      alert('Failed to generate panic pick');
    } finally {
      setLoading(false);
      setPanicMode(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/outfits/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather,
          vibe,
          occasion: occasion || undefined,
          timeAvailable,
          count: 3
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to outfits list
        router.push('/outfits');
      } else {
        alert(data.error || 'Failed to generate outfits');
      }
    } catch (error) {
      console.error('Error generating outfits:', error);
      alert('Failed to generate outfits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-surface-container shadow-elevation-2">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 hover:bg-surface-variant rounded-full flex items-center justify-center transition-colors"
            aria-label="Go back"
          >
            <svg className="w-6 h-6 text-on-surface" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-title-large text-on-surface">Generate Outfit</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto pb-32">
        {/* Panic Pick Button - Most Prominent */}
        <div className="mb-8 p-6 bg-error-container rounded-3xl shadow-elevation-2">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">⚡</div>
            <div className="flex-1">
              <h2 className="text-title-large text-on-error-container mb-2">Panic Pick</h2>
              <p className="text-body-medium text-on-error-container opacity-80 mb-4">
                Need to leave NOW? Get a working outfit instantly. No thinking required.
              </p>
              <button
                onClick={handlePanicPick}
                disabled={loading}
                className="w-full min-h-[56px] bg-error text-on-error rounded-full text-label-large font-medium shadow-elevation-2 hover:shadow-elevation-3 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {panicMode ? 'Picking...' : 'PANIC PICK - Go Now!'}
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-outline"></div>
          <span className="text-body-small text-on-surface-variant">or customize</span>
          <div className="flex-1 h-px bg-outline"></div>
        </div>

        {/* Weather Selection */}
        <div className="mb-8">
          <label className="block text-title-medium text-on-surface mb-3">
            Weather
            <span className="text-body-small text-on-surface-variant ml-2">(optional)</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'hot', icon: '🌞', label: 'Hot' },
              { value: 'warm', icon: '☀️', label: 'Warm' },
              { value: 'cool', icon: '🍂', label: 'Cool' },
              { value: 'cold', icon: '❄️', label: 'Cold' },
              { value: 'rain', icon: '🌧️', label: 'Rain' },
              { value: 'snow', icon: '⛄', label: 'Snow' }
            ].map(({ value, icon, label }) => (
              <button
                key={value}
                onClick={() => setWeather(weather === value ? undefined : value as Weather)}
                className={`min-h-[64px] rounded-2xl text-label-large font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                  weather === value
                    ? 'bg-primary text-on-primary shadow-elevation-2'
                    : 'bg-surface-variant text-on-surface-variant hover:shadow-elevation-1'
                }`}
              >
                <span className="text-2xl">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vibe Selection */}
        <div className="mb-8">
          <label className="block text-title-medium text-on-surface mb-3">
            How do you want to feel?
            <span className="text-body-small text-on-surface-variant ml-2">(optional)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'dysphoria_safe', icon: '🛡️', label: 'Dysphoria-safe', desc: 'Comfortable & safe' },
              { value: 'confidence_boost', icon: '💪', label: 'Confidence boost', desc: 'Feel powerful' },
              { value: 'dopamine', icon: '✨', label: 'Dopamine hit', desc: 'Fun & exciting' },
              { value: 'neutral', icon: '😌', label: 'Neutral', desc: 'Just functional' }
            ].map(({ value, icon, label, desc }) => (
              <button
                key={value}
                onClick={() => setVibe(vibe === value ? undefined : value as Vibe)}
                className={`min-h-[80px] rounded-2xl text-left p-4 transition-all duration-200 ${
                  vibe === value
                    ? 'bg-secondary text-on-secondary shadow-elevation-2'
                    : 'bg-surface-variant text-on-surface-variant hover:shadow-elevation-1'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="text-label-large font-medium">{label}</div>
                    <div className={`text-body-small ${vibe === value ? 'opacity-90' : 'opacity-70'}`}>
                      {desc}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Available */}
        <div className="mb-8">
          <label className="block text-title-medium text-on-surface mb-3">Time available</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTimeAvailable('quick')}
              className={`min-h-[64px] rounded-2xl text-label-large font-medium transition-all duration-200 ${
                timeAvailable === 'quick'
                  ? 'bg-tertiary text-on-tertiary shadow-elevation-2'
                  : 'bg-surface-variant text-on-surface-variant hover:shadow-elevation-1'
              }`}
            >
              ⚡ Quick (5 min)
            </button>
            <button
              onClick={() => setTimeAvailable('normal')}
              className={`min-h-[64px] rounded-2xl text-label-large font-medium transition-all duration-200 ${
                timeAvailable === 'normal'
                  ? 'bg-tertiary text-on-tertiary shadow-elevation-2'
                  : 'bg-surface-variant text-on-surface-variant hover:shadow-elevation-1'
              }`}
            >
              🕐 Normal (15+ min)
            </button>
          </div>
        </div>

        {/* Occasion (Optional) */}
        <div className="mb-8">
          <label htmlFor="occasion" className="block text-title-medium text-on-surface mb-3">
            Occasion
            <span className="text-body-small text-on-surface-variant ml-2">(optional)</span>
          </label>
          <input
            type="text"
            id="occasion"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="e.g., work, date, errands, staying home"
            className="w-full px-4 py-3 bg-surface-variant text-on-surface rounded-2xl text-body-large placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full min-h-[56px] bg-primary text-on-primary rounded-full text-label-large font-medium shadow-elevation-2 hover:shadow-elevation-3 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && !panicMode ? 'Generating...' : 'Generate 3 Outfits'}
        </button>

        <p className="text-body-small text-on-surface-variant text-center mt-4">
          This will take 10-30 seconds. You can continue browsing while we work.
        </p>
      </main>
    </div>
  );
}
