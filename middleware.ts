import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/session";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Returns the home route for an authenticated user based on their role. */
function resolveHomeForRole(role: unknown): string {
    if (role === "DOCTOR") return "/admin";
    if (role === "NURSE") return "/dashboard";
    return "/dashboard";
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isLoginRoute = pathname === "/login";

    const session = req.cookies.get("session")?.value;
    const payload = await verifySession(session);

    if (isProtectedRoute(pathname) && !payload) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    if (isLoginRoute && payload) {
        const home = resolveHomeForRole(payload.role);
        return NextResponse.redirect(new URL(home, req.nextUrl));
    }

    return NextResponse.next();
}

// Configurar matcher para quais rotas o middleware deve rodar
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
