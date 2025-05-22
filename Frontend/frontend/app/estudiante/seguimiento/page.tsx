"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
interface Materia {
  nombre: string;
}

interface Docente {
  usuario: {
    first_name: string;
    last_name: string;
  };
}

interface Inscripcion {
  id: number;
  materia: Materia;
  docente: Docente;
  nota: number;
}

export default function Page() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInscripciones = async () => {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("access");
      try {
        // 1. Obtener el usuario actual
        const userRes = await fetch(`${API_BASE_URL}/api/auth/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        // 2. Obtener el perfil estudiante
        const estRes = await fetch(
          `${API_BASE_URL}/api/estudiantes/?usuario=${userData.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const estData = await estRes.json();
        const estudianteId = estData.results?.[0]?.id;
        if (!estudianteId) {
          setError("No se encontró el perfil de estudiante.");
          setLoading(false);
          return;
        }
        // 3. Obtener inscripciones del estudiante
        const inscRes = await fetch(
          `${API_BASE_URL}/api/inscripciones/?estudiante=${estudianteId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const inscData = await inscRes.json();
        setInscripciones(inscData.results || []);
      } catch {
        setError("Error al cargar los datos.");
      }
      setLoading(false);
    };
    fetchInscripciones();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Mis Materias y Notas</h1>
      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Materia</th>
              <th className="p-2 border">Docente</th>
              <th className="p-2 border">Nota</th>
            </tr>
          </thead>
          <tbody>
            {inscripciones.map((insc) => (
              <tr key={insc.id}>
                <td className="p-2 border">
                  {insc.materia?.nombre ?? "Sin materia"}
                </td>
                <td className="p-2 border">
                  {insc.docente?.usuario
                    ? `${insc.docente.usuario.first_name} ${insc.docente.usuario.last_name}`
                    : "Sin docente"}
                </td>
                <td className="p-2 border">
                  {insc.nota ?? "Sin nota"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}