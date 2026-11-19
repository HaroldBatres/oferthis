// Worker de entrada en Cloudflare.
// - fetch: lo sirve OpenNext (la app Next.js).
// - scheduled: sustituye a los "crons" de vercel.json. Llama a la misma ruta
//   con la cabecera que enviaba Vercel Cron (Authorization: Bearer CRON_SECRET).
// @ts-ignore `.open-next/worker.js` se genera en el build
import { default as handler } from "./.open-next/worker.js";

const CRONS: Record<string, string> = {
  "0 8 * * *": "/api/comprobar-alertas",
  "0 3 * * *": "/api/caducar-automatico",
  "0 4 * * *": "/api/comprobar-disponibilidad",
  "0 6 * * *": "/api/cron/aliexpress",
  "0 5 * * *": "/api/importar-awin-mibro",
};

type Env = {
  CRON_SECRET?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  WORKER_SELF_REFERENCE?: { fetch(req: Request): Promise<Response> };
} & Record<string, unknown>;

export default {
  fetch: handler.fetch,

  async scheduled(event: { cron: string }, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    const path = CRONS[event.cron];
    if (!path) return;
    const base = env.NEXT_PUBLIC_SITE_URL || "https://www.oferthis.com";
    const req = new Request(new URL(path, base), {
      headers: { authorization: `Bearer ${env.CRON_SECRET ?? ""}`, "user-agent": "cloudflare-cron" },
    });
    ctx.waitUntil(
      // Por el service binding a sí mismo: la petición nunca sale a Internet.
      (env.WORKER_SELF_REFERENCE ? env.WORKER_SELF_REFERENCE.fetch(req) : handler.fetch(req, env, ctx)).then(async (res: Response) => {
        console.log(`cron ${event.cron} ${path} -> ${res.status}`);
      }),
    );
  },
};

// @ts-ignore
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
