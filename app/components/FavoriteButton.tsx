"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

type Props = {
  productId: number;
};

export default function FavoriteButton({ productId }: Props) {
  const { isSignedIn } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;

    fetch("/api/favoritos")
      .then((res) => res.json())
      .then((data) => {
        setIsFavorite(data.favoritos?.includes(productId) || false);
      })
      .catch(() => {});
  }, [isSignedIn, productId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      alert("Debes iniciar sesión para guardar favoritos");
      return;
    }

    setLoading(true);

    const action = isFavorite ? "remove" : "add";

    const res = await fetch("/api/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, action }),
    });

    if (res.ok) {
      setIsFavorite(!isFavorite);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className="text-2xl hover:scale-110 transition"
      title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      {isFavorite ? "❤️" : "🤍"}
    </button>
  );
}