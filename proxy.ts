import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    if (request.nextUrl.pathname.startsWith("/auth/")) {
      const details =
        error instanceof Error
          ? { name: error.name, message: error.message }
          : { name: "UnknownError", message: "Unknown proxy error" };

      return NextResponse.json(
        {
          status: "error",
          source: "auth-proxy",
          ...details,
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "private, no-store",
          },
        },
      );
    }

    throw error;
  }
}

export const config = {
  matcher: [
    "/((?!api/health|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
