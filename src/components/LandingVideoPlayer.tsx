'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface LandingVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl: string;
  title?: string;
  className?: string;
}

/**
 * LandingVideoPlayer - Video player HTML5 con thumbnail click-to-play
 *
 * Mostra la thumbnail, al click avvia il video MP4.
 * Un solo click per avviare.
 */
export function LandingVideoPlayer({
  videoUrl,
  thumbnailUrl,
  title = 'Video Vitaeology',
  className = '',
}: LandingVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    // Avvia il video dopo il render
    setTimeout(() => {
      videoRef.current?.play();
    }, 100);
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
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
          // HTML5 Video Player
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            playsInline
            preload="auto"
            src={videoUrl}
          >
            Il tuo browser non supporta il video.
          </video>
        )}
      </div>
    </div>
  );
}
