'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[480px] shrink-0">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                selectedIndex === idx
                  ? 'border-brand-600 ring-2 ring-amber-500/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Image src={img} alt={`${title} thumbnail ${idx}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image View */}
      <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden border-2 border-brand-800/20 bg-slate-50 shadow-sm">
        <Image
          src={displayImages[selectedIndex]}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in"
        />
      </div>
    </div>
  );
}
