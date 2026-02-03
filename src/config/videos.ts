/**
 * Configurazione Video Challenge
 *
 * Video hostati su Cloudflare R2 (egress gratuito)
 * Thumbnail locali in /public/videos/thumbnails/
 */

// Cloudflare R2 CDN base URL
const R2_CDN_URL = 'https://pub-2417d7e6729544f893d3a858ccab7ea2.r2.dev';

// Video landing page (hostati su Cloudflare R2)
export const LANDING_VIDEOS = {
  homepage: {
    videoUrl: `${R2_CDN_URL}/homepage.mp4`,
    thumbnail: '/videos/thumbnails/01_homepage_thumbnail.png',
  },
  leadership: {
    videoUrl: `${R2_CDN_URL}/leadership.mp4`,
    thumbnail: '/videos/thumbnails/02_leadership_thumbnail.png',
  },
  ostacoli: {
    videoUrl: `${R2_CDN_URL}/ostacoli.mp4`,
    thumbnail: '/videos/thumbnails/03_ostacoli_thumbnail.png',
  },
  microfelicita: {
    videoUrl: `${R2_CDN_URL}/microfelicita.mp4`,
    thumbnail: '/videos/thumbnails/04_microfelicita_thumbnail.png',
  },
};

// Video delle challenge (7 giorni ciascuna) - hostati su Cloudflare R2
export const CHALLENGE_VIDEOS = {
  leadership: {
    hero: `${R2_CDN_URL}/leadership.mp4`,
    days: [
      `${R2_CDN_URL}/leadership-day-1.mp4`,
      `${R2_CDN_URL}/leadership-day-2.mp4`,
      `${R2_CDN_URL}/leadership-day-3.mp4`,
      `${R2_CDN_URL}/leadership-day-4.mp4`,
      `${R2_CDN_URL}/leadership-day-5.mp4`,
      `${R2_CDN_URL}/leadership-day-6.mp4`,
      `${R2_CDN_URL}/leadership-day-7.mp4`,
    ],
  },
  ostacoli: {
    hero: `${R2_CDN_URL}/ostacoli.mp4`,
    days: [
      `${R2_CDN_URL}/ostacoli-day-1.mp4`,
      `${R2_CDN_URL}/ostacoli-day-2.mp4`,
      `${R2_CDN_URL}/ostacoli-day-3.mp4`,
      `${R2_CDN_URL}/ostacoli-day-4.mp4`,
      `${R2_CDN_URL}/ostacoli-day-5.mp4`,
      `${R2_CDN_URL}/ostacoli-day-6.mp4`,
      `${R2_CDN_URL}/ostacoli-day-7.mp4`,
    ],
  },
  microfelicita: {
    hero: `${R2_CDN_URL}/microfelicita.mp4`,
    days: [
      `${R2_CDN_URL}/microfelicita-day-1.mp4`,
      `${R2_CDN_URL}/microfelicita-day-2.mp4`,
      `${R2_CDN_URL}/microfelicita-day-3.mp4`,
      `${R2_CDN_URL}/microfelicita-day-4.mp4`,
      `${R2_CDN_URL}/microfelicita-day-5.mp4`,
      `${R2_CDN_URL}/microfelicita-day-6.mp4`,
      `${R2_CDN_URL}/microfelicita-day-7.mp4`,
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
