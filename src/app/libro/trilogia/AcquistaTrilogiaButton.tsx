'use client';

import { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { getTrilogia } from '@/data/libri';

interface Props {
  size?: 'normal' | 'large';
  variant?: 'primary' | 'gold';
}

export default function AcquistaTrilogiaButton({ size = 'normal', variant = 'primary' }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const trilogia = getTrilogia();

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/libro/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libroSlug: 'trilogia',
          isTrilogia: true,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Errore checkout:', data.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Errore checkout:', error);
      setIsLoading(false);
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-lg
    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const sizeClasses = size === 'large'
    ? 'px-8 py-4 text-lg'
    : 'px-6 py-3 text-base';

  const variantClasses = variant === 'gold'
    ? 'bg-gold-500 text-petrol-600 hover:bg-gold-400'
    : 'bg-white text-petrol-600 hover:bg-gray-100';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Caricamento...
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          Acquista la Trilogia - €{trilogia.prezzo.toFixed(2)}
        </>
      )}
    </button>
  );
}
