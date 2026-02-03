/**
 * Configurazione Video Challenge
 *
 * Video HeyGen con embedded player iframe
 * Formato: https://app.heygen.com/embedded-player/{VIDEO_ID}
 *
 * Thumbnail locali in /public/videos/thumbnails/
 */

// Video locali per le landing page
export const LANDING_VIDEOS = {
  homepage: {
    videoUrl: '/videos/homepage.mp4',
    thumbnail: '/videos/thumbnails/01_homepage_thumbnail.png',
  },
  leadership: {
    videoUrl: '/videos/leadership.mp4',
    thumbnail: '/videos/thumbnails/02_leadership_thumbnail.png',
  },
  ostacoli: {
    videoUrl: '/videos/ostacoli.mp4',
    thumbnail: '/videos/thumbnails/03_ostacoli_thumbnail.png',
  },
  microfelicita: {
    videoUrl: '/videos/microfelicita.mp4',
    thumbnail: '/videos/thumbnails/04_microfelicita_thumbnail.png',
  },
};

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
