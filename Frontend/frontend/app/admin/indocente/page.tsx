"use client";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";
export default function Page() {
  const [email, setEmail] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [ci, setCi] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // Para el modal
  const [showModal, setShowModal] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [fechaContratacion, setFechaContratacion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    const token = localStorage.getItem("access");
    try {
      // 1. Crear usuario
      const res = await fetch(`${API_BASE_URL}/api/usuarios/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          first_name,
          last_name,
          password,
          rol: "docente",
          is_active: true,
          ci,
          telefono,
          direccion,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsuarioId(data.id);
        setShowModal(true); // Mostrar modal para completar datos de docente
      } else {
        setError(JSON.stringify(data) || "Error al crear el usuario docente");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  const handleDocenteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    const token = localStorage.getItem("access");
    try {
      const docenteRes = await fetch(`${API_BASE_URL}/api/docentes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usuario_id: usuarioId, // <-- CAMBIA AQUÍ
          titulo,
          especialidad,
          fecha_contratacion: fechaContratacion,
        }),
      });
      if (docenteRes.ok) {
        setMensaje("Docente creado correctamente");
        setShowModal(false);
        setEmail("");
        setFirstName("");
        setLastName("");
        setPassword("");
        setCi("");
        setTelefono("");
        setDireccion("");
        setTitulo("");
        setEspecialidad("");
        setFechaContratacion("");
        setUsuarioId(null);
      } else {
        const docenteErr = await docenteRes.json();
        setError(JSON.stringify(docenteErr) || "Error al crear el perfil docente");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4">Crear docente</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md flex flex-col gap-4 w-96">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 rounded border"
        />
        <input
          type="text"
          placeholder="Nombre"
          value={first_name}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="p-2 rounded border"
        />
        <input
          type="text"
          placeholder="Apellido"
          value={last_name}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="p-2 rounded border"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 rounded border"
        />
        <input
          type="text"
          placeholder="CI"
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          required
          className="p-2 rounded border"
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
          className="p-2 rounded border"
        />
        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          required
          className="p-2 rounded border"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded p-2 font-bold hover:bg-blue-700"
        >
          Crear usuario docente
        </button>
        {mensaje && <div className="text-green-600 text-center">{mensaje}</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
      </form>

      {/* Modal para completar datos de docente */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md flex flex-col gap-4 w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
              onClick={() => setShowModal(false)}
            >
              X
            </button>
            <h2 className="text-xl font-bold mb-2">Datos de Docente</h2>
            <form onSubmit={handleDocenteSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Título"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="p-2 rounded border"
              />
              <input
                type="text"
                placeholder="Especialidad"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                required
                className="p-2 rounded border"
              />
              <input
                type="date"
                placeholder="Fecha de contratación"
                value={fechaContratacion}
                onChange={(e) => setFechaContratacion(e.target.value)}
                required
                className="p-2 rounded border"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded p-2 font-bold hover:bg-blue-700"
              >
                Guardar perfil docente
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}