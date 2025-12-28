'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Libro } from '@/data/libri';

interface AcquistaButtonProps {
  libro: Libro;
  size?: 'normal' | 'large';
  variant?: 'primary' | 'gold';
}

export default function AcquistaButton({
  libro,
  size = 'normal',
  variant = 'gold',
}: AcquistaButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleAcquista = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/libro/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libroSlug: libro.slug,
          priceId: libro.stripePriceId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Errore checkout');
      }
    } catch (error) {
      console.error('Errore checkout:', error);
      alert('Si è verificato un errore. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  // Dimensioni
  const sizeClasses = size === 'large'
    ? 'px-8 py-4 text-lg'
    : 'px-6 py-3 text-base';

  // Varianti con palette Vitaeology
  const variantClasses = variant === 'gold'
    ? 'bg-gold-500 text-petrol-600 hover:bg-gold-400 focus:ring-gold-500'
    : 'bg-petrol-600 text-white hover:bg-petrol-700 focus:ring-petrol-600';

  return (
    <button
      onClick={handleAcquista}
      disabled={loading}
      className={`
        inline-flex items-center justify-center font-semibold rounded-lg
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses}
        ${variantClasses}
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Elaborazione...
        </>
      ) : (
        <>
          Acquista Ora - €{libro.prezzo.toFixed(2)}
          <ArrowRight className="ml-2 h-5 w-5" />
        </>
      )}
    </button>
  );
}
