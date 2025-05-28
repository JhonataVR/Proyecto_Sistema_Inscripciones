"use client";

export default function Page() {
  // Simulación de datos
  const topSubjects = [
    { name: "Matemáticas Discretas", score: 95 },
    { name: "Programación I", score: 92 },
    { name: "Lógica de Sistemas", score: 90 },
  ];
  const toImprove = [
    { name: "Cálculo II", score: 65 },
    { name: "Física General", score: 70 },
  ];
  const upcomingEvents = [
    { title: "Examen Parcial", date: "2025-06-10" },
    { title: "Entrega Proyecto", date: "2025-06-15" },
  ];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-700 via-blue-900 to-indigo-900 p-4">
      {/* Bloque de bienvenida */}
      <div className="w-full max-w-5xl flex flex-col items-center gap-8">
        <div className="bg-white/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg text-center animate-slide-down">
            ¡Bienvenido, Estudiante!
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-4 text-center max-w-xl animate-fade-in">
            Nos alegra tenerte aquí en el portal de Ingeniería de Sistemas.
            <br />
            Aquí tienes un resumen de tu avance y novedades importantes.
          </p>
        </div>

        {/* Secciones informativas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Top Materias */}
          <section className="bg-blue-500/90 rounded-xl shadow-lg p-6 flex flex-col gap-2 animate-tile-move">
            <h2 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
              ⭐ Materias Top
            </h2>
            {topSubjects.map((m, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-blue-600/60 rounded px-3 py-1 mb-1 last:mb-0 transition-transform hover:scale-105"
              >
                <span className="text-white font-medium">{m.name}</span>
                <span className="text-white font-bold">{m.score}</span>
              </div>
            ))}
          </section>
          {/* Materias a mejorar */}
          <section className="bg-yellow-500/90 rounded-xl shadow-lg p-6 flex flex-col gap-2 animate-tile-move [animation-delay:0.2s]">
            <h2 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
              ⚠️ Materias a Mejorar
            </h2>
            {toImprove.map((m, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-yellow-600/60 rounded px-3 py-1 mb-1 last:mb-0 transition-transform hover:scale-105"
              >
                <span className="text-white font-medium">{m.name}</span>
                <span className="text-white font-bold">{m.score}</span>
              </div>
            ))}
          </section>
          {/* Próximos eventos */}
          <section className="bg-green-500/90 rounded-xl shadow-lg p-6 flex flex-col gap-2 animate-tile-move [animation-delay:0.4s]">
            <h2 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
              📅 Próximos Eventos
            </h2>
            {upcomingEvents.map((e, i) => (
              <div
                key={i}
                className="flex flex-col bg-green-600/60 rounded px-3 py-1 mb-1 last:mb-0 transition-transform hover:scale-105"
              >
                <span className="text-white font-medium">{e.title}</span>
                <span className="text-white text-xs">{e.date}</span>
              </div>
            ))}
          </section>
        </div>

        {/* Mensaje motivacional */}
        <div className="bg-black/30 rounded-xl px-6 py-4 text-center text-blue-100 text-lg font-medium shadow-inner w-full animate-fade-in">
          “El éxito es la suma de pequeños esfuerzos repetidos día tras día.”
        </div>
      </div>
      {/* Footer */}
      <div className="mt-10 text-white/70 text-sm text-center">
        Universidad de Ingeniería de Sistemas &copy; {new Date().getFullYear()}
      </div>

      {/* Animaciones Tailwind personalizadas */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease;
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.8s cubic-bezier(0.4, 2, 0.6, 1.2);
        }
        @keyframes tile-move {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-tile-move {
          animation: tile-move 0.8s cubic-bezier(0.4, 2, 0.6, 1.2);
        }
      `}</style>
    </main>
  );
}
