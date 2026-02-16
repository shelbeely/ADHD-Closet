'use client';

import { useRouter } from 'next/navigation';

export default function AddItemButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/items/new')}
      className="md3-fab fixed bottom-6 right-6 z-50 md3-state-layer group"
      style={{
        backgroundColor: 'var(--md-sys-color-primary-container)',
        color: 'var(--md-sys-color-on-primary-container)',
      }}
      aria-label="Add new item"
    >
      <svg
        className="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4v16m8-8H4"
        />
      </svg>
      {/* Tooltip for clarity - ADHD optimization */}
      <span 
        className="absolute bottom-full mb-3 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none text-body-small font-medium shadow-elevation-2"
        style={{
          backgroundColor: 'var(--md-sys-color-inverse-surface)',
          color: 'var(--md-sys-color-inverse-on-surface)',
        }}
      >
        Add item (~30 sec)
      </span>
    </button>
  );
}
