"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

type Props = {
  productId: number;
};

export default function VoteButtons({ productId }: Props) {
  const { isSignedIn } = useAuth();
  const [up, setUp] = useState(0);
  const [down, setDown] = useState(0);
  const [miVoto, setMiVoto] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    fetch(`/api/votos?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setUp(data.up || 0);
        setDown(data.down || 0);
      })
      .catch(() => {});
  }, [productId]);

  const votar = async (tipo: "up" | "down") => {
    if (!isSignedIn) {
      alert("Debes iniciar sesión para votar");
      return;
    }

    const res = await fetch("/api/votos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, tipo }),
    });

    if (res.ok) {
      // Actualizamos los contadores de forma simple
      if (miVoto === tipo) return; // ya votó lo mismo

      if (tipo === "up") {
        setUp((prev) => prev + 1);
        if (miVoto === "down") setDown((prev) => Math.max(0, prev - 1));
      } else {
        setDown((prev) => prev + 1);
        if (miVoto === "up") setUp((prev) => Math.max(0, prev - 1));
      }

      setMiVoto(tipo);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-6">
      <button
        onClick={() => votar("up")}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
          miVoto === "up"
            ? "bg-green-100 border-green-500 text-green-700"
            : "hover:bg-gray-50"
        }`}
      >
        <span className="text-xl">👍</span>
        <span className="font-semibold">{up}</span>
      </button>

      <button
        onClick={() => votar("down")}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
          miVoto === "down"
            ? "bg-red-100 border-red-500 text-red-700"
            : "hover:bg-gray-50"
        }`}
      >
        <span className="text-xl">👎</span>
        <span className="font-semibold">{down}</span>
      </button>
    </div>
  );
}