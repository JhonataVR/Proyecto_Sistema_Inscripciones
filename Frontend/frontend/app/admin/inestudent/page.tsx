"use client";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
interface Carrera {
  id: number;
  nombre: string;
}

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
  const [carreras, setCarreras] = useState<Carrera[]>([]);

  // Para el modal
  const [showModal, setShowModal] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [matricula, setMatricula] = useState("");
  const [carrera, setCarrera] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");

  useEffect(() => {
    // Cargar carreras para el select
    const token = localStorage.getItem("access");
    fetch(`${API_BASE_URL}/api/carreras/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCarreras(data.results || []))
      .catch(() => setCarreras([]));
  }, []);

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
          rol: "estudiante",
          is_active: true,
          ci,
          telefono,
          direccion,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsuarioId(data.id);
        setShowModal(true); // Mostrar modal para completar datos de estudiante
      } else {
        setError(JSON.stringify(data) || "Error al crear el usuario estudiante");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  const handleEstudianteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    const token = localStorage.getItem("access");
    try {
      const estudianteRes = await fetch(`${API_BASE_URL}/api/estudiantes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usuario_id: usuarioId, // Usa usuario_id según tu backend
          matricula,
          carrera,
          fecha_ingreso: fechaIngreso,
        }),
      });
      if (estudianteRes.ok) {
        setMensaje("Estudiante creado correctamente");
        setShowModal(false);
        setEmail("");
        setFirstName("");
        setLastName("");
        setPassword("");
        setCi("");
        setTelefono("");
        setDireccion("");
        setMatricula("");
        setCarrera("");
        setFechaIngreso("");
        setUsuarioId(null);
      } else {
        const estudianteErr = await estudianteRes.json();
        setError(JSON.stringify(estudianteErr) || "Error al crear el perfil estudiante");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4">Crear estudiante</h1>
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
          Crear usuario estudiante
        </button>
        {mensaje && <div className="text-green-600 text-center">{mensaje}</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
      </form>

      {/* Modal para completar datos de estudiante */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md flex flex-col gap-4 w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
              onClick={() => setShowModal(false)}
            >
              X
            </button>
            <h2 className="text-xl font-bold mb-2">Datos de Estudiante</h2>
            <form onSubmit={handleEstudianteSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Matrícula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
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
              <input
                type="date"
                placeholder="Fecha de ingreso"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                required
                className="p-2 rounded border"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded p-2 font-bold hover:bg-blue-700"
              >
                Guardar perfil estudiante
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}