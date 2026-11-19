import { unstable_cache } from "next/cache";

// Caché de datos compartida (en Cloudflare se guarda en Workers KV).
// Evita repetir las mismas consultas a Neon en cada visita y baja CPU/tiempo.
// Los precios se actualizan como mucho una vez al día, así que unos minutos de caché no afectan.
export const CACHE_PORTADA_S = 120;
export const CACHE_LISTADO_S = 300;
export const CACHE_PRODUCTO_S = 300;

export function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  key: string,
  revalidate: number,
) {
  return unstable_cache(fn, [key], { revalidate, tags: ["productos"] });
}
