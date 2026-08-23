"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function NewsletterForm() {
  const t = useTranslations("Newsletter");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setMensaje(t("success"));
      setEmail("");
    } else {
      setMensaje(t("error"));
    }

    setLoading(false);
  };

  return (
    <div className="bg-orange-50 rounded-2xl p-8 border border-orange-100">
      <h3 className="text-2xl font-bold mb-2 text-gray-900">
        📬 {t("title")}
      </h3>
      <p className="text-gray-600 mb-6">{t("subtitle")}</p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          required
          className="flex-1 border rounded-xl px-4 py-3 text-gray-900"
          style={{ color: "#111827", WebkitTextFillColor: "#111827" }}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
        >
          {loading ? t("sending") : t("submit")}
        </button>
      </form>

      {mensaje && (
        <p className="mt-4 text-sm font-medium text-green-600">{mensaje}</p>
      )}
    </div>
  );
}