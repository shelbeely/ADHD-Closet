'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AddItemButton() {
  const router = useRouter();
  const [isExtended, setIsExtended] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show label when scrolling up, hide when scrolling down
      // ADHD-optimized: Less visual noise when browsing, clear CTA when ready to act
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsExtended(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsExtended(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <button
      onClick={() => router.push('/items/new')}
      className={`md3-fab md3-ripple fixed bottom-6 right-6 z-50 md3-state-layer group transition-all duration-300 ${
        isExtended ? 'md3-fab-extended' : ''
      }`}
      style={{
        backgroundColor: 'var(--md-sys-color-primary-container)',
        color: 'var(--md-sys-color-on-primary-container)',
        paddingLeft: isExtended ? '16px' : undefined,
        paddingRight: isExtended ? '20px' : undefined,
        gap: isExtended ? '12px' : undefined,
      }}
      aria-label="Add new item"
    >
      <svg
        className="w-6 h-6 transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
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
      
      {/* Extended label - ADHD optimization: Clear action text when visible */}
      <span 
        className={`text-label-large font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${
          isExtended ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'
        }`}
      >
        Add Item
      </span>
      
      {/* Tooltip for collapsed state - ADHD optimization */}
      {!isExtended && (
        <span 
          className="absolute bottom-full mb-3 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none text-body-small font-medium shadow-elevation-2"
          style={{
            backgroundColor: 'var(--md-sys-color-inverse-surface)',
            color: 'var(--md-sys-color-inverse-on-surface)',
          }}
        >
          Add item (~30 sec)
        </span>
      )}
    </button>
  );
}
