import { useEffect, useRef } from 'react';

export const DotField = ({
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 500,
  cursorForce = 0.10,
  bulgeOnly = true,
  bulgeStrength = 67,
  glowRadius = 160,
  sparkle = false,
  waveAmplitude = 0
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let dots = [];
    
    // Track mouse without triggering React renders
    const mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const initGrid = () => {
      dots = [];
      const cols = Math.floor(window.innerWidth / dotSpacing);
      const rows = Math.floor(window.innerHeight / dotSpacing);
      
      const offsetX = (window.innerWidth - cols * dotSpacing) / 2;
      const offsetY = (window.innerHeight - rows * dotSpacing) / 2;

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          dots.push({
            originX: offsetX + i * dotSpacing,
            originY: offsetY + j * dotSpacing,
            x: offsetX + i * dotSpacing,
            y: offsetY + j * dotSpacing,
            baseAlpha: 0.2 + Math.random() * 0.1
          });
        }
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGrid();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const time = Date.now() * 0.001;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dx = mouse.x - dot.originX;
        const dy = mouse.y - dot.originY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let targetX = dot.originX;
        let targetY = dot.originY;
        let radius = dotRadius;
        let alpha = dot.baseAlpha;

        // Apply wave amplitude if set
        if (waveAmplitude > 0) {
          targetY += Math.sin(dot.originX * 0.01 + time) * waveAmplitude;
        }

        // Apply mouse interaction physics
        if (distance < cursorRadius) {
          const force = (cursorRadius - distance) / cursorRadius;
          
          if (bulgeOnly) {
            // Push dots away from cursor
            const angle = Math.atan2(dy, dx);
            const pushDistance = force * bulgeStrength;
            targetX -= Math.cos(angle) * pushDistance;
            targetY -= Math.sin(angle) * pushDistance;
          } else {
            // Pull dots toward cursor
            targetX += dx * force * cursorForce;
            targetY += dy * force * cursorForce;
          }

          // Glow effect near cursor
          if (distance < glowRadius) {
            alpha = Math.min(1, alpha + (glowRadius - distance) / glowRadius);
            radius += force * 1.5;
          }
        }

        // Smooth interpolation (easing) back to target positions
        dot.x += (targetX - dot.x) * 0.1;
        dot.y += (targetY - dot.y) * 0.1;

        // Sparkle effect
        if (sparkle && Math.random() < 0.01) {
          alpha = 1;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(161, 161, 170, ${alpha})`; // Tailwind zinc-400 equivalent
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dotRadius, dotSpacing, cursorRadius, cursorForce, bulgeOnly, bulgeStrength, glowRadius, sparkle, waveAmplitude]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block w-full h-full pointer-events-none"
    />
  );
};