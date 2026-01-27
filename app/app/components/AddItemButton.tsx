'use client';

import { useRouter } from 'next/navigation';

export default function AddItemButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/items/new')}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-primary text-on-primary rounded-full shadow-elevation-3 hover:shadow-elevation-4 active:scale-95 transition-all duration-200 flex items-center justify-center group"
      aria-label="Add new item"
    >
      <svg
        className="w-8 h-8 transition-transform group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M12 4v16m8-8H4"
        />
      </svg>
      {/* Tooltip for clarity */}
      <span className="absolute bottom-full mb-2 px-3 py-2 bg-inverse-surface text-inverse-on-surface text-body-small rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-elevation-2">
        Add item (30 sec)
      </span>
    </button>
  );
}
