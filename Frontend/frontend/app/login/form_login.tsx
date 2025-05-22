"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import GlobalLoader from "@/components/ui/GlobalLoader";

export default function LoginPage() {
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
      <form
        onSubmit={handleLogin}
        className="z-10 relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md flex flex-col gap-5 w-80 min-h-80 border-2 border-slate-900 "
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded border"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded border-slate-300 border-1"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>
        {error && <div className="text-red-500 text-center">{error}</div>}
      </form>
    </>
  );
}
