"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

type Comentario = {
  id: number;
  producto_id: number;
  user_id: string;
  user_name: string | null;
  texto: string;
  created_at: string;
};

type Props = {
  productoId: number;
};

export default function Comments({ productoId }: Props) {
  const { isSignedIn } = useUser();
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const cargarComentarios = async () => {
    try {
      const res = await fetch(`/api/comentarios?producto_id=${productoId}`);
      const data = await res.json();
      setComentarios(Array.isArray(data) ? data : []);
    } catch {
      setComentarios([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarComentarios();
  }, [productoId]);

  const enviarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;

    setEnviando(true);
    try {
      const res = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producto_id: productoId,
          texto: texto.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al enviar");
        return;
      }

      setTexto("");
      await cargarComentarios();
    } catch {
      alert("Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Comentarios</h2>

      {/* Formulario */}
      {isSignedIn ? (
        <form onSubmit={enviarComentario} className="mb-8">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe tu comentario..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            className="mt-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
          >
            {enviando ? "Enviando..." : "Publicar comentario"}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
          <SignInButton mode="modal">
            <button className="text-orange-500 font-semibold hover:underline">
              Inicia sesión
            </button>
          </SignInButton>{" "}
          para dejar un comentario.
        </div>
      )}

      {/* Lista */}
      {cargando ? (
        <p className="text-gray-500 text-sm">Cargando comentarios...</p>
      ) : comentarios.length === 0 ? (
        <p className="text-gray-500 text-sm">Sé el primero en comentar.</p>
      ) : (
        <div className="space-y-4">
          {comentarios.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-100 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">
                  {c.user_name || "Usuario"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString("es-ES")}
                </span>
              </div>
              <p className="text-sm text-gray-700">{c.texto}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}