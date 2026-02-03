'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { getHeygenEmbedUrl } from '@/config/videos';

interface LandingVideoPlayerProps {
  heygenId: string;
  thumbnailUrl: string;
  title?: string;
  className?: string;
}

/**
 * LandingVideoPlayer - Video player con thumbnail click-to-play
 *
 * Mostra la thumbnail, al click carica l'iframe HeyGen.
 * Formato 16:9 per landing page.
 */
export function LandingVideoPlayer({
  heygenId,
  thumbnailUrl,
  title = 'Video Vitaeology',
  className = '',
}: LandingVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className={`relative w-full max-w-3xl mx-auto ${className}`}>
      {/* Aspect ratio 16:9 container */}
      <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
        {!isPlaying ? (
          // Thumbnail con play button
          <button
            onClick={handlePlay}
            className="relative w-full h-full group cursor-pointer"
            aria-label={`Riproduci ${title}`}
          >
            {/* Thumbnail image */}
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover"
              priority
            />

            {/* Overlay scuro al hover */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />

            {/* Play button centrale */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg">
                <Play className="w-8 h-8 md:w-10 md:h-10 text-petrol-600 ml-1" fill="currentColor" />
              </div>
            </div>
          </button>
        ) : (
          // HeyGen iframe player
          <iframe
            src={getHeygenEmbedUrl(heygenId)}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="encrypted-media; fullscreen;"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
