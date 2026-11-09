import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Clerk user id del administrador de Oferthis. */
export const ADMIN_USER_ID = "user_3Hd21PlPrp9kabWnbxXrPCzlH0D";

/**
 * Exige sesión de Clerk y que el usuario sea el admin.
 * Devuelve una Response 401 si no está autorizado; null si ok.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const { userId } = await auth();
  if (!userId || userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}
