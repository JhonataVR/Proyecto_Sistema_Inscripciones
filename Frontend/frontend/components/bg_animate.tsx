"use client";
import React, { useEffect, useState, useRef } from "react";

const NUM_STARS = 30;

function randomBetween(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

type Star = {
  left: number; // %
  top: number;  // %
  size: number;
  duration: number;
  delay: number;
  dx: number;   // velocidad horizontal
  dy: number;   // velocidad vertical
};

interface BgAnimateProps {
  speed?: number; // 1 = normal, >1 = más rápido, <1 = más lento
}

const getConnectDistance = () => {
  if (typeof window !== "undefined" && window.innerWidth < 640) {
    return 100; // Menor distancia en móvil
  }
  return 200; // Mayor distancia en PC
};

const BgAnimate: React.FC<BgAnimateProps> = ({ speed = 1 }) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const CONNECT_DISTANCE = getConnectDistance();
  const starsRef = useRef<Star[]>([]);

  // Detecta si es móvil
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  // Tamaño de estrella y línea según dispositivo
  const starMin = isMobile ? 1 : 1;
  const starMax = isMobile ? 1 : 1;
  const lineWidth = isMobile ? 2 : 5;

  useEffect(() => {
    const generatedStars = Array.from({ length: NUM_STARS }).map(() => ({
      left: randomBetween(0, 100),
      top: randomBetween(0, 100),
      size: randomBetween(starMin, starMax),
      duration: randomBetween(1.5, 4),
      delay: randomBetween(0, 3),
      dx: randomBetween(-0.08, 0.38) * speed,
      dy: randomBetween(-0.08, 0.38) * speed,
    }));
    setStars(generatedStars);
    starsRef.current = generatedStars;

    function updateDimensions() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Animación de rebote
    let animationId: number;
    function animate() {
      starsRef.current = starsRef.current.map(star => {
        let newLeft = star.left + star.dx;
        let newTop = star.top + star.dy;
        let dx = star.dx;
        let dy = star.dy;
        // Rebote en los bordes
        if (newLeft < 0) { newLeft = 0; dx *= -1; }
        if (newLeft > 100) { newLeft = 100; dx *= -1; }
        if (newTop < 0) { newTop = 0; dy *= -1; }
        if (newTop > 100) { newTop = 100; dy *= -1; }
        return { ...star, left: newLeft, top: newTop, dx, dy };
      });
      setStars([...starsRef.current]);
      animationId = requestAnimationFrame(animate);
    }
    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Calcula líneas entre estrellas cercanas
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number; opacity: number }> = [];
  if (dimensions.width && dimensions.height) {
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const starA = stars[i];
        const starB = stars[j];
        const x1 = (starA.left / 100) * dimensions.width;
        const y1 = (starA.top / 100) * dimensions.height;
        const x2 = (starB.left / 100) * dimensions.width;
        const y2 = (starB.top / 100) * dimensions.height;
        const dist = Math.hypot(x1 - x2, y1 - y2);
        if (dist < CONNECT_DISTANCE) {
          // Opacidad: 1 cerca, 0 lejos
          const opacity = 0.45 * (1 - dist / CONNECT_DISTANCE);
          lines.push({ x1, y1, x2, y2, opacity });
        }
      }
    }
  }

  return (
    <div className="absolute h-full w-full pointer-events-none bg-gradient-to-br from-blue-200 via-white to-blue-400 dark:from-blue-950 dark:via-black dark:to-blue-950">
      {/* Líneas entre estrellas */}
      <svg
        className="absolute inset-0 w-full h-full"
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: "block" }}
      >
        {lines.map((line, idx) => (
          <line
            key={idx}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="var(--star-line-color)"
            strokeOpacity={line.opacity}
            strokeWidth={lineWidth} // <--- aquí
          />
        ))}
      </svg>
      {/* Estrellas */}
      {stars.map((star, i) => (
        <span
          key={i}
          style={{
            left: `${(star.left / 100) * dimensions.width}px`,
            top: `${(star.top / 100) * dimensions.height}px`,
            width: star.size,
            height: star.size,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            position: "absolute",
          }}
          className="rounded-full opacity-100 animate-star"
        />
      ))}
      <style jsx global>{`
        :root {
          --star-line-color: #000; /* blue-400 */
        }
        .dark {
          --star-line-color: #fff; /* pink-400, cambia por el color que prefieras */
        }
        @keyframes star {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.1; }
        }
        .animate-star {
          animation: star infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default BgAnimate;