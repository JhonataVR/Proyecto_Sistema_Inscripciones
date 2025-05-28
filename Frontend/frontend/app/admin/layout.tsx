"use client";
import React, { useState, useEffect } from "react";
import ThemeToggle from "../theme-toggle";
import { useRouter, usePathname } from "next/navigation";
import LoginPage from "@/app/login/form_login";
import Chatbot from "@/components/chatbot/chatbot";
import GlobalLoader from "@/components/ui/GlobalLoader";
import Aside from "./aside";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const headerHeight = "4rem";
  const [showLogin, setShowLogin] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const profileImg = "/img/foto.jpg"; // Cambia por tu ruta
  const robotImg = "/img/robot.png"; // Cambia por tu ruta
  const [showRobotModal, setShowRobotModal] = useState(true);
  const [robotClosing, setRobotClosing] = useState(false);
  // URL de la imagen de perfil
  // Global loader
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // 1 segundo
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!showRobotModal) return;
    const timer = setTimeout(() => {
      setRobotClosing(true);
      setTimeout(() => {
        setShowRobotModal(false);
        setRobotClosing(false); // Reinicia para la próxima vez
      }, 600); // 600ms = duración animación
    }, 5000);
    return () => clearTimeout(timer);
  }, [showRobotModal]);

  return (
    <>
      <GlobalLoader show={loading} />

      {!loading && (
        <div
          id="inicio"
          className="min-h-screen w-full bg-white relative flex overflow-hidden"
        >
          {showRobotModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
              <div
                className={`
        flex items-center bg-zinc-900 rounded-xl p-8 shadow-lg border-2 dark:border-green-500 border-blue-500
        transition-all duration-700
        ${
          robotClosing
            ? "scale-50 translate-x-[38vw] -translate-y-[38vh] opacity-0"
            : "scale-100"
        }
      `}
                style={{ willChange: "transform, opacity" }}
              >
                <img
                  className="w-24 h-24 mr-6"
                  src={robotImg}
                  alt="imagenRobot"
                />
                <div className="dark:text-green-400 text-blue-400 font-mono text-xl">
                  ¡Hola! Soy tu asistente virtual.
                  <br />
                  ¿En qué puedo ayudarte hoy?
                </div>
              </div>
            </div>
          )}
          <Aside />
          <div className="flex flex-col flex-1 min-h-screen">
            {/* Header */}
            <header
              style={{ height: headerHeight }}
              className="fixed top-0 left-0 w-full z-30 flex items-center justify-center space-x-10 bg-blue-600 dark:bg-zinc-950 border-amber-50 border-b-2 border-dashed "
            >
              {/* Informação */}
              <div className="flex flex-shrink-0 items-center space-x-4 text-white">
                {/* Tema */}
                <div className="fixed h-16 w-16 top-0 left-0 bg-blue-600 dark:bg-zinc-950"></div>
                {/* tema */}
                <ThemeToggle></ThemeToggle>
                <div className="flex flex-col items-end ">
                  {/* Nome */}
                  <div className="text-md font-bold text-3xl lg:text-4xl ">
                    Bienvenido
                  </div>
                  {/* Título */}
                </div>
                <button
                  className="absolute right-0 rounded-4xl cursor-pointer group transition-transform duration-300"
                  onClick={() => setShowChatbot((prev) => !prev)}
                  style={{ width: 56, height: 56 }}
                >
                  <span
                    className="absolute left-[-70px] top-1/2 -translate-y-1/2 bg-zinc-900 text-green-400 font-mono text-sm px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Oli
                  </span>
                  {/* Robot detrás */}
                  <img
                    className={`w-5 absolute left-5 top-5 z-0 transition-all duration-100
      ${
        showChatbot
          ? "translate-x-[-16px] -translate-y-2 -rotate-10 scale-220 top-6"
          : ""
      }
      group-hover:translate-x-[-16px] group-hover:-translate-y-2 group-hover:-rotate-10 group-hover:scale-220 group-hover:top-6
    `}
                    src={robotImg}
                    alt="imagenRobot"
                    style={{ transition: "all 0.3s" }}
                  />
                  {/* Puerta encima */}
                  <img
                    src="/img/puerta.png"
                    alt="puerta"
                    className="w-14 absolute left-0 top-0 z-10 transition-transform duration-300 group-hover:rotate-12 "
                    style={{ transition: "transform 0.3s" }}
                  />
                </button>
                {/* Foto */}
                <button
                  className="h-10 w-10 rounded-full cursor-pointer bg-gray-200 border-2 border-blue-400 overflow-hidden flex items-center justify-center"
                  onClick={() => setShowPhoto(true)}
                >
                  <img
                    src={profileImg}
                    alt="Foto profile"
                    className="object-cover w-full h-full"
                  />
                </button>

                {/* Modal de la foto */}
                {showPhoto && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="relative">
                      <button
                        onClick={() => setShowPhoto(false)}
                        className="absolute top-2 right-2 text-white text-2xl bg-black/50 rounded-full px-2"
                      >
                        ❌
                      </button>
                      <img
                        src={profileImg}
                        alt="Foto de perfil grande"
                        className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </header>
            {showChatbot && (
              <div className="absolute top-[4rem] right-4 z-80">
                <Chatbot
                  open={showChatbot}
                  onClose={() => setShowChatbot(false)}
                />
              </div>
            )}
            {/* Main */}
            <main className="snap-y snap-mandatory flex-1 bg-transparent max-w-full w-full flex flex-col relative">
              {children}
            </main>
            <footer className="z-50">
              <div className="ml-16 flex items-center justify-between p-4 bg-gray-200 dark:bg-zinc-950">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  © 2023 Mi Aplicación
                </span>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:underline "
                  >
                    Política de privacidad
                  </a>
                  <a
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                  >
                    Términos de servicio
                  </a>
                </div>
              </div>
            </footer>
          </div>
          {/* Modal para LoginPage */}
          {showLogin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 relative">
                <button
                  onClick={() => setShowLogin(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  ✕
                </button>
                <LoginPage onClose={() => setShowLogin(false)} />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
