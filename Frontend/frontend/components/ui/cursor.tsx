"use client";
import React, { useEffect, useRef, useState } from "react";

// Paleta arcoíris
const COLORS = [
  "#f87171", // red-400
  "#fbbf24", // yellow-400
  "#34d399", // green-400
  "#38bdf8", // sky-400
  "#a78bfa", // purple-400
  "#f472b6", // pink-400
  "#fb7185", // rose-400
];

type Spark = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
  life: number;
  id: number;
};

const MAX_SPARKS = 60;

const CursorRainbowSparks: React.FC = () => {
  const sparksRef = useRef<Spark[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    function spawnSparks(x: number, y: number) {
      const newSparks: Spark[] = [];
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1.5;
        newSparks.push({
          x,
          y,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: Math.random() * 4 + 4,
          life: 1,
          id: idRef.current++,
        });
      }
      sparksRef.current = [...sparksRef.current, ...newSparks].slice(-MAX_SPARKS);
    }

    function onMove(e: MouseEvent) {
      spawnSparks(e.clientX, e.clientY);
    }

    window.addEventListener("mousemove", onMove);

    let animationId: number;
    function animate() {
      sparksRef.current = sparksRef.current
        .map(spark => ({
          ...spark,
          x: spark.x + spark.dx,
          y: spark.y + spark.dy,
          dx: spark.dx * 0.96,
          dy: (spark.dy + 0.15) * 0.96, // gravedad
          life: spark.life - 0.025,
        }))
        .filter(spark => spark.life > 0);

      if (containerRef.current) {
        // Forzar rerender
        containerRef.current.style.opacity = containerRef.current.style.opacity === "1" ? "0.99" : "1";
      }
      animationId = requestAnimationFrame(animate);
    }
    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Forzar rerender usando una clave que cambia en cada frame
  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ width: "100vw", height: "100vh" }}
    >
      {sparksRef.current.map(spark => (
        <span
          key={spark.id}
          style={{
            position: "absolute",
            left: spark.x,
            top: spark.y,
            width: spark.size,
            height: spark.size,
            borderRadius: "50%",
            background: spark.color,
            opacity: spark.life,
            pointerEvents: "none",
            filter: "blur(0.5px)",
            boxShadow: `0 0 8px 2px ${spark.color}`,
            transition: "opacity 0.2s linear",
            zIndex: 9999,
          }}
        />
      ))}
    </div>
  );
};

const SimpleCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x - 10,
        top: pos.y - 10,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "rgba(59,130,246,0.5)", // azul-500 con opacidad
        pointerEvents: "none",
        zIndex: 9999,
        transition: "left 0.08s, top 0.08s",
        mixBlendMode: "difference",
      }}
    />
  );
};

export default CursorRainbowSparks;