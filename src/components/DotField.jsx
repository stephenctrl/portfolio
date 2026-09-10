import { useEffect, useRef } from "react";

export function DotField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const DOT_SPACING = 28;
    const BASE_RADIUS = 1.2;
    const GLOW_RADIUS = 90;
    const ACCENT = [103, 58, 184];

    let mouse = { x: -1000, y: -1000 };
    let width = 0, height = 0, cols = 0, rows = 0;

    function resize() {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      cols = Math.ceil(width / DOT_SPACING) + 1;
      rows = Math.ceil(height / DOT_SPACING) + 1;
    }

    function draw(t) {
      ctx.clearRect(0, 0, width, height);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * DOT_SPACING;
          const y = r * DOT_SPACING;
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / GLOW_RADIUS);
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.0008 + c * 0.4 + r * 0.3);
          const alpha = 0.08 + influence * 0.6 + pulse * 0.04;
          const rad = BASE_RADIUS + influence * 1.4;

          const [ar, ag, ab] = ACCENT;
          const gr = Math.round(ar * influence + 80 * (1 - influence));
          const gg = Math.round(ag * influence + 80 * (1 - influence));
          const gb = Math.round(ab * influence + 80 * (1 - influence));

          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${gr},${gg},${gb},${alpha})`;
          ctx.fill();
        }
      }
      animId = requestAnimationFrame(draw);
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onLeave() { mouse = { x: -1000, y: -1000 }; }

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ pointerEvents: "auto" }}
    />
  );
}