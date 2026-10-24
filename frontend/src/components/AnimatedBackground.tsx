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
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 3 : 300,
  });

  // Track mouse coordinates for interactive volumetric lighting
  useEffect(() => {
    let animationFrameId: number;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let currentX = targetX;
    let currentY = targetY;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Smooth lerp loop for the interactive spotlight
    const lerpLoop = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      setMousePos({ x: Math.round(currentX), y: Math.round(currentY) });
      animationFrameId = requestAnimationFrame(lerpLoop);
    };

    animationFrameId = requestAnimationFrame(lerpLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Neural constellation canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particleCount = Math.min(50, Math.max(22, Math.floor(width / 40)));

    const darkPalette = [
      'rgba(255, 255, 255, ',  // pure starlight
      'rgba(56, 189, 248, ',   // cyan-400
      'rgba(129, 140, 248, ',  // indigo-400
      'rgba(244, 244, 245, ',  // zinc-100
      'rgba(52, 211, 153, ',   // emerald-400
    ];

    const lightPalette = [
      'rgba(14, 165, 233, ',   // sky-500
      'rgba(79, 70, 229, ',    // indigo-600
      'rgba(100, 116, 139, ',  // slate-500
    ];

    const palette = isDark ? darkPalette : lightPalette;

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

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDistance) {
            const lineAlpha = (1 - dist / maxConnectDistance) * (isDark ? 0.16 : 0.1);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark
              ? `rgba(255, 255, 255, ${lineAlpha})`
              : `rgba(99, 102, 241, ${lineAlpha})`;
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
        ctx.shadowColor = p.color + '0.5)';
        ctx.shadowBlur = isDark ? 6 : 3;
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
      {/* 1. Base Deep Void Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 15%, #181920 0%, #0c0d12 45%, #050608 100%)'
            : 'radial-gradient(ellipse at 50% 15%, #f8fafc 0%, #f1f5f9 60%, #e2e8f0 100%)',
        }}
      />

      {/* 2. Interactive Volumetric Spotlight (Glides with cursor and sweeps across the hero) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: isDark
            ? `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.14) 0%, rgba(200, 215, 240, 0.06) 35%, rgba(6, 182, 212, 0.04) 55%, transparent 75%)`
            : `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.12) 0%, rgba(56, 189, 248, 0.06) 40%, transparent 70%)`,
        }}
      />

      {/* 3. Volumetric Ethereal Atmospheric Aura Cloud (Center glow behind headline) */}
      <div
        className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[650px] sm:w-[950px] h-[450px] sm:h-[600px] rounded-full blur-[140px] opacity-40 dark:opacity-55 animate-aurora-float-1 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.28) 0%, rgba(220, 230, 245, 0.15) 30%, rgba(56, 189, 248, 0.08) 60%, transparent 80%)'
            : 'radial-gradient(ellipse at center, rgba(147, 197, 253, 0.35) 0%, rgba(199, 210, 254, 0.2) 40%, transparent 75%)',
        }}
      />

      {/* 4. Secondary Organic Ambient Drift Cloud (Lower Right) */}
      <div
        className="absolute top-[50%] -right-[5%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full blur-[130px] opacity-25 dark:opacity-35 animate-aurora-float-2 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(196, 181, 253, 0.25) 0%, transparent 70%)',
        }}
      />

      {/* 5. Tertiary Ambient Grounding Cloud (Bottom Left) */}
      <div
        className="absolute bottom-[5%] -left-[5%] w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full blur-[130px] opacity-20 dark:opacity-30 animate-aurora-float-3 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(110, 231, 183, 0.2) 0%, transparent 70%)',
        }}
      />

      {/* 6. Iconic Halftone / Dither Mesh Screen Overlay (Tactile dot texture from reference) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)'
            : 'radial-gradient(rgba(15, 23, 42, 0.07) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          opacity: isDark ? 0.65 : 0.45,
        }}
      />

      {/* 7. Neural Truth Constellation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />

      {/* 8. Vignette Edge Shading for Cinematic Depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(5, 6, 8, 0.65) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(226, 232, 240, 0.45) 100%)',
        }}
      />
    </div>
  );
};
