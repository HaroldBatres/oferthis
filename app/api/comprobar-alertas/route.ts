import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "../../lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

function parsePrecio(precio: string): number {
  return parseFloat(
    String(precio)
      .replace("€", "")
      .replace(/\s/g, "")
      .replace(",", ".")
  );
}

export async function GET() {
  try {
    const alertas = (await sql`
      SELECT
        a.id,
        a.user_id,
        a.product_id,
        a.precio_objetivo,
        a.notificada,
        a.email,
        p.nombre,
        p.precio,
        p.tienda
      FROM alertas a
      JOIN productos p ON p.id = a.product_id
      WHERE (a.notificada = false OR a.notificada IS NULL)
    `) as any[];

    const enviados: number[] = [];
    const errores: string[] = [];

    for (const alerta of alertas) {
      const precioActual = parsePrecio(alerta.precio);
      const precioObjetivo = parsePrecio(alerta.precio_objetivo);

      if (isNaN(precioActual) || isNaN(precioObjetivo)) continue;
      if (precioActual > precioObjetivo) continue;

      const email = alerta.email || null;

      if (!email) {
        errores.push(`Sin email en alerta ${alerta.id}`);
        continue;
      }

      const { error } = await resend.emails.send({
        from: "Oferthis <onboarding@resend.dev>",
        to: email,
        subject: `¡Bajó de precio! ${alerta.nombre}`,
        html: `
          <h1>Tu alerta de precio se ha cumplido</h1>
          <p>
            <strong>${alerta.nombre}</strong> está a
            <strong>${alerta.precio}</strong>
            (objetivo: ${alerta.precio_objetivo}).
          </p>
          <p>Tienda: ${alerta.tienda}</p>
          <p>
            <a href="https://www.oferthis.com/producto/${alerta.product_id}">
              Ver oferta en Oferthis
            </a>
          </p>
        `,
      });

      if (error) {
        errores.push(`Email alerta ${alerta.id}: ${JSON.stringify(error)}`);
        continue;
      }

      await sql`
        UPDATE alertas SET notificada = true WHERE id = ${alerta.id}
      `;
      enviados.push(alerta.id);
    }

    return NextResponse.json({
      ok: true,
      revisadas: alertas.length,
      enviados: enviados.length,
      ids: enviados,
      errores,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Error" },
      { status: 500 }
    );
  }
}