import React, { useEffect, useRef } from "react";

const GalaxyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationFrameId: number;
    const stars: {
      x: number;
      y: number;
      radius: number;
      angle: number;
      speed: number;
    }[] = [];
    const numStars = 150;
    const center = { x: canvas.width / 2, y: canvas.height / 2 };

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: 0,
        y: 0,
        radius: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.0005,
      });
    }

    const pointer = { x: center.x, y: center.y };
    window.addEventListener("mousemove", (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    });

    const draw = () => {
      // Detect theme from Tailwind's class
      const isDark = document.documentElement.classList.contains("dark");

      // Background
      ctx.fillStyle = isDark
        ? ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        : "#FAF9F6";

      if (isDark && typeof ctx.fillStyle !== "string") {
        // ctx.fillStyle.addColorStop(0, "#6b21a8"); // purple-900
        ctx.fillStyle.addColorStop(1, "#0f041c"); // black
        // ctx.fillStyle.addColorStop(1, "#4c1d95"); // purple-950
      }

      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach((star, i) => {
        star.angle += star.speed;
        const orbitRadius = 80 + i * 1.5;
        const x = center.x + Math.cos(star.angle) * orbitRadius;
        const y = center.y + Math.sin(star.angle) * orbitRadius;

        ctx.beginPath();
        ctx.arc(x, y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "white" : "#8b5cf6"; // tailwind purple-500
        ctx.fill();
      });

      // Pointer effect
      const gradient = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        80
      );
      gradient.addColorStop(
        0,
        isDark ? "rgba(255,255,255,0.25)" : "rgba(139,92,246,0.25)"
      );
      gradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 80, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] transition-colors duration-500">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default GalaxyBackground;
