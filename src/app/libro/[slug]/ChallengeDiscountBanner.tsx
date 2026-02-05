'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isValidRedirectUrl } from '@/lib/security';
import { getLibroChallengeDbValue } from '@/lib/challenge/config';

const OTO_PRICE = 7.90;

interface ChallengeDiscountBannerProps {
  libroSlug: string;
  libroTitolo: string;
}

export default function ChallengeDiscountBanner({ libroSlug, libroTitolo }: ChallengeDiscountBannerProps) {
  const [hasCompletedChallenge, setHasCompletedChallenge] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function checkChallengeStatus() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.email) {
          setLoading(false);
          return;
        }

        const challengeDbValue = getLibroChallengeDbValue(libroSlug);
        if (!challengeDbValue) {
          setLoading(false);
          return;
        }

        const { data: subscriber } = await supabase
          .from('challenge_subscribers')
          .select('status')
          .eq('email', user.email)
          .eq('challenge', challengeDbValue)
          .eq('status', 'completed')
          .limit(1)
          .maybeSingle();

        setHasCompletedChallenge(!!subscriber);
      } catch {
        // Silenzioso
      } finally {
        setLoading(false);
      }
    }

    checkChallengeStatus();
  }, [libroSlug]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/libro/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libroSlug,
          otoDiscount: true,
          source: 'challenge_oto',
        }),
      });

      const data = await response.json();
      if (data.url && isValidRedirectUrl(data.url)) {
        window.location.href = data.url;
      }
    } catch {
      // Fallback
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading || !hasCompletedChallenge) return null;

  return (
    <div className="bg-gradient-to-r from-gold-500/10 to-gold-500/5 border border-gold-500/30 rounded-xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 text-center sm:text-left">
          <p className="text-petrol-600 font-bold text-lg">
            Hai completato la Challenge!
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {libroTitolo} è tuo a <span className="font-bold text-gold-600">€{OTO_PRICE.toFixed(2)}</span>{' '}
            <span className="text-gray-400 line-through">€9.90</span>
          </p>
        </div>
        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="bg-gold-500 hover:bg-gold-400 text-petrol-600 font-bold px-6 py-3 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
        >
          {checkoutLoading ? 'Elaborazione...' : `Acquista — €${OTO_PRICE.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
