import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DEFAULT_APP_HOME = "/app/overview";

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/inbox" ||
    pathname.startsWith("/inbox/") ||
    pathname === "/reservations" ||
    pathname.startsWith("/reservations/") ||
    pathname === "/knowledge" ||
    pathname.startsWith("/knowledge/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/analytics" ||
    pathname.startsWith("/analytics/") ||
    pathname === "/api/conversations" ||
    pathname.startsWith("/api/conversations/") ||
    pathname === "/api/settings" ||
    pathname.startsWith("/api/settings/") ||
    pathname === "/api/ai/respond"
  );
}

function buildSafeNext(pathname: string, search: string): string {
  if (!pathname.startsWith("/")) return DEFAULT_APP_HOME;
  if (pathname.startsWith("//")) return DEFAULT_APP_HOME;
  return `${pathname}${search}`;
}

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured (local dev without .env.local), skip auth.
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = isProtectedPath(pathname);
  const isProtectedApiRoute = pathname.startsWith("/api/");

  if (!user && isProtectedRoute) {
    if (isProtectedApiRoute) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set(
      "next",
      buildSafeNext(request.nextUrl.pathname, request.nextUrl.search)
    );
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/auth/login") {
    const url = request.nextUrl.clone();
    const requestedNext = request.nextUrl.searchParams.get("next");
    url.pathname =
      requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
        ? requestedNext
        : DEFAULT_APP_HOME;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
