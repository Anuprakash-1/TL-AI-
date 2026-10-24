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
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Subtle interactive parallax offset for the chromatic torus
  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX = (e.clientX - centerX) / 45;
      targetY = (e.clientY - centerY) / 45;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const lerpLoop = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      setMouseOffset({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(lerpLoop);
    };

    animationFrameId = requestAnimationFrame(lerpLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Neural constellation canvas with SRTP amber & emerald star palette
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particleCount = Math.min(42, Math.max(18, Math.floor(width / 45)));

    // SRTP Palette: Molten Gold, Vibrant Teal, Emerald, Amber, Diamond
    const palette = [
      'rgba(245, 158, 11, ',  // amber-500
      'rgba(251, 191, 36, ',  // amber-400
      'rgba(16, 185, 129, ',  // emerald-500
      'rgba(6, 182, 212, ',   // cyan-500
      'rgba(255, 255, 255, ',  // pure white starlight
    ];

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.6 + 0.7,
        baseAlpha: Math.random() * 0.35 + 0.15,
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

      const maxConnectDistance = Math.min(120, width / 9);

      // Draw delicate neural connection filaments
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDistance) {
            const lineAlpha = (1 - dist / maxConnectDistance) * (isDark ? 0.14 : 0.08);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Gradient connection between amber and emerald
            ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
            ctx.lineWidth = 0.65;
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
        ctx.shadowColor = p.color + '0.5)';
        ctx.shadowBlur = 5;
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
      {/* 1. Base Deep Void Background (SRTP Noir) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 20%, #0d0f14 0%, #06070a 60%, #020304 100%)'
            : 'radial-gradient(ellipse at 50% 20%, #fefcf8 0%, #f8fafc 60%, #edf2f7 100%)',
        }}
      />

      {/* 2. Warm Molten Amber / Solar Nebula (Bottom-Left from SRTP Abstract Background 32) */}
      <div
        className="absolute -bottom-[10%] -left-[10%] w-[550px] sm:w-[800px] h-[550px] sm:h-[800px] rounded-full blur-[140px] opacity-45 dark:opacity-60 animate-srtp-drift pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.18) 40%, rgba(180, 83, 9, 0.05) 70%, transparent 85%)',
        }}
      />

      {/* 3. Bioluminescent Emerald & Neon Cyan Nebula (Bottom-Right from SRTP Abstract Background 32) */}
      <div
        className="absolute -bottom-[15%] -right-[10%] w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] rounded-full blur-[150px] opacity-50 dark:opacity-65 animate-srtp-aura pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(6, 182, 212, 0.22) 40%, rgba(4, 120, 87, 0.08) 70%, transparent 85%)',
        }}
      />

      {/* 4. THE ICONIC SRTP CHROMATIC TORUS RING ("The Lens of Truth") */}
      {/* Placed prominently on the right side of hero matching srtp_theme.jpg */}
      <div
        className="absolute top-[8%] lg:top-[12%] right-[2%] lg:right-[6%] w-[380px] sm:w-[520px] md:w-[620px] lg:w-[680px] h-[380px] sm:h-[520px] md:h-[620px] lg:h-[680px] pointer-events-none transition-transform duration-700 ease-out select-none"
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
        }}
      >
        {/* Outer Chromatic Volumetric Flare */}
        <div
          className="absolute inset-0 rounded-full blur-[75px] opacity-60 dark:opacity-75 animate-srtp-aura"
          style={{
            background:
              'conic-gradient(from 45deg, rgba(245, 158, 11, 0.6) 0deg, rgba(251, 191, 36, 0.7) 60deg, rgba(217, 119, 6, 0.5) 120deg, rgba(16, 185, 129, 0.65) 180deg, rgba(6, 182, 212, 0.75) 240deg, rgba(52, 211, 153, 0.6) 300deg, rgba(245, 158, 11, 0.6) 360deg)',
          }}
        />

        {/* The Torus Swirling Fluid Ring Body (Exact 3D gradient torus curvature) */}
        <div
          className="absolute inset-[10%] rounded-full animate-srtp-torus"
          style={{
            background:
              'conic-gradient(from 55deg, #f59e0b 0deg, #fbbf24 45deg, #ea580c 90deg, #10b981 160deg, #06b6d4 210deg, #2dd4bf 260deg, #059669 310deg, #f59e0b 360deg)',
            filter: 'blur(1.5px)',
            boxShadow:
              '0 0 60px rgba(245, 158, 11, 0.4), 0 0 90px rgba(16, 185, 129, 0.4), inset 0 0 40px rgba(0, 0, 0, 0.8)',
          }}
        />

        {/* Inner Secondary Fluid Wave Layer (Creates the 3D twist ribbon depth) */}
        <div
          className="absolute inset-[15%] rounded-full opacity-85 mix-blend-screen animate-srtp-aura"
          style={{
            background:
              'conic-gradient(from 220deg, transparent 0deg, rgba(6, 182, 212, 0.8) 50deg, rgba(16, 185, 129, 0.9) 110deg, transparent 180deg, rgba(251, 191, 36, 0.8) 260deg, rgba(245, 158, 11, 0.9) 320deg, transparent 360deg)',
            filter: 'blur(3px)',
          }}
        />

        {/* Central Obsidian Aperture (The inner void of the torus) */}
        <div
          className="absolute inset-[30%] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, #050608 65%, rgba(5, 6, 8, 0.95) 85%, transparent 100%)'
              : 'radial-gradient(circle, #f8fafc 65%, rgba(248, 250, 252, 0.95) 85%, transparent 100%)',
            boxShadow:
              'inset 0 0 45px rgba(0, 0, 0, 0.95), 0 0 35px rgba(0, 0, 0, 0.8)',
          }}
        />

        {/* Central Core Truth Glow */}
        <div
          className="absolute inset-[40%] rounded-full blur-[25px] opacity-25 animate-pulse"
          style={{
            background:
              'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, rgba(245, 158, 11, 0.3) 60%, transparent 100%)',
          }}
        />
      </div>

      {/* 5. Tactile Halftone Dither Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(rgba(255, 255, 255, 0.14) 1px, transparent 1px)'
            : 'radial-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          opacity: isDark ? 0.45 : 0.3,
        }}
      />

      {/* 6. Truth Constellation Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />

      {/* 7. Vignette Shading for Cinematic Edge Focus */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(4, 5, 7, 0.7) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(226, 232, 240, 0.5) 100%)',
        }}
      />
    </div>
  );
};
