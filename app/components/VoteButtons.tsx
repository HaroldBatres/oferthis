"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

type Props = {
  productId: number;
};

export default function VoteButtons({ productId }: Props) {
  const { isSignedIn } = useUser();
  const [up, setUp] = useState(0);
  const [down, setDown] = useState(0);
  const [miVoto, setMiVoto] = useState<"up" | "down" | null>(null);
  const [cargando, setCargando] = useState(false);

  const cargar = async () => {
    try {
      const res = await fetch(`/api/votos?producto_id=${productId}`);
      const data = await res.json();
      setUp(data.up ?? 0);
      setDown(data.down ?? 0);
      setMiVoto(data.miVoto ?? null);
    } catch {
      // silencio
    }
  };

  useEffect(() => {
    cargar();
  }, [productId]);

  const votar = async (tipo: "up" | "down") => {
    if (!isSignedIn) return;
    setCargando(true);
    try {
      const res = await fetch("/api/votos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto_id: productId, tipo }),
      });
      if (res.ok) {
        await cargar();
      }
    } finally {
      setCargando(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <SignInButton mode="modal">
          <button className="text-orange-500 font-medium hover:underline">
            Inicia sesión
          </button>
        </SignInButton>
        <span>para votar</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => votar("up")}
        disabled={cargando}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
          miVoto === "up"
            ? "bg-green-50 border-green-300 text-green-700"
            : "border-gray-200 hover:border-green-300 hover:text-green-600"
        }`}
      >
        👍 {up}
      </button>
      <button
        onClick={() => votar("down")}
        disabled={cargando}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
          miVoto === "down"
            ? "bg-red-50 border-red-300 text-red-700"
            : "border-gray-200 hover:border-red-300 hover:text-red-600"
        }`}
      >
        👎 {down}
      </button>
    </div>
  );
}