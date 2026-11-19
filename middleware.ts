import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// Clerk sigue necesitando clerkMiddleware. La protección de /admin y
// /favoritos (y APIs) se hace en cada página/ruta, no con createRouteMatcher.
const clerkHandler = clerkMiddleware();

// En Cloudflare (OpenNext) el middleware "edge" (middleware.ts) es el soportado oficialmente;
// el "proxy.ts" de Next 16 corre en Node y en OpenNext es experimental.
export function middleware(request: NextRequest, event: any) {
  return clerkHandler(request, event);
}

export default middleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
