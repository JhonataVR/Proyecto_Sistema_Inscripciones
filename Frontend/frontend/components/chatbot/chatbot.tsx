import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

interface ChatbotProps {
  open: boolean;
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((msgs) => [...msgs, { sender: "user", text: input }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbot/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta: input }),
      });
      const data = await res.json();

      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: data.respuesta || "No se pudo obtener respuesta." },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "Error al conectar con el chatbot." },
      ]);
    }
    setInput("");
    setLoading(false);
  };

  function parseLinks(text: string) {
    // Regex simple para detectar URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-400 hover:text-blue-600 break-all"
        >
          {part}
        </a>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Terminal */}
      <div
        ref={modalRef}
        className="relative m-4 w-80 bg-black border-2 border-green-500 rounded-lg shadow-lg p-0 z-10 font-mono"
      >
        {/* Header con botón X */}
        <div className="flex items-center px-4 py-2 border-b border-green-700 bg-zinc-900 rounded-t-lg">
          <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
          <span className="h-3 w-3 bg-yellow-400 rounded-full mr-2"></span>
          <span className="h-3 w-3 bg-red-500 rounded-full mr-4"></span>
          <span className="text-green-400 font-bold text-base select-none flex-1">
            Terminal Asistente
          </span>
          <button
            onClick={onClose}
            className="text-green-400 hover:text-red-500 text-xl font-bold ml-auto w-9 h-9 px-2 focus:outline-none border-2 border-green-700 rounded-full duration-200 ease-in-out hover:rotate-90 transition-transform"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {/* Mensajes */}
        <div className="h-56 overflow-y-auto overflow-x-hidden mb-2 border-b border-green-700 px-4 py-2 bg-black">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-1 text-sm break-words ${
                msg.sender === "user"
                  ? "text-green-300 text-right"
                  : "text-green-400 text-left"
              }`}
            >
              <span>
                {msg.sender === "user" ? "> " : ""}
                {parseLinks(msg.text)}
              </span>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-green-600 animate-pulse">
              Pensando... █
            </div>
          )}
        </div>
        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 px-4 py-2 bg-zinc-900 rounded-b-lg"
        >
          <input
            type="text"
            className="flex-1 border border-green-700 bg-black text-green-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="¿En qué te ayudo?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-green-600 text-black px-3 py-1 rounded font-bold disabled:opacity-50"
            disabled={loading}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;