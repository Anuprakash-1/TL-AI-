import React, { useEffect, useRef, useState } from 'react';

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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Interactive mouse tracking and gentle parallax
  useEffect(() => {
    let animationFrameId: number;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let currentX = targetX;
    let currentY = targetY;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setParallax({
        x: (e.clientX - centerX) / 50,
        y: (e.clientY - centerY) / 50,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const lerpLoop = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      setMousePos({ x: Math.round(currentX), y: Math.round(currentY) });
      animationFrameId = requestAnimationFrame(lerpLoop);
    };

    animationFrameId = requestAnimationFrame(lerpLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Neural constellation canvas with crimson & ruby cyber particle palette
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particleCount = Math.min(45, Math.max(20, Math.floor(width / 40)));

    // Cyber Alert Palette: Crimson Neon, Ruby, Coral, Starlight
    const palette = [
      'rgba(239, 68, 68, ',   // red-500
      'rgba(244, 63, 94, ',   // rose-500
      'rgba(220, 38, 38, ',   // red-600
      'rgba(252, 165, 165, ', // red-300
      'rgba(255, 255, 255, ', // pure white
    ];

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.8,
        baseAlpha: Math.random() * 0.4 + 0.2,
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

      const maxConnectDistance = Math.min(130, width / 9);

      // Draw delicate neural connection filaments
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDistance) {
            const lineAlpha = (1 - dist / maxConnectDistance) * (isDark ? 0.18 : 0.1);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(239, 68, 68, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.baseAlpha})`;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

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
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-opacity duration-700 select-none bg-neutral-950"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* 1. Base Deep Noir Void Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 15%, #0e1017 0%, #06070a 55%, #020305 100%)'
            : 'radial-gradient(ellipse at 50% 15%, #fff5f5 0%, #fef2f2 50%, #fce7e7 100%)',
        }}
      />

      {/* 2. Liquid Carbon Wave Background with Crimson Neon Edge Tracing */}
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-45 dark:opacity-65 transition-transform duration-700 ease-out"
        style={{
          backgroundImage: 'url(/alert_theme_bg.png)',
          transform: `translate3d(${parallax.x * 0.4}px, ${parallax.y * 0.4}px, 0) scale(1.03)`,
          filter: isDark ? 'brightness(0.95) contrast(1.1)' : 'brightness(1.05) contrast(0.95)',
        }}
      />

      {/* 3. Interactive Volumetric Crimson Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: isDark
            ? `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.06) 35%, transparent 70%)`
            : `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(239, 68, 68, 0.1) 0%, transparent 65%)`,
        }}
      />

      {/* 4. Ambient Ethereal Crimson Nebulas */}
      {/* Top Right Nebula */}
      <div
        className="absolute -top-[10%] -right-[10%] w-[600px] sm:w-[850px] h-[600px] sm:h-[850px] rounded-full blur-[140px] opacity-40 dark:opacity-55 animate-crimson-drift pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.18) 45%, transparent 75%)',
        }}
      />

      {/* Bottom Left Nebula */}
      <div
        className="absolute -bottom-[15%] -left-[10%] w-[550px] sm:w-[800px] h-[550px] sm:h-[800px] rounded-full blur-[150px] opacity-35 dark:opacity-50 animate-cyber-alert pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(244, 63, 94, 0.35) 0%, rgba(185, 28, 28, 0.15) 50%, transparent 75%)',
        }}
      />

      {/* 5. THE ICONIC GLOWING CYBER NEON ALERT HUD BEACON */}
      {/* Positioned on the right side of the hero matching the reference image */}
      <div
        className="absolute top-[8%] lg:top-[12%] right-[3%] lg:right-[8%] w-[320px] sm:w-[440px] md:w-[500px] lg:w-[560px] h-[320px] sm:h-[440px] md:h-[500px] lg:h-[560px] pointer-events-none transition-transform duration-700 ease-out select-none flex items-center justify-center"
        style={{
          transform: `translate3d(${parallax.x * 0.8}px, ${parallax.y * 0.8}px, 0)`,
        }}
      >
        {/* Outer Volumetric Crimson Halo Glow */}
        <div
          className="absolute inset-[-5%] rounded-full blur-[65px] opacity-70 animate-cyber-alert"
          style={{
            background:
              'radial-gradient(circle, rgba(239, 68, 68, 0.65) 0%, rgba(220, 38, 38, 0.35) 45%, transparent 75%)',
          }}
        />

        {/* Outer Rotating Segmented Tech HUD Ring */}
        <div className="absolute inset-[4%] rounded-full border border-red-500/30 animate-hud-spin">
          {/* Segmented HUD Arcs */}
          <div className="absolute inset-[-2px] rounded-full border-t-2 border-r-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-red-400 rounded-full shadow-[0_0_8px_#ef4444]" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-red-400 rounded-full shadow-[0_0_8px_#ef4444]" />
        </div>

        {/* Middle Counter-Rotating Tech Ring with Markers */}
        <div className="absolute inset-[14%] rounded-full border border-red-500/40 border-dashed animate-hud-reverse">
          <div className="absolute inset-[-2px] rounded-full border-b-2 border-l-2 border-rose-400/90 shadow-[0_0_12px_rgba(244,63,94,0.7)]" />
        </div>

        {/* Inner Solid Red Glowing Ring */}
        <div
          className="absolute inset-[24%] rounded-full border-2 border-red-500 animate-cyber-alert"
          style={{
            boxShadow:
              '0 0 30px rgba(239, 68, 68, 0.7), inset 0 0 25px rgba(239, 68, 68, 0.5)',
          }}
        />

        {/* Dark Obsidian Aperture Void */}
        <div
          className="absolute inset-[26%] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, #08090d 70%, #150608 100%)'
              : 'radial-gradient(circle, #ffffff 70%, #fee2e2 100%)',
            boxShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.9)',
          }}
        />

        {/* Center Neon Alert Triangle with Exclamation Point */}
        <div className="relative z-10 flex flex-col items-center justify-center animate-cyber-alert">
          <svg
            className="w-20 sm:w-28 md:w-36 h-20 sm:h-28 md:h-36 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter:
                'drop-shadow(0 0 12px rgba(239, 68, 68, 0.95)) drop-shadow(0 0 24px rgba(220, 38, 38, 0.8))',
            }}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>

          {/* Angled "Alert" Banner underneath (Directly matching reference image) */}
          <div
            className="mt-1 sm:mt-2 px-4 sm:px-6 py-0.5 sm:py-1 rounded bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(239,68,68,0.9)] transform -skew-x-12 border border-red-300/40"
          >
            <span className="inline-block transform skew-x-12">Alert</span>
          </div>
        </div>
      </div>

      {/* 6. Tactile Dot Matrix Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(rgba(239, 68, 68, 0.12) 1px, transparent 1px)'
            : 'radial-gradient(rgba(220, 38, 38, 0.05) 1px, transparent 1px)',
          backgroundSize: '4px 4px',
          opacity: 0.5,
        }}
      />

      {/* 7. Neural Truth Constellation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />

      {/* 8. Vignette Edge Shading for Cinematic Focus */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(5, 6, 8, 0.75) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(254, 242, 242, 0.6) 100%)',
        }}
      />
    </div>
  );
};
