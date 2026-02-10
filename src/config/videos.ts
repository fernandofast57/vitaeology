/**
 * Configurazione Video Challenge
 *
 * Video hostati su Cloudflare R2 (egress gratuito)
 * Thumbnail locali in /public/videos/thumbnails/
 */

// Cloudflare R2 CDN base URL
const R2_CDN_URL = 'https://pub-2417d7e6729544f893d3a858ccab7ea2.r2.dev';

// Cache buster: incrementare quando si caricano nuovi video su R2
const VIDEO_VERSION = 'v=2';

// Video landing page (hostati su Cloudflare R2)
export const LANDING_VIDEOS = {
  homepage: {
    videoUrl: `${R2_CDN_URL}/homepage.mp4?${VIDEO_VERSION}`,
    thumbnail: '/videos/thumbnails/01_homepage_thumbnail.webp',
  },
  // Video per /beta - TODO: aggiornare quando pronto
  beta: {
    videoUrl: `${R2_CDN_URL}/beta.mp4?${VIDEO_VERSION}`,
    thumbnail: '/videos/thumbnails/01_homepage_thumbnail.webp', // Usa homepage come placeholder
  },
  leadership: {
    videoUrl: `${R2_CDN_URL}/leadership.mp4?${VIDEO_VERSION}`,
    thumbnail: '/videos/thumbnails/02_leadership_thumbnail.webp',
  },
  ostacoli: {
    videoUrl: `${R2_CDN_URL}/ostacoli.mp4?${VIDEO_VERSION}`,
    thumbnail: '/videos/thumbnails/03_ostacoli_thumbnail.webp',
  },
  microfelicita: {
    videoUrl: `${R2_CDN_URL}/microfelicita.mp4?${VIDEO_VERSION}`,
    thumbnail: '/videos/thumbnails/04_microfelicita_thumbnail.webp',
  },
};

// Video delle challenge (7 giorni ciascuna) - hostati su Cloudflare R2
export const CHALLENGE_VIDEOS = {
  leadership: {
    hero: `${R2_CDN_URL}/leadership.mp4?${VIDEO_VERSION}`,
    days: [
      `${R2_CDN_URL}/leadership-day-1.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/leadership-day-2.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/leadership-day-3.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/leadership-day-4.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/leadership-day-5.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/leadership-day-6.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/leadership-day-7.mp4?${VIDEO_VERSION}`,
    ],
  },
  ostacoli: {
    hero: `${R2_CDN_URL}/ostacoli.mp4?${VIDEO_VERSION}`,
    days: [
      `${R2_CDN_URL}/ostacoli-day-1.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/ostacoli-day-2.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/ostacoli-day-3.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/ostacoli-day-4.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/ostacoli-day-5.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/ostacoli-day-6.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/ostacoli-day-7.mp4?${VIDEO_VERSION}`,
    ],
  },
  microfelicita: {
    hero: `${R2_CDN_URL}/microfelicita.mp4?${VIDEO_VERSION}`,
    days: [
      `${R2_CDN_URL}/microfelicita-day-1.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/microfelicita-day-2.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/microfelicita-day-3.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/microfelicita-day-4.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/microfelicita-day-5.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/microfelicita-day-6.mp4?${VIDEO_VERSION}`,
      `${R2_CDN_URL}/microfelicita-day-7.mp4?${VIDEO_VERSION}`,
    ],
  },
};

// Helper per ottenere video di un giorno specifico
export function getChallengeVideo(
  challengeType: keyof typeof CHALLENGE_VIDEOS,
  dayNumber: number
): string | undefined {
  const challenge = CHALLENGE_VIDEOS[challengeType];
  if (!challenge) return undefined;

  // dayNumber è 1-based, array è 0-based
  if (dayNumber < 1 || dayNumber > 7) return undefined;
  return challenge.days[dayNumber - 1];
}

// Helper per ottenere video hero (landing page della challenge)
export function getHeroVideo(
  challengeType: keyof typeof CHALLENGE_VIDEOS
): string | undefined {
  return CHALLENGE_VIDEOS[challengeType]?.hero;
}
