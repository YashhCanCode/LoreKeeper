import { useEffect, useRef } from 'react';

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const createParticle = (atBottom = false) => {
      return {
        x: Math.random() * canvas.width,
        y: atBottom ? canvas.height + 10 : Math.random() * canvas.height,
        size: Math.random() * 2.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: -Math.random() * 0.35 - 0.08, // Slow upward drifting
        opacity: Math.random() * 0.6 + 0.1,
        fadeSpeed: Math.random() * 0.003 + 0.001,
      };
    };

    // Initialize particles
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save canvas state
      ctx.save();
      
      particles.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += p.speedX;
        
        p.opacity -= p.fadeSpeed;
        
        // Recycle offscreen or faded particles
        if (p.opacity <= 0 || p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
          particles[idx] = createParticle(true);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Purple-pink sunset glow particle colors
        const colorRatio = Math.random();
        if (colorRatio > 0.6) {
          ctx.fillStyle = `rgba(236, 72, 153, ${p.opacity})`; // Pink
        } else if (colorRatio > 0.3) {
          ctx.fillStyle = `rgba(192, 132, 252, ${p.opacity})`; // Lavender
        } else {
          ctx.fillStyle = `rgba(249, 115, 22, ${p.opacity})`; // Warm orange
        }
        
        ctx.shadowBlur = p.size * 2.5;
        ctx.shadowColor = 'rgba(192, 132, 252, 0.4)';
        ctx.fill();
      });
      
      ctx.restore();
      animationFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
