'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/lib/theme';

/**
 * Settings Page - Export/Import, Dark Mode, Reminders
 * 
 * Design Decisions (M3 + ADHD-optimized):
 * - One primary action per section (export/import clearly separated)
 * - Clear warnings for destructive actions (replace mode)
 * - Progress indicators for long operations
 * - Forgiving UX (undo via export before import-replace)
 * - Time estimates shown
 * - No hidden gestures, all actions explicit
 */

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [laundryReminderDays, setLaundryReminderDays] = useState(3);
  const [laundryStatus, setLaundryStatus] = useState<any>(null);

  useEffect(() => {
    // Load laundry reminder settings
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('laundryReminderDays');
      if (stored) {
        setLaundryReminderDays(parseInt(stored));
      }
    }
  }, []);

  useEffect(() => {
    // Load laundry status when reminderDays changes
    if (laundryReminderDays > 0) {
      checkLaundryStatus();
    }
  }, [laundryReminderDays]);

  const checkLaundryStatus = async () => {
    try {
      const response = await fetch(`/api/reminders?daysThreshold=${laundryReminderDays}`);
      const data = await response.json();
      setLaundryStatus(data);
    } catch (error) {
      console.error('Error checking laundry:', error);
    }
  };

  const saveLaundryReminderDays = (days: number) => {
    setLaundryReminderDays(days);
    if (typeof window !== 'undefined') {
      localStorage.setItem('laundryReminderDays', days.toString());
    }
  };

  async function handleExport() {
    try {
      setExporting(true);
      setError(null);

      const response = await fetch('/api/export', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download the ZIP file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wardrobe-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export wardrobe. Please try again.');
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  async function handleImport() {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }

    try {
      setImporting(true);
      setError(null);
      setImportResult(null);

      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('mode', importMode);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data);
      setImportFile(null);
      
      // Reload page after successful import
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to import backup. Please check the file and try again.');
      console.error(err);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top app bar */}
      <header className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-full hover:bg-surface-variant transition-colors"
              aria-label="Back to home"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-headline-medium text-on-surface">Export & Import</h1>
              <p className="text-body-small text-on-surface-variant">
                Backup and restore your wardrobe
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Error message */}
        {error && (
          <div className="bg-error-container text-on-error-container rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success message */}
        {importResult && (
          <div className="bg-primary-container text-on-primary-container rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-medium">Import Successful!</p>
              <p className="text-sm mt-2">
                Imported {importResult.imported.items} items, {importResult.imported.outfits} outfits, 
                {' '}{importResult.imported.tags} tags, and {importResult.imported.images} images.
              </p>
              <p className="text-sm mt-1">Redirecting to home...</p>
            </div>
          </div>
        )}

        {/* Dark Mode Section */}
        <div className="bg-surface-container rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-tertiary-container rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              🌙
            </div>
            <div className="flex-1">
              <h2 className="text-title-large text-on-surface mb-2">Dark Mode</h2>
              <p className="text-body-medium text-on-surface-variant mb-4">
                Choose your preferred color scheme
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-primary text-on-primary shadow-elevation-2'
                      : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  ☀️ Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-primary text-on-primary shadow-elevation-2'
                      : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  🌙 Dark
                </button>
                <button
                  onClick={() => setTheme('auto')}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    theme === 'auto'
                      ? 'bg-primary text-on-primary shadow-elevation-2'
                      : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  🔄 Auto
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Laundry Reminder Section */}
        <div className="bg-surface-container rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              🧺
            </div>
            <div className="flex-1">
              <h2 className="text-title-large text-on-surface mb-2">Laundry Reminders</h2>
              <p className="text-body-medium text-on-surface-variant mb-4">
                Get notified when items have been in laundry too long
              </p>
              <div className="mb-4">
                <label className="block text-label-large text-on-surface mb-2">
                  Remind me after (days):
                </label>
                <div className="flex gap-3">
                  {[1, 3, 5, 7].map(days => (
                    <button
                      key={days}
                      onClick={() => saveLaundryReminderDays(days)}
                      className={`px-6 py-3 rounded-full font-medium transition-all ${
                        laundryReminderDays === days
                          ? 'bg-primary text-on-primary shadow-elevation-2'
                          : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {days} {days === 1 ? 'day' : 'days'}
                    </button>
                  ))}
                </div>
              </div>
              {laundryStatus && (
                <div className="mt-4 p-4 bg-surface rounded-xl">
                  <p className="text-body-medium text-on-surface mb-2">
                    <strong>{laundryStatus.total}</strong> items in laundry
                  </p>
                  {laundryStatus.overdue > 0 && (
                    <p className="text-body-medium text-error">
                      <strong>{laundryStatus.overdue}</strong> items overdue (&gt;{laundryStatus.threshold} days)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-surface-container rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              📦
            </div>
            <div className="flex-1">
              <h2 className="text-title-large text-on-surface mb-2">Export Wardrobe</h2>
              <p className="text-body-medium text-on-surface-variant mb-4">
                Download a complete backup of your wardrobe as a ZIP file. Includes all items, images, outfits, and tags.
              </p>
              <ul className="text-body-small text-on-surface-variant space-y-1 mb-6">
                <li>• Items and metadata (JSON)</li>
                <li>• All original images</li>
                <li>• Outfits and configurations</li>
                <li>• Spreadsheet-friendly catalog (CSV)</li>
              </ul>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-6 py-3 bg-primary text-on-primary rounded-full text-label-large font-medium shadow-elevation-1 hover:shadow-elevation-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Exporting...</span>
                  </span>
                ) : (
                  'Export Wardrobe'
                )}
              </button>
              {exporting && (
                <p className="text-body-small text-on-surface-variant mt-2">
                  ⏱️ This may take 10-30 seconds depending on the number of images...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-surface-container rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              📥
            </div>
            <div className="flex-1">
              <h2 className="text-title-large text-on-surface mb-2">Import Wardrobe</h2>
              <p className="text-body-medium text-on-surface-variant mb-4">
                Restore your wardrobe from a backup ZIP file.
              </p>

              {/* Import mode selection */}
              <div className="mb-6">
                <p className="text-label-large text-on-surface mb-3">Import Mode:</p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={(e) => setImportMode(e.target.value as 'merge')}
                      className="mt-1 w-5 h-5 accent-primary"
                    />
                    <div>
                      <p className="text-body-large text-on-surface font-medium group-hover:text-primary transition-colors">
                        Merge (Add to existing)
                      </p>
                      <p className="text-body-small text-on-surface-variant">
                        Safe option. Adds imported items to your current wardrobe without removing anything.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={(e) => setImportMode(e.target.value as 'replace')}
                      className="mt-1 w-5 h-5 accent-error"
                    />
                    <div>
                      <p className="text-body-large text-on-surface font-medium group-hover:text-error transition-colors">
                        Replace (Clear existing) ⚠️
                      </p>
                      <p className="text-body-small text-on-surface-variant">
                        <strong className="text-error">Destructive!</strong> Deletes all current items first, then imports the backup. 
                        Export your current wardrobe first if you want to keep it.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* File selection */}
              <div className="mb-4">
                <label className="block mb-2 text-label-large text-on-surface">
                  Select backup file:
                </label>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="block w-full text-body-medium text-on-surface
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-label-large file:font-medium
                    file:bg-surface-variant file:text-on-surface-variant
                    hover:file:bg-surface-container-high
                    file:cursor-pointer"
                />
                {importFile && (
                  <p className="text-body-small text-on-surface-variant mt-2">
                    Selected: {importFile.name} ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <button
                onClick={handleImport}
                disabled={importing || !importFile}
                className={`px-6 py-3 rounded-full text-label-large font-medium shadow-elevation-1 hover:shadow-elevation-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  importMode === 'replace'
                    ? 'bg-error text-on-error'
                    : 'bg-secondary text-on-secondary'
                }`}
              >
                {importing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    <span>Importing...</span>
                  </span>
                ) : (
                  `Import Wardrobe (${importMode})`
                )}
              </button>
              {importing && (
                <p className="text-body-small text-on-surface-variant mt-2">
                  ⏱️ This may take 30-60 seconds depending on file size...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Help section - ADHD-optimized: progressive disclosure */}
        <div className="bg-surface-container rounded-2xl p-6">
          <h2 className="text-title-large text-on-surface mb-4">💡 Tips</h2>
          <div className="space-y-3 text-body-medium text-on-surface-variant">
            <p>
              <strong className="text-on-surface">Regular backups:</strong> Export your wardrobe monthly or after making significant changes.
            </p>
            <p>
              <strong className="text-on-surface">Safe restore:</strong> Use "Merge" mode to try a backup without losing your current data.
            </p>
            <p>
              <strong className="text-on-surface">Before "Replace":</strong> Always export your current wardrobe first as a safety backup.
            </p>
            <p>
              <strong className="text-on-surface">File location:</strong> Store backups in multiple safe locations (cloud storage, external drive).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
