import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Oferthis <onboarding@resend.dev>",
      to: "haroldbatres@gmail.com", // cámbialo si usas otro email
      subject: "Prueba Oferthis - Email OK",
      html: `
        <h1>Funciona</h1>
        <p>Si lees esto, Resend está bien configurado en Oferthis.</p>
      `,
    });

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Error" },
      { status: 500 }
    );
  }
}