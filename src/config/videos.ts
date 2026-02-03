/**
 * Configurazione Video Challenge
 *
 * Video HeyGen con embedded player iframe
 * Formato: https://app.heygen.com/embedded-player/{VIDEO_ID}
 *
 * Thumbnail locali in /public/videos/thumbnails/
 */

// Video ID HeyGen per le landing page
export const LANDING_VIDEOS = {
  homepage: {
    heygenId: '96db220f526648919acfdf428fd44dd5',
    thumbnail: '/videos/thumbnails/01_homepage_thumbnail.png',
  },
  leadership: {
    heygenId: 'a32aeedd895942a59796a58fd3c71f58',
    thumbnail: '/videos/thumbnails/02_leadership_thumbnail.png',
  },
  ostacoli: {
    heygenId: 'afcef7f8bff34a749dad7e7283107e4c',
    thumbnail: '/videos/thumbnails/03_ostacoli_thumbnail.png',
  },
  microfelicita: {
    heygenId: 'f3a2403f04264828b28db1b029db37ec',
    thumbnail: '/videos/thumbnails/04_microfelicita_thumbnail.png',
  },
};

// Helper per ottenere URL embedded player HeyGen
export function getHeygenEmbedUrl(videoId: string): string {
  return `https://app.heygen.com/embedded-player/${videoId}`;
}

// Video delle challenge (7 giorni ciascuna)
export const CHALLENGE_VIDEOS = {
  leadership: {
    hero: undefined as string | undefined,
    days: [
      undefined, // Day 1
      undefined, // Day 2
      undefined, // Day 3
      undefined, // Day 4
      undefined, // Day 5
      undefined, // Day 6
      undefined, // Day 7
    ] as (string | undefined)[],
  },
  ostacoli: {
    hero: undefined as string | undefined,
    days: [
      undefined, // Day 1
      undefined, // Day 2
      undefined, // Day 3
      undefined, // Day 4
      undefined, // Day 5
      undefined, // Day 6
      undefined, // Day 7
    ] as (string | undefined)[],
  },
  microfelicita: {
    hero: undefined as string | undefined,
    days: [
      undefined, // Day 1
      undefined, // Day 2
      undefined, // Day 3
      undefined, // Day 4
      undefined, // Day 5
      undefined, // Day 6
      undefined, // Day 7
    ] as (string | undefined)[],
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
  return challenge.days[dayNumber - 1];
}

// Helper per ottenere video hero
export function getHeroVideo(
  challengeType: keyof typeof CHALLENGE_VIDEOS
): string | undefined {
  return CHALLENGE_VIDEOS[challengeType]?.hero;
}
