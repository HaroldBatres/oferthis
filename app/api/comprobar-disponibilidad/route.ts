import { NextResponse } from "next/server";
import { comprobarTodosLosProductos } from "../../services/comprobarDisponibilidad";

export async function GET() {
  try {
    const resultados = await comprobarTodosLosProductos();

    return NextResponse.json({
      ok: true,
      message: "Comprobación terminada",
      resultados,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}