import { NextResponse } from "next/server";
import { sql } from "../../lib/db";

export const dynamic = "force-dynamic";

function espera(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function sigueEnIngles(texto: string) {
  const n = (texto.match(/\b(the|and|with|for|this|your|from|that|watch|is|are|running)\b/gi) || []).length;
  return n >= 3;
}

async function conGoogle(parte: string) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=" +
    encodeURIComponent(parte);
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    cache: "no-store",
  });
  if (r.status === 429) return "";
  if (!r.ok) throw new Error("Traductor " + r.status);
  const data = await r.json();
  return (Array.isArray(data?.[0]) ? data[0] : [])
    .map((x: any) => (Array.isArray(x) ? x[0] : ""))
    .join("")
    .trim();
}

async function conMyMemory(parte: string) {
  const url =
    "https://api.mymemory.translated.net/get?langpair=en|es&q=" + encodeURIComponent(parte);
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return "";
  const data = await r.json();
  const es = String(data?.responseData?.translatedText || "").trim();
  if (!es || es.includes("MYMEMORY WARNING")) return "";
  return es;
}

async function traducir(texto: string): Promise<string> {
  const limpio = String(texto || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const frases = limpio.match(/[^.!?]+[.!?]?/g) || [limpio];
  const trozos: string[] = [];
  let buf = "";
  for (const frase of frases) {
    if ((buf + " " + frase).trim().length > 350) {
      if (buf) trozos.push(buf.trim());
      buf = frase;
    } else {
      buf = `${buf} ${frase}`.trim();
    }
  }
  if (buf) trozos.push(buf.trim());

  const salida: string[] = [];
  for (const parte of trozos) {
    let es = await conGoogle(parte);
    if (!es) {
      await espera(2500);
      es = await conGoogle(parte);
    }
    if (!es) es = await conMyMemory(parte);
    if (!es) throw new Error("Sin traducción");
    salida.push(es);
    await espera(1200);
  }
  return salida.join(" ");
}

export async function GET() {
  try {
    const filas = (await sql`
      SELECT id, nombre, descripcion
      FROM productos
      WHERE tienda = 'Mibro'
        AND descripcion IS NOT NULL
        AND descripcion <> ''
      ORDER BY id
    `) as any[];

    let actualizados = 0;
    let yaEspanol = 0;
    const errores: string[] = [];
    const muestra: any[] = [];

    for (const p of filas) {
      const original = String(p.descripcion || "");
      if (!sigueEnIngles(original)) {
        yaEspanol++;
        continue;
      }
      try {
        const es = await traducir(original);
        await sql`UPDATE productos SET descripcion = ${es} WHERE id = ${p.id}`;
        actualizados++;
        if (muestra.length < 6) {
          muestra.push({ id: p.id, nombre: String(p.nombre).slice(0, 40), es: es.slice(0, 100) });
        }
      } catch (e: any) {
        errores.push(`${p.id}: ${e?.message || "error"}`);
      }
    }

    return NextResponse.json({ ok: true, actualizados, yaEspanol, errores, muestra });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}