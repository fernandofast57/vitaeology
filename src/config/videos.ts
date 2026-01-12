/**
 * Configurazione Video Challenge
 *
 * Sostituire `undefined` con URL video HeyGen quando pronti.
 *
 * Esempio:
 *   hero: "https://cdn.heygen.com/xxxxx.mp4"
 *   days: ["https://cdn.heygen.com/day1.mp4", ...]
 *
 * I video possono essere ospitati su:
 * - HeyGen CDN (consigliato per video AI)
 * - Cloudflare Stream
 * - Vercel Blob Storage
 * - AWS S3 / CloudFront
 */

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
