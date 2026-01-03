import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Configurazione colori per challenge
const challengeConfig = {
  leadership: {
    title: 'Leadership Autentica',
    subtitle: 'Scopri il leader che è in te',
    tagline: '7 giorni di esercizi pratici gratuiti',
    primaryColor: '#F59E0B', // amber-500
    secondaryColor: '#D97706', // amber-600
    bgGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)',
    icon: '👑',
  },
  ostacoli: {
    title: 'Oltre gli Ostacoli',
    subtitle: 'Trasforma i blocchi in trampolini',
    tagline: '7 giorni di esercizi pratici gratuiti',
    primaryColor: '#10B981', // emerald-500
    secondaryColor: '#059669', // emerald-600
    bgGradient: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 50%, #6EE7B7 100%)',
    icon: '🚀',
  },
  microfelicita: {
    title: 'Microfelicità',
    subtitle: 'Trova la gioia nei piccoli momenti',
    tagline: '7 giorni di pratiche gratuite',
    primaryColor: '#8B5CF6', // violet-500
    secondaryColor: '#7C3AED', // violet-600
    bgGradient: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 50%, #C4B5FD 100%)',
    icon: '✨',
  },
};

type ChallengeType = keyof typeof challengeConfig;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const config = challengeConfig[type as ChallengeType];

  if (!config) {
    // Fallback per type non valido
    return new Response('Challenge type not found', { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: config.bgGradient,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo/Brand top */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: config.primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            V
          </div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#1F2937',
            }}
          >
            Vitaeology
          </span>
        </div>

        {/* Badge "Sfida Gratuita" */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 60,
            background: config.primaryColor,
            color: 'white',
            padding: '8px 20px',
            borderRadius: 20,
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          SFIDA GRATUITA
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 60px',
          }}
        >
          {/* Icon */}
          <div style={{ fontSize: 72, marginBottom: 20 }}>{config.icon}</div>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#1F2937',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            {config.title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: config.secondaryColor,
              marginBottom: 24,
            }}
          >
            {config.subtitle}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 24,
              color: '#4B5563',
              background: 'rgba(255,255,255,0.7)',
              padding: '12px 32px',
              borderRadius: 30,
            }}
          >
            {config.tagline}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: config.primaryColor,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
