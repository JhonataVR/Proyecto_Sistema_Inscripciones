"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { on } from "events";

export default function LoginPage({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        // Obtener datos del usuario autenticado
        const meRes = await fetch(`${API_BASE_URL}/api/auth/me/`, {
          headers: { Authorization: `Bearer ${data.access}` },
        });
        const me = await meRes.json();

        // Redirigir según el rol
        if (me.rol === "estudiante") {
          router.push("/estudiante");
        } else if (me.rol === "admin") {
          router.push("/admin");
        } else {
          setError("Rol no permitido");
          setLoading(false);
        }
      } else {
        setError(data.detail || "Credenciales incorrectas");
        setLoading(false);
      }
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalLoader show={loading} />
      <div className="relative flex flex-col items-center justify-center min-h-[420px] ">
        {/* Fondo animado tipo matrix */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="w-full h-full animate-hacker-bg opacity-60" />
        </div>
        {/* Botón de cierre */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 text-green-400 hover:text-red-500 text-xl font-bold ml-auto w-9 h-9  focus:outline-none border-2 border-green-700 rounded-full duration-200 ease-in-out hover:rotate-90 transition-transform group"
          aria-label="Cerrar"
        >
          <span className="text-2xl font-bold leading-none group-hover:scale-125 transition-transform duration-200">
            ✕
          </span>
        </button>
        {/* Marco tipo terminal */}
        <form
          onSubmit={handleLogin}
          className="z-10 relative bg-black/95 border-2 border-green-500 rounded-lg shadow-2xl p-8 flex flex-col gap-5 w-[340px] min-h-80 font-mono text-green-400 terminal-glow"
          autoComplete="off"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="h-3 w-3 bg-green-500 rounded-full"></span>
            <span className="h-3 w-3 bg-yellow-400 rounded-full"></span>
            <span className="h-3 w-3 bg-red-500 rounded-full"></span>
            <span className="ml-4 text-green-400 font-bold text-lg tracking-widest select-none animate-hacker-title">
              LOGIN TERMINAL
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-green-300 text-xs tracking-widest animate-hacker-label">
              🤖Correo electrónico
            </label>
            <input
              type="email"
              placeholder="user@hacker.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/80 border border-green-700 rounded px-3 py-2 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-inner animate-hacker-input transition-all duration-200"
              required
              autoComplete="username"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-green-300 text-xs tracking-widest animate-hacker-label">
              🔑Contraseña
            </label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/80 border border-green-700 rounded px-3 py-2 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-inner animate-hacker-input transition-all duration-200"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-green-700 hover:bg-green-500 text-black font-bold py-2 rounded transition-all duration-200 shadow-lg border border-green-400 animate-hacker-btn relative overflow-hidden"
          >
            <span className="relative z-10">
              {loading ? (
                <span className="animate-pulse">[ ACCEDIENDO... ]</span>
              ) : (
                <span>[ INGRESAR ]</span>
              )}
            </span>
            <span className="absolute left-0 top-0 w-full h-full bg-green-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></span>
          </button>
          {error && (
            <div className="text-red-400 text-center mt-2 animate-hacker-error">
              {error}
            </div>
          )}
          <div className="mt-4 text-xs text-green-600 text-center opacity-70 animate-hacker-footer">
            Universidad de Ingeniería de Sistemas - Acceso restringido
          </div>
        </form>
        {/* Animaciones y fondo tipo matrix */}
        <style jsx global>{`
          @keyframes hacker-bg {
            0% { background-position: 0 0, 0 0; }
            100% { background-position: 0 1000px, 0 1000px; }
          }
          .animate-hacker-bg {
            background-image:
              repeating-linear-gradient(180deg, rgba(0,255,0,0.08) 0 2px, transparent 2px 8px),
              repeating-linear-gradient(180deg, rgba(0,255,0,0.04) 0 1px, transparent 1px 4px);
            background-size: 100% 40px, 100% 16px;
            animation: hacker-bg 10s linear infinite;
          }
          @keyframes hacker-title {
            0% { letter-spacing: 0.5em; opacity: 0; }
            100% { letter-spacing: 0.1em; opacity: 1; }
          }
          .animate-hacker-title {
            animation: hacker-title 1.2s cubic-bezier(.4,2,.6,1.2) both;
          }
          @keyframes hacker-label {
            0% { opacity: 0; transform: translateX(-20px);}
            100% { opacity: 1; transform: translateX(0);}
          }
          .animate-hacker-label {
            animation: hacker-label 0.8s cubic-bezier(.4,2,.6,1.2) both;
          }
          @keyframes hacker-input {
            0% { opacity: 0; transform: scaleX(0.8);}
            100% { opacity: 1; transform: scaleX(1);}
          }
          .animate-hacker-input {
            animation: hacker-input 1s cubic-bezier(.4,2,.6,1.2) both;
          }
          @keyframes hacker-btn {
            0% { opacity: 0; transform: scale(0.9);}
            100% { opacity: 1; transform: scale(1);}
          }
          .animate-hacker-btn {
            animation: hacker-btn 1.2s cubic-bezier(.4,2,.6,1.2) both;
          }
          @keyframes hacker-error {
            0% { opacity: 0; transform: scale(0.8);}
            100% { opacity: 1; transform: scale(1);}
          }
          .animate-hacker-error {
            animation: hacker-error 0.5s cubic-bezier(.4,2,.6,1.2) both;
          }
          @keyframes hacker-footer {
            0% { opacity: 0;}
            100% { opacity: 0.7;}
          }
          .animate-hacker-footer {
            animation: hacker-footer 1.5s cubic-bezier(.4,2,.6,1.2) both;
          }
          .terminal-glow {
            box-shadow: 0 0 24px 2px #22ff22cc, 0 0 2px 0 #22ff22cc inset;
          }
        `}</style>
      </div>
    </>
  );
}
