"use client";

import { useState } from "react";
import Link from "next/link";
import FavoriteButton from "./FavoriteButton";

type Producto = Record<string, any>;

function pick(p: Producto, keys: string[]) {
  for (const k of keys) {
    if (p[k] !== undefined && p[k] !== null && p[k] !== "") return p[k];
  }
  return undefined;
}

function toNumber(v: unknown) {
  if (v == null || v === "") return 0;
  const n = parseFloat(String(v).replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.abs(n) : 0;
}

function tiendaStyle(tienda: string) {
  const t = tienda.toLowerCase();
  if (t.includes("amazon")) {
    return { label: "Amazon", className: "border-[#ff9900] text-[#ff9900]" };
  }
  if (t.includes("ebay")) {
    return { label: "eBay", className: "border-[#0064d2] text-[#0064d2]" };
  }
  if (t.includes("ali")) {
    return { label: "AliExpress", className: "border-[#e62e04] text-[#e62e04]" };
  }
  if (t.includes("shein")) {
    return { label: "SHEIN", className: "border-[#7b2cbf] text-[#7b2cbf]" };
  }
  return { label: tienda, className: "border-gray-400 text-gray-500" };
}

export default function ProductCard({ product }: { product: Producto }) {
  const nombre = String(pick(product, ["nombre", "titulo", "title", "name"]) ?? "Oferta");
  const imagen = String(
    pick(product, ["imagen", "image", "image_url", "foto"]) ?? "/placeholder.png"
  );
  const url = String(pick(product, ["url", "enlace", "link", "affiliate_url"]) ?? "#");
  const tienda = String(pick(product, ["tienda", "store", "merchant"]) ?? "");
  const precio = toNumber(pick(product, ["precio", "precio_oferta", "price", "precio_actual"]));
  const original = toNumber(
    pick(product, ["antes", "precio_original", "precio_antes", "original_price"])
  );
  const descuentoCampo = toNumber(
    pick(product, ["descuento", "discount", "porcentaje", "descuento_porcentaje"])
  );
  const descuento =
    descuentoCampo > 0 && descuentoCampo <= 95
      ? Math.round(descuentoCampo)
      : original > precio && precio > 0
        ? Math.round(((original - precio) / original) * 100)
        : 0;
  const id = pick(product, ["id", "product_id"]) ?? "";
  const ficha = id ? `/producto/${id}` : url;
  const store = tienda ? tiendaStyle(tienda) : null;

  const [cursor, setCursor] = useState({ x: 0, y: 0, on: false });

  return (
    <article
      className="product-glow relative flex h-full cursor-none flex-col overflow-hidden rounded-2xl bg-white text-gray-900 shadow-sm transition duration-200"
      onMouseEnter={() => setCursor((c) => ({ ...c, on: true }))}
      onMouseLeave={() => setCursor((c) => ({ ...c, on: false }))}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setCursor({
          x: e.clientX - r.left,
          y: e.clientY - r.top,
          on: true,
        });
      }}
    >
      <style>{`
        @keyframes oferthis-flotar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .oferthis-flotar { animation: oferthis-flotar 1.4s ease-in-out infinite; }
        .product-glow:hover {
          transform: translateY(-4px);
          box-shadow:
            0 0 12px #ff6a00,
            0 0 28px rgba(255,106,0,.7),
            0 0 48px rgba(255,106,0,.35);
        }
        @keyframes chispa {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(.2); opacity: 0; }
        }
        .chispa {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 99px;
          background: #ffcc66;
          box-shadow: 0 0 6px #ff6a00;
          animation: chispa .55s ease-out infinite;
        }
      `}</style>

      {cursor.on && (
        <div
          className="pointer-events-none absolute z-50"
          style={{ left: cursor.x, top: cursor.y, transform: "translate(-50%, -70%)" }}
        >
          <span className="block text-xl leading-none drop-shadow-[0_0_8px_#ff6a00]">
            🔥
          </span>
          <span className="chispa" style={{ left: 6, top: -2, ["--dx" as any]: "10px", ["--dy" as any]: "-14px" }} />
          <span className="chispa" style={{ left: -4, top: 0, ["--dx" as any]: "-12px", ["--dy" as any]: "-16px", animationDelay: ".12s" }} />
          <span className="chispa" style={{ left: 2, top: 4, ["--dx" as any]: "6px", ["--dy" as any]: "-18px", animationDelay: ".24s" }} />
        </div>
      )}

      <div className="relative h-[180px] w-full shrink-0 bg-white">
        {descuento > 0 && (
          <span className="oferthis-flotar pointer-events-none absolute left-2 top-2 z-30 rounded-md bg-orange-500 px-2 py-1 text-xs font-extrabold text-white shadow-md">
            -{descuento}%
          </span>
        )}

        <span className="pointer-events-none absolute right-2 top-2 z-30 rounded-md border border-orange-500 bg-white px-1.5 py-1 text-[9px] font-extrabold leading-tight text-orange-500 shadow-[0_2px_8px_rgba(249,115,22,0.55)]">
          OFERTA
          <br />
          OFERTHIS
        </span>

        <div className="absolute right-2 top-12 z-30">
          <FavoriteButton productId={id} />
        </div>

        <Link href={ficha} className="block h-[180px] w-full cursor-none">
          <img
            src={imagen}
            alt={nombre}
            className="h-[180px] w-full object-contain p-3"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-1">
        <Link href={ficha} className="cursor-none">
          <h3 className="line-clamp-2 min-h-10 text-[13px] font-semibold leading-snug hover:underline">
            {nombre}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          {original > precio && (
            <span className="text-xs text-gray-400 line-through">
              {original.toFixed(2)} €
            </span>
          )}
          {precio > 0 && (
            <span className="text-lg font-extrabold">{precio.toFixed(2)} €</span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block cursor-none rounded-full bg-orange-500 py-2 text-center text-xs font-bold text-white hover:bg-orange-600"
          >
            Ver oferta →
          </a>

          {store && (
            <p className="mt-2 flex justify-center">
              <span
                className={`rounded-full border-2 px-3 py-0.5 text-[11px] font-bold ${store.className}`}
              >
                {store.label}
              </span>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}