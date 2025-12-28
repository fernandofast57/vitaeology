'use client';

import React, { useEffect, useRef } from 'react';
import { PillarResult, PILLAR_CONFIG } from '@/lib/assessment-scoring';

interface ResultsRadarProps {
  pillars: PillarResult[];
  size?: number;
  showLabels?: boolean;
  animate?: boolean;
}

export default function ResultsRadar({
  pillars,
  size = 300,
  showLabels = true,
  animate = true,
}: ResultsRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Supporto retina display
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = (size / 2) - 40; // Margine per le label
    const numAxes = pillars.length;
    const angleStep = (2 * Math.PI) / numAxes;
    const startAngle = -Math.PI / 2; // Inizia dall'alto

    const draw = (progress: number) => {
      ctx.clearRect(0, 0, size, size);

      // Disegna cerchi di riferimento (20%, 40%, 60%, 80%, 100%)
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      [0.2, 0.4, 0.6, 0.8, 1].forEach((level) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * level, 0, 2 * Math.PI);
        ctx.stroke();
      });

      // Disegna gli assi
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1;
      pillars.forEach((_, i) => {
        const angle = startAngle + i * angleStep;
        const x = centerX + maxRadius * Math.cos(angle);
        const y = centerY + maxRadius * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      });

      // Calcola i punti del poligono dei risultati
      const points: { x: number; y: number; color: string }[] = pillars.map((pillar, i) => {
        const angle = startAngle + i * angleStep;
        const value = (pillar.percentage / 100) * progress;
        const radius = maxRadius * value;
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          color: pillar.color,
        };
      });

      // Disegna il poligono riempito
      if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach((point, i) => {
          if (i > 0) ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();

        // Gradiente radiale
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, maxRadius
        );
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0.3)');
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Bordo del poligono
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Disegna i punti sui vertici
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = point.color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Disegna le label
      if (showLabels) {
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        pillars.forEach((pillar, i) => {
          const angle = startAngle + i * angleStep;
          const labelRadius = maxRadius + 25;
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);

          // Label del pilastro
          ctx.fillStyle = pillar.color;
          ctx.fillText(pillar.pillarLabel, x, y - 8);

          // Percentuale
          ctx.font = '11px system-ui, sans-serif';
          ctx.fillStyle = '#6B7280';
          ctx.fillText(`${Math.round(pillar.percentage * progress)}%`, x, y + 8);

          ctx.font = 'bold 12px system-ui, sans-serif';
        });
      }
    };

    if (animate) {
      const startTime = performance.now();
      const duration = 1000; // 1 secondo

      const animateFrame = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        progressRef.current = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progressRef.current, 3);

        draw(eased);

        if (progressRef.current < 1) {
          animationRef.current = requestAnimationFrame(animateFrame);
        }
      };

      animationRef.current = requestAnimationFrame(animateFrame);
    } else {
      draw(1);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pillars, size, showLabels, animate]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="max-w-full"
        style={{ width: size, height: size }}
      />

      {/* Legenda sotto il grafico */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {pillars.map((pillar) => (
          <div
            key={pillar.pillar}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: pillar.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {pillar.pillarLabel}
            </span>
            <span className="text-sm text-gray-500">
              {pillar.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
