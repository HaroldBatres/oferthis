import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../lib/db";
import { enviarBienvenidaNewsletter } from "../../lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    await sql`
      INSERT INTO newsletter (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
    `;

    const envio = await enviarBienvenidaNewsletter(email);
    console.log("Newsletter email:", email, envio);

    if (!envio.ok) {
      return NextResponse.json(
        { error: "Guardado, pero el correo no se envió", detalles: envio },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al suscribirse" }, { status: 500 });
  }
}