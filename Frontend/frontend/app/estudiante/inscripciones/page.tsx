"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
interface Grupo {
  id: number;
  materia_nombre: string;
  paralelo: string;
  gestion: string;
  docente_nombre: string;
}

export default function InscripcionPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoId, setGrupoId] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Cargar grupos disponibles
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${API_BASE_URL}/api/grupos/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setGrupos(data.results || []))
      .catch(() => setError("No se pudieron cargar los grupos"));
  }, [router]);

  // Manejar inscripción
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    const token = localStorage.getItem("access");
    if (!token) {
      setError("No autenticado");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/inscripciones/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ grupo: grupoId }),
      });
      if (res.ok) {
        setMensaje("¡Inscripción exitosa!");
      } else {
        const data = await res.json();
        setError(data.detail || "Error al inscribir");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded shadow-md flex flex-col gap-4 w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Inscripción a Materias</h2>
        <label className="font-semibold">Selecciona un grupo:</label>
        <select
          value={grupoId}
          onChange={(e) => setGrupoId(e.target.value)}
          className="p-2 rounded border"
          required
        >
          <option value="">-- Selecciona --</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.materia_nombre} | Paralelo: {g.paralelo} | Gestión: {g.gestion} | Docente: {g.docente_nombre}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded p-2 font-bold hover:bg-blue-700"
          disabled={!grupoId}
        >
          Inscribirse
        </button>
        {mensaje && <div className="text-green-600 text-center">{mensaje}</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
      </form>
    </div>
  );
}