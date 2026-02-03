/**
 * Privacy Settings Component
 * 
 * Allows users to control their data sharing and analytics preferences.
 * ADHD-friendly with clear explanations and one setting at a time.
 */

'use client';

import { useState } from 'react';
import { PrivacySetting } from '@prisma/client';

interface PrivacySettingsProps {
  userId: string;
  initialSettings: {
    analyticsOptIn: boolean;
    dataSharing: PrivacySetting;
    adConsent: boolean;
  };
  onSave?: () => void;
}

export function PrivacySettings({
  userId,
  initialSettings,
  onSave,
}: PrivacySettingsProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    
    try {
      const response = await fetch('/api/user/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...settings,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      setSaved(true);
      if (onSave) onSave();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          🔒 Your Privacy Matters
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Twin Style is built with privacy first. You control what data is collected and how it's used.
          All settings default to OFF for maximum privacy.
        </p>
      </div>
      
      {/* Analytics Opt-In */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            id="analyticsOptIn"
            checked={settings.analyticsOptIn}
            onChange={(e) => setSettings({ ...settings, analyticsOptIn: e.target.checked })}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <div className="flex-1">
            <label htmlFor="analyticsOptIn" className="font-medium text-gray-900 dark:text-white cursor-pointer">
              Help improve Twin Style with usage analytics
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Allow us to collect anonymous usage data to improve features. We track things like:
              which features you use, how often you create outfits, and performance metrics.
              <strong> We never collect personal photos, item details, or sensitive outfit preferences.</strong>
            </p>
          </div>
        </div>
      </div>
      
      {/* Data Sharing Level */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Data Sharing Level
        </h4>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="dataSharing"
              value="opt_out"
              checked={settings.dataSharing === 'opt_out'}
              onChange={(e) => setSettings({ ...settings, dataSharing: e.target.value as PrivacySetting })}
              className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Don't Share (Default) ✅
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                No data leaves your device except what's needed to run the app.
              </div>
            </div>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="dataSharing"
              value="anonymized_only"
              checked={settings.dataSharing === 'anonymized_only'}
              onChange={(e) => setSettings({ ...settings, dataSharing: e.target.value as PrivacySetting })}
              className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Share Anonymous Trends
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Help fashion sustainability research with anonymized aggregate data
                (like "users wear items 2.3x before washing" or "earth tones trending up 40%").
                No personally identifiable information included.
              </div>
            </div>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="dataSharing"
              value="all_data"
              checked={settings.dataSharing === 'all_data'}
              onChange={(e) => setSettings({ ...settings, dataSharing: e.target.value as PrivacySetting })}
              className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Full Data Sharing
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Share detailed usage data to get personalized recommendations and insights.
                We still never share your photos or sensitive preferences.
              </div>
            </div>
          </label>
        </div>
      </div>
      
      {/* Ad Consent (only if on ad-supported tier) */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            id="adConsent"
            checked={settings.adConsent}
            onChange={(e) => setSettings({ ...settings, adConsent: e.target.checked })}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <div className="flex-1">
            <label htmlFor="adConsent" className="font-medium text-gray-900 dark:text-white cursor-pointer">
              Personalized ad experience (ad-supported tier only)
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Allow advertisers to show you relevant fashion ads based on your interests.
              If disabled, you'll see random ads instead (same number of ads, less relevant).
              <strong> Upgrade to Premium for an ad-free experience.</strong>
            </p>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
        >
          {saving ? 'Saving...' : 'Save Privacy Settings'}
        </button>
        
        {saved && (
          <span className="text-green-600 dark:text-green-400 font-medium">
            ✓ Settings saved
          </span>
        )}
      </div>
      
      {/* GDPR Rights */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Your Rights
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• <strong>Export your data:</strong> Download all your wardrobe data anytime</li>
          <li>• <strong>Delete your account:</strong> Permanently remove all your data</li>
          <li>• <strong>Access transparency:</strong> See exactly what data we collect</li>
          <li>• <strong>Change your mind:</strong> Update these settings anytime</li>
        </ul>
      </div>
    </div>
  );
}
