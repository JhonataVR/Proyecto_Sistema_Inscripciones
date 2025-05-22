"use client";
import React, { useEffect, useState } from "react";

interface TitlePageProps {
  size?: string; // Ejemplo: "text-3xl", "text-5xl"
  text?: string;
}

const TitlePage: React.FC<TitlePageProps> = ({
  size = "text-4xl sm:text-6xl md:text-7xl lg:text-8xl",
  text = "INGENIERIA DE SISTEMAS",
}) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed(""); // Reinicia si cambia el texto
    setDone(false);
    const speed = 40; // velocidad rápida y visible en todos los dispositivos
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i === text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="z-10 sm:mt-8 md:m-12 lg:m-16 px-2 sm:px-4 ">
      <h1
        className={`${size} relative z-50 font-bold font-rubik dark:text-shadow-lg/20 dark:text-shadow-white text-shadow-lg/30 text-shadow-black text-zinc-950 dark:text-blue-50`}
      >
        {displayed}
        <span className={done ? "animate-pulse" : ""}>|</span>
      </h1>
    </div>
  );
};

export default TitlePage;
