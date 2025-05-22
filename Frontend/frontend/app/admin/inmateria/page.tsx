"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
interface Carrera {
  id: number;
  nombre: string;
}

interface Materia {
  id: number;
  nombre: string;
  sigla: string;
}

export default function Page() {
  const [nombre, setNombre] = useState("");
  const [sigla, setSigla] = useState("");
  const [horasAcademicas, setHorasAcademicas] = useState("");
  const [nivel, setNivel] = useState("");
  const [creditos, setCreditos] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [carrera, setCarrera] = useState("");
  const [requisito, setRequisito] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("access");
    fetch(`${API_BASE_URL}/api/carreras/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCarreras(data.results || []))
      .catch(() => setCarreras([]));

    fetch(`${API_BASE_URL}/api/materias/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMaterias(data.results || []))
      .catch(() => setMaterias([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    const token = localStorage.getItem("access");
    try {
      // 1. Crear la materia
      const res = await fetch(`${API_BASE_URL}/api/materias/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          sigla,
          horas_academicas: horasAcademicas,
          nivel,
          creditos,
          descripcion,
          carrera,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // 2. Si hay requisito y nivel > 1, crea el requisito en la tabla MateriaRequisito
        if (parseInt(nivel) > 1 && requisito) {
          await fetch(`${API_BASE_URL}/api/materia-requisitos/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              materia: data.id,      // ID de la materia recién creada
              requisito: requisito,  // ID de la materia requisito seleccionada
            }),
          });
        }
        setMensaje("Materia creada correctamente");
        setNombre("");
        setSigla("");
        setHorasAcademicas("");
        setNivel("");
        setCreditos("");
        setDescripcion("");
        setCarrera("");
        setRequisito("");
      } else {
        setError(JSON.stringify(data) || "Error al crear la materia");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4">Crear materia</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md flex flex-col gap-4 w-96">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="p-2 rounded border"
        />
        <input
          type="text"
          placeholder="Sigla"
          value={sigla}
          onChange={(e) => setSigla(e.target.value)}
          required
          className="p-2 rounded border"
        />
        <input
          type="number"
          placeholder="Horas académicas"
          value={horasAcademicas}
          onChange={(e) => setHorasAcademicas(e.target.value)}
          required
          className="p-2 rounded border"
        />
        <input
          type="number"
          placeholder="Nivel"
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
          required
          className="p-2 rounded border"
        />
        <input
          type="number"
          placeholder="Créditos"
          value={creditos}
          onChange={(e) => setCreditos(e.target.value)}
          required
          className="p-2 rounded border"
        />
        <select
          value={carrera}
          onChange={(e) => setCarrera(e.target.value)}
          required
          className="p-2 rounded border"
        >
          <option value="">-- Selecciona carrera --</option>
          {carreras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        {/* Campo de requisito solo si nivel > 1 */}
        <select
          value={requisito}
          onChange={(e) => setRequisito(e.target.value)}
          className="p-2 rounded border"
          disabled={parseInt(nivel) <= 1 || materias.length === 0}
        >
          <option value="">-- Materia requisito (opcional) --</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre} ({m.sigla})
            </option>
          ))}
        </select>
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="p-2 rounded border"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded p-2 font-bold hover:bg-blue-700"
        >
          Crear materia
        </button>
        {mensaje && <div className="text-green-600 text-center">{mensaje}</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
      </form>
    </div>
  );
}