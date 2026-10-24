import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  isDark: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  color: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Responsive particle count based on screen width
    const particleCount = Math.min(55, Math.max(25, Math.floor(width / 35)));

    // Palette: Cyan, Electric Indigo, Neon Violet, Sapphire
    const darkPalette = [
      'rgba(6, 182, 212, ',   // cyan-500
      'rgba(59, 130, 246, ',  // blue-500
      'rgba(99, 102, 241, ',  // indigo-500
      'rgba(168, 85, 247, ',  // purple-500
      'rgba(16, 185, 129, ',  // emerald-500
    ];

    const lightPalette = [
      'rgba(14, 165, 233, ',  // sky-500
      'rgba(79, 70, 229, ',   // indigo-600
      'rgba(139, 92, 246, ',  // violet-500
      'rgba(16, 185, 129, ',  // emerald-500
    ];

    const palette = isDark ? darkPalette : lightPalette;

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
        baseAlpha: Math.random() * 0.4 + 0.25,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const maxConnectDistance = Math.min(140, width / 8);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDistance) {
            const lineAlpha = (1 - dist / maxConnectDistance) * (isDark ? 0.22 : 0.15);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark
              ? `rgba(56, 189, 248, ${lineAlpha})`
              : `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.baseAlpha})`;
        ctx.shadowColor = p.color + '0.6)';
        ctx.shadowBlur = isDark ? 8 : 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset blur for next drawing

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap edges smoothly
          if (p.x < -10) p.x = width + 10;
          else if (p.x > width + 10) p.x = -10;

          if (p.y < -10) p.y = height + 10;
          else if (p.y > height + 10) p.y = -10;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-opacity duration-700 select-none"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* Dynamic Cybernetic Perspective Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06] transition-opacity duration-500"
        style={{
          pointerEvents: 'none',
          backgroundImage: isDark
            ? `linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`
            : `linear-gradient(to right, rgba(99, 102, 241, 0.25) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(99, 102, 241, 0.25) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 90% 80% at 50% 40%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 40%, black 20%, transparent 85%)',
        }}
      />

      {/* Floating Ethereal Aurora Blob 1 (Cyan / Teal) */}
      <div
        className="absolute -top-[15%] left-[5%] w-[520px] sm:w-[650px] h-[520px] sm:h-[650px] rounded-full blur-[130px] opacity-35 dark:opacity-45 animate-aurora-float-1 transition-all duration-700 pointer-events-none"
        style={{
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.45) 0%, rgba(14, 116, 144, 0.15) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(186, 230, 253, 0.15) 60%, transparent 80%)',
        }}
      />

      {/* Floating Ethereal Aurora Blob 2 (Electric Violet / Indigo) */}
      <div
        className="absolute top-[35%] -right-[10%] w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] rounded-full blur-[140px] opacity-30 dark:opacity-40 animate-aurora-float-2 transition-all duration-700 pointer-events-none"
        style={{
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(99, 102, 241, 0.2) 55%, transparent 80%)'
            : 'radial-gradient(circle, rgba(165, 180, 252, 0.3) 0%, rgba(199, 210, 254, 0.15) 55%, transparent 80%)',
        }}
      />

      {/* Floating Ethereal Aurora Blob 3 (Sapphire / Emerald Pulse) */}
      <div
        className="absolute -bottom-[10%] left-[25%] w-[500px] sm:w-[620px] h-[500px] sm:h-[620px] rounded-full blur-[125px] opacity-25 dark:opacity-35 animate-aurora-float-3 transition-all duration-700 pointer-events-none"
        style={{
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(16, 185, 129, 0.15) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(96, 165, 250, 0.25) 0%, rgba(110, 231, 183, 0.12) 60%, transparent 80%)',
        }}
      />

      {/* Live Constellation Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
        style={{ pointerEvents: 'none' }}
      />

      {/* Subtle Vignette Edge Shading for Depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(7, 11, 20, 0.55) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(248, 250, 252, 0.4) 100%)',
        }}
      />
    </div>
  );
};
