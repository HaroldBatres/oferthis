import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY no está configurada");
  }
  return new Resend(key);
}

export async function enviarAlertaPrecio(params: {
  to: string;
  nombreProducto: string;
  precioActual: string;
  precioObjetivo: string;
  productoId: number;
}) {
  const { to, nombreProducto, precioActual, precioObjetivo, productoId } =
    params;

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: "Oferthis <hola@oferthis.com>",
      to: [to],
      subject: `🔔 Bajó el precio: ${nombreProducto}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #f97316;">¡Buena noticia!</h2>
          <p>El producto <strong>${nombreProducto}</strong> ha alcanzado (o bajado de) tu precio objetivo.</p>
          <p>
            Precio actual: <strong style="color: #f97316;">${precioActual}</strong><br/>
            Tu objetivo: <strong>${precioObjetivo}</strong>
          </p>
          <p>
            <a href="https://oferthis.com/producto/${productoId}"
               style="display:inline-block;background:#f97316;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Ver oferta
            </a>
          </p>
          <p style="color:#888;font-size:12px;margin-top:32px;">Oferthis – alertas de precio</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error Resend:", error);
      return { ok: false, error };
    }

    return { ok: true, data };
  } catch (err) {
    console.error("Error enviando email:", err);
    return { ok: false, error: err };
  }
}

export async function enviarBienvenidaNewsletter(to: string) {
  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: "Oferthis <hola@oferthis.com>",
      to: [to],
      subject: "Ya estás suscrito a Oferthis",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#f97316;">¡Bienvenido a Oferthis!</h2>
          <p>Te has suscrito para recibir las mejores ofertas.</p>
          <p>
            <a href="https://oferthis.com"
               style="display:inline-block;background:#f97316;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Ver ofertas
            </a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error Resend newsletter:", error);
      return { ok: false, error };
    }
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, error: err };
  }
}